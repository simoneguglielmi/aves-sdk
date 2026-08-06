---
name: aves-sdk-add-op
description: Checklist to add a new AVES API operation to aves-sdk — endpoint, AVES_OPS, WireShape, schemas, domain client, tests, changelog. Use when implementing a new RQ/RS or extending booking/master/package clients.
---

# aves-sdk add operation

## Checklist

```
Task Progress:
- [ ] Endpoint in AVES_ENDPOINTS + XML root if needed
- [ ] Entry in AVES_OPS (ops.ts) — endpoint, roots, apiSchema, responseSchema, bodyKey?
- [ ] WireShape in wire-shapes.ts (attrs / preserveCamel) — see aves-sdk-wire
- [ ] Input schema + createApiSchema / createWireSchemaPair (+ facadeObject if dual keys)
- [ ] Response: flatten detail and/or listDetailApiSchema + createListResponseSchema
- [ ] Domain method: invokeOp("opName", params) → toFacadeResult (types from types.ts only)
- [ ] Export InferInput/InferOutput / convenience aliases from types.ts / index.ts if public
- [ ] Enums via enumSchema if new picklists — re-export from index
- [ ] Tests: schema unit + client mock (success DX + facade aliases + error.kind)
- [ ] yarn typecheck && yarn test && yarn check
- [ ] CHANGELOG under the next version section (+ README if DX / alias map changes); bump semver if breaking
```

Do not invent a parallel transform path — extend helpers (`aves-sdk-schemas` / `aves-sdk-wire`). Follow `aves-sdk-validation` + `aves-sdk-style`.

## Client sketch

```ts
async createBooking(
  params: BookingFileRQ,
): Promise<Result<FacadeOutput<BookingFileRS>, AvesError>> {
  const result = await this.transport.invokeOp("createBooking", params);
  return toFacadeResult(result);
}
```

Register static metadata only in `AVES_OPS` — do not pass endpoint/schema bags into `invokeOp`. Use `bodyKey` on the op def when the RQ nests the payload (master upsert).

## Placement

| Piece | File |
| ----- | ---- |
| URL | `src/client/endpoints.ts` |
| Op registry | `src/client/ops.ts` |
| Domain method | `src/client/{booking,master-records,packages}.ts` |
| Schemas | `src/schemas/<domain>.ts` (+ tests) |
| WireShape | `src/utils/wire-shapes.ts` |
| Facade inbound keys | `src/utils/facade-aliases.ts` (+ `facadeObject` on schema) |
| Facade outbound keys | `publicKeyAliases` in `facade-transform.ts` |
| Public types | `src/types.ts` / `src/index.ts` |

## Verify / release

```bash
yarn typecheck
yarn test
yarn build   # when packaging / before release
# optional: yarn test:bench · AVES_PERF=1 yarn test:perf
```

Breaking DX → semver + `CHANGELOG.md` version section (not a perpetual Unreleased dump) + README examples / alias map when public shapes change.

## Related

- Layers / `AVES_OPS` → `aves-sdk-architecture`
- Wire → `aves-sdk-wire` · Schemas / facade → `aves-sdk-schemas`
