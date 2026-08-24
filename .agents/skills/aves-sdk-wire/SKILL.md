---
name: aves-sdk-wire
description: AVES XML wire encoding for aves-sdk — WireShape attrs, PascalCase/@attrs, fused toWireBody, list wrap. Use when editing wire-shapes.ts, toWireBody, camelToPascalKeys, or request XML attributes.
---

# aves-sdk wire

## Rules

- **SDK I/O**: camelCase, flat DX (plus optional facade aliases — see `aves-sdk-schemas`)
- **Wire**: PascalCase keys; `@`-prefixed keys → XML attributes
- Attr vs element is **per-request `WireShape`** in `src/utils/wire-shapes.ts` — never a global field set
- Element-only roots → `elementOnlyWire` (`{}`)
- Master upsert nests under `bodyKey: "MasterRecordDetail"`; booking/search usually spread at RQ root
- Keep shapes isolated per op family (editing CreateBooking must not affect SearchFile)
- `WireShapeFor<T>` constrains attrs/children to schema keys at pairing sites — no `| WireShape` escape

## Outbound path

1. Effect Schema validates camelCase input (after schema-owned facade coalesce)
2. `createApiSchema(schema, shape)` → **`toWireBody`** — **single** shape-driven walk (list wrap + `paxAssociated` normalize + Pascal/`@` keys)
3. Transport looks up `AVES_OPS`, adds `RqHeader`, optional `bodyKey`, POSTs XML

Prefer `createWireSchemaPair(inputSchema, shape)` when you need both `api` + PascalCase `validation` schemas.

Keep exported `wrapListDetails` / `normalizeEmptyPaxAssociated` for tests/direct callers; hot path is fused `toWireBody`.

`itemShape` / `encodeShapeFor` cache synthesized shapes on static `WireShape` refs (`WeakMap`).

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
- Reintroducing a 3-walk outbound path beside fused `toWireBody`

## Related

- Response flatten / facade aliases → `aves-sdk-schemas`
- Result / tagged errors → `aves-sdk-validation`
- New op → `aves-sdk-add-op`
