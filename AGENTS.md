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
```

Verify after substantive edits: `yarn typecheck && yarn test`.

---

## Architecture

| Layer      | Path                                                                           | Role                                                |
| ---------- | ------------------------------------------------------------------------------ | --------------------------------------------------- |
| Facade     | `src/client.ts`                                                                | `AvesClient` + namespaced domain clients            |
| Domains    | `src/client/{booking,master-records,packages}.ts`                              | Op methods                                          |
| Transport  | `src/client/transport.ts`                                                      | HTTP + XML + `invokeOp` (`bodyKey?`)                |
| Endpoints  | `src/client/endpoints.ts`                                                      | URL map                                             |
| Schemas    | `src/schemas/*.ts`                                                             | Input/API/response Valibot                          |
| Transforms | `src/utils/{schema-transform,booking-transform,case-transform,wire-shapes}.ts` | Wire DX                                             |
| XML        | `src/xml/`                                                                     | Encode/decode + roots                               |
| Types      | `src/types.ts`                                                                 | `InferInput` / `InferOutput`                        |
| Public API | `src/index.ts`                                                                 | Client, enums, types                                |

### DI

`AvesClient(options, deps?)` — optional `AvesClientDeps`: `transport`, `master`, `booking`, `packages`.

- Domains take `AvesTransport` only (no direct `undici`)
- Inject mocks via `deps` in tests

### Domain namespaces

Use `client.booking.*` / `client.master.*` / `client.packages.*`. Domain methods are only exposed through their namespace.

### Ownership

- Domains call `transport.invokeOp({…})`
- Schemas own shape; transport owns validation + HTTP + XML orchestration

### Where to put code

| Change                 | Put it in                                      |
| ---------------------- | ---------------------------------------------- |
| New HTTP op            | Domain client + `endpoints.ts` + XML root      |
| Request/response shape | `src/schemas/`                                 |
| Attr vs element        | `src/utils/wire-shapes.ts`                     |
| Shared transform       | `schema-transform.ts` / `booking-transform.ts` |
| Errors / Result        | `error.ts` / `utils/result.ts`                 |
| Object enum + picklist | `schemas/enums.ts` → re-export in `index.ts`   |

---

## Style

| Tool  | Notes                                                         |
| ----- | ------------------------------------------------------------- |
| yarn  | `packageManager`: yarn@1.22.22                                |
| Biome | tabs, double quotes — do not fight formatter                  |
| TS    | ESM only; relative imports use **`.js` extensions**           |
| Types | Prefer `{}[]` over `Array<T>`; short early returns when clear |

- Prefer existing helpers over one-off transforms
- No `as Record<string, unknown>` to feed `toWireBody` — keep `GenericSchema<object, object>`
- Request types: `InferInput<typeof XSchema>` · Response: `InferOutput<typeof XResponseSchema>`
- Define aliases in `types.ts`; export from `index.ts` when public
- Prefer schema-driven types over hand-written duplicates

### Enums

```ts
export const Foo = { A: 'A', B: 'B' } as const;
export type Foo = EnumValue<typeof Foo>;
export const FooSchema = enumSchema(Foo);
```

Add to `schemas/enums.ts` and re-export from `index.ts`.

### Testing

| Kind        | Where                                                     |
| ----------- | --------------------------------------------------------- |
| Schema unit | `src/schemas/*.test.ts` — camel in / wire out / flat RS   |
| Client HTTP | `src/client.test.ts` — undici `MockAgent`; skip under Bun |
| XML / utils | colocated `*.test.ts`                                     |

Assert `result.success` / `error.kind` (`validation` \| `api` \| `unknown`). Restore `setGlobalDispatcher` in `afterEach`. Cover aliases and flattened DX when touching those schemas.

Public package `files`: `dist`, README, CHANGELOG only.

---

## Validation & errors

Public ops return `Result<T, AvesError>` — never throw for expected API/validation failures.

```ts
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };
```

| `error.kind` | When                                                                                |
| ------------ | ----------------------------------------------------------------------------------- |
| `validation` | Bad input (`parse`), bad response (`safeParse`), missing XML root, XML convert fail |
| `api`        | HTTP non-200, `rsStatus.status !== "OK"`, timeout (`TIMEOUT`)                       |
| `unknown`    | Unexpected thrown errors                                                            |

Factories: `validationError`, `apiError`, `unknownError`. Format Valibot issues with `buildDetails`.

### Transport flow

`invokeOp`:

1. `parse(apiSchema, params)` — throws `ValiError` on bad input → caught → `validation` Result
2. Build root + `RqHeader` (+ optional `bodyKey` nest)
3. `request` → POST XML

`request`:

1. Timeout (`createTimeoutSignal`, default 30s) → abort → `api` / `TIMEOUT`
2. Non-200 → `api`
3. Missing response root → `validation`
4. `safeParse(responseSchema, root)` → soft fail → `validation`
5. `rsStatus.status !== "OK"` → `api`
6. Else `ok(output)`

Rules: request uses `parse`; response uses `safeParse`; map errors via `toAvesError` / factories — no raw `Error` in Results.

---

## Wire encoding

- **SDK I/O**: camelCase, flat DX
- **Wire**: PascalCase keys; `@`-prefixed → XML attributes
- Attr vs element is **per-request `WireShape`** in `wire-shapes.ts` — never a global attr set
- Element-only roots → `elementOnlyWire` (`{}`)
- Master upsert nests under `bodyKey: "MasterRecordDetail"`; booking/search usually spread at RQ root
- Keep shapes isolated per op family

### Outbound path

1. Valibot validates camelCase input
2. `createApiSchema(schema, shape)` → `toWireBody` (shape-driven list wrap + `paxAssociated` normalize + `camelToPascalKeys`)
3. `invokeOp` adds `RqHeader`, optional `bodyKey`, POSTs XML

Prefer `createWireSchemaPair(inputSchema, shape)` for both `api` + PascalCase `validation` schemas.

### List wrap (request)

SDK: flat `*List: Item[]`. Wire via `listWrap` on the **item** shape in `wire-shapes.ts`:

- `"many"` → `{ detailKey: items }`
- `"one"` → `[{ detailKey: item }, …]` (CreateBooking selectedService/passenger lists)
- `detailKey` override when inference fails (e.g. `financialDeadlineList` → `deadlineDetail`)

Attrs/children on a list shape describe each **item** — `WireShapeFor` stays honest; encode synthesizes the Detail wrapper.

`paxAssociated`: SDK `string[]` → wire `{ pax }[]`; empty `[]` → `""`.

### Shape map

| Shape                                   | Ops                                       |
| --------------------------------------- | ----------------------------------------- |
| `masterRecordWire` / `searchMasterWire` | Upsert / Search master                    |
| `bookingFileWire`                       | CreateBooking                             |
| `modBookingFileWire`                    | Mod services / Mod header                 |
| `filePaymentListRequestWire`            | InsertFilePaymentList                     |
| `searchFileWire`                        | SearchBookingFiles                        |
| `setFileStatusWire`                     | SetBookingFileStatus                      |
| `packageDetailRequestWire`              | GetPackageDetail                          |
| `baseSearchWire` + `avesSearchWire`     | Package / top-service search              |
| `elementOnlyWire`                       | Cancel / SetServiceStatus / CommitPackage |

Anti-patterns: global attr sets; ad-hoc PascalCase mappers beside `createApiSchema`; sharing attr lists across unrelated RQs; `| WireShape` escape hatches on `WireShapeFor`.

Define shapes with `wire` / `attrsWire` / `camelAttrsWire` / `attrsCamelWire` / `childrenWire` / `nestWire` / `listWire` / `listAttrsWire` / `listWireModes` — never hand-write `as const satisfies WireShape`.

---

## Schemas & DX (1.9+)

Callers use `result.data.recordCode` / `bookingFileCode` / `pCode` and `data.*List?.[0]` — never nested `*Detail` in public output.

Source: `schema-transform.ts`, `booking-transform.ts`, `schemas/common.ts`.

### Inbound helpers

| Helper                                          | Use when                                      |
| ----------------------------------------------- | --------------------------------------------- |
| `createResponseSchema`                          | camelCase only                                |
| `createFlattenedResponseSchema(api, detailKey)` | spread one `*Detail` onto `data`              |
| `createListResponseSchema(listKey, listSchema)` | typed list RS (`PackageList` → `packageList`) |
| `listDetailApiSchema(DetailKey, item)`          | wire `{ Detail }` → flat `Detail[]`           |
| `coalesceWireAliases`                           | dialect attrs → canonical                     |
| `StatusOnlyResponseSchema`                      | cancel / mod-header / commit / payment list   |

`master.search` is a special case: transport still parses wire `{ rsStatus, masterRecordList }`, but the domain client maps success to `MasterRecordDetailResponse[]` (no `rsStatus` on `result.data`).

```ts
createFlattenedResponseSchema(PackageDetailApiSchema, 'packageDetail'); // data.pCode
listDetailApiSchema('FeatureDetail', FeatureDetailApiSchema);
createListResponseSchema('PackageList', PackageListApiSchema);
// master.search → result.data is MasterRecordDetailResponse[]
```

### Request helpers & aliases

```ts
createApiSchema(FooInputSchema, fooWire);
createWireSchemaPair(MasterRecordDetailSchema, masterRecordWire);
valueFieldSchema(BookingFileStatusSchema, {
  expiredDate: v.optional(v.string()),
});
```

| Alias                                           | Helper                                        |
| ----------------------------------------------- | --------------------------------------------- |
| `customerRecordCode` ↔ `customerDetail`         | `coalesceCustomerRecordCode`                  |
| status string \| `{ value }`                    | `valueFieldSchema`                            |
| `selectedPackageList` ↔ `selectedPackageDetail` | `coalesceListHead`                            |
| `paxAssociated: string[]`                       | `normalizeEmptyPaxAssociated` in `toWireBody` |

Shared primitives in `common.ts`: `LanguageCodeSchema`, `StringishSchema`, `DateRangeSchema`, etc.

Anti-patterns: nested public output; `Record` casts for `toWireBody`; duplicating List/Detail unwrap instead of `listDetailApiSchema`.

---

## Adding an operation

```
Task Progress:
- [ ] Endpoint in AVES_ENDPOINTS + XML root if needed
- [ ] WireShape in wire-shapes.ts (attrs / preserveCamel)
- [ ] Input schema + createApiSchema / createWireSchemaPair (+ wrap if lists)
- [ ] Response: flatten detail and/or listDetailApiSchema + createListResponseSchema
- [ ] Domain client method → Result<T, AvesError> via invokeOp (no throws)
- [ ] Export InferInput/InferOutput types from types.ts / index.ts if public
- [ ] Enums via enumSchema if new picklists — re-export from index
- [ ] Tests: schema unit + client mock (success DX + error.kind)
- [ ] yarn typecheck && yarn test && yarn check
- [ ] CHANGELOG (+ README if DX changes); bump semver if breaking
```

Do not invent a parallel transform path — extend existing helpers.

### Client sketch

```ts
return this.transport.invokeOp({
  op: 'createBooking',
  params: input,
  apiSchema: BookingFileApiSchema,
  endpoint: AVES_ENDPOINTS.createBooking,
  requestRoot: XML_ROOT_ELEMENTS.createBooking,
  responseRoot: '…',
  responseSchema: BookingFileResponseSchema,
  // bodyKey: "MasterRecordDetail", // only when RQ nests payload
});
```

| Piece         | File                                              |
| ------------- | ------------------------------------------------- |
| URL           | `src/client/endpoints.ts`                         |
| Domain method | `src/client/{booking,master-records,packages}.ts` |
| Schemas       | `src/schemas/<domain>.ts` (+ tests)               |
| WireShape     | `src/utils/wire-shapes.ts`                        |

Breaking DX → semver + `CHANGELOG.md` + README examples.

---

## Optional skills

Canonical skills directory: **`.agents/skills/`**

| Skill | Topic |
| ----- | ----- |
| `aves-sdk` | Index |
| `aves-sdk-architecture` | Layers / DI / domain namespaces |
| `aves-sdk-wire` | WireShape / outbound XML |
| `aves-sdk-schemas` | Valibot helpers / flatten DX |
| `aves-sdk-validation` | Result / AvesError |
| `aves-sdk-style` | Biome / enums / Vitest |
| `aves-sdk-add-op` | New operation checklist |

Harness discovery symlinks (same tree): `.cursor/skills`, `.claude/skills`, `.codex/skills` → `.agents/skills`. Prefer this file when skills are unavailable.

Human docs: `README.md`, `CHANGELOG.md`.
