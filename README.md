# AVES SDK

A type-safe TypeScript SDK for the AVES XML REST API. Automatically handles XML parsing, validation, case transformation, and provides full TypeScript support.

## Features

- **Type-safe** - Full TypeScript support with inferred types
- **Runtime validation** - Input/output validation using Valibot
- **XML handling** - Automatic XML ↔ JSON conversion
- **Case transformation** - Automatic camelCase ↔ PascalCase conversion
- **Error handling** - Custom error types with detailed error information

## Installation

```bash
npm install aves-sdk
# or
yarn add aves-sdk
# or
bun add aves-sdk
```

## Quick Start

```typescript
import { AvesClient } from 'aves-sdk';

const client = new AvesClient(
  'https://api.example.com', // Base URL
  '025706', // 6-digit HostID
  'TOKEN002756', // Xtoken
  '02' // Optional: 2-digit language code (01=Italian, 02=English)
);

// Search for records (camelCase input)
const results = await client.search({
  searchType: 'CODE',
  recordCode: '508558',
});

// Insert or update a record (camelCase input)
const response = await client.upsertRecord({
  name: 'John Doe',
  email: 'john@example.com',
  address: '123 Main St',
  zipCode: '12345',
  cityName: 'New York',
  stateCode: 'USA',
  // ... other fields
});
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

Search for master records by various criteria.

```typescript
const results = await client.search({
  searchType:
    | 'CODE'
    | 'NAME'
    | 'VATCODE'
    | 'ZONE'
    | 'CATEGORY'
    | 'EMAIL'
    | 'LASTMODDATE'
    | 'SEARCH FIELD'
    | 'EXTERNAL_REF_CODE',
  recordCode?: string, // When searchType='CODE' (6 digits)
  name?: string, // When searchType='NAME'
  vatCode?: string, // When searchType='VATCODE'
  zipCode?: string, // When searchType='ZONE'
  city?: string, // When searchType='ZONE'
  countyCode?: string, // When searchType='ZONE'
  phoneNumber?: string, // When searchType='VATCODE'
  categoryCode?: string, // When searchType='CATEGORY'
  email?: string, // When searchType='EMAIL'
  lastModificationDate?: {
    // When searchType='LASTMODDATE'
    minDate: string,
    maxDate: string,
  },
  searchFieldValue?: string, // When searchType='SEARCH FIELD' or 'EXTERNAL_REF_CODE'
  languageCode?: string, // Optional: 2-digit language code
});
```

**Example:**

```typescript
// Search by code
const byCode = await client.search({
  searchType: 'CODE',
  recordCode: '508558',
});

// Search by email
const byEmail = await client.search({
  searchType: 'EMAIL',
  email: 'user@example.com',
});

// Search by name
const byName = await client.search({
  searchType: 'NAME',
  name: 'John Doe',
  city: 'New York',
});
```

##### `upsertRecord(record)`

Insert or update a master record. The `insertCriteria` defaults to `'T'` (update all fields if exists) but can be overridden by including it in the record.

```typescript
const response = await client.upsertRecord({
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
  languageCode: string,
  categoryCode: string,
  recordCode: string, // Optional: 6-digit code
  insertCriteria: 'S' | 'N' | 'T' | 'M', // Optional: defaults to 'T'
  // ... see types for full list
});
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

// Override insertCriteria
const newRecord = await client.upsertRecord({
  name: 'John Doe',
  insertCriteria: 'S', // Always insert new
  email: 'john@example.com',
  // ... other fields
});

console.log(response.customerRecordRS?.customerRecordCode);
```

## Error Handling

The SDK throws `AvesError` for API errors and validation failures:

```typescript
import { AvesError } from 'aves-sdk';

try {
  await client.search({ searchType: 'CODE', recordCode: '123' });
} catch (error) {
  if (error instanceof AvesError) {
    console.error('Status:', error.status); // 'ERROR' | 'TIMEOUT' | 'WARNING'
    console.error('Error Code:', error.errorCode);
    console.error('Description:', error.errorDescription);
  }
}
```

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
- All other fields follow the AVES API specification

Invalid data will throw a validation error before making the API request. All validation happens on camelCase input, making it easy to use.

## License

MIT

## Links

- [GitHub Repository](https://github.com/simoneguglielmi/aves-sdk)
- [NPM Package](https://npmjs.com/package/aves-sdk)
- [Issue Tracker](https://github.com/simoneguglielmi/aves-sdk/issues)
