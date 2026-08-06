---
name: aves-sdk-validation
description: aves-sdk validation and error model — Result, AvesError kinds, Valibot parse/safeParse, rsStatus, transport invokeOp flow. Use when changing transport, error.ts, client return types, or request/response validation behavior.
---

# aves-sdk validation

Public ops return `Result<T, AvesError>` — never throw for expected API/validation failures.

## Result

```ts
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

ok(data) / err(error)
```

Callers branch on `result.success`. Do not introduce throwing domain methods.

## AvesError

| `kind` | When |
| ------ | ---- |
| `validation` | Bad input (`parse`), bad response shape (`safeParse`), missing XML root, XML convert fail |
| `api` | HTTP non-200, `rsStatus.status !== "OK"`, timeout (`TIMEOUT`) |
| `unknown` | Unexpected thrown errors |

Factories: `validationError`, `apiError`, `unknownError`, **`toAvesError`** (in `error.ts`). Format Valibot issues with `buildDetails(issues)`.

`status` keeps AVES casing (`"OK"` / `"ERROR"` / …). `code` is `number | undefined` (absent → `undefined`, not `0`).

## Transport flow

`invokeOp(op, params)` (`AvesTransport`):

1. Look up `AVES_OPS[op]` (endpoint, roots, schemas, `bodyKey?`)
2. `parse(apiSchema, params)` — **throws** `ValiError` on bad input → caught → `validation` Result
3. `buildOpEnvelope` + cached frozen `RqHeader`
4. `HttpClient.postXml` — timeout, status, capped error body (`readTextCapped` / `MAX_ERROR_BODY`)
5. `readAvesResponse` — XML root → `safeParse(responseSchema)` → `rsStatus` gate

Response reader:

1. Missing root → `validation`
2. `safeParse` soft fail → `validation` + `buildDetails`
3. `rsStatus.status !== "OK"` → `api`
4. Else `ok(output)` (already camelized in-place by `createResponseSchema`)

## Rules

- Request path: `parse` (fail fast at invoke)
- Response path: `safeParse` (never throw from Valibot in the reader)
- Map all caught errors through `toAvesError` / factories — no raw `Error` in Results
- XML helpers throw `AvesError` validation on convert failure; transport maps them
- Do not widen public APIs to `throw` instead of `Result`
- Types for ops: `OpParams` / `OpResult` from `ops.ts` — domain methods still take/return aliases from `types.ts`

## Related

- Schema helpers / facade → `aves-sdk-schemas`
- Transport placement → `aves-sdk-architecture`
- Tests asserting `error.kind` → `aves-sdk-style`
