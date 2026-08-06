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
- Prefer `import * as v from "valibot"` in schemas
- Prefer `{}[]` over `Array<T>` as a type
- Prefer short early returns / one-liners when clear
- Prefer existing helpers over one-off transforms (`aves-sdk-schemas` / `aves-sdk-wire`)
- No `as Record<string, unknown>` to feed `toWireBody` — keep `GenericSchema<object, object>`
- Prefer `await` over `.then`
- No `as unknown as {…}` double casts in tests — assert via `parse` / `result.success` narrowing
- **Types out of services:** domain clients import RQ/RS from `types.ts` only

## Types

- Public request types: `InferInput<typeof XSchema>`
- Public response types: `InferOutput<typeof XResponseSchema>` (often wrapped as `FacadeOutput<…>` at domain boundary)
- Define aliases in `src/types.ts`; export from `src/index.ts` when part of the public surface
- Prefer schema-driven types over hand-written duplicates
- Op registry types: `AvesOp`, `OpParams`, `OpResult` from `ops.ts` / `index.ts`

## Enums

Object enum + type + Valibot picklist via `enumSchema`:

```ts
export const Foo = { A: "A", B: "B" } as const;
export type Foo = EnumValue<typeof Foo>;
export const FooSchema = enumSchema(Foo);
```

Add to `schemas/enums.ts` and re-export from `index.ts`.

## Testing

| Kind | Where |
| ---- | ----- |
| Schema unit | `src/schemas/*.test.ts` — `parse` / `safeParse`, camel in / wire out / flat RS |
| Client HTTP | `src/client.test.ts` — undici `MockAgent`; skip under Bun |
| XML / utils | colocated `*.test.ts` |
| Hot-path bench | `src/utils/hot-path.bench.ts` — `yarn test:bench` |
| Hot-path asserts | `src/utils/hot-path.perf.test.ts` — `AVES_PERF=1 yarn test:perf` (skipped by default) |

Patterns:

- Assert success: `result.success === true` then `result.data…`
- Assert errors: `error.kind` (`validation` \| `api` \| `unknown`)
- Cover facade dual keys and flattened list/detail DX when touching those schemas
- Restore `setGlobalDispatcher` in `afterEach` for HTTP mocks

## Public package

- `files`: `dist`, README, CHANGELOG only
- Breaking DX → semver + CHANGELOG version section + README examples / alias map (`aves-sdk-add-op`)

## Related

- Errors / Result → `aves-sdk-validation`
- Layers → `aves-sdk-architecture`
