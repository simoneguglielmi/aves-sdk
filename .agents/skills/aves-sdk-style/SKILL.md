---
name: aves-sdk-style
description: Coding style and conventions for aves-sdk — Biome, ESM imports, enums, Infer types, Vitest, yarn scripts. Use when writing or reviewing TypeScript in this package, adding tests, or formatting code.
---

# aves-sdk style

## Tooling

| Tool | Role |
| ---- | ---- |
| **yarn** | Package manager (`packageManager`: yarn@1.22.22) |
| **Biome** | Format + lint (`yarn check`) — tabs, double quotes, organize imports |
| **TypeScript** | `yarn typecheck` (`tsc --noEmit`); extends `@tsconfig/node22` |
| **Vitest** | `yarn test` — node env, globals; `yarn test:bench`; `AVES_PERF=1 yarn test:perf` |
| **tsdown** | Build to `dist/` ESM + `.d.mts` |

Always run Biome via `yarn check` / `yarn build` (build runs check). Do not fight tab/double-quote settings.

## Module / TS

- ESM only (`"type": "module"`); relative imports use **`.js` extensions** (`./foo.js`)
- Prefer `import { Schema } from "effect"` in schemas (Effect Schema)
- Prefer `{}[]` over `Array<T>` as a type
- Prefer short early returns / one-liners when clear
- Prefer existing helpers over one-off transforms (`aves-sdk-schemas` / `aves-sdk-wire`)
- Prefer `await` over `.then`
- Assert via `result.success` / `_tag` / `isAvesError` narrowing in tests
- **Types out of services:** domain clients import RQ/RS from `types.ts` only

## Types

- Public request types: `InferInput<typeof XSchema>`
- Public response types: `InferOutput<typeof XResponseSchema>` (often wrapped as `FacadeOutput<…>` at domain boundary)
- Infer helpers live in `src/effect/infer.ts`
- Define aliases in `src/types.ts`; export from `src/index.ts` when part of the public surface
- Prefer schema-driven types over hand-written duplicates
- Op registry types: `AvesOp`, `OpParams`, `OpResult` from `ops.ts` / `index.ts`

## Enums

Object enum + type + Effect Schema picklist via `enumSchema`:

```ts
export const Foo = { A: "A", B: "B" } as const;
export type Foo = EnumValue<typeof Foo>;
export const FooSchema = enumSchema(Foo);
```

Add to `schemas/enums.ts` and re-export from `index.ts`.

## Testing

| Kind | Where |
| ---- | ----- |
| Schema unit | `src/schemas/*.test.ts` — camel in / wire out / flat RS |
| Client HTTP (Promise) | `src/client.test.ts` — `HttpClient.make` mocks |
| Effect DX / Layers | `src/client.effect.test.ts` — runtime, DI, `catchTag`, timeout |
| Transport reader | `src/client/transport/response-reader.test.ts` |
| XML / utils | colocated `*.test.ts` |
| Hot-path bench | `src/utils/hot-path.bench.ts` — `yarn test:bench` |
| Hot-path asserts | `src/utils/hot-path.perf.test.ts` — `AVES_PERF=1 yarn test:perf` (skipped by default) |

Patterns:

- Assert success: `result.success === true` then `result.data…`
- Assert errors: `error.kind` / `_tag` (`validation` \| `api` \| `unknown`) / `isAvesError`
- Cover facade dual keys and flattened list/detail DX when touching those schemas

## Public package

- `files`: `dist`, README, CHANGELOG only
- Breaking DX → semver + CHANGELOG version section + README examples / alias map (`aves-sdk-add-op`)

## Related

- Errors / Result → `aves-sdk-validation`
- Layers → `aves-sdk-architecture`
