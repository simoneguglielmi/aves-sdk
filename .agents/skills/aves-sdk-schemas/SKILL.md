---
name: aves-sdk-schemas
description: Valibot schema helpers for aves-sdk — createApiSchema, listDetailApiSchema, flattened/list responses, facade dual keys, shared primitives. Use when editing src/schemas, schema-transform.ts, or facade-aliases.
---

# aves-sdk schemas

Source: `src/utils/schema-transform.ts`, `booking-transform.ts`, `facade-aliases.ts`, `facade-transform.ts`, `src/schemas/common.ts`.

Before changing Valibot APIs, check Context7.

## DX contract (1.9+)

Callers use `result.data.recordCode` / `bookingFileCode` / `pCode` and `data.*List?.[0]` — never nested `*Detail` in public output.

Facade concise names (`customerCode`, `bookingCode`, `services`, …) are also accepted on input and exposed on success (compat window). Full map: README · SoT: `facade-aliases.ts` (in) / `publicKeyAliases` (out).

## Inbound helpers

| Helper | Use when |
| ------ | -------- |
| `createResponseSchema` | camelCase via **in-place** `pascalToCamelKeysInPlace` after parse (ADR 0001 Phase 2a) |
| `createFlattenedResponseSchema(api, detailKey)` | spread one `*Detail` onto `data` |
| `createListResponseSchema(listKey, listSchema)` | typed list RS (`PackageList` → `packageList`) |
| `listDetailApiSchema(DetailKey, item)` | wire `{ Detail }` → flat `Detail[]` |
| `coalesceWireAliases` | dialect attr names → canonical |
| `facadeObject` / `coalesceAliases` | dual-key input → AVES-only schema output |
| `StatusOnlyResponseSchema` | cancel / mod-header / commit / payment list |

### Examples

```ts
createFlattenedResponseSchema(PackageDetailApiSchema, "packageDetail");
// data.pCode

listDetailApiSchema("FeatureDetail", FeatureDetailApiSchema);

createListResponseSchema("PackageList", PackageListApiSchema);

// master.search → result.data is MasterRecordDetailResponse[] (domain maps list)
```

## Request helpers

```ts
createApiSchema(FooInputSchema, fooWire);

createWireSchemaPair(MasterRecordDetailSchema, masterRecordWire);
// → { api, validation }

valueFieldSchema(BookingFileStatusSchema, {
  expiredDate: v.optional(v.string()),
});
```

`createApiSchema` takes `GenericSchema<object, object>` — no `as Record<string, unknown>` on `toWireBody`.

## Facade dual keys

| Direction | Mechanism |
| --------- | --------- |
| **Inbound** | Scoped maps in `facade-aliases.ts` + `facadeObject` / `coalesceAliases` on the owning schema |
| **Outbound** | `withPublicAliases` / `toFacadeResult` — hardened lazy **Proxy** (`publicKeyAliases`); zero deep-copy |

Do **not** invent a global AliasShape walker. Colliding facade names (`services`, `status`, `passengerCount`) resolve by schema scope (in) / existing AVES key on target (out).

Legacy helpers still valid:

| Alias | Helper |
| ----- | ------ |
| `customerRecordCode` ↔ `customerDetail` | `coalesceCustomerRecordCode` |
| status string \| `{ value }` | `valueFieldSchema` |
| `selectedPackageList` ↔ `selectedPackageDetail` | `coalesceListHead` |
| `paxAssociated: string[]` | normalize inside fused `toWireBody` |

## Shared primitives

`LanguageCodeSchema`, `OptionalLanguageCodeSchema`, `StringishSchema`, `StringishBoolSchema`, `DateRangeSchema` in `common.ts`.

Enums: object enum + `*Schema` in `schemas/enums.ts` → re-export from `index.ts`.

## Anti-patterns

- Nested public output (`data.bookingFileDetail.bookingFileCode`)
- Casting through `Record<string, unknown>` for `toWireBody`
- Duplicating List/Detail unwrap instead of `listDetailApiSchema`
- Global facade walker / dual SoT beside `facade-aliases` + `publicKeyAliases`
- Merging camelize + facade aliases into one inbound walk (Proxy already zero-copies aliases)

## Related

- WireShape / list wrap → `aves-sdk-wire`
- Result / parse vs safeParse → `aves-sdk-validation`
- Enums / Infer types / tests → `aves-sdk-style`
- New op checklist → `aves-sdk-add-op`
