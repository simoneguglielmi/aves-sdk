---
name: aves-sdk-add-op
description: Checklist to add a new AVES API operation to aves-sdk — endpoint, WireShape, schemas, domain client, tests, changelog. Use when implementing a new RQ/RS or extending booking/master/package clients.
---

# aves-sdk add operation

## Checklist

```
Task Progress:
- [ ] Endpoint in AVES_ENDPOINTS + XML root if needed
- [ ] WireShape in wire-shapes.ts (attrs / preserveCamel) — see aves-sdk-wire
- [ ] Input schema + createApiSchema / createWireSchemaPair (+ wrap if lists)
- [ ] Response: flatten detail and/or listDetailApiSchema + createListResponseSchema
- [ ] Domain client method → Result<T, AvesError> via invokeOp (no throws)
- [ ] Export InferInput/InferOutput types from types.ts / index.ts if public
- [ ] Enums via enumSchema if new picklists — re-export from index
- [ ] Tests: schema unit + client mock (assert success DX and error.kind)
- [ ] yarn typecheck && yarn test && yarn check
- [ ] CHANGELOG (+ README example if DX changes); bump semver if breaking
```

Do not invent a parallel transform path — extend helpers (`aves-sdk-schemas` / `aves-sdk-wire`). Follow `aves-sdk-validation` + `aves-sdk-style`.

## Client sketch

```ts
async createBooking(input: BookingFileRQ): Promise<Result<BookingFileRS, AvesError>> {
  return this.transport.invokeOp({
    endpoint: AVES_ENDPOINTS.createBooking,
    root: XML_ROOT_ELEMENTS.createBooking,
    schema: BookingFileApiSchema,
    responseSchema: BookingFileResponseSchema,
    input,
  });
}
```

Use `bodyKey` only when the RQ nests the payload (master upsert). Use the matching domain namespace from `AvesClient`.

## Placement

| Piece | File |
| ----- | ---- |
| URL | `src/client/endpoints.ts` |
| Domain method | `src/client/{booking,master-records,packages}.ts` |
| Schemas | `src/schemas/<domain>.ts` (+ tests) |
| WireShape | `src/utils/wire-shapes.ts` |

## Verify / release

```bash
yarn typecheck
yarn test
yarn build   # when packaging / before release
```

Breaking DX → major/minor per semver; document under `CHANGELOG.md` `[Unreleased]` or version section; update README examples when public shapes change.
