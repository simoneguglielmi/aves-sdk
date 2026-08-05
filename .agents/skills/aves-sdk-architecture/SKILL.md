---
name: aves-sdk-architecture
description: Maps aves-sdk layers — AvesClient facade, domain clients, transport, schemas, XML. Use when navigating src/client, DI, or deciding where new code belongs.
---

# aves-sdk architecture

## Layers

| Layer | Path | Role |
| ----- | ---- | ---- |
| Facade | `src/client.ts` | `AvesClient` + namespaced domain clients |
| Domains | `src/client/{booking,master-records,packages}.ts` | Op methods |
| Transport | `src/client/transport.ts` | HTTP + XML + `invokeOp` (`bodyKey?`) |
| Endpoints | `src/client/endpoints.ts` | URL map |
| Schemas | `src/schemas/*.ts` | Input/API/response Valibot |
| Transforms | `src/utils/{schema-transform,booking-transform,case-transform,wire-shapes}.ts` | Wire DX |
| XML | `src/xml/` | Encode/decode + roots |
| Types | `src/types.ts` | `InferOutput` / `InferInput` re-exports |
| Public API | `src/index.ts` | Client, enums, types |

## DI

`AvesClient(options, deps?)` accepts optional `AvesClientDeps`: `transport`, `master`, `booking`, `packages`.

- Default: construct real transport + domain clients
- Tests / custom stacks: inject mocks via `deps`
- Domains take `AvesTransport` only — no direct `undici` in domain files

## Domain namespaces

Use `client.booking.*` / `client.master.*` / `client.packages.*`. Domain methods are only exposed through their namespace.

## Request/response ownership

- Domains call `transport.invokeOp({ op, params, apiSchema, endpoint, requestRoot, responseRoot, responseSchema, bodyKey? })`
- Validation + HTTP + XML live in transport (`aves-sdk-validation`)
- Schemas own shape; transport owns orchestration

## Where to put code

| Change | Put it in |
| ------ | --------- |
| New HTTP op | Domain client + `endpoints.ts` + XML root |
| Request/response shape | `src/schemas/` |
| Attr vs element for an RQ | `wire-shapes.ts` (see `aves-sdk-wire`) |
| Shared transform | `schema-transform.ts` / `booking-transform.ts` (see `aves-sdk-schemas`) |
| Errors / Result | `error.ts` / `utils/result.ts` (see `aves-sdk-validation`) |
| Object enum + picklist | `schemas/enums.ts` → re-export in `index.ts` |

## Related

- Wire → `aves-sdk-wire` · Schemas → `aves-sdk-schemas`
- Validation → `aves-sdk-validation` · Style → `aves-sdk-style`
- New op → `aves-sdk-add-op`
