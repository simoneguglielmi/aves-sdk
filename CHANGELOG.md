# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.0] - 2026-08-06

### Changed

- **Breaking:** `master.search` success payload is now `MasterRecordDetailResponse[]` — always a flat array (`[]`, one element, or many). No `rsStatus` wrapper on success (non-OK AVES status remains `result.error`). Replaces the prior `{ rsStatus, masterRecordList }` shape.

## [2.0.1] - 2026-08-05

### Changed

- Omit source maps from the published package; `files` now ships only
  `dist/index.mjs` and `dist/index.d.mts`.

## [2.0.0] - 2026-08-05

### Changed

- **Breaking:** flat operation aliases were removed; use namespaced domain clients only.
- **Breaking:** enum-typed fields now reject arbitrary strings at compile time.
- **Breaking:** `AvesError.status` retains AVES casing and `AvesError.code` is `number | undefined`.
- **Breaking:** master-record responses reflect the actual API payload, including server-only fields; `dynamicFields` is an array.
- Fixed AVES language codes (`01` Italian, `02` English), raw warning text preservation, and the `PaymentDetail` `@PaumentNote` wire spelling.

### Migration

| Change | Symptom on upgrade | Fix |
| ------ | ------------------ | --- |
| Flat aliases removed | Runtime `TypeError` | Insert the domain namespace: `client.search` → `client.master.search` |
| Enum types narrowed | Compile errors for enum fields receiving `string` | Use exported enum objects or unions |
| `AvesError.status` casing | `err.status === "error"` no longer matches | Compare with `RsStatusValue` (`"OK"`, `"ERROR"`, `"WARNING"`, `"TIMEOUT"`) |
| `AvesError.code` | Absent codes are `undefined`, not `0` | Check for `undefined` |
| `MasterRecordDetailResponse` corrected | Type gains server-only fields | Remove local re-declarations |
| `dynamicFields` is an array | Single-object assignment fails | Wrap the field in an array |

---

## [1.9.0] - 2026-08-03

### Changed

- **Breaking:** `upsertRecord` spreads `masterRecordDetail` into `data` — `result.data.recordCode`
- **Breaking:** booking create/mod/status spreads `bookingFileDetail` into `data` — `result.data.bookingFileCode`
- **Breaking:** `getPackageDetail` spreads `packageDetail` into `data` — `result.data.pCode`
- **Breaking:** response `*List` fields are flat Detail arrays (no inner `*Detail` wrapper) — e.g. `data.packageList?.[0]`, `data.masterRecordList`, `data.bookingFileList`, `data.bookedServiceList`
- **Breaking:** nested booking/catalog lists unwrapped the same way (`passengerList`, `serviceList`, `paxPriceList`, …)
- Input aliases: `customerRecordCode` ↔ `customerDetail`; `bookingFileStatus` / `fileStatus` as string or `{ value }`; `paxAssociated: string[]`; mod `selectedPackageList` ↔ `selectedPackageDetail`

### Added

- Response helpers: `listDetailApiSchema`, `flattenResponseDetail`, `createFlattenedResponseSchema`, `createListResponseSchema`
- Request helpers: `createApiSchema`, `valueFieldSchema`, `coalesceCustomerRecordCode`, `coalesceListHead`, `coalesceWireAliases`
- Shared primitives: `LanguageCodeSchema`, `StringishSchema`, `DateRangeSchema`, `StatusOnlyResponseSchema`, `createWireSchemaPair`
- `yarn typecheck` script (`tsc --noEmit`)

---

## [1.8.0] - 2026-08-03

### Added

- Exportable shared object enums (`PaxQtyCriteria`, `AvesSearchType`, `PaymentType`, `InsertCriteria`, booking/master statuses, etc.) and matching `*Schema` picklists

### Changed

- **Breaking:** `searchPackages` / `searchTopServices` payload is flat (no `baseSearch` nest)
- Defaults: `avesSearchType` (`PACKAGE` / `SERVICE` by method), `paxQty` ← `passengerList.length`, `paxQtyCriteria` ← `GREATER_OR_EQUAL`
- `languageCode` optional when set on `AvesClient` options
- Schemas use shared object enums instead of inline string unions

---

## [1.7.0] - 2026-08-03

### Added

- Package / Program catalog APIs: `searchPackages`, `searchTopServices`, `getPackageDetail`, `commitPackage`
- `searchBookingFiles` (`FILE_CODE` | `PAX_NAME` | `PACKAGE_CODE` | `OTHER`)
- Domain clients with DI: `AvesTransport`, `MasterRecordsClient`, `BookingClient`, `PackageCatalogClient`, `AvesClientDeps`
- Per-request `WireShape` model (`src/utils/wire-shapes.ts`)
- Flat method aliases auto-bound from domain prototypes (`client/flat-aliases.ts`)

### Changed

- `AvesClient` is a thin facade; prefer `client.booking.*` / `client.packages.*` / `client.master.*`
- Single outbound wire path: `createApiSchema` / `toWireBody` / `invokeOp` (optional `bodyKey`)
- XML helpers moved to `src/xml/`
- Master search/upsert routed through `invokeOp`

### Fixed

- InsertFilePaymentList root `paymentUser` emitted as `@PaymentUser` (not a child element)

### Removed

- Global `ATTRIBUTE_FIELDS` registry
- Versioned docs under `docs/` from git (`docs/` gitignored)

---

## [1.6.0] - 2026-07-29

### Changed

- **Breaking:** booking `*List` SDK inputs are flat `Detail[]`; SDK wraps to AVES List/Detail XML
- Shared `PaymentTypeSchema` across booking ops
- README refreshed for constructor, `Result` / `AvesError`, and flat list examples
- Documented additional package managers in README

---

## [1.5.1] - 2026-07-29

### Changed

- Added `fast-xml-builder` dependency
- Dependency / `tsdown` config maintenance

---

## [1.5.0] - 2026-07-29

### Added

- `insertFilePaymentList` (InsertFilePaymentList) for payment registration
- Tighter `invokeOp` schema inference
- Booking ops documentation updates

---

## [1.4.0] - 2026-07-29

### Added

- Booking ops: ModBookingFileServices, ModBookingFileHeader, CancelBookingFile, SetStatus / SetStatusService
- Shared transforms and typed BOOKEDFILE responses
- Unit coverage for booking ops

### Changed

- Dependency updates

---

## [1.3.4] - 2026-03-09

### Added

- Create-booking related input schemas: financial deadlines, payments, selected packages/services, notes, passengers

### Fixed

- Union formatting in `SelectedServiceListInputSchema`

### Changed

- Error handling via `isOk`
- Schema / quote standardization across client and types

---

## [1.3.3] - 2026-02-26

### Fixed

- `package.json` packaging fix

---

## [1.3.2] - 2026-02-10

### Added

- `createBooking` (CreateBookingFile) with tests
- Migrated bundler from `tsup` to `tsdown`

### Changed

- Package configuration updates

---

## [1.3.1] - 2026-02-01

### Changed

- Error-handling path formatting simplified
- String-quote standardization

---

## [1.3.0] - 2026-02-01

### Added

- Biome linting
- Undici-based mock improvements in tests
- Additional master-record properties and attribute-schema refactor
- Broader test coverage

### Changed

- Consolidated XML root element definitions and utilities

---

## [1.2.16] - 2026-01-27

### Changed

- Removed unnecessary `as any` casts

---

## [1.2.15] - 2026-01-27

### Fixed

- XML / validation follow-up fixes

---

## [1.2.14] - 2026-01-27

### Changed

- XML ↔ JSON conversion and validation schema improvements

---

## [1.2.13] - 2026-01-27

### Added

- Request timeout handling with clear timeout vs other errors
- `isAbortError` utility

### Changed

- `AvesClientOptions` moved to `types.ts`
- Request method uses Valibot `BaseSchema` more consistently
- Upsert response schema and error detail improvements
- `recordCode` length validation tests

---

## [1.2.12] - 2026-01-26

### Added

- Export `AvesClientOptions` for external usage
- Mapped profiling record support

### Changed

- Restructured `AvesError` handling and client initialization
- Optional `insertCriteria` on upsert flow

### Fixed

- Misc client fixes

---

## [1.2.11] - 2026-01-21

### Fixed

- Error code handling uses numeric values instead of strings

---

## [1.0.3] - 2025-10-04

Early tagged releases (`v1.0.0` … `v1.0.3`) from the initial NestJS-oriented AVES SDK work. Detailed commit notes for those tags are limited in the current branch history.

### Added

- Initial AVES SDK implementation with XML/REST interfaces (2025-10-03)

---

## Links

- [npm](https://www.npmjs.com/package/aves-sdk)
- [GitHub](https://github.com/simoneguglielmi/aves-sdk)
- Tags: [v1.0.0](https://github.com/simoneguglielmi/aves-sdk/releases/tag/v1.0.0) … [v1.0.3](https://github.com/simoneguglielmi/aves-sdk/releases/tag/v1.0.3)

> Git tags after `v1.0.3` were not present when this file was generated; version sections follow `package.json` bumps and commit messages.
