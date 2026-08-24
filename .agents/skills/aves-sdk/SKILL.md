---
name: aves-sdk
description: Index for aves-sdk project skills. Use when starting work in this repo or unsure which aves-sdk-* skill applies. Canonical guide is AGENTS.md — skills are optional progressive disclosure.
---

# aves-sdk

**Canonical:** repo-root [`AGENTS.md`](../../../AGENTS.md) — self-contained; enough without skills.

Skills live in **`.agents/skills/`** (symlinked for Cursor / Claude Code / Codex).

TypeScript SDK for AVES XML REST. **yarn** · **Effect Schema** · **`@effect/platform`** · `tsdown` · Biome.

Before changing Effect Schema / `@effect/platform` APIs, check Context7.

## Optional skills (mirrors of AGENTS.md sections)

| Skill | When |
| ----- | ---- |
| `aves-sdk-architecture` | Client layers, domains, DI, `AVES_OPS`, transport split |
| `aves-sdk-wire` | WireShape, PascalCase/@attrs, fused `toWireBody` |
| `aves-sdk-schemas` | Effect Schema helpers, flatten DX, facade aliases |
| `aves-sdk-validation` | Result, tagged `AvesError`, `decodeUnknownAves`, rsStatus |
| `aves-sdk-style` | Biome, ESM, enums, Infer types, Vitest / bench |
| `aves-sdk-add-op` | Adding an API op end-to-end + verify/release |

Prefer existing helpers over new transform paths. Facade dual keys: schema-owned inbound (`facade-aliases.ts`) + Proxy outbound (`withPublicAliases`).

```bash
yarn typecheck && yarn test
# optional: yarn test:bench · AVES_PERF=1 yarn test:perf
```
