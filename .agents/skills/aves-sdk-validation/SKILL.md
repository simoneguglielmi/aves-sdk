---
name: aves-sdk-validation
description: aves-sdk validation and error model — Result, AvesError kinds, Valibot parse/safeParse, rsStatus handling, timeouts. Use when changing transport, error.ts, client return types, or request/response validation behavior.
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

Factories: `validationError`, `apiError`, `unknownError`. Format Valibot issues with `buildDetails(issues)`.

`status` is lowercased; `code` coerced to number (`0` default).

## Transport flow

`invokeOp`:

1. `parse(apiSchema, params)` — **throws** `ValiError` on bad input → caught → `validation` Result
2. Build root + `RqHeader` (+ optional `bodyKey` nest)
3. `request` → POST XML (`undici`)

`request`:

1. Timeout via `createTimeoutSignal` (default 30s) → abort → `api` / `TIMEOUT`
2. Non-200 → `api` with body text
3. Missing response root → `validation`
4. `safeParse(responseSchema, root)` — soft fail → `validation` + `buildDetails`
5. `handleApiStatus`: `rsStatus.status !== "OK"` → `api` with `errorDescription` / `errorCode`
6. Else `ok(output)`

`toAvesError`: `AvesError` passthrough → `ValiError` → validation → `Error` → unknown.

## Rules

- Request path: `parse` (fail fast at invoke)
- Response path: `safeParse` (never throw from Valibot in `request`)
- Map all caught errors through `toAvesError` / factories — no raw `Error` in Results
- XML helpers throw `AvesError("validation", …)` on convert failure; transport maps them
- Do not widen public APIs to `throw` instead of `Result`

## Related

- Schema helpers → `aves-sdk-schemas`
- Transport placement → `aves-sdk-architecture`
- Tests asserting `error.kind` → `aves-sdk-style`
