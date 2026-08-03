---
name: aves-sdk-wire
description: AVES XML wire encoding for aves-sdk — WireShape attrs, PascalCase keys, list wrap, bodyKey nesting. Use when editing wire-shapes.ts, toWireBody, camelToPascalKeys, or request XML attributes.
---

# aves-sdk wire

## Rules

- **SDK I/O**: camelCase, flat DX
- **Wire**: PascalCase keys; `@`-prefixed keys → XML attributes
- Attr vs element is **per-request `WireShape`** in `src/utils/wire-shapes.ts` — never a global field set
- Element-only roots → `elementOnlyWire` (`{}`)
- Master upsert nests under `bodyKey: "MasterRecordDetail"`; booking/search usually spread at RQ root
- Keep shapes isolated per op family (editing CreateBooking must not affect SearchFile)

## Outbound path

1. Valibot validates camelCase input
2. `createApiSchema(schema, shape, wrap?)` → `toWireBody` (list wrap + `paxAssociated` normalize + `camelToPascalKeys`)
3. `invokeOp` adds `RqHeader`, optional `bodyKey`, POSTs XML

Prefer `createWireSchemaPair(inputSchema, shape)` when you need both `api` + PascalCase `validation` schemas.

## List wrap (request)

SDK: flat `*List: Detail[]`. Wire: List/Detail via `wrapListDetails` / `ListWrapOptions`:

- Default: `{ detailKey: items }`
- Create-only `arrayOfOne`: `[{ detailKey: item }, …]`
- Override: `financialDeadlineList` → `deadlineDetail`

Reuse constants from `booking-transform.ts`:

| Constant | Op |
| -------- | -- |
| `CREATE_BOOKING_LIST_KEYS` + `CREATE_ARRAY_OF_ONE` | CreateBooking |
| `MOD_SERVICES_LIST_KEYS` | ModFileServices |
| `MOD_HEADER_LIST_KEYS` | ModFileHeader |
| `FILE_PAYMENT_LIST_KEYS` | InsertFilePaymentList |

`paxAssociated`: SDK `string[]` → wire `{ pax }[]`; empty `[]` → `""`.

## Shape map

| Shape | Ops |
| ----- | --- |
| `masterRecordWire` / `searchMasterWire` | Upsert / Search master |
| `bookingFileWire` | Create / Mod services / Mod header |
| `filePaymentListRequestWire` | InsertFilePaymentList |
| `searchFileWire` | SearchBookingFiles |
| `setFileStatusWire` | SetBookingFileStatus |
| `packageDetailRequestWire` | GetPackageDetail |
| `baseSearchWire` + `avesSearchWire` | Package / top-service search |
| `elementOnlyWire` | Cancel / SetServiceStatus / CommitPackage |

## Anti-patterns

- Global “these fields are always attrs” sets
- Ad-hoc PascalCase mappers beside `createApiSchema`
- Sharing attr lists across unrelated RQs

## Related

- Response flatten / aliases → `aves-sdk-schemas`
- parse/safeParse / Result → `aves-sdk-validation`
- New op → `aves-sdk-add-op`
