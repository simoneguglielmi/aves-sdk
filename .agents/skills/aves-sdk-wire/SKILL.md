---
name: aves-sdk-wire
description: AVES XML wire encoding for aves-sdk — WireShape attrs, PascalCase/@attrs, list wrap, bodyKey nesting. Use when editing wire-shapes.ts, toWireBody, camelToPascalKeys, or request XML attributes.
---

# aves-sdk wire

## Rules

- **SDK I/O**: camelCase, flat DX
- **Wire**: PascalCase keys; `@`-prefixed keys → XML attributes
- Attr vs element is **per-request `WireShape`** in `src/utils/wire-shapes.ts` — never a global field set
- Element-only roots → `elementOnlyWire` (`{}`)
- Master upsert nests under `bodyKey: "MasterRecordDetail"`; booking/search usually spread at RQ root
- Keep shapes isolated per op family (editing CreateBooking must not affect SearchFile)
- `WireShapeFor<T>` constrains attrs/children to schema keys at pairing sites — no `| WireShape` escape

## Outbound path

1. Valibot validates camelCase input
2. `createApiSchema(schema, shape)` → `toWireBody` (shape-driven list wrap + `paxAssociated` normalize + `camelToPascalKeys`)
3. `invokeOp` adds `RqHeader`, optional `bodyKey`, POSTs XML

Prefer `createWireSchemaPair(inputSchema, shape)` when you need both `api` + PascalCase `validation` schemas.

## List wrap (request)

SDK: flat `*List: Item[]`. Put `listWrap` on the **item** shape:

- `"many"` → `{ detailKey: items }`
- `"one"` → `[{ detailKey: item }, …]`
- `detailKey` when inference fails (`financialDeadlineList` → `deadlineDetail`)

Attrs/children describe each item; encode synthesizes the Detail wrapper so `WireShapeFor` stays honest.

`paxAssociated`: SDK `string[]` → wire `{ pax }[]`; empty `[]` → `""`.

## Key overrides

- Global `KEY_OVERRIDES` (`rph`/`toServiceType`/`text→#text`) — types + runtime
- Per-shape `rename` (e.g. `paymentNote` → `PaumentNote`) — `wireKey` + `Pascalize<T, S>`

## Shape map

| Shape | Ops |
| ----- | --- |
| `masterRecordWire` / `searchMasterWire` | Upsert / Search master |
| `bookingFileWire` | CreateBooking |
| `modBookingFileWire` | ModFileServices / ModFileHeader |
| `filePaymentListRequestWire` | InsertFilePaymentList |
| `searchFileWire` | SearchBookingFiles |
| `setFileStatusWire` | SetBookingFileStatus |
| `packageDetailRequestWire` | GetPackageDetail |
| `baseSearchWire` + `avesSearchWire` | Package / top-service search |
| `elementOnlyWire` | Cancel / SetFileServiceStatus / CommitPackage |

## Anti-patterns

- Global “these fields are always attrs” sets
- Ad-hoc PascalCase mappers beside `createApiSchema`
- Sharing attr lists across unrelated RQs
- Global list-key name scans (`listKeys: string[]`)
- `| WireShape` on `WireShapeFor.children`
- Hand-written `as const satisfies WireShape` — use `wire` / `attrsWire` / `camelAttrsWire` / `listWire`

## Related

- Response flatten / aliases → `aves-sdk-schemas`
- parse/safeParse / Result → `aves-sdk-validation`
- New op → `aves-sdk-add-op`
