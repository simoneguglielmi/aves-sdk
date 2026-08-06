---
name: aves-sdk-architecture
description: Maps aves-sdk layers — AvesClient facade, domain clients, transport split, AVES_OPS registry. Use when navigating src/client, DI, or deciding where new code belongs.
---

# aves-sdk architecture

## Layers

| Layer | Path | Role |
| ----- | ---- | ---- |
| Facade | `src/client.ts` | `AvesClient` + namespaced domain clients |
| Domains | `src/client/{booking,master-records,packages}.ts` | Op methods → `invokeOp` + `toFacadeResult` |
| Ops registry | `src/client/ops.ts` | `AVES_OPS` + `AvesOp` / `OpParams` / `OpResult` |
| Transport | `src/client/transport.ts` | Thin orchestrator: validate → envelope → HTTP → reader |
| HTTP | `src/client/http-client.ts` | POST XML + timeout (`HttpClient`) |
| Envelope | `src/client/envelope.ts` / `rq-header.ts` | RQ root + `RqHeader` |
| Response | `src/client/response-reader.ts` | XML root → `safeParse` → `rsStatus` |
| Constants / types | `src/client/constants.ts`, `src/client/types.ts` | Timeouts, headers, `HttpClientOptions`, `AvesClientDeps` |
| Endpoints | `src/client/endpoints.ts` | URL map |
| Schemas | `src/schemas/*.ts` | Input/API/response Valibot |
| Transforms | `src/utils/{schema-transform,booking-transform,case-transform,wire-shapes,facade-*}.ts` | Wire + facade DX |
| XML | `src/xml/` | Encode/decode + roots |
| Types | `src/types.ts` | Public RQ/RS aliases (no types inside domain clients) |
| Public API | `src/index.ts` | Client, enums, types, `AvesOp` / `OpParams` / `OpResult` |

## DI

`AvesClient(options, deps?)` accepts optional `AvesClientDeps`: `transport`, `master`, `booking`, `packages`.

- Domains take `AvesTransport` only — no direct `undici`
- Inject mocks via `deps` in tests

## Domain namespaces

Use `client.booking.*` / `client.master.*` / `client.packages.*`. Domain methods are only exposed through their namespace.

Import RQ/RS types from `src/types.ts` only — never define type aliases inside domain service files.

## Ownership

- Domains: `await this.transport.invokeOp("opName", params)` then `toFacadeResult` (or `withPublicAliases` for special cases)
- `AVES_OPS` owns endpoint / roots / schemas / optional `bodyKey`
- Transport owns orchestration; HTTP / envelope / reader are split modules
- Schemas own shape; facade inbound maps live in `facade-aliases.ts`

### `master.search` special case

Transport parses `{ rsStatus, masterRecordList }`; domain maps success to `MasterRecordDetailResponse[]` (flat array, no `rsStatus` on `result.data`).

## Where to put code

| Change | Put it in |
| ------ | --------- |
| New HTTP op | Domain + `ops.ts` + `endpoints.ts` + XML root |
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
