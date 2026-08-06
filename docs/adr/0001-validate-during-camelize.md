# ADR 0001: Validate-during-camelize

## Status

**Accepted (Phase 2a shipped).** Phase 2b (true single-pass schema visitor from XML) remains proposed.

## Context

Inbound AVES responses historically did:

```text
XML → Pascal object (xmlToJson)
    → Valibot safeParse (Pascal-shaped API schema)   // allocates tree A
    → transform pascalToCamelKeys                    // allocates tree B
    → camel object (+ optional flatten)
    → withPublicAliases (Proxy facade, zero-copy)
```

After the Proxy facade work, aliasing no longer deep-copies. The remaining waste on large RS payloads was **tree B**: a full structural clone solely to rename keys.

Ideal end state (Phase 2b):

```text
XML parser → schema visitor → camel object (validated in the same walk)
```

That requires rewriting how response schemas bind to XML (blast radius across `createResponseSchema`, flatten/list helpers, and RS tests).

## Decision

Ship **Phase 2a** now; keep **Phase 2b** as a follow-up when benches justify it.

### Phase 2a (shipped)

1. Keep Pascal wire validation schemas (no DX / schema rewrite).
2. After `safeParse`/`parse` succeeds, **camelize keys in place** on the Valibot output via `pascalToCamelKeysInPlace`.
3. Wire this through `createResponseSchema` so every list/flattened/status RS benefits.

```text
XML → Pascal object
    → Valibot parse (tree A)
    → pascalToCamelKeysInPlace(tree A)   // same references, renamed keys
    → Proxy facade
```

Public API and InferOutput types unchanged. Pure `pascalToCamelKeys` remains for callers that need an immutable copy.

### Phase 2b (proposed)

Unify XML decode + validation + camel emit into one schema-driven visitor so tree A is born already camelCase. Go criteria:

1. Bench: `pascalToCamelKeysInPlace` share of `invokeOp` on large `BookingFile` RS still material after Phase 2a
2. Prototype visitor on one RS family without regressing flatten / `listDetailApiSchema`
3. Prefer internal-only change; semver only if intermediate Pascal types leak publicly

## Consequences

### Positive

- Phase 2a: eliminates the second deep-copy allocation on every successful response parse
- Validation still runs on the wire-shaped Pascal tree (schemas unchanged)
- Phase 2b path remains open without blocking current releases

### Negative / risks

- Phase 2a mutates Valibot output objects (safe today: outputs are fresh plain objects; do not freeze parse results)
- Phase 2b still a large rewrite if pursued
- In-place rename must not run on shared/cached wire trees (transport always parses per response)

## Alternatives considered

| Option | Outcome |
| ------ | ------- |
| Fuse camelize + Proxy aliases | Rejected — Proxy already zero-copy for aliases |
| Pascal-native public API | Rejected — breaks camelCase SDK DX |
| Camelize-then-validate (reorder only) | Rejected for Phase 2a — still one full copy; needs camel schemas |
| Full schema visitor immediately | Deferred to Phase 2b — high blast radius |

## Non-goals

- Removing dual-key facade DX / Proxy facade
- Merging public aliases into the camelize pass
- Changing XML parser library

## References

- `src/utils/case-transform.ts` — `pascalToCamelKeys` / `pascalToCamelKeysInPlace`
- `src/utils/schema-transform.ts` — `createResponseSchema`
- `src/utils/facade-transform.ts` — Proxy `withPublicAliases`
- Perf: `yarn test:bench` (`src/utils/hot-path.bench.ts`), `yarn test:perf` (`AVES_PERF=1`)
