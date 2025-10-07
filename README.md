# Aves SDK

TypeScript SDK for integrating with the Aves XML 1.8.0 Booking API in NestJS applications. 100% type-safe, fully validated, and compliant with the official Aves XML specification.

## Features

- **100% Aves XML 1.8.0 Compliant** - Exact implementation of official spec
- **Full Type Safety** - Discriminated unions, type narrowing, zero `any` types
- **Smart Interfaces** - Type-safe search with discriminated unions
- **Zod Validation** - Runtime validation for all requests/responses
- **NestJS Native** - Proper module with DI support
- **Production Ready** - Tested, validated, optimized bundle

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

### 1. Configure Environment

```env
AVES_BASE_URL=https://your-aves-instance.com
AVES_HOST_ID=123456
AVES_XTOKEN=your_token_here
AVES_LANGUAGE_CODE=01
```

### 2. Import Module

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AvesModule } from 'aves-sdk';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AvesModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        baseUrl: config.get('AVES_BASE_URL')!,
        hostId: config.get('AVES_HOST_ID')!,
        xtoken: config.get('AVES_XTOKEN')!,
        languageCode: config.get('AVES_LANGUAGE_CODE'),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

### 3. Use the Service

```typescript
import { Injectable } from '@nestjs/common';
import { AvesService, SearchCustomerRequest } from 'aves-sdk';

@Injectable()
export class BookingService {
  constructor(private readonly aves: AvesService) {}

  async findCustomer(code: string) {
    // Type-safe discriminated union
    const request: SearchCustomerRequest = {
      type: 'code',
      code: code,
      pagination: { pages: 50, page: 1 },
    };

    const result = await this.aves.searchCustomers(request);
    return result.customers; // Fully typed Customer[]
  }
}
```

## Type-Safe Search (Discriminated Union)

The search interface uses **discriminated unions** for perfect type safety:

```typescript
// Search by customer code - TypeScript knows only 'code' is available
const searchByCode: SearchCustomerRequest = {
  type: 'code',
  code: '123456',
  // Only 'code' property available - type-safe!
};

// Search by name - different fields available
const searchByName: SearchCustomerRequest = {
  type: 'name',
  name: 'Smith',
  city: 'New York', // Optional for 'name' type
};

// Search by VAT code
const searchByVat: SearchCustomerRequest = {
  type: 'vat_code',
  vatCode: 'IT12345678',
  phoneNumber: '+39123456', // Optional for 'vat_code' type
};

// Search by last modification date
const searchByDate: SearchCustomerRequest = {
  type: 'last_mod_date',
  from: '2025-01-01',
  to: '2025-12-31',
  // 'from' and 'to' are required for this type
};
```

### Available Search Types

| Type                | Required Fields   | Optional Fields                    |
| ------------------- | ----------------- | ---------------------------------- |
| `code`              | `code`            | `pagination`                       |
| `name`              | `name`            | `city`, `pagination`               |
| `vat_code`          | `vatCode`         | `phoneNumber`, `pagination`        |
| `zone`              | `zipCode`         | `city`, `countyCode`, `pagination` |
| `category`          | `categoryCode`    | `pagination`                       |
| `email`             | `email`           | `pagination`                       |
| `last_mod_date`     | `from`, `to`      | `pagination`                       |
| `search_field`      | `searchField`     | `pagination`                       |
| `external_ref_code` | `externalRefCode` | `pagination`                       |

## API Methods

### Customer Management

```typescript
// Search customers
const result = await aves.searchCustomers({
  type: 'name',
  name: 'Rossi',
  pagination: { pages: 25, page: 1 },
});

// Create customer
const customer = await aves.createCustomer({
  id: '123456',
  type: 'customer',
  status: 'enabled',
  personalInfo: {
    firstName: 'Mario',
    lastName: 'Rossi',
    dateOfBirth: '1990-01-01',
    gender: 'male',
  },
  contact: {
    email: { address: 'mario.rossi@example.com' },
    phone: { number: '+39123456789' },
  },
});

// Update customer
await aves.updateCustomer(customer);

// Upsert customer (insert or update secondary fields)
await aves.upsertCustomer(customer);
```

### Booking Management

```typescript
// Create booking
const booking = await aves.createBooking({
  customerId: '123456',
  description: 'Summer vacation package',
  startDate: '2025-07-01',
  endDate: '2025-07-14',
  currency: 'EUR',
  passengers: [
    {
      id: '001',
      type: 'adult',
      firstName: 'Mario',
      lastName: 'Rossi',
      dateOfBirth: '1990-01-01',
      gender: 'male',
    },
  ],
  services: [
    {
      id: 'HTL001',
      type: 'hotel',
      status: 'pending',
      name: 'Hotel Paradise',
      startDate: '2025-07-01',
      endDate: '2025-07-14',
    },
  ],
  statisticCodes: {
    code2: 'USA',
    code3: 'GEN',
  },
  printDocument: false,
  sendDocumentViaEmail: false,
});

// Update booking header
await aves.updateBookingHeader('123456', 'BK/2025/001', '2025-07-01', {
  notes: 'Updated booking notes',
  passengers: [
    /* updated passengers */
  ],
});

// Set booking status
await aves.setBookingStatus('123456', 'BK/2025/001', 'confirmed');

// Cancel booking
await aves.cancelBooking({
  bookingId: 'BK/2025/001',
  customerId: '123456',
});
```

### Document Management

```typescript
// Print booking documents
const result = await aves.printDocument({
  bookingId: 'BK/2025/001',
  customerId: '123456',
  documentType: 'voucher',
  format: 'pdf',
  language: '01',
});

// Access generated documents
result.data.documents.forEach((doc) => {
  console.log(doc.fileName);
  console.log(doc.content); // Base64 content
  console.log(doc.contentSize);
});
```

### Payment Management

```typescript
// Add payment
await aves.addPayment({
  bookingId: 'BK/2025/001',
  payments: [
    {
      id: 'PAY001',
      type: 'cash',
      status: 'confirmed',
      amount: {
        currency: 'EUR',
        amount: 500.0,
      },
    },
  ],
  enableMultiple: true,
  operationType: 'absolute',
});
```

## Type Definitions

### Customer Types

```typescript
type CustomerType = 'customer' | 'supplier' | 'voucher' | 'supplier_voucher';
type CustomerStatusType = 'enabled' | 'warning' | 'blacklisted' | 'disabled';
type PassengerType = 'adult' | 'child' | 'infant' | 'senior';
type GenderType = 'male' | 'female';
```

### Booking Types

```typescript
type BookingStatusType =
  | 'quotation'
  | 'work_in_progress'
  | 'confirmed'
  | 'optioned'
  | 'nullified'
  | 'canceled';
```

### Document Types

```typescript
type DocumentType =
  | 'visa_request'
  | 'travel_information'
  | 'voucher'
  | 'booking_contract'
  | 'booking_confirmation'
  | 'supplier_service_list'
  | 'invoice'
  | 'proforma_invoice'
  | 'adeguamento'
  | 'reservation_form'
  | 'open_xml'
  | 'sales_invoice'
  | 'ticketing_tmaster'
  | 'summary_form';
```

## Response Interfaces

### Search Response with Pagination

```typescript
interface CustomerSearchResult {
  customers: Customer[];
  pagination: {
    page: number; // Current page
    pages: number; // Minimum known pages
    totalItems: number; // Items in this response
    hasMore: boolean; // More results available
  };
}
```

### Document Print Result

```typescript
interface DocumentPrintResult {
  emailRecipient?: string;
  documents: PrintedDocument[];
  additionalDocuments?: {
    emailRecipient: string;
    documents: PrintedDocument[];
  }[];
}

interface PrintedDocument {
  fileName: string;
  content?: string; // Base64 content
  contentSize: number;
}
```

## Validation

All requests are validated using Zod schemas:

```typescript
import { searchCustomerRequestSchema } from 'aves-sdk';

const result = searchCustomerRequestSchema.safeParse(request);
if (!result.success) {
  console.error(result.error.issues);
}
```

## Error Handling

```typescript
import { AvesErrorHandler, AvesErrorCodes } from 'aves-sdk';

try {
  const booking = await aves.createBooking(request);
} catch (error) {
  const avesError = errorHandler.handleHttpError(error);
  console.error(avesError.code, avesError.message);
}
```

## Bundle Size

Optimized for production:

- **ESM**: 51.75 KB (gzipped)
- **CJS**: 55.13 KB (gzipped)
- **DTS**: 137.03 KB

## Architecture

```
aves-sdk/
├── types/
│   ├── api-interfaces.ts      # Clean API layer (your code)
│   ├── interfaces.ts           # XML layer (Aves API)
│   └── common.ts              # Shared types
├── mappers/
│   ├── request-mappers.ts     # API → XML
│   ├── response-mappers.ts    # XML → API
│   └── type-mappers.ts        # Enum conversions
├── validation/
│   └── api-schemas.ts         # Zod validation schemas
├── nest/
│   ├── aves.module.ts         # NestJS module
│   └── aves.service.ts        # Main service
└── config/
    ├── endpoints.ts           # API endpoints
    └── root-elements.ts       # XML root elements
```

## License

MIT

## Credits

Built for the Aves XML 1.8.0 Booking CPX API specification.
