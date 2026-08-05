---
name: aves-sdk-schemas
description: Valibot schema helpers for aves-sdk — createApiSchema, listDetailApiSchema, flattened/list responses, input aliases, shared primitives. Use when editing src/schemas or schema-transform.ts.
---

# aves-sdk schemas

Source: `src/utils/schema-transform.ts`, `booking-transform.ts`, `src/schemas/common.ts`.

Before changing Valibot APIs, check Context7.

## DX contract (1.9+)

Callers use `result.data.recordCode` / `bookingFileCode` / `pCode` and `data.*List?.[0]` — never nested `*Detail` in public output.

## Inbound helpers

| Helper | Use when |
| ------ | -------- |
| `createResponseSchema` | camelCase only |
| `createFlattenedResponseSchema(api, detailKey)` | spread one `*Detail` onto `data` |
| `createListResponseSchema(listKey, listSchema)` | typed list RS (`PackageList` → `packageList`) |
| `listDetailApiSchema(DetailKey, item)` | wire `{ Detail }` → flat `Detail[]` |
| `coalesceWireAliases` | dialect attr names → canonical |
| `StatusOnlyResponseSchema` | cancel / mod-header / commit / payment list |

### Examples

```ts
createFlattenedResponseSchema(PackageDetailApiSchema, "packageDetail");
// data.pCode

listDetailApiSchema("FeatureDetail", FeatureDetailApiSchema);

createListResponseSchema("PackageList", PackageListApiSchema);
```

## Request helpers

```ts
createApiSchema(FooInputSchema, fooWire);

createWireSchemaPair(MasterRecordDetailSchema, masterRecordWire);
// → { api, validation }

valueFieldSchema(BookingFileStatusSchema, {
  expiredDate: v.optional(v.string()),
});
// 'QUOTATION' | { value: 'QUOTATION', expiredDate? }
```

`createApiSchema` takes `GenericSchema<object, object>` — no `as Record<string, unknown>` on `toWireBody`.

## Input aliases

| Alias | Helper |
| ----- | ------ |
| `customerRecordCode` ↔ `customerDetail` | `coalesceCustomerRecordCode` |
| status string \| `{ value }` | `valueFieldSchema` |
| `selectedPackageList` ↔ `selectedPackageDetail` | `coalesceListHead` |
| `paxAssociated: string[]` | `normalizeEmptyPaxAssociated` in `toWireBody` |

Pipe coalesces so the wire always sees the canonical field.

## Shared primitives

`LanguageCodeSchema`, `OptionalLanguageCodeSchema`, `StringishSchema`, `StringishBoolSchema`, `DateRangeSchema` in `common.ts`.

Enums: object enum + `*Schema` in `schemas/enums.ts` → re-export from `index.ts`.

## Conventions

- Prefer existing helpers; extract when a block repeats
- Prefer `{}[]` over `Array<…>`
- Prefer short early returns when clear

## Anti-patterns

- Nested public output (`data.bookingFileDetail.bookingFileCode`)
- Casting through `Record<string, unknown>` for `toWireBody`
- Duplicating List/Detail unwrap instead of `listDetailApiSchema`

## Related

- WireShape / list wrap → `aves-sdk-wire`
- Result / parse vs safeParse → `aves-sdk-validation`
- Enums / Infer types / tests → `aves-sdk-style`
- New op checklist → `aves-sdk-add-op`
