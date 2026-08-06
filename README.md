# AVES SDK

Type-safe TypeScript SDK for the AVES XML REST API. Handles XML parsing, Valibot validation, camelCase ↔ PascalCase / `@` attrs, and returns `Result` instead of throwing.

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

const result = await client.master.search({
  searchType: 'CODE',
  recordCode: '508558',
});

if (result.success) {
  const [record] = result.data;
  console.log(record?.recordCode);
} else {
  console.error(result.error.kind, result.error.message, result.error.code);
}
```

## Client shape

`AvesClient` is a facade over domain clients. Operations are namespaced by domain.

```typescript
await client.booking.create(params);
await client.packages.search(params);
await client.master.search({ searchType: 'CODE', recordCode: '508558' });
```

Migration from 1.x: insert the appropriate domain namespace (for example,
`client.search` → `client.master.search`). See the [2.0.0 migration notes](https://github.com/simoneguglielmi/aves-sdk/blob/main/CHANGELOG.md#v2.0.0).

Migration from 2.x: `master.search` success is a flat array — see the
[3.0.0 migration notes](https://github.com/simoneguglielmi/aves-sdk/blob/main/CHANGELOG.md#v3.0.0).

Migration from 3.x: domain method names were shortened — see the
[4.0.0 migration notes](https://github.com/simoneguglielmi/aves-sdk/blob/main/CHANGELOG.md#v4.0.0).

| Namespace | Methods |
| --------- | ------- |
| `master` | `search`, `upsert` |
| `booking` | `create`, `updateServices`, `updateHeader`, `cancel`, `setStatus`, `setServiceStatus`, `addPayments`, `search` |
| `packages` | `search`, `searchServices`, `get`, `commit` |

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

## Simple facade names

The facade exposes concise aliases for the AVES payload vocabulary. Inbound
dual keys are owned by Valibot input schemas (`facadeObject` / `coalesceAliases`)
and coalesced to AVES camelCase before wire encoding. Outbound success payloads
keep AVES names and add concise compatibility aliases. XML shapes are unchanged.

Source of truth in code:

- Outbound (AVES → facade): `publicKeyAliases` in `src/utils/facade-transform.ts`
- Inbound (facade → AVES): scoped maps in `src/utils/facade-aliases.ts`

Some facade names are reused (`services`, `status`, `passengerCount`, `financial`,
`payments`, `packages`, `identityDocument`). Resolution is **schema-scoped** on
input and **target-key presence** on Proxy output — not a single global rename.

### Outbound map (AVES → facade)

Applied on success payloads via `withPublicAliases` (both names remain readable).

| AVES-shaped name | Facade name |
| ---------------- | ----------- |
| `rsStatus` | `response` |
| `customerRecordCode` | `customerCode` |
| `bookingFileCode` | `bookingCode` |
| `bookingFileRefCode` | `bookingReference` |
| `bookingFileStatus` | `status` |
| `fileStatus` | `status` |
| `bookingFileDescription` | `description` |
| `bookingFileStartDate` | `startDate` |
| `bookingFileReferenceName` | `referenceName` |
| `bookingFileServiceStatus` | `serviceStatus` |
| `bookingFileServiceStatusDate` | `serviceStatusDate` |
| `bookingServiceRef` | `serviceReference` |
| `newCustomerRecordCode` | `newCustomerCode` |
| `customerDetail` | `customer` |
| `bookingFileDocument` | `documents` |
| `bookingFinancialInfo` | `financial` |
| `financialDetail` | `financial` |
| `idDocumentDetail` | `identityDocument` |
| `idDocInfo` | `identityDocument` |
| `accountPolicies` | `policies` |
| `dynamicFields` | `customFields` |
| `supplierRefMasterRecords` | `supplierReference` |
| `selectedPackageDetail` | `package` |
| `selectedPackageList` | `packages` |
| `packageList` | `packages` |
| `selectedServiceList` | `services` |
| `bookedServiceList` | `services` |
| `serviceList` | `services` |
| `extraQuoteServiceList` | `extraServices` |
| `passengerList` | `passengers` |
| `noteList` | `notes` |
| `deadlineList` | `deadlines` |
| `financialDeadlineList` | `financialDeadlines` |
| `paymentList` | `payments` |
| `filePaymentList` | `payments` |
| `cancellableBookedServiceList` | `cancellableServices` |
| `subServiceList` | `subServices` |
| `featureList` | `features` |
| `pCode` | `packageCode` |
| `sCode` | `serviceCode` |
| `ssCode` | `subServiceCode` |
| `rph` | `passengerRef` |
| `roomRph` | `roomRef` |
| `avesSession` | `session` |
| `paxAssociated` | `passengerRefs` |
| `paxQty` | `passengerCount` |
| `pax` | `passengerCount` |
| `paxQtyCriteria` | `passengerCountRule` |
| `qty` | `quantity` |
| `eMail` | `email` |
| `sex` | `gender` |
| `nType` | `noteType` |
| `avesServiceType` | `serviceType` |
| `toServiceType` | `targetType` |
| `packageParams` | `packageOptions` |
| `topServiceParams` | `serviceOptions` |
| `servOrPackCode` | `serviceOrPackageCode` |
| `servOrPackDesc` | `serviceOrPackageDescription` |
| `getDocumentation` | `includeDocumentation` |
| `getServicesFromPackage` | `includeServices` |
| `mergeBoardAndAccomodation` | `mergeBoardAndAccommodation` |
| `discartNotAvailables` | `discardUnavailable` |
| `discartNotAvailablesMinSales` | `discardUnavailableMinSales` |
| `discartNotAvailablesDaysInOut` | `discardUnavailableDaysInOut` |
| `getAllDeptDate` | `allDepartureDates` |
| `getAllAccomodation` | `allAccommodation` |
| `compatibleAccomodation` | `compatibleAccommodation` |
| `alternativeAccomodation` | `alternativeAccommodation` |

### Inbound map (facade → AVES)

Applied only on the schema that owns each fragment (`facadeObject` / `coalesceAliases`).

#### Shared refs

| Facade | AVES |
| ------ | ---- |
| `customerCode` | `customerRecordCode` |
| `bookingCode` | `bookingFileCode` |
| `bookingReference` | `bookingFileRefCode` |

#### Passenger / note / service line

| Facade | AVES |
| ------ | ---- |
| `passengerRef` | `rph` |
| `roomRef` | `roomRph` |
| `gender` | `sex` |
| `email` | `eMail` |
| `identityDocument` | `idDocInfo` |
| `noteType` | `nType` |
| `serviceCode` | `sCode` |
| `subServiceCode` | `ssCode` |
| `quantity` | `qty` |
| `passengerCount` | `pax` |
| `session` | `avesSession` |
| `passengerRefs` | `paxAssociated` |
| `serviceType` | `avesServiceType` |
| `targetType` | `toServiceType` |
| `notes` | `noteList` |
| `packageCode` | `pCode` |
| `includeServices` | `getServicesFromPackage` |

#### Booking root (`create`)

| Facade | AVES |
| ------ | ---- |
| `customer` | `customerDetail` |
| `status` | `bookingFileStatus` |
| `description` | `bookingFileDescription` |
| `referenceName` | `bookingFileReferenceName` |
| `financial` | `bookingFinancialInfo` |
| `package` | `selectedPackageDetail` |
| `packages` | `selectedPackageList` |
| `services` | `selectedServiceList` |
| `extraServices` | `extraQuoteServiceList` |
| `passengers` | `passengerList` |
| `payments` | `paymentList` |
| `documents` | `bookingFileDocument` |
| `deadlines` | `deadlineList` |
| `financialDeadlines` | `financialDeadlineList` |
| `notes` | `noteList` |

(+ shared refs above)

#### Mod services / mod header / status / payments / search booking

| Scope | Facade | AVES |
| ----- | ------ | ---- |
| Mod services | `package` / `packages` | `selectedPackageDetail` / `selectedPackageList` |
| Mod services | `services` / `passengers` / `deadlines` | `selectedServiceList` / `passengerList` / `deadlineList` |
| Mod services | `cancellableServices` | `cancellableBookedServiceList` |
| Mod header | `startDate` | `bookingFileStartDate` |
| Mod header | `newCustomerCode` | `newCustomerRecordCode` |
| Mod header | `referenceName` / `passengers` / `financial` / `financialDeadlines` | `bookingFileReferenceName` / `passengerList` / `bookingFinancialInfo` / `financialDeadlineList` |
| Set file status | `status` / `documents` | `fileStatus` / `bookingFileDocument` |
| Set service status | `serviceReference` / `serviceStatus` / `serviceStatusDate` | `bookingServiceRef` / `bookingFileServiceStatus` / `bookingFileServiceStatusDate` |
| Insert payments | `payments` | `filePaymentList` |
| Search booking files | `status` | `fileStatus` |

(+ shared refs where listed in each map)

#### Master record

| Facade | AVES |
| ------ | ---- |
| `financial` | `financialDetail` |
| `identityDocument` | `idDocumentDetail` |
| `policies` | `accountPolicies` |
| `customFields` | `dynamicFields` |
| `supplierReference` | `supplierRefMasterRecords` |

#### Package / top-service search + package params + get package detail

| Facade | AVES |
| ------ | ---- |
| `searchType` | `avesSearchType` |
| `passengers` | `passengerList` |
| `packageOptions` | `packageParams` |
| `serviceOptions` | `topServiceParams` |
| `serviceOrPackageCode` | `servOrPackCode` |
| `serviceOrPackageDescription` | `servOrPackDesc` |
| `passengerCount` | `paxQty` |
| `passengerCountRule` | `paxQtyCriteria` |
| `features` | `featureList` |
| `includeDocumentation` | `getDocumentation` |
| `mergeBoardAndAccommodation` | `mergeBoardAndAccomodation` |
| `discardUnavailable` | `discartNotAvailables` |
| `discardUnavailableMinSales` | `discartNotAvailablesMinSales` |
| `discardUnavailableDaysInOut` | `discartNotAvailablesDaysInOut` |
| `allDepartureDates` | `getAllDeptDate` |
| `allAccommodation` | `getAllAccomodation` |
| `compatibleAccommodation` | `compatibleAccomodation` |
| `alternativeAccommodation` | `alternativeAccomodation` |
| `services` (package detail RQ) | `selectedServiceList` |

(+ shared refs on search / package detail)

New code can use the simplified vocabulary directly:

```typescript
const created = await client.booking.create({
  customerCode: '138311',
  status: 'CONFIRMED',
  startDate: '2026-08-06',
  endDate: '2026-08-07',
  services: [
    {
      serviceCode: 'HT00110840',
      serviceType: 'TOP',
      targetType: 'RESIDENCE',
      quantity: '1',
      passengerCount: '2',
      session: '1',
    },
  ],
  passengers: [
    {
      passengerRef: '001',
      name: 'ADULT 001',
      categoryCode: 'AD',
      gender: 'M',
    },
  ],
});

if (created.success) {
  console.log(created.data.bookingCode);
  console.log(created.data.services?.[0]?.serviceStatus);
}
```

The previous AVES-shaped names remain accepted and returned as compatibility
aliases. New type aliases such as `BookingInput`, `Booking`, `MasterRecord`,
`PackageInput`, and `Package` are exported for new integrations.

---

## Master records

### `client.master.search(params)`

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

if (byCode.success) {
  const [record] = byCode.data;
  console.log(record?.recordCode);
}

const byEmail = await client.master.search({
  searchType: 'EMAIL',
  email: 'user@example.com',
});
```

### `client.master.upsert(record)`

`insertCriteria`: `'S'` always insert · `'N'` skip if exists · `'T'` update all (default) · `'M'` secondary fields only.

```typescript
const result = await client.master.upsert({
  name: 'Jane Smith',
  email: 'jane@example.com',
  languageCode: '02',
  insertCriteria: 'T',
});

if (result.success) {
  console.log(result.data.recordCode);
}
```

---

## Booking

`*List` request fields are **flat arrays of Detail objects**. The SDK wraps them to AVES List/Detail XML.

| Method | Purpose |
| ------ | ------- |
| `create` | Create booking file |
| `updateServices` | Add/replace services, assign package, delete/nullify lines |
| `updateHeader` | Header only (pax, notes, billing) — no costs |
| `cancel` | Delete booking file |
| `setStatus` | Change file status (`CANCELED` / `NULLIFIED` / …) |
| `setServiceStatus` | Nullify a single service line |
| `addPayments` | Register payments |
| `search` | Search practices (`FILE_CODE`, `PAX_NAME`, `PACKAGE_CODE`, `OTHER`) |

### Create

```typescript
const created = await client.booking.create({
  customerRecordCode: '138311', // or customerDetail: { recordCode: '138311' }
  bookingFileStatus: 'QUOTATION', // or { value: 'QUOTATION', expiredDate? }
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
      paxAssociated: [], // or string[] like ['001','002']
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
  console.log(created.data.bookingFileCode);
  console.log(created.data.bookedServiceList?.[0]?.serviceStatus);
}
```

### Modify services / package / overwrite lines

```typescript
await client.booking.updateServices({
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
await client.booking.addPayments({
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
await client.booking.updateHeader({
  bookingFileCode: '14/000043',
  bookingFileStartDate: '2014-04-28',
  customerRecordCode: '103737',
  passengerList: [{ rph: '001', name: 'ADULTI 001', sex: 'M' }],
});

await client.booking.setStatus({
  customerRecordCode: '000170',
  bookingFileCode: '14/000081',
  fileStatus: 'CANCELED', // or { value: 'CANCELED' }
});

await client.booking.setServiceStatus({
  customerRecordCode: '000001',
  bookingFileCode: '18/000252',
  bookingServiceRef: '002',
  bookingFileServiceStatus: 'NULLIFIED',
});

await client.booking.cancel({
  bookingFileCode: '14/000081',
  customerRecordCode: '000170',
});

await client.booking.search({
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
| `search` | Search programs (defaults `avesSearchType: 'PACKAGE'`) |
| `searchServices` | Search TOP services (defaults `avesSearchType: 'SERVICE'`) |
| `get` | Package base info + service list |
| `commit` | Publish existing package (`packageCode` only) |

`paxQty` defaults to `passengerList.length`; `paxQtyCriteria` defaults to `GREATER_OR_EQUAL`. `languageCode` can be omitted when set on `AvesClient` options.

```typescript
const packages = await client.packages.search({
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
  servOrPackCode: '2014MDE0000010',
});

const detail = await client.packages.get({
  customerRecordCode: '001692',
  packageCode: '2015F042',
  startDate: '2015-05-02T00:00:00',
  endDate: '2015-05-05T00:00:00',
  selectedServiceList: [
    { serviceCode: 'PFRM04    PAR', packageRow: '01' },
  ],
});

await client.packages.commit({ packageCode: '14/PACKAGE001' });

if (packages.success) console.log(packages.data.packageList?.[0]?.pCode);
if (detail.success) console.log(detail.data.pCode, detail.data.serviceList?.[0]);
```

---

## Errors

```typescript
import { AvesClient, AvesError } from 'aves-sdk';

const result = await client.master.search({
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

- **Facade input**: concise camelCase (`customerCode`, `services`, `passengers`)
- **Wire input**: AVES-shaped camelCase before XML (`recordCode`, `selectedServiceList`, `paymentUser`)
- **Wire**: PascalCase keys; `@`-prefixed keys become XML attributes
- **Output**: concise facade aliases plus compatibility aliases

You do not handle XML attribute prefixes yourself. Attr vs element is decided by a **per-request `WireShape`** (`src/utils/wire-shapes.ts`), not a global field set.

### Pipeline

One outbound path for all ops:

1. Valibot validates camelCase input  
2. `createApiSchema(schema, shape, wrap?)` → `toWireBody` (optional list wrap + `paxAssociated` string[]/empty normalize + `camelToPascalKeys`)  
3. `AvesTransport.invokeOp` adds `RqHeader`, optional `bodyKey` nest, POSTs XML  

Inbound: `createResponseSchema` / `createFlattenedResponseSchema` / `createListResponseSchema` → camelCase + optional detail spread or typed list RS; `listDetailApiSchema` unwraps wire `*List`/`*Detail` to flat arrays; `coalesceWireAliases` normalizes dialect attrs. Input aliases: `valueFieldSchema`, `coalesceCustomerRecordCode`, `coalesceListHead`. Shared primitives: `LanguageCodeSchema`, `StringishSchema`, `DateRangeSchema`, `StatusOnlyResponseSchema`.

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

## Architecture

`AvesClient` (`src/client.ts`) is a thin facade over DI-friendly domain clients:

| Module | Role |
| ------ | ---- |
| `AvesTransport` | HTTP + XML encode/decode + `invokeOp` (optional `bodyKey`) |
| `MasterRecordsClient` | search / upsert |
| `BookingClient` | booking file ops + search practices |
| `PackageCatalogClient` | package/program catalog |
| `client/types.ts` | `AvesClientDeps` |
| `src/xml/` | XML root helpers + JSON ↔ XML |

Outbound path: validate → `createApiSchema` / `toWireBody` → `invokeOp` → XML POST.

---

## Types

Operations are available only through `client.master`, `client.booking`, and
`client.packages`; flat aliases were removed in 2.0.0. When upgrading from 2.x,
also update `master.search` consumers for the flat array success payload (3.0.0).
See the [CHANGELOG migration notes](https://github.com/simoneguglielmi/aves-sdk/blob/main/CHANGELOG.md).

```typescript
import type {
  AvesClientOptions,
  AvesClientDeps,
  AvesSearchRQ,
  BookingFileRQ,
  SearchMasterRecord,
} from 'aves-sdk';

import {
  AvesClient,
  AvesTransport,
  MasterRecordsClient,
  BookingClient,
  PackageCatalogClient,
  AvesError,
  // object enums
  AvesSearchType,
  BookingFileStatus,
  InsertCriteria,
  PassengerCategory,
  PaxQtyCriteria,
  PaymentType,
  SearchMasterType,
} from 'aves-sdk';

PaxQtyCriteria.GREATER_OR_EQUAL
AvesSearchType.PACKAGE
PaymentType.B
InsertCriteria.T
```

## License

MIT

## Links

- [Changelog](https://github.com/simoneguglielmi/aves-sdk/blob/main/CHANGELOG.md)
- [GitHub Repository](https://github.com/simoneguglielmi/aves-sdk)
- [NPM Package](https://npmjs.com/package/aves-sdk)
- [Issue Tracker](https://github.com/simoneguglielmi/aves-sdk/issues)
