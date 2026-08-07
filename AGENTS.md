# AGENTS.md

Self-contained agent guide for **aves-sdk**. Optional Agent Skills live in **`.agents/skills/`** (harness-agnostic). This file is enough on its own.

TypeScript SDK for AVES XML REST. **yarn** · Valibot · ESM (`tsdown`) · Biome · Vitest.

Before changing Valibot APIs, check current docs (Context7 or official Valibot docs).

---

## Commands

```bash
yarn typecheck
yarn test
yarn check      # Biome: tabs, double quotes, organize imports
yarn build      # clean + check + tsdown
# optional: yarn test:bench · AVES_PERF=1 yarn test:perf
```

Verify after substantive edits: `yarn typecheck && yarn test`.

---

## Architecture

| Layer | Path | Role |
| ----- | ---- | ---- |
| Facade | `src/client.ts` | `AvesClient` + namespaced domain clients |
| Domains | `src/client/{booking,master-records,packages}.ts` | Op methods → `invokeOp` + `toFacadeResult` |
| Ops registry | `src/client/ops.ts` | `AVES_OPS` + `AvesOp` / `OpParams` / `OpResult` |
| Transport | `src/client/transport.ts` | Thin orchestrator: validate → envelope → HTTP → reader |
| HTTP | `src/client/http-client.ts` | POST XML + timeout (`HttpClient`) |
| Envelope | `src/client/envelope.ts` / `rq-header.ts` | RQ root + `RqHeader` |
| Response | `src/client/response-reader.ts` | XML root → `safeParse` → `rsStatus` |
| Constants / types | `src/client/constants.ts`, `src/client/types.ts` | Timeouts, headers, deps |
| Endpoints | `src/client/endpoints.ts` | URL map |
| Schemas | `src/schemas/*.ts` | Input/API/response Valibot |
| Transforms | `src/utils/{schema-transform,booking-transform,case-transform,wire-shapes,facade-*}.ts` | Wire + facade DX |
| XML | `src/xml/` | Encode/decode + roots |
| Types | `src/types.ts` | Public RQ/RS aliases (no types inside domain clients) |
| Public API | `src/index.ts` | Client, enums, types, op types |

### DI

`AvesClient(options, deps?)` — optional `AvesClientDeps`: `transport`, `master`, `booking`, `packages`.

- Domains take `AvesTransport` only (no direct `undici`)
- Inject mocks via `deps` in tests

### Domain namespaces

Use `client.booking.*` / `client.master.*` / `client.packages.*`. Domain methods are only exposed through their namespace.

Import RQ/RS types from `src/types.ts` only — never define type aliases inside domain service files.

### Ownership

- Domains: `await this.transport.invokeOp(AvesOp.opName, params)` then `toFacadeResult`
- `AVES_OPS` owns endpoint / roots / schemas / optional `bodyKey`
- Transport owns orchestration; HTTP / envelope / reader are split modules
- Schemas own shape; facade inbound maps live in `facade-aliases.ts`

### Where to put code

| Change | Put it in |
| ------ | --------- |
| New HTTP op | Domain + `ops.ts` + `endpoints.ts` + XML root |
| Request/response shape | `src/schemas/` |
| Attr vs element | `src/utils/wire-shapes.ts` |
| Facade dual keys (inbound) | `facade-aliases.ts` + `facadeObject` on schema |
| Facade dual keys (outbound) | `publicKeyAliases` in `facade-transform.ts` |
| Shared transform | `schema-transform.ts` / `booking-transform.ts` |
| Errors / Result | `error.ts` / `utils/result.ts` |
| Object enum + picklist | `schemas/enums.ts` → re-export in `index.ts` |
| Public types | `types.ts` / `index.ts` — not domain clients |

---

## Style

| Tool | Notes |
| ---- | ----- |
| yarn | `packageManager`: yarn@1.22.22 |
| Biome | tabs, double quotes — do not fight formatter |
| TS | ESM only; relative imports use **`.js` extensions** |
| Types | Prefer `{}[]` over `Array<T>`; short early returns when clear |

- Prefer existing helpers over one-off transforms
- No `as Record<string, unknown>` to feed `toWireBody` — keep `GenericSchema<object, object>`
- Prefer `await` over `.then`
- Request types: `InferInput<typeof XSchema>` · Response: `InferOutput<typeof XResponseSchema>`
- Define aliases in `types.ts`; export from `index.ts` when public
- Prefer schema-driven types over hand-written duplicates
- **Types out of services:** domain clients import RQ/RS from `types.ts` only

### Enums

```ts
export const Foo = { A: "A", B: "B" } as const;
export type Foo = EnumValue<typeof Foo>;
export const FooSchema = enumSchema(Foo);
```

Add to `schemas/enums.ts` and re-export from `index.ts`.

### Testing

| Kind | Where |
| ---- | ----- |
| Schema unit | `src/schemas/*.test.ts` — camel in / wire out / flat RS |
| Client HTTP | `src/client.test.ts` — undici `MockAgent`; skip under Bun |
| XML / utils | colocated `*.test.ts` |
| Hot-path bench | `src/utils/hot-path.bench.ts` — `yarn test:bench` |
| Hot-path asserts | `src/utils/hot-path.perf.test.ts` — `AVES_PERF=1 yarn test:perf` |

Assert `result.success` / `error.kind` (`validation` \| `api` \| `unknown`). Restore `setGlobalDispatcher` in `afterEach`. Cover facade dual keys and flattened DX when touching those schemas.

Public package `files`: `dist`, README, CHANGELOG only.

---

## Validation & errors

Public ops return `Result<T, AvesError>` — never throw for expected API/validation failures.

```ts
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };
```

| `error.kind` | When |
| ------------ | ---- |
| `validation` | Bad input (`parse`), bad response (`safeParse`), missing XML root, XML convert fail |
| `api` | HTTP non-200, `rsStatus.status !== "OK"`, timeout (`TIMEOUT`) |
| `unknown` | Unexpected thrown errors |

Factories: `validationError`, `apiError`, `unknownError`, **`toAvesError`** (in `error.ts`). Format Valibot issues with `buildDetails`.

`status` keeps AVES casing (`"OK"` / `"ERROR"` / …). `code` is `number | undefined` (absent → `undefined`, not `0`).

### Transport flow

`invokeOp(op, params)` (`AvesTransport`):

1. Look up `AVES_OPS[op]` (endpoint, roots, schemas, `bodyKey?`)
2. `parse(apiSchema, params)` — throws `ValiError` on bad input → caught → `validation` Result
3. `buildOpEnvelope` + cached frozen `RqHeader`
4. `HttpClient.postXml` — timeout, status, capped error body
5. `readAvesResponse` — XML root → `safeParse(responseSchema)` → `rsStatus` gate

Response reader:

1. Missing root → `validation`
2. `safeParse` soft fail → `validation`
3. `rsStatus.status !== "OK"` → `api`
4. Else `ok(output)` (camelized in-place by `createResponseSchema`)

Rules: request uses `parse`; response uses `safeParse`; map errors via `toAvesError` / factories — no raw `Error` in Results.

---

## Wire encoding

- **SDK I/O**: camelCase, flat DX (+ optional facade aliases)
- **Wire**: PascalCase keys; `@`-prefixed → XML attributes
- Attr vs element is **per-request `WireShape`** in `wire-shapes.ts` — never a global attr set
- Element-only roots → `elementOnlyWire` (`{}`)
- Master upsert nests under `bodyKey: "MasterRecordDetail"`; booking/search usually spread at RQ root
- Keep shapes isolated per op family

### Outbound path

1. Valibot validates camelCase input (after schema-owned facade coalesce)
2. `createApiSchema(schema, shape)` → **fused** `toWireBody` (list wrap + `paxAssociated` + Pascal/`@` keys in one walk)
3. `invokeOp` looks up `AVES_OPS`, adds `RqHeader`, optional `bodyKey`, POSTs XML

Prefer `createWireSchemaPair(inputSchema, shape)` for both `api` + PascalCase `validation` schemas.

`itemShape` / `encodeShapeFor` cache synthesized shapes on static `WireShape` refs (`WeakMap`).

### List wrap (request)

SDK: flat `*List: Item[]`. Wire via `listWrap` on the **item** shape in `wire-shapes.ts`:

- `"many"` → `{ detailKey: items }`
- `"one"` → `[{ detailKey: item }, …]` (CreateBooking selectedService/passenger lists)
- `detailKey` override when inference fails (e.g. `financialDeadlineList` → `deadlineDetail`)

Attrs/children on a list shape describe each **item** — `WireShapeFor` stays honest; encode synthesizes the Detail wrapper.

`paxAssociated`: SDK `string[]` → wire `{ pax }[]`; empty `[]` → `""`.

### Shape map

| Shape | Ops |
| ----- | --- |
| `masterRecordWire` / `searchMasterWire` | Upsert / Search master |
| `bookingFileWire` | CreateBooking |
| `modBookingFileWire` | Mod services / Mod header |
| `filePaymentListRequestWire` | InsertFilePaymentList |
| `searchFileWire` | SearchBookingFiles |
| `setFileStatusWire` | SetBookingFileStatus |
| `packageDetailRequestWire` | GetPackageDetail |
| `baseSearchWire` + `avesSearchWire` | Package / top-service search |
| `elementOnlyWire` | Cancel / SetServiceStatus / CommitPackage |

Anti-patterns: global attr sets; ad-hoc PascalCase mappers beside `createApiSchema`; sharing attr lists across unrelated RQs; `| WireShape` escape hatches on `WireShapeFor`; reintroducing a 3-walk outbound path beside fused `toWireBody`.

Define shapes with `wire` / `attrsWire` / `camelAttrsWire` / `attrsCamelWire` / `childrenWire` / `nestWire` / `listWire` / `listAttrsWire` / `listWireModes` — never hand-write `as const satisfies WireShape`.

---

## Schemas & DX (1.9+)

Callers use `result.data.recordCode` / `bookingFileCode` / `pCode` and `data.*List?.[0]` — never nested `*Detail` in public output.

Facade concise names (`customerCode`, `bookingCode`, `services`, …) are also accepted on input and exposed on success. Full map: README · SoT: `facade-aliases.ts` (in) / `publicKeyAliases` (out).

Source: `schema-transform.ts`, `booking-transform.ts`, `facade-aliases.ts`, `facade-transform.ts`, `schemas/common.ts`.

### Inbound helpers

| Helper | Use when |
| ------ | -------- |
| `createResponseSchema` | camelCase via **in-place** `pascalToCamelKeysInPlace` |
| `createFlattenedResponseSchema(api, detailKey)` | spread one `*Detail` onto `data` |
| `createListResponseSchema(listKey, listSchema)` | typed list RS (`PackageList` → `packageList`) |
| `listDetailApiSchema(DetailKey, item)` | wire `{ Detail }` → flat `Detail[]` |
| `coalesceWireAliases` | dialect attrs → canonical |
| `facadeObject` / `coalesceAliases` | dual-key input → AVES-only schema output |
| `StatusOnlyResponseSchema` | cancel / mod-header / commit / payment list |

`master.search` is a special case: transport still parses wire `{ rsStatus, masterRecordList }`, but the domain client maps success to `MasterRecordDetailResponse[]` (no `rsStatus` on `result.data`).

```ts
createFlattenedResponseSchema(PackageDetailApiSchema, "packageDetail"); // data.pCode
listDetailApiSchema("FeatureDetail", FeatureDetailApiSchema);
createListResponseSchema("PackageList", PackageListApiSchema);
// master.search → result.data is MasterRecordDetailResponse[]
```

### Request helpers & facade

```ts
createApiSchema(FooInputSchema, fooWire);
createWireSchemaPair(MasterRecordDetailSchema, masterRecordWire);
valueFieldSchema(BookingFileStatusSchema, {
  expiredDate: v.optional(v.string()),
});
```

| Direction | Mechanism |
| --------- | --------- |
| **Inbound** | Scoped maps in `facade-aliases.ts` + `facadeObject` / `coalesceAliases` |
| **Outbound** | `withPublicAliases` / `toFacadeResult` — hardened lazy Proxy (`publicKeyAliases`) |

| Alias | Helper |
| ----- | ------ |
| `customerRecordCode` ↔ `customerDetail` | `coalesceCustomerRecordCode` |
| status string \| `{ value }` | `valueFieldSchema` |
| `selectedPackageList` ↔ `selectedPackageDetail` | `coalesceListHead` |
| `paxAssociated: string[]` | normalize inside fused `toWireBody` |

Shared primitives in `common.ts`: `LanguageCodeSchema`, `StringishSchema`, `DateRangeSchema`, etc.

Anti-patterns: nested public output; `Record` casts for `toWireBody`; duplicating List/Detail unwrap; global facade walker beside `facade-aliases` + `publicKeyAliases`.

---

## Adding an operation

```
Task Progress:
- [ ] Endpoint in AVES_ENDPOINTS + XML root if needed
- [ ] Entry in AVES_OPS (ops.ts) — endpoint, roots, apiSchema, responseSchema, bodyKey?
- [ ] WireShape in wire-shapes.ts (attrs / preserveCamel)
- [ ] Input schema + createApiSchema / createWireSchemaPair (+ facadeObject if dual keys)
- [ ] Response: flatten detail and/or listDetailApiSchema + createListResponseSchema
- [ ] Domain method: invokeOp(AvesOp.opName, params) → toFacadeResult (types from types.ts only)
- [ ] Export InferInput/InferOutput types from types.ts / index.ts if public
- [ ] Enums via enumSchema if new picklists — re-export from index
- [ ] Tests: schema unit + client mock (success DX + facade aliases + error.kind)
- [ ] yarn typecheck && yarn test && yarn check
- [ ] CHANGELOG under the next version section (+ README if DX / alias map changes); bump semver if breaking
```

Do not invent a parallel transform path — extend existing helpers.

### Client sketch

```ts
async create(
  params: BookingFileRQ,
): Promise<Result<FacadeOutput<BookingFileRS>, AvesError>> {
  const result = await this.transport.invokeOp(AvesOp.create, params);
  return toFacadeResult(result);
}
```

Register static metadata only in `AVES_OPS` — do not pass endpoint/schema bags into `invokeOp`. Use `bodyKey` on the op def when the RQ nests the payload (master upsert).

| Piece | File |
| ----- | ---- |
| URL | `src/client/endpoints.ts` |
| Op registry | `src/client/ops.ts` |
| Domain method | `src/client/{booking,master-records,packages}.ts` |
| Schemas | `src/schemas/<domain>.ts` (+ tests) |
| WireShape | `src/utils/wire-shapes.ts` |
| Facade inbound | `src/utils/facade-aliases.ts` |
| Facade outbound | `publicKeyAliases` in `facade-transform.ts` |
| Public types | `src/types.ts` / `src/index.ts` |

Breaking DX → semver + `CHANGELOG.md` + README examples / alias map.

---

## Optional skills

Canonical skills directory: **`.agents/skills/`**

| Skill | Topic |
| ----- | ----- |
| `aves-sdk` | Index |
| `aves-sdk-architecture` | Layers / DI / `AVES_OPS` / transport split |
| `aves-sdk-wire` | WireShape / fused `toWireBody` |
| `aves-sdk-schemas` | Valibot helpers / flatten DX / facade |
| `aves-sdk-validation` | Result / AvesError / `invokeOp(op, params)` |
| `aves-sdk-style` | Biome / enums / Vitest / bench |
| `aves-sdk-add-op` | New operation checklist |

Harness discovery symlinks (same tree): `.cursor/skills`, `.claude/skills`, `.codex/skills` → `.agents/skills`. Prefer this file when skills are unavailable.

Human docs: `README.md`, `CHANGELOG.md`.
