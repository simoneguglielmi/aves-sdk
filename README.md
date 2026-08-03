# AVES SDK

Type-safe TypeScript SDK for the AVES XML REST API. Handles XML parsing, Valibot validation, camelCase ↔ PascalCase / `@` attrs, and returns `Result` instead of throwing.

## Release 1.7.0

- **Package / Program catalog**: `searchPackages`, `searchTopServices`, `getPackageDetail`, `commitPackage` (namespaced under `client.packages` + flat aliases)
- **Search booking files**: `searchBookingFiles` (`FILE_CODE` | `PAX_NAME` | `PACKAGE_CODE` | `OTHER`)
- **Client split**: `AvesTransport`, `MasterRecordsClient`, `BookingClient`, `PackageCatalogClient`; DI via `AvesClientDeps`
- **Wire shapes**: per-request `WireShape` (replaces global attr set); `InsertFilePaymentList` root `paymentUser` is `@PaymentUser`
- **Unified outbound path**: `createApiSchema` / `toWireBody` / `invokeOp` (optional `bodyKey` for master upsert)
- Flat methods remain as auto-bound compat aliases; prefer `client.booking.*` / `client.packages.*` / `client.master.*`

## Installation

```bash
npm install aves-sdk
# or
yarn add aves-sdk
# or
pnpm add aves-sdk
# or
bun add aves-sdk
```

## Quick start

```typescript
import { AvesClient } from 'aves-sdk';

const client = new AvesClient({
  baseURL: 'https://api.example.com',
  hostID: '000000', // 6 digits
  xtoken: 'TOKEN',
  languageCode: '02', // optional: 01=Italian, 02=English
  timeoutMs: 30_000, // optional
});

const result = await client.search({
  searchType: 'CODE',
  recordCode: '508558',
});

if (result.success) {
  console.log(result.data.masterRecordList);
} else {
  console.error(result.error.kind, result.error.message, result.error.code);
}
```

## Client shape

`AvesClient` is a facade over domain clients. **Prefer namespaces.** Flat methods are auto-bound from domain prototypes (no hand-maintained forwarders).

```typescript
// canonical
await client.booking.createBooking(params);
await client.packages.searchPackages(params);
await client.master.search({ searchType: 'CODE', recordCode: '508558' });

// flat compat (same implementations)
await client.createBooking(params);
await client.searchPackages(params);
await client.search({ searchType: 'CODE', recordCode: '508558' });
```

| Namespace | Methods |
| --------- | ------- |
| `master` | `search`, `upsertRecord` |
| `booking` | `createBooking`, `modBookingServices`, `modBookingHeader`, `cancelBooking`, `setBookingStatus`, `setBookingServiceStatus`, `insertFilePaymentList`, `searchBookingFiles` |
| `packages` | `searchPackages`, `searchTopServices`, `getPackageDetail`, `commitPackage` |

### Constructor

```typescript
new AvesClient(options: AvesClientOptions, deps?: AvesClientDeps)
```

| Option | Description |
| ------ | ----------- |
| `baseURL` | AVES API base URL |
| `hostID` | 6-digit host id |
| `xtoken` | Auth token |
| `languageCode` | Optional 2-digit language code |
| `timeoutMs` | Optional request timeout (default 30000) |

Optional DI (tests / custom transport):

```typescript
import {
  AvesClient,
  AvesTransport,
  BookingClient,
} from 'aves-sdk';

const transport = new AvesTransport(options);
new AvesClient(options, {
  transport,
  booking: new BookingClient(transport),
});
```

### Result type

All methods return `Result<T, AvesError>` — they do **not** throw.

```typescript
type Result<T, E> =
  | { success: true; data: T }
  | { success: false; error: E };
```

---

## Master records

### `search(params)` / `client.master.search`

| `searchType` | Required fields |
| ------------ | --------------- |
| `'CODE'` | `recordCode` |
| `'NAME'` | `name` (+ optional `city`) |
| `'VATCODE'` | `vatCode` (+ optional `phoneNumber`) |
| `'ZONE'` | `zipCode`, `countyCode` (+ optional `city`) |
| `'CATEGORY'` | `categoryCode` |
| `'EMAIL'` | `email` |
| `'LASTMODDATE'` | `lastModificationDate: { minDate, maxDate }` |
| `'SEARCH_FIELD'` / `'EXTERNAL_REF_CODE'` | `searchFieldValue` |

```typescript
const byCode = await client.master.search({
  searchType: 'CODE',
  recordCode: '508558',
});

const byEmail = await client.search({
  searchType: 'EMAIL',
  email: 'user@example.com',
});
```

### `upsertRecord(record)` / `client.master.upsertRecord`

`insertCriteria`: `'S'` always insert · `'N'` skip if exists · `'T'` update all (default) · `'M'` secondary fields only.

```typescript
const result = await client.upsertRecord({
  name: 'Jane Smith',
  email: 'jane@example.com',
  languageCode: '02',
  insertCriteria: 'T',
});

if (result.success) {
  console.log(result.data.masterRecordDetail?.recordCode);
}
```

---

## Booking

`*List` request fields are **flat arrays of Detail objects**. The SDK wraps them to AVES List/Detail XML.

| Method | Purpose |
| ------ | ------- |
| `createBooking` | Create booking file |
| `modBookingServices` | Add/replace services, assign package, delete/nullify lines |
| `modBookingHeader` | Header only (pax, notes, billing) — no costs |
| `cancelBooking` | Delete booking file |
| `setBookingStatus` | Change file status (`CANCELED` / `NULLIFIED` / …) |
| `setBookingServiceStatus` | Nullify a single service line |
| `insertFilePaymentList` | Register payments |
| `searchBookingFiles` | Search practices (`FILE_CODE`, `PAX_NAME`, `PACKAGE_CODE`, `OTHER`) |

### Create

```typescript
const created = await client.booking.createBooking({
  customerDetail: { recordCode: '138311' },
  bookingFileStatus: { value: 'QUOTATION' },
  startDate: '2015-01-22T00:00:00',
  endDate: '2015-01-25T00:00:00',
  selectedServiceList: [
    {
      sCode: 'HT00110840',
      ssCode: 'DL',
      avesServiceType: 'TOP',
      toServiceType: 'RESIDENCE',
      startDate: '2015-01-22T00:00:00',
      endDate: '2015-01-25T00:00:00',
      qty: '1',
      pax: '2',
      paxAssociated: [],
      avesSession: '1',
    },
  ],
  passengerList: [
    {
      rph: '001',
      roomRph: '001',
      name: 'ADULTI 001',
      categoryCode: 'AD', // required on create
      sex: 'M',
    },
  ],
});

if (created.success) {
  console.log(created.data.bookingFileDetail?.bookingFileCode);
}
```

### Modify services / package / overwrite lines

```typescript
await client.booking.modBookingServices({
  customerRecordCode: '138311',
  bookingFileCode: '14/036654',
  selectedPackageDetail: {
    pCode: '2014MDE0000010',
    startDate: '2015-01-22T00:00:00',
    endDate: '2015-01-25T00:00:00',
  },
  cancellableBookedServiceList: [
    {
      cancelOperationType: 'DELETE', // or 'NULLIFY'
      serviceRefType: 'RPH',
      serviceRefValue: '001',
    },
  ],
  selectedServiceList: [
    {
      sCode: 'HT00110840',
      avesServiceType: 'TOP',
      toServiceType: 'RESIDENCE',
      startDate: '2015-01-22T00:00:00',
      endDate: '2015-01-25T00:00:00',
      qty: '1',
      pax: '2',
      avesSession: '1',
      bookedServiceRef: '001',
      serviceFare: { currencyCode: 'EUR', cost: '100.00', price: '120.00' },
    },
  ],
});
```

### Payments

Requires `bookingFileCode` **or** `bookingFileRefCode`.

`paymentUser` is serialized as an XML **attribute** on `FilePaymentListRQ` (`PaymentUser="…"`), not as a child element.

```typescript
await client.booking.insertFilePaymentList({
  bookingFileCode: '18/000172',
  paymentUser: 'MLDN',
  enableMultiplePayments: true,
  operationType: 'AbsoluteAmountsInsertion',
  filePaymentList: [
    {
      paymentDate: '2018-09-08',
      paymentNote: 'INCASSO',
      amount: '100.00',
      paymentType: 'B', // C cash | B bank | R card | …
    },
  ],
});
```

### Header, status, cancel, search practices

```typescript
await client.booking.modBookingHeader({
  bookingFileCode: '14/000043',
  bookingFileStartDate: '2014-04-28',
  customerRecordCode: '103737',
  passengerList: [{ rph: '001', name: 'ADULTI 001', sex: 'M' }],
});

await client.booking.setBookingStatus({
  customerRecordCode: '000170',
  bookingFileCode: '14/000081',
  fileStatus: { value: 'CANCELED' },
});

await client.booking.setBookingServiceStatus({
  customerRecordCode: '000001',
  bookingFileCode: '18/000252',
  bookingServiceRef: '002',
  bookingFileServiceStatus: 'NULLIFIED',
});

await client.booking.cancelBooking({
  bookingFileCode: '14/000081',
  customerRecordCode: '000170',
});

await client.booking.searchBookingFiles({
  searchType: 'PACKAGE_CODE',
  customerRecordCode: '138311',
  packageCode: '2014MDE0000010',
});
```

---

## Package / Program catalog

There is **no** Create Package API in AVES XML 1.8.0. Search, detail, and commit (publish) are supported.

| Method | Purpose |
| ------ | ------- |
| `searchPackages` | Search programs (`avesSearchType`: `PACKAGE` / `PROGRAM`) |
| `searchTopServices` | Search TOP services (`avesSearchType`: `SERVICE`) |
| `getPackageDetail` | Package base info + service list |
| `commitPackage` | Publish existing package (`packageCode` only) |

```typescript
const packages = await client.packages.searchPackages({
  baseSearch: {
    customerRecordCode: '138311',
    languageCode: '01',
    currencyCode: 'EUR',
    startDate: '2014-12-27T00:00:00',
    endDate: '2015-01-03T00:00:00',
    passengerList: [
      {
        rph: '001',
        roomRph: '001',
        name: 'ADULTI 001',
        categoryCode: 'AD',
        sex: 'M',
      },
    ],
  },
  avesSearchType: 'PACKAGE',
  paxQty: '1',
  paxQtyCriteria: 'GREATER_OR_EQUAL',
  servOrPackCode: '2014MDE0000010',
});

const detail = await client.packages.getPackageDetail({
  customerRecordCode: '001692',
  packageCode: '2015F042',
  startDate: '2015-05-02T00:00:00',
  endDate: '2015-05-05T00:00:00',
  selectedServiceList: [
    { serviceCode: 'PFRM04    PAR', packageRow: '01' },
  ],
});

await client.packages.commitPackage({ packageCode: '14/PACKAGE001' });
```

---

## Errors

```typescript
import { AvesClient, AvesError } from 'aves-sdk';

const result = await client.search({
  searchType: 'CODE',
  recordCode: '508558',
});

if (!result.success) {
  // kind: 'validation' | 'api' | 'unknown'
  console.error(result.error.kind, result.error.message, result.error.code);
}
```

---

## Case transformation & wire shapes

- **Input**: camelCase (`recordCode`, `selectedServiceList`, `paymentUser`)
- **Wire**: PascalCase keys; `@`-prefixed keys become XML attributes
- **Output**: camelCase again

You do not handle XML attribute prefixes yourself. Attr vs element is decided by a **per-request `WireShape`** (`src/utils/wire-shapes.ts`), not a global field set.

### Pipeline

One outbound path for all ops:

1. Valibot validates camelCase input  
2. `createApiSchema(schema, shape, wrap?)` → `toWireBody` (optional list wrap + empty `paxAssociated` normalize + `camelToPascalKeys`)  
3. `AvesTransport.invokeOp` adds `RqHeader`, optional `bodyKey` nest, POSTs XML  

Element-only roots use `elementOnlyWire` (`{}`). Master upsert nests under `bodyKey: "MasterRecordDetail"`; master search and booking spread fields at the RQ root.

### Request shapes (one family per op)

| Shape | Used by |
| ----- | ------- |
| `masterRecordWire` / `searchMasterWire` | Upsert / Search master |
| `bookingFileWire` | CreateBooking, ModFileServices, ModFileHeader |
| `filePaymentListRequestWire` | InsertFilePaymentList (`paymentUser` root attr) |
| `searchFileWire` | SearchBookingFiles (date ranges / insurance attrs) |
| `setFileStatusWire` | SetBookingFileStatus |
| `packageDetailRequestWire` | GetPackageDetail |
| `baseSearchWire` + `avesSearchWire` | SearchAvesPackages / SearchTopServices |
| `elementOnlyWire` | CancelFile, SetFileServiceStatus, CommitPackage |

Editing CreateBooking shapes does not affect SearchFile or AvesSearch.

---

## Architecture notes (recent changes)

Documented here so consumers and contributors know what moved and why.

### Client layout

- `AvesClient` (`src/client.ts`) is a thin facade over DI-friendly domain clients:
  - `AvesTransport` — HTTP + XML encode/decode + `invokeOp` (optional `bodyKey`)
  - `MasterRecordsClient` — search / upsert (same `invokeOp` as booking/packages)
  - `BookingClient` — booking file ops + search practices
  - `PackageCatalogClient` — package/program catalog
  - `client/types.ts` — `AvesClientDeps` / `AvesClientFlat`
  - `client/flat-aliases.ts` — auto-bind flat compat methods from domain prototypes
- Flat aliases (`client.createBooking`, …) are attached once in the constructor — add a domain method, flat + namespaced both work.
- XML helpers live under `src/xml/` (`root.ts`, `client.ts`).

### Wire model

- **Removed** global `ATTRIBUTE_FIELDS` Set.
- **Added** tree-scoped `WireShape` (`attrs` / `preserveCamel` / `children`), one shape family per request root.
- **Bug fix**: InsertFilePaymentList root `paymentUser` emits `PaymentUser="…"` via `filePaymentListRequestWire`.
- **Single transform API**: `createApiSchema` / `toWireBody` (list wrap optional). No parallel `createWireApiSchema` / `toBookingApiBody`.
- AvesSearch nests `BaseSearch` with `baseSearchWire`, then `toWireBody` + `avesSearchWire` for the rest.

### Package / Program APIs

- Methods: `searchPackages`, `searchTopServices`, `getPackageDetail`, `commitPackage` (+ flat aliases).
- Schemas in `src/schemas/package-catalog.ts` and `search-booking-file.ts`.
- No Create Package API in AVES XML 1.8.0 — commit publishes an existing package.

### Docs

- Versioned spike / implementation MD guides removed from git; local `docs/` is gitignored.

---

## Types

```typescript
import type {
  AvesClientOptions,
  AvesClientDeps,
  SearchMasterRecord,
  SearchMasterRecordRS,
  MasterRecordDetail,
  ManageMasterRecordRS,
  BookingFileRQ,
  BookingFileRS,
  ModFileServicesRQ,
  ModFileHeaderRQ,
  CancelFileRQ,
  SetFileStatusRQ,
  SetFileServiceStatusRQ,
  FilePaymentListRQ,
  BookingStatusOnlyRS,
  SearchBookingFileRQ,
  SearchBookingFileRS,
  AvesSearchRQ,
  SearchPackageRS,
  SearchServicesRS,
  PackageDetailRQ,
  PackageDetailRS,
  CommitPackageRQ,
  CommitPackageRS,
} from 'aves-sdk';

import {
  AvesClient,
  AvesTransport,
  MasterRecordsClient,
  BookingClient,
  PackageCatalogClient,
  AvesError,
} from 'aves-sdk';
```

## License

MIT

## Links

- [Changelog](./CHANGELOG.md)
- [GitHub Repository](https://github.com/simoneguglielmi/aves-sdk)
- [NPM Package](https://npmjs.com/package/aves-sdk)
- [Issue Tracker](https://github.com/simoneguglielmi/aves-sdk/issues)
