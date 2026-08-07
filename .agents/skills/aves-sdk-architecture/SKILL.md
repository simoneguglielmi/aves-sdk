---
name: aves-sdk-architecture
description: Maps aves-sdk layers — Promise facade, Effect Tags/Layers, domain modules, AVES_OPS registry. Use when navigating src/client, DI, or deciding where new code belongs.
---

# aves-sdk architecture

## Layers

| Layer | Path | Role |
| ----- | ---- | ---- |
| Promise facade | `src/client.ts` | `createAvesClient` / `AvesClient` / `makeAvesRuntime` |
| Composition | `src/client/layer.ts` | `avesClientLayer` / `AvesClientLive` |
| Domains | `src/client/{booking,master,packages}/` | Tag · service · layer — Effect → `transport.ops` / `toFacadeEffect` |
| Ops registry | `src/client/ops.ts` | `AVES_OPS` + `AvesOp` / `OpParams` / `OpResult` |
| Transport | `src/client/transport/` | `invoke` · envelope · response reader |
| HTTP | `src/client/http/` | XML POST via platform `HttpClient` (`makeAvesHttp` / `httpClientLayer`) |
| Config | `src/client/config/` | `AvesConfig` |
| Envelope | `src/client/envelope.ts` / `rq-header.ts` | RQ root + `RqHeader` |
| Endpoints | `src/client/endpoints.ts` | URL map |
| Schemas | `src/schemas/*.ts` | Effect Schema RQ/RS |
| Transforms | `src/utils/{schema-transform,booking-transform,case-transform,wire-shapes,facade-*}.ts` | Wire + facade DX |
| Effect bridges | `src/effect/` | `runToResult` · `decodeUnknownAves` · infer |
| XML | `src/xml/` | Encode/decode + roots |
| Types | `src/types.ts` | Public RQ/RS aliases (no types inside domain clients) |
| Public API | `src/index.ts` | Client, Tags, enums, types, `Result`, errors |

## DI

`AvesClient(options, deps?)` / `avesClientLayer(options, deps?)` — optional `AvesClientDeps`:

`httpClient?` · `http?` · `transport?` · `master?` · `booking?` · `packages?`

- Default HTTP: `FetchHttpClient.layer`
- Tests: inject `HttpClient.make(...)` via `deps.httpClient`
- Promise facade does **not** expose `transport` — Effect programs use Tags + Layers

## Domain namespaces

Promise: `client.booking.*` / `client.master.*` / `client.packages.*`.
Effect: `yield* AvesBooking` / `AvesMaster` / `AvesPackages` (after `provide` / `makeAvesRuntime`).

Import RQ/RS types from `src/types.ts` only — never define type aliases inside domain service files.

## Ownership

- Domains: `transport.ops.opName(params)` (or `invokeOp`) → `toFacadeEffect` / `facadeMethod`
- Promise edge: `toPromiseFacade` in `createAvesClient`
- `AVES_OPS` owns endpoint / roots / schemas / optional `bodyKey`
- Transport owns orchestration; HTTP / envelope / reader are split modules
- Schemas own shape; facade inbound maps live in `facade-aliases.ts`

### `master.search` special case

Transport parses `{ rsStatus, masterRecordList }`; domain maps success to `MasterRecordDetailResponse[]` (flat array, no `rsStatus` on `result.data`).

## Where to put code

| Change | Put it in |
| ------ | --------- |
| New HTTP op | Domain module + `ops.ts` + `endpoints.ts` + XML root |
| Request/response shape | `src/schemas/` |
| Attr vs element for an RQ | `wire-shapes.ts` (see `aves-sdk-wire`) |
| Facade dual keys (inbound) | `facade-aliases.ts` + `facadeObject` on schema |
| Facade dual keys (outbound) | `publicKeyAliases` in `facade-transform.ts` |
| Shared transform | `schema-transform.ts` / `booking-transform.ts` |
| Errors / Result | `error.ts` / `utils/result.ts` |
| Object enum + picklist | `schemas/enums.ts` → re-export in `index.ts` |
| Public types | `types.ts` / `index.ts` — not domain clients |

## Related

- Wire → `aves-sdk-wire` · Schemas → `aves-sdk-schemas`
- Validation → `aves-sdk-validation` · Style → `aves-sdk-style`
- New op → `aves-sdk-add-op`
