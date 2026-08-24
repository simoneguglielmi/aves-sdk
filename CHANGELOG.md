# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

<a id="v5.0.0"></a>
## [5.0.0] - 2026-08-07

Effect-native core: **Effect Schema** + **`@effect/platform` HttpClient**, Promise `Result` facade at the edge, optional Layers / `ManagedRuntime` for Effect apps.

### Added

- `makeAvesRuntime(options, deps?)` — `ManagedRuntime` over `avesClientLayer` for `yield* AvesBooking` / `AvesMaster` / `AvesPackages` / `AvesTransport`
- `avesClientLayer` / `AvesClientLive` — composable Effect Layers (`config → http → transport → domains`)
- Domain Tags: `AvesBooking`, `AvesMaster`, `AvesPackages`, `AvesTransport`, `AvesHttp`, `AvesConfig`
- `createAvesClient` — plain-object Promise facade (same shape as `AvesClient`)
- Public `Result` / `ok` / `err`; `isAvesError`; tagged errors `AvesValidationError` / `AvesApiError` / `AvesUnknownError` (+ factories)
- Test DI: `deps.httpClient` (`HttpClient.make`) and/or `deps.http` / domain service overrides

### Changed

- **Breaking:** Validation stack is **Effect Schema** (`effect`). Valibot is removed.
- **Breaking:** HTTP is **`@effect/platform`** (`FetchHttpClient` by default). Undici is no longer a dependency; do not use `MockAgent` / `setGlobalDispatcher` for SDK tests — inject `HttpClient.make` via `deps.httpClient`.
- **Breaking:** Domains are Effect-native (`Effect.Effect<…, AvesError>`). The Promise API is a thin `toPromiseFacade` edge on `createAvesClient` / `AvesClient`.
- **Breaking:** `client.transport` is **removed** from the Promise facade. Effect programs use `yield* AvesTransport` (or domain Tags) with `makeAvesRuntime` / `avesClientLayer`.
- **Breaking:** `AvesError` is a **tagged union**, not a single constructible class. Prefer `isAvesError(e)`, `e instanceof AvesApiError`, or `Effect.catchTag("AvesApiError", …)`. Promise `error.kind` (`validation` | `api` | `unknown`) is unchanged.
- **Breaking:** DI no longer uses `new AvesTransport(options)` / `new BookingClient(transport)`. Use `AvesClientDeps`: `{ httpClient?, http?, transport?, master?, booking?, packages? }`.
- Internal layout: `src/client/{booking,master,packages,http,transport,config}/` (types / tag / service / layer).
- Published types shrank from 1.21 MB to 404 kB (npm tarball 115 kB → 72 kB): op params/results and the domain service types are now written against named types instead of inferred, so the declaration bundle references `BookingInput` & co. instead of inlining every schema structure. The public API is unchanged — `src/client/{ops,services}.test-d.ts` pin each op and domain method against the schema the transport actually uses.

### Migration (4.x → 5.x)

1. **Install** — `aves-sdk@5` pulls `effect` and `@effect/platform`. No Valibot/undici required.
2. **Promise apps** — keep `new AvesClient(options)` / `createAvesClient(options)`. Import `Result` from `aves-sdk` if you typed it locally. Stop reading `client.transport`.
3. **Errors** — replace `instanceof AvesError` with `isAvesError(error)` (or the concrete tagged class). `error.kind` / `message` / `status` / `code` still work on the Promise path.
4. **Tests / DI** — replace undici `MockAgent` with platform mocks:

```ts
import { HttpClient, HttpClientResponse } from "@effect/platform";
import { Effect } from "effect";
import { AvesClient } from "aves-sdk";

const httpClient = HttpClient.make((request, url) =>
  Effect.succeed(
    HttpClientResponse.fromWeb(
      request,
      new Response(`<SearchMasterRecordRS><RsStatus Status="OK"/></SearchMasterRecordRS>`, {
        status: 200,
      }),
    ),
  ),
);

const client = new AvesClient(options, { httpClient });
```

5. **Effect apps** — use Layers instead of the Promise facade:

```ts
import { Effect } from "effect";
import { AvesMaster, makeAvesRuntime } from "aves-sdk";

const runtime = makeAvesRuntime(options);
const records = await runtime.runPromise(
  Effect.gen(function* () {
    const master = yield* AvesMaster;
    return yield* master.search({ searchType: "CODE", recordCode: "508558" });
  }),
);
await runtime.dispose();
```

Or `Effect.provide(avesClientLayer(options, deps))` without a ManagedRuntime. Recover with `Effect.catchTag("AvesApiError", …)` / `"AvesValidationError"` / `"AvesUnknownError"`.

XML wire shapes, facade aliases, and domain method names from 4.x are unchanged.

<a id="v4.1.0"></a>
## [4.1.0] - 2026-08-07

### Added

- `client.booking.exportData(params)` — **ExportBookingData** (`BookingDataExportRQ` / `BookingDataExportRS`). The only AVES operation that reads a booking file back whole: header, passengers, booked services with per-line `amountsDetail`, file-level `bookedFileAmounts`, and **registered payments**. `addPayments` finally has a read counterpart.
- `ExtraInfo` lookup tables on the response: `currencyList`, `vatList`, `nationList`, `travelAgentList`, `programList`, `statisticList`, `priceOffertList`, `userList`, `passengerCategoryList`, `masterDataSet`, `masterDataSetExtraInfo`. `nationList[].territoriality` (`IN_UE` / `OUT_UE` / `MIXED_UE`) is the VAT-regime input.
- Object enums (+ schemas) for every closed picklist the export returns: `ExportType`, `Territoriality`, `StatisticType`, `ToSubServiceType`, `SellingType`, `Printable`, `PrintType`, `DeadlineStatus`, `CommissionIncomeType`, `CommissionOwedType`.
- `RecordTypeWire` — `RecordType` plus `NOT_SET`, for read responses. Mirrors the existing `BookingFileStatus` / `BookingFileStatusWire` split.
- Remaining documented export structures are now typed: `customerProcessedPrintList`, `instalmentPlanList`, `supplierInstalmentPlanList`, file- and service-level `deadlineList`, `commissionIncomeDetails`, `commissionOwedDetails`.
- Types `ExportBookingDataRQ` / `ExportBookingDataRS`, `ExportedBookingFile`, `ExportExtraInfo`, and facade aliases `BookingExportInput` / `BookingExportResult`.
- Facade output aliases: `bookingFileList` → `bookings`, `bookedServices` → `services`, `amountsDetail` → `amounts`, `bookedFileAmounts` → `totals`.

### Fixed

- `master.search` / `master.upsert` responses no longer reject a record whose `RecordType` is `NOT_SET`. The response validation schema was reusing the request picklist, which omits it. Server-only fields AVES returns on read (`AreaCode`, `LastDateContact`, `UseSupplierDataOnTravelDoc`, `BookingEnabled`, `PrivacyPolicyAccepted`, and the misspelled `ModifitedDate`) are no longer dropped.

  Note for TypeScript consumers: `MasterRecordDetailResponse["recordType"]` widens from `RecordType` to `RecordTypeWire`, so an exhaustive `switch` over it now needs a `NOT_SET` branch. Input types are unchanged.
- Facade arrays now expose public aliases when **iterated**, not only when indexed. `withPublicAliases` bound array methods to the raw target, so `for…of`, destructuring, spread, `Array.from`, `map`, `filter`, `find`, `forEach` and `at` all handed back rows without their alias keys — `const [p] = result.data.payments` yielded a row with `paymentDate` but no aliases, while `result.data.payments[0]` worked. Methods now run with `this` bound to the proxy. This also makes `indexOf` / `includes` consistent: `arr.indexOf(arr[0])` returned `-1` before, since it compared wrapped items against raw ones.

### Changed

- `BoolishSchema` moved from `schemas/booking-shared.ts` to `schemas/common.ts`, next to `StringishSchema` — it is a cross-domain wire primitive, and `master-record` / `package-catalog` were already importing it out of the booking module. Internal only; it is not part of the published entry point.

### Notes

- Request roots are `BookingDataExport*`, not `ExportBookingData*`: the spec's section tables name the endpoint, while its index and both worked XML examples name the elements.
- `limitRange` enforces the documented bounds (`skip` ≥ 0, `take` ≤ 1000) before the request leaves the SDK.
- Wire misspellings are normalized on the way in: `PaumentNote` → `paymentNote`, `FirstConfemationDate` → `firstConfirmationDate`, `UsersList` → `userList`, `TOSubServiceType` → `toSubServiceType`.
- `extraInfo.masterDataSet` rows validate as full master records, reusing the schema behind `master.search`.
- `regimeType` and `customerPayAt` are the only response fields left as plain strings: Booking.txt:11312 documents no value list for the first, and the second appears nowhere in the response table — only in the example, as `OUR_AGENCY`. There is nothing to validate against; an enum built from one sample would reject every other value.
- `Printable` values are rejoined from a spec table that hard-wraps identifiers mid-token. If a live response is ever rejected on that field, check the reconstruction against Booking.txt:11261-11289 first.

<a id="v4.0.1"></a>
## [4.0.1] - 2026-08-06

### Added

- Copy `CHANGELOG.md` into `dist/` on build (`tsdown` `copy`) and include `dist/CHANGELOG.md` in published `files`.

<a id="v4.0.0"></a>
## [4.0.0] - 2026-08-06

### Added

- `OpBodyKey` object enum (`MasterRecordDetail`) for RQ payload nest keys; typed on `AVES_OPS` / envelope.
- `AvesOp` object enum (+ `AvesOpSchema`) for `invokeOp` keys; domains use `AvesOp.create` instead of string literals.

### Changed

- **Breaking:** Domain method names no longer repeat the namespace / AVES verb soup. `AVES_OPS` keys follow the same short names (with `searchBookings` / `searchPackages` where `search` would collide).

| Namespace | 3.x | 4.x |
| --------- | --- | --- |
| `master` | `upsertRecord` | `upsert` |
| `booking` | `createBooking` | `create` |
| `booking` | `modBookingServices` | `updateServices` |
| `booking` | `modBookingHeader` | `updateHeader` |
| `booking` | `cancelBooking` | `cancel` |
| `booking` | `setBookingStatus` | `setStatus` |
| `booking` | `setBookingServiceStatus` | `setServiceStatus` |
| `booking` | `insertFilePaymentList` | `addPayments` |
| `booking` | `searchBookingFiles` | `search` |
| `packages` | `searchPackages` | `search` |
| `packages` | `searchTopServices` | `searchServices` |
| `packages` | `getPackageDetail` | `get` |
| `packages` | `commitPackage` | `commit` |

`master.search` is unchanged. Endpoint URLs and XML roots are unchanged.

### Migration (1.x / 3.x → 4.x)

Jump straight to 4.x for September apps: apply the 3.x facade + `master.search` flat-array notes, then rename methods per the table above (no compatibility aliases).

```ts
// 3.x
await client.booking.createBooking(params);
await client.packages.searchPackages(params);
await client.master.upsertRecord(record);

// 4.x
await client.booking.create(params);
await client.packages.search(params);
await client.master.upsert(record);
```

<a id="v3.1.1"></a>
## [3.1.1] - 2026-08-06

### Added

- Concise facade aliases for common I/O properties: `customerCode`, `bookingCode`, `services`, `passengers`, `packageCode`, `serviceCode`, `quantity`, `session`, and related fields.
- Schema-owned dual keys via `facadeObject` / `coalesceAliases` (same pattern as `coalesceCustomerRecordCode`).
- Simplified public type aliases including `BookingInput`, `Booking`, `MasterRecord`, `PackageInput`, and `Package`.
- `AVES_OPS` registry + `invokeOp(op, params)` with external `OpParams` / `OpResult` typings.
- Full facade alias property map in README (outbound `publicKeyAliases` + inbound scoped maps).
- 2.x → 3.x migration notes for `master.search` (flat array success payload).

### Changed

- Facade names are accepted on Valibot input schemas and coalesced to AVES camelCase before wire encoding. Success payloads also expose concise compatibility aliases.
- Internal transport split: `HttpClient`, `buildOpEnvelope`, `readAvesResponse`, `createRqHeader`; `toAvesError` lives in `error.ts`. Public `invokeOp` API unchanged.
- Hot-path micro-opts: cached endpoint URLs, shared XML POST headers, frozen cached `RqHeader`, single `AVES_OPS` lookup per `invokeOp`.
- Cap HTTP error body reads via `readTextCapped` (drain stream, keep ≤ `MAX_ERROR_BODY`).
- WeakMap cache for `itemShape` / `encodeShapeFor` on static WireShape refs.
- `toWireBody` single shape-driven walk (list wrap + pax normalize + wire keys).
- Zero-copy `withPublicAliases` via hardened lazy Proxy (WeakMap identity, proto-pollution blocked).
- `createResponseSchema` camelizes Valibot output **in place** (`pascalToCamelKeysInPlace`) — no second deep-copy.
- Performance harness: `yarn test:bench` (Vitest bench) and `AVES_PERF=1 yarn test:perf` (relative hot-path asserts).

<a id="v3.0.0"></a>
## [3.0.0] - 2026-08-06

### Changed

- **Breaking:** `master.search` success payload is now `MasterRecordDetailResponse[]` — always a flat array (`[]`, one element, or many). No `rsStatus` wrapper on success (non-OK AVES status remains `result.error`). Replaces the prior `{ rsStatus, masterRecordList }` shape.

### Migration (2.x → 3.x)

Only `master.search` success shape changed. Other domain methods and error/`Result` contracts are unchanged from 2.x.

| Change | Symptom on upgrade | Fix |
| ------ | ------------------ | --- |
| `master.search` success is a flat array | `result.data.masterRecordList` / `result.data.rsStatus` are `undefined`; types fail | Use `result.data` as `MasterRecordDetailResponse[]` (e.g. `const [record] = result.data` or `result.data.map(...)`) |
| Looking for `rsStatus` on success | Always missing when `result.success` | Keep using `result.error` for non-OK AVES / HTTP failures (`error.kind`, `error.status`, `error.code`) |
| Empty search | May have expected a missing list or wrapper | Success with no hits is `result.data === []` |

**Before (2.x):**

```ts
const result = await client.master.search({
  searchType: "CODE",
  recordCode: "508558",
});
if (result.success) {
  const records = result.data.masterRecordList ?? [];
  console.log(result.data.rsStatus.status, records[0]?.recordCode);
}
```

**After (3.x):**

```ts
const result = await client.master.search({
  searchType: "CODE",
  recordCode: "508558",
});
if (result.success) {
  const [record] = result.data; // MasterRecordDetailResponse[]
  console.log(record?.recordCode);
} else {
  console.error(result.error.kind, result.error.status, result.error.message);
}
```

3.1.x on top of 3.0 is additive (facade aliases / internal transport). No further breaking migration from 3.0 → 3.1.1.

<a id="v2.0.1"></a>
## [2.0.1] - 2026-08-05

### Changed

- Omit source maps from the published package; `files` now ships only
  `dist/index.mjs` and `dist/index.d.mts`.

<a id="v2.0.0"></a>
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

<a id="v1.9.0"></a>
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

<a id="v1.8.0"></a>
## [1.8.0] - 2026-08-03

### Added

- Exportable shared object enums (`PaxQtyCriteria`, `AvesSearchType`, `PaymentType`, `InsertCriteria`, booking/master statuses, etc.) and matching `*Schema` picklists

### Changed

- **Breaking:** `searchPackages` / `searchTopServices` payload is flat (no `baseSearch` nest)
- Defaults: `avesSearchType` (`PACKAGE` / `SERVICE` by method), `paxQty` ← `passengerList.length`, `paxQtyCriteria` ← `GREATER_OR_EQUAL`
- `languageCode` optional when set on `AvesClient` options
- Schemas use shared object enums instead of inline string unions

---

<a id="v1.7.0"></a>
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

<a id="v1.6.0"></a>
## [1.6.0] - 2026-07-29

### Changed

- **Breaking:** booking `*List` SDK inputs are flat `Detail[]`; SDK wraps to AVES List/Detail XML
- Shared `PaymentTypeSchema` across booking ops
- README refreshed for constructor, `Result` / `AvesError`, and flat list examples
- Documented additional package managers in README

---

<a id="v1.5.1"></a>
## [1.5.1] - 2026-07-29

### Changed

- Added `fast-xml-builder` dependency
- Dependency / `tsdown` config maintenance

---

<a id="v1.5.0"></a>
## [1.5.0] - 2026-07-29

### Added

- `insertFilePaymentList` (InsertFilePaymentList) for payment registration
- Tighter `invokeOp` schema inference
- Booking ops documentation updates

---

<a id="v1.4.0"></a>
## [1.4.0] - 2026-07-29

### Added

- Booking ops: ModBookingFileServices, ModBookingFileHeader, CancelBookingFile, SetStatus / SetStatusService
- Shared transforms and typed BOOKEDFILE responses
- Unit coverage for booking ops

### Changed

- Dependency updates

---

<a id="v1.3.4"></a>
## [1.3.4] - 2026-03-09

### Added

- Create-booking related input schemas: financial deadlines, payments, selected packages/services, notes, passengers

### Fixed

- Union formatting in `SelectedServiceListInputSchema`

### Changed

- Error handling via `isOk`
- Schema / quote standardization across client and types

---

<a id="v1.3.3"></a>
## [1.3.3] - 2026-02-26

### Fixed

- `package.json` packaging fix

---

<a id="v1.3.2"></a>
## [1.3.2] - 2026-02-10

### Added

- `createBooking` (CreateBookingFile) with tests
- Migrated bundler from `tsup` to `tsdown`

### Changed

- Package configuration updates

---

<a id="v1.3.1"></a>
## [1.3.1] - 2026-02-01

### Changed

- Error-handling path formatting simplified
- String-quote standardization

---

<a id="v1.3.0"></a>
## [1.3.0] - 2026-02-01

### Added

- Biome linting
- Undici-based mock improvements in tests
- Additional master-record properties and attribute-schema refactor
- Broader test coverage

### Changed

- Consolidated XML root element definitions and utilities

---

<a id="v1.2.16"></a>
## [1.2.16] - 2026-01-27

### Changed

- Removed unnecessary `as any` casts

---

<a id="v1.2.15"></a>
## [1.2.15] - 2026-01-27

### Fixed

- XML / validation follow-up fixes

---

<a id="v1.2.14"></a>
## [1.2.14] - 2026-01-27

### Changed

- XML ↔ JSON conversion and validation schema improvements

---

<a id="v1.2.13"></a>
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

<a id="v1.2.12"></a>
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

<a id="v1.2.11"></a>
## [1.2.11] - 2026-01-21

### Fixed

- Error code handling uses numeric values instead of strings

---

<a id="v1.0.3"></a>
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
