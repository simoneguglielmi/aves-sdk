# AVES SDK

Type-safe TypeScript SDK for the AVES XML REST API. Handles XML parsing, Valibot validation, camelCase ↔ PascalCase, and returns `Result` instead of throwing.

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

## Quick Start

```typescript
import { AvesClient } from 'aves-sdk';

const client = new AvesClient({
  baseURL: 'https://api.example.com',
  hostID: '000000', // 6 digits
  xtoken: 'TOKEN',
  languageCode: '02', // optional: 01=Italian, 02=English
  timeoutMs: 30_000, // optional
});

const searchResult = await client.search({
  searchType: 'CODE',
  recordCode: '508558',
});

if (searchResult.success) {
  console.log(searchResult.data.masterRecordList);
} else {
  console.error(
    searchResult.error.kind,
    searchResult.error.message,
    searchResult.error.code,
  );
}
```

## API Reference

### `AvesClient`

#### Constructor

```typescript
new AvesClient(options: AvesClientOptions)
```

| Option         | Description                    |
| -------------- | ------------------------------ |
| `baseURL`      | AVES API base URL              |
| `hostID`       | 6-digit host id                |
| `xtoken`       | Auth token                     |
| `languageCode` | Optional 2-digit language code |
| `timeoutMs`    | Optional request timeout       |

All methods return `Result<T, AvesError>`:

```typescript
type Result<T, E> = { success: true; data: T } | { success: false; error: E };
```

---

### Master records

#### `search(params)`

Search by `searchType`. TypeScript enforces the required fields per variant.

| `searchType`                             | Required fields                              |
| ---------------------------------------- | -------------------------------------------- |
| `'CODE'`                                 | `recordCode`                                 |
| `'NAME'`                                 | `name` (+ optional `city`)                   |
| `'VATCODE'`                              | `vatCode` (+ optional `phoneNumber`)         |
| `'ZONE'`                                 | `zipCode`, `countyCode` (+ optional `city`)  |
| `'CATEGORY'`                             | `categoryCode`                               |
| `'EMAIL'`                                | `email`                                      |
| `'LASTMODDATE'`                          | `lastModificationDate: { minDate, maxDate }` |
| `'SEARCH_FIELD'` / `'EXTERNAL_REF_CODE'` | `searchFieldValue`                           |

```typescript
const byCode = await client.search({
  searchType: 'CODE',
  recordCode: '508558',
});

const byEmail = await client.search({
  searchType: 'EMAIL',
  email: 'user@example.com',
});
```

#### `upsertRecord(record)`

Insert or update a master record. `insertCriteria` defaults to `'T'`.

- `'S'` — always insert
- `'N'` — do not update if exists
- `'T'` — update all fields if exists (default)
- `'M'` — update secondary fields only

```typescript
const result = await client.upsertRecord({
  name: 'Jane Smith',
  email: 'jane@example.com',
  address: '456 Oak Ave',
  zipCode: '67890',
  cityName: 'Los Angeles',
  stateCode: 'USA',
  languageCode: '02',
  insertCriteria: 'T',
});

if (result.success) {
  console.log(result.data.masterRecordDetail?.recordCode);
}
```

---

### Booking

`*List` request fields are **flat arrays of Detail objects**. The SDK wraps them to AVES List/Detail XML automatically.

| Method                    | Purpose                                                    |
| ------------------------- | ---------------------------------------------------------- |
| `createBooking`           | Create booking file                                        |
| `modBookingServices`      | Add/replace services, assign package, delete/nullify lines |
| `modBookingHeader`        | Header only (pax, notes, billing) — no costs               |
| `cancelBooking`           | Delete booking file                                        |
| `setBookingStatus`        | Change file status (`CANCELED` / `NULLIFIED` / …)          |
| `setBookingServiceStatus` | Nullify a single service line                              |
| `insertFilePaymentList`   | Register payments on a booking                             |

#### `createBooking(params)`

```typescript
const created = await client.createBooking({
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

#### `modBookingServices(params)`

```typescript
const result = await client.modBookingServices({
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

#### `insertFilePaymentList(params)`

Requires `bookingFileCode` **or** `bookingFileRefCode`.

```typescript
const paid = await client.insertFilePaymentList({
  bookingFileCode: '18/000172',
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

#### Other booking ops

```typescript
await client.modBookingHeader({
  bookingFileCode: '14/000043',
  bookingFileStartDate: '2014-04-28',
  customerRecordCode: '103737',
  passengerList: [{ rph: '001', name: 'ADULTI 001', sex: 'M' }],
});

await client.setBookingStatus({
  customerRecordCode: '000170',
  bookingFileCode: '14/000081',
  fileStatus: { value: 'CANCELED' },
});

await client.setBookingServiceStatus({
  customerRecordCode: '000001',
  bookingFileCode: '18/000252',
  bookingServiceRef: '002',
  bookingFileServiceStatus: 'NULLIFIED',
});

await client.cancelBooking({
  bookingFileCode: '14/000081',
  customerRecordCode: '000170',
});
```

---

## Error Handling

```typescript
import { AvesClient, AvesError } from 'aves-sdk';

const result = await client.search({
  searchType: 'CODE',
  recordCode: '508558',
});

if (!result.success) {
  // AvesError: kind ('validation' | 'api' | 'unknown'), message, status?, code?
  console.error(result.error.kind, result.error.message, result.error.code);
}
```

## Case Transformation

- **Input**: camelCase (`recordCode`, `selectedServiceList`)
- **Wire**: PascalCase / `@` attributes for XML
- **Output**: camelCase again

You do not handle XML attribute prefixes yourself.

## Types

```typescript
import type {
  AvesClientOptions,
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
} from 'aves-sdk';
```

## License

MIT

## Links

- [GitHub Repository](https://github.com/simoneguglielmi/aves-sdk)
- [NPM Package](https://npmjs.com/package/aves-sdk)
- [Issue Tracker](https://github.com/simoneguglielmi/aves-sdk/issues)
