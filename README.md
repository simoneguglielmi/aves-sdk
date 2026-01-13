# AVES SDK

A type-safe TypeScript SDK for the AVES XML REST API. Automatically handles XML parsing, validation, case transformation, and provides full TypeScript support.

## Features

- **Type-safe** - Full TypeScript support with inferred types
- **Runtime validation** - Input/output validation using Valibot
- **XML handling** - Automatic XML ↔ JSON conversion
- **Case transformation** - Automatic camelCase ↔ PascalCase conversion
- **Functional error handling** - Result pattern for type-safe error handling

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

const client = new AvesClient(
  'https://api.example.com', // Base URL
  'hostid', // 6-digit HostID
  'TOKEN', // Xtoken
  '02' // Optional: 2-digit language code (01=Italian, 02=English)
);

// Search for records
const searchResult = await client.search({
  searchType: 'CODE',
  recordCode: '508558',
});

if (searchResult.success) {
  console.log(searchResult.data); // SearchMasterRecordRS
} else {
  console.error(searchResult.error); // AvesError
}

// Insert or update a record
const upsertResult = await client.upsertRecord({
  name: 'John Doe',
  email: 'john@example.com',
  address: '123 Main St',
  zipCode: '12345',
  cityName: 'New York',
  stateCode: 'USA',
  languageCode: '02',
  // ... other fields
});

if (upsertResult.success) {
  console.log(upsertResult.data.customerRecordRS?.customerRecordCode);
} else {
  console.error(
    upsertResult.error.errorCode,
    upsertResult.error.errorDescription
  );
}
```

## API Reference

### `AvesClient`

#### Constructor

```typescript
new AvesClient(baseURL: string, hostID: string, xtoken: string, languageCode?: string)
```

- `baseURL` - Base URL of the AVES API
- `hostID` - 6-digit identification code
- `xtoken` - Unique validation string
- `languageCode` - Optional: 2-digit language code (01=Italian, 02=English, etc.)

#### Methods

##### `search(params)`

Search for master records by various criteria. The required fields depend on the `searchType` - TypeScript will enforce the correct fields for each search type.

**Search Types and Required Fields:**

- **`'CODE'`** - Requires `recordCode` (6 digits)
- **`'NAME'`** - Requires `name`, optionally `city`
- **`'VATCODE'`** - Requires `vatCode`, optionally `phoneNumber`
- **`'ZONE'`** - Requires `zipCode` and `countyCode`, optionally `city`
- **`'CATEGORY'`** - Requires `categoryCode`
- **`'EMAIL'`** - Requires `email`
- **`'LASTMODDATE'`** - Requires `lastModificationDate` with `minDate` and `maxDate`
- **`'SEARCH_FIELD'`** - Requires `searchFieldValue`
- **`'EXTERNAL_REF_CODE'`** - Requires `searchFieldValue`

All search types accept an optional `languageCode` (2-digit code).

**Examples:**

```typescript
// Search by code
const byCode = await client.search({
  searchType: 'CODE',
  recordCode: '508558',
});

if (byCode.success) {
  console.log('Found records:', byCode.data.masterRecordList);
}

// Search by email
const byEmail = await client.search({
  searchType: 'EMAIL',
  email: 'user@example.com',
});

if (byEmail.success) {
  console.log('Found:', byEmail.data.masterRecordList);
} else {
  console.error('Error:', byEmail.error.message);
}

// Search by name (with optional city)
const byName = await client.search({
  searchType: 'NAME',
  name: 'John Doe',
  city: 'New York', // Optional
});

// Search by zone (requires zipCode and countyCode)
const byZone = await client.search({
  searchType: 'ZONE',
  zipCode: '47841',
  countyCode: 'RN',
  city: 'Cattolica', // Optional
});

// Search by last modification date
const byDate = await client.search({
  searchType: 'LASTMODDATE',
  lastModificationDate: {
    minDate: '2024-01-01',
    maxDate: '2024-12-31',
  },
});
```

##### `upsertRecord(record)`

Insert or update a master record. The `insertCriteria` defaults to `'T'` (update all fields if exists) but can be overridden by including it in the record.

```typescript
const result = await client.upsertRecord({
  name: string,
  email: string,
  address: string,
  zipCode: string,
  cityName: string,
  countyCode: string,
  stateCode: string,
  firstPhoneNumber: string,
  mobilePhoneNumber: string,
  fiscalCode: string,
  birthDate: string,
  gender: string,
  languageCode: string, // Required
  categoryCode: string,
  recordCode: string, // Optional: 6-digit code
  insertCriteria: 'S' | 'N' | 'T' | 'M', // Optional: defaults to 'T'
  // ... see types for full list
});

// Result is Result<ManageMasterRecordRS, AvesError>
if (result.success) {
  // Access result.data
} else {
  // Handle result.error
}
```

**Insert Criteria:**

- `'S'` - Insert always new record
- `'N'` - If record exists, do not update
- `'T'` - If record exists, update all fields (default)
- `'M'` - If record exists, update only secondary fields

**Example:**

```typescript
// Default behavior (update all fields if exists)
const response = await client.upsertRecord({
  name: 'Jane Smith',
  email: 'jane@example.com',
  address: '456 Oak Ave',
  zipCode: '67890',
  cityName: 'Los Angeles',
  stateCode: 'USA',
  firstPhoneNumber: '+1234567890',
  languageCode: '02',
});

if (response.success) {
  console.log(response.data.customerRecordRS?.customerRecordCode);
} else {
  console.error('Failed:', response.error.message);
}

// Override insertCriteria
const newRecord = await client.upsertRecord({
  name: 'John Doe',
  insertCriteria: 'S', // Always insert new
  email: 'john@example.com',
  languageCode: '02',
  // ... other fields
});

if (newRecord.success) {
  console.log('Created:', newRecord.data.customerRecordRS?.customerRecordCode);
}
```

## Error Handling

The SDK uses a functional `Result` pattern for type-safe error handling. All methods return `Result<Success, AvesError>` instead of throwing exceptions:

```typescript
import { AvesClient, AvesError, type Result } from 'aves-sdk';

const result = await client.search({
  searchType: 'CODE',
  recordCode: '508558',
});

if (result.success) {
  // TypeScript knows result.data is SearchMasterRecordRS
  console.log(result.data.masterRecordList);
} else {
  // TypeScript knows result.error is AvesError
  console.error('Status:', result.error.status); // 'ERROR' | 'TIMEOUT' | 'WARNING'
  console.error('Error Code:', result.error.errorCode);
  console.error('Description:', result.error.errorDescription);
}
```

**Result Type:**

```typescript
type Result<T, E> = { success: true; data: T } | { success: false; error: E };
```

This pattern ensures:

- **Type safety**: TypeScript narrows the type based on `success`
- **No exceptions**: All errors are explicit in the return type
- **Functional style**: Easier to compose and chain operations

## Case Transformation

The SDK automatically handles case transformation between your code and the API:

- **Input**: Use camelCase (e.g., `recordCode`, `zipCode`)
- **API**: Automatically converted to PascalCase with XML attributes (e.g., `@RecordCode`, `ZipCode`)
- **Output**: Automatically converted back to camelCase

You never need to worry about case conversion or XML attribute prefixes - the SDK handles it all.

## Type Safety

All types are exported and inferred from the validation schemas:

```typescript
import type {
  SearchMasterRecordRS,
  ManageMasterRecordRS,
  MasterRecordDetail,
} from 'aves-sdk';

// Use types for your functions
function processRecord(record: MasterRecordDetail) {
  // TypeScript knows all available fields in camelCase
}
```

## Validation

The SDK validates all inputs and outputs using Valibot schemas:

- **HostID**: Must be exactly 6 digits
- **RecordCode**: Must be exactly 6 characters
- **LanguageCode**: Must be exactly 2 digits (01=Italian, 02=English, etc.)
- **Search parameters**: Required fields are enforced based on `searchType` using discriminated unions
- All other fields follow the AVES API specification

Invalid data will return an error `Result` before making the API request. All validation happens on camelCase input, making it easy to use. TypeScript will also provide type checking and autocomplete based on the selected `searchType`.

## License

MIT

## Links

- [GitHub Repository](https://github.com/simoneguglielmi/aves-sdk)
- [NPM Package](https://npmjs.com/package/aves-sdk)
- [Issue Tracker](https://github.com/simoneguglielmi/aves-sdk/issues)
