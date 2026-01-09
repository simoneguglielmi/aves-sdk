# AVES SDK

A type-safe TypeScript SDK for the AVES XML REST API. Automatically handles XML parsing, validation, and provides full TypeScript support.

## Features

- **Type-safe** - Full TypeScript support with inferred types
- **Runtime validation** - Input/output validation using Valibot
- **XML handling** - Automatic XML ↔ JSON conversion
- **Error handling** - Custom error types with detailed error information
- **Zero dependencies** - Uses native Node.js fetch (undici)

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
  'TOKEN002756' // Xtoken
);

// Search for records
const results = await client.search({
  SearchType: 'CODE',
  RecordCode: '508558',
  languageCode: '02', // Optional: 01=Italian, 02=English
});

// Insert or update a record
const response = await client.upsertRecord(
  {
    Name: 'John Doe',
    Email: 'john@example.com',
    Address: '123 Main St',
    ZipCode: '12345',
    CityName: 'New York',
    StateCode: 'USA',
    // ... other fields
  },
  'S'
); // Insert criteria: S, N, T, or M
```

## API Reference

### `AvesClient`

#### Constructor

```typescript
new AvesClient(baseURL: string, hostID: string, xtoken: string)
```

- `baseURL` - Base URL of the AVES API
- `hostID` - 6-digit identification code
- `xtoken` - Unique validation string

#### Methods

##### `search(params)`

Search for master records by various criteria.

```typescript
const results = await client.search({
  SearchType:
    'CODE' |
    'NAME' |
    'VATCODE' |
    'ZONE' |
    'CATEGORY' |
    'EMAIL' |
    'LASTMODDATE' |
    'SEARCH FIELD' |
    'EXTERNAL_REF_CODE',
  RecordCode: string, // When SearchType='CODE' (6 digits)
  Name: string, // When SearchType='NAME'
  VatCode: string, // When SearchType='VATCODE'
  ZipCode: string, // When SearchType='ZONE'
  City: string, // When SearchType='ZONE'
  CountyCode: string, // When SearchType='ZONE'
  CategoryCode: string, // When SearchType='CATEGORY'
  Email: string, // When SearchType='EMAIL'
  LastModificationDate: {
    // When SearchType='LASTMODDATE'
    '@MinDate': string,
    '@MaxDate': string,
  },
  SearchFieldValue: string, // When SearchType='SEARCH FIELD' or 'EXTERNAL_REF_CODE'
  languageCode: string, // Optional: 2-digit language code
});
```

**Example:**

```typescript
// Search by code
const byCode = await client.search({
  SearchType: 'CODE',
  RecordCode: '508558',
});

// Search by email
const byEmail = await client.search({
  SearchType: 'EMAIL',
  Email: 'user@example.com',
});

// Search by name
const byName = await client.search({
  SearchType: 'NAME',
  Name: 'John Doe',
  City: 'New York',
});
```

##### `upsertRecord(record, insertCriteria?, languageCode?)`

Insert or update a master record.

```typescript
const response = await client.upsertRecord(
  {
    Name: string,
    Email: string,
    Address: string,
    ZipCode: string,
    CityName: string,
    CountyCode: string,
    StateCode: string,
    FirstPhoneNumber: string,
    MobilePhoneNumber: string,
    FiscalCode: string,
    BirthDate: string,
    Gender: string,
    LanguageCode: string,
    CategoryCode: string,
    // ... see types for full list
  },
  'S' | 'N' | 'T' | 'M', // Insert criteria (default: 'S')
  '02' // Optional: 2-digit language code
);
```

**Insert Criteria:**

- `'S'` - Insert always new record (default)
- `'N'` - If record exists, do not update
- `'T'` - If record exists, update all fields
- `'M'` - If record exists, update only secondary fields

**Example:**

```typescript
const response = await client.upsertRecord(
  {
    Name: 'Jane Smith',
    Email: 'jane@example.com',
    Address: '456 Oak Ave',
    ZipCode: '67890',
    CityName: 'Los Angeles',
    StateCode: 'USA',
    FirstPhoneNumber: '+1234567890',
    LanguageCode: '02',
  },
  'T'
); // Update all fields if exists

console.log(response.CustomerRecordRS?.CustomerRecordCode);
```

## Error Handling

The SDK throws `AvesError` for API errors and validation failures:

```typescript
import { AvesError } from 'aves-sdk';

try {
  await client.search({ SearchType: 'CODE', RecordCode: '123' });
} catch (error) {
  if (error instanceof AvesError) {
    console.error('Status:', error.status); // 'ERROR' | 'TIMEOUT' | 'WARNING'
    console.error('Error Code:', error.errorCode);
    console.error('Description:', error.errorDescription);
  }
}
```

## Type Safety

All types are exported and inferred from the validation schemas:

```typescript
import type {
  SearchMasterRecordRQ,
  SearchMasterRecordRS,
  ManageMasterRecordRQ,
  ManageMasterRecordRS,
  MasterRecordDetail,
} from 'aves-sdk';

// Use types for your functions
function processRecord(record: MasterRecordDetail) {
  // TypeScript knows all available fields
}
```

## Validation

The SDK validates all inputs and outputs using Valibot schemas:

- **HostID**: Must be exactly 6 digits
- **RecordCode**: Must be exactly 6 characters
- **LanguageCode**: Must be exactly 2 digits (01=Italian, 02=English, etc.)
- All other fields follow the AVES API specification

Invalid data will throw a validation error before making the API request.

## License

MIT

## Links

- [GitHub Repository](https://github.com/simoneguglielmi/aves-sdk)
- [NPM Package](https://npmjs.com/package/aves-sdk)
- [Issue Tracker](https://github.com/simoneguglielmi/aves-sdk/issues)
