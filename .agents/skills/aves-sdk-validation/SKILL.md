---
name: aves-sdk-validation
description: aves-sdk validation and error model — Result, tagged AvesError, decodeUnknownAves, rsStatus, transport invoke flow. Use when changing transport, error.ts, client return types, or request/response validation behavior.
---

# aves-sdk validation

Public Promise ops return `Result<T, AvesError>` — never throw for expected API/validation failures. Effect ops fail with tagged `AvesError` (`catchTag` / `isAvesError`).

## Result

```ts
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

ok(data) / err(error)
```

Callers branch on `result.success`. Do not introduce throwing domain methods on the Promise facade.

## AvesError

Tagged union (`Data.TaggedError`): `AvesValidationError` | `AvesApiError` | `AvesUnknownError` (`_tag` + `kind`).

| `kind` / `_tag` | When |
| --------------- | ---- |
| `validation` / `AvesValidationError` | Bad input/response Schema decode, missing XML root, XML convert fail |
| `api` / `AvesApiError` | HTTP non-2xx, `rsStatus.status !== "OK"`, timeout (`TIMEOUT`), transport errors |
| `unknown` / `AvesUnknownError` | Unexpected defects |

Factories: `validationError`, `apiError`, `unknownError`, **`toAvesError`**, guard **`isAvesError`**. Prefer `isAvesError(e)` / `e instanceof AvesApiError` over a class `instanceof AvesError`. Effect: `Effect.catchTag("AvesApiError", …)`.

`status` keeps AVES casing (`"OK"` / `"ERROR"` / …). `code` is `number | undefined` (absent → `undefined`, not `0`).

## Transport flow

`invoke` / `ops[op](params)` (`AvesTransport`):

1. Look up `AVES_OPS[op]` (endpoint, roots, schemas, `bodyKey?`)
2. `decodeUnknownAves(apiSchema, params)` — validation → `AvesValidationError`
3. `buildOpEnvelope` + cached frozen `RqHeader`
4. `AvesHttp.post` — platform client, timeout, status, capped error body
5. `readAvesResponseEffect` — XML root → Schema decode → `rsStatus` gate

Response reader:

1. Missing root → `validation`
2. Schema decode fail → `validation`
3. `rsStatus.status !== "OK"` → `api`
4. Else success output (camelized in-place by `createResponseSchema`)

Promise edge: `runToResult` / `toPromiseFacade`.

## Rules

- Decode via Effect Schema helpers (`decodeUnknownAves`) — not Valibot `parse` / `safeParse`
- Map all errors through `toAvesError` / factories — no raw `Error` in Results
- XML helpers map convert failure to validation; transport maps them
- Do not widen public Promise APIs to `throw` instead of `Result`
- Types for ops: `OpParams` / `OpResult` from `ops.ts` — domain methods still take/return aliases from `types.ts`

## Related

- Schema helpers / facade → `aves-sdk-schemas`
- Transport placement → `aves-sdk-architecture`
- Tests asserting `error.kind` / `_tag` → `aves-sdk-style`
