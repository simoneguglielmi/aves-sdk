# AVES SDK for NestJS

A comprehensive TypeScript SDK for integrating with the AVES XML REST API in NestJS applications. This SDK provides full type safety, validation, error handling, and follows NestJS best practices.

## Features

- **Full NestJS Integration** - Native module with `forRoot`/`forRootAsync` support and global availability
- **Complete Type Safety** - Comprehensive TypeScript interfaces with clean API abstractions
- **Advanced Validation** - Modern Zod validation with `AvesValidator` class and utility functions
- **Enhanced Date Handling** - Native JavaScript Date integration for robust date manipulation and validation
- **Error Handling** - Structured error handling with AVES-specific error codes
- **Configuration** - Environment-based configuration with validation
- **Dependency Injection** - Interface-based DI following NestJS patterns
- **Clean APIs** - Developer-friendly interfaces abstracting XML complexity
- **Bidirectional Mappers** - Seamless conversion between clean and XML interfaces
- **Production Ready** - Built for npm deployment with proper exports

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

### 1. Environment Configuration

Create a `.env` file:

```env
AVES_BASE_URL=https://api.aves.example.com
AVES_HOST_ID=123456
AVES_XTOKEN=your_xtoken_here
AVES_LANGUAGE_CODE=01
AVES_TIMEOUT=30000
```

### 2. Module Setup

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AvesModule } from 'aves-sdk';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Synchronous configuration
    AvesModule.forRoot({
      baseUrl: process.env.AVES_BASE_URL!,
      hostId: process.env.AVES_HOST_ID!,
      xtoken: process.env.AVES_XTOKEN!,
      languageCode: process.env.AVES_LANGUAGE_CODE,
      timeout: parseInt(process.env.AVES_TIMEOUT || '30000'),
    }),

    // OR Asynchronous configuration
    AvesModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        baseUrl: configService.get('AVES_BASE_URL')!,
        hostId: configService.get('AVES_HOST_ID')!,
        xtoken: configService.get('AVES_XTOKEN')!,
        languageCode: configService.get('AVES_LANGUAGE_CODE'),
        timeout: configService.get('AVES_TIMEOUT'),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

### 3. Service Usage with Clean APIs

```typescript
import { Injectable } from '@nestjs/common';
import {
  AvesService,
  SearchCustomerRequest,
  CreateBookingRequest,
  Customer,
  BookingResponse,
} from 'aves-sdk';

@Injectable()
export class BookingService {
  constructor(private readonly avesService: AvesService) {}

  async searchCustomers(searchTerm: string): Promise<Customer[]> {
    const searchRequest: SearchCustomerRequest = {
      type: 'customer',
      fields: [
        {
          name: 'LastName',
          value: searchTerm,
          operator: 'contains',
        },
      ],
    };

    const response = await this.avesService.searchCustomer(searchRequest);
    return response.results;
  }

  async createBooking(bookingData: {
    customerId: string;
    passengers: any[];
    services: any[];
  }): Promise<BookingResponse> {
    const bookingRequest: CreateBookingRequest = {
      type: 'individual',
      priority: 'normal',
      customerId: bookingData.customerId,
      passengers: bookingData.passengers,
      services: bookingData.services,
    };

    return await this.avesService.createBooking(bookingRequest);
  }
}
```

## Clean API Interfaces

The SDK provides developer-friendly interfaces that abstract away XML complexity:

### Customer Management

```typescript
import {
  Customer,
  CustomerAddress,
  CustomerContact,
  AddressType,
  CustomerType,
} from 'aves-sdk';

// Clean, intuitive interfaces
const customer: Customer = {
  id: '12345',
  type: 'customer',
  status: 'active',
  personalInfo: {
    title: 'mr',
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '1990-01-01',
    gender: 'male',
  },
  address: {
    type: 'home',
    street: '123 Main St',
    city: 'New York',
    postalCode: '10001',
    country: 'US',
  },
  contact: {
    phone: {
      type: 'mobile',
      number: '+1234567890',
    },
    email: {
      type: 'work',
      address: 'john.doe@example.com',
    },
  },
};
```

### Booking Management

```typescript
import {
  CreateBookingRequest,
  BookingPassenger,
  BookingService,
  PassengerType,
  ServiceType,
} from 'aves-sdk';

const booking: CreateBookingRequest = {
  type: 'individual',
  priority: 'normal',
  customerId: '12345',
  passengers: [
    {
      id: 'PAX001',
      type: 'adult',
      title: 'mr',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1990-01-01',
      gender: 'male',
    },
  ],
  services: [
    {
      id: 'SRV001',
      type: 'flight',
      status: 'confirmed',
      description: 'Flight from NYC to LAX',
      startDate: '2024-06-01',
      endDate: '2024-06-01',
    },
  ],
};
```

### Complete Type Safety

The SDK provides **zero `any` types** and complete type safety throughout:

```typescript
import {
  CreateBookingRequest,
  Customer,
  CustomerAddress,
  CustomerContact,
} from 'aves-sdk';

// Fully type-safe customer details in booking
const booking: CreateBookingRequest = {
  type: 'individual',
  priority: 'normal',
  customerId: '12345',
  // customerDetails is now properly typed as Customer interface
  customerDetails: {
    id: 'CUST001',
    type: 'customer',
    status: 'active',
    personalInfo: {
      title: 'mr',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1990-01-01',
      gender: 'male',
    },
    contact: {
      phone: {
        type: 'mobile',
        number: '+1234567890',
      },
      email: {
        type: 'work',
        address: 'john.doe@example.com',
      },
    },
    address: {
      type: 'home',
      street: '123 Main St',
      city: 'New York',
      postalCode: '10001',
      country: 'US',
    },
  },
  passengers: [...],
  services: [...],
};

// Automatic conversion to XML format with full type safety
const xmlBooking = mapCreateBookingToXml(booking);
```

## API Reference

### Core Services

#### AvesService

The main service for interacting with the AVES API with clean interfaces.

**Customer Management:**

- `searchCustomer(request: SearchCustomerRequest)` - Search for customers
- `createCustomer(customer: Customer)` - Create new customer
- `updateCustomer(customer: Customer)` - Update existing customer

**Booking Management:**

- `createBooking(request: CreateBookingRequest)` - Create new booking
- `updateBooking(bookingId: string, updates: Partial<CreateBookingRequest>)` - Update booking
- `cancelBooking(request: CancelBookingRequest)` - Cancel booking
- `getBooking(bookingId: string)` - Get booking details

**Payment Management:**

- `addPayment(request: AddPaymentRequest)` - Add payment to booking
- `getPayments(bookingId: string)` - Get payment history

**Document Management:**

- `printDocument(request: PrintDocumentRequest)` - Generate documents

#### AvesValidator

Advanced validation class for comprehensive data validation scenarios.

**Core Methods:**

- `validate(data, schema?)` - Synchronous validation with error throwing
- `asyncValidate(data, schema?)` - Asynchronous validation with error throwing
- `safeValidateAndParse(data, schema?)` - Safe validation without throwing errors
- `safeAsyncValidateAndParse(data, schema?)` - Safe async validation

**Utility Methods:**

- `getErrorMessage(error, separator?)` - Format ZodError messages
- `getSchema()` - Get current default schema

**Static Methods:**

- `AvesValidator.withSchema(schema)` - Create validator with specific schema

**Utility Functions:**

- `createValidator(schema)` - Create validator instance
- Date utilities with native JavaScript Date for enhanced date manipulation

### Configuration

#### AvesSdkConfig

```typescript
interface AvesSdkConfig {
  baseUrl: string; // AVES API base URL (validated as URL)
  hostId: string; // 6-digit host ID (validated)
  xtoken: string; // Authentication token (required)
  languageCode?: string; // Language code: '01' (Italian) or '02' (English)
  timeout?: number; // Request timeout in ms (default: 30000)
}
```

### Type Definitions

#### Union Types

The SDK provides strongly-typed union types for better type safety:

```typescript
type AddressType = 'home' | 'work' | 'billing' | 'delivery';
type PassengerType = 'adult' | 'child' | 'infant';
type ServiceType = 'flight' | 'hotel' | 'transfer' | 'activity';
type PaymentType = 'cash' | 'credit_card' | 'bank_transfer';
type CustomerType = 'customer' | 'agent' | 'supplier';
type BookingType = 'individual' | 'group' | 'corporate';
```

#### Date Utilities

Enhanced date manipulation with native JavaScript Date:

```typescript
import {
  createDateString,
  createDateTimeString,
  createTimeString,
  formatDateString,
  isValidDateString,
  calculateAge,
  isValidBookingDate,
} from 'aves-sdk';

// Create validated date strings
const dateString = createDateString('2024-01-01');
const dateTimeString = createDateTimeString('2024-01-01T10:30:00');
const timeString = createTimeString('10:30:00');

// Format dates for display
const formattedDate = formatDateString('2024-01-01', 'MMM dd, yyyy'); // "Jan 01, 2024"

// Validate date strings
const isValid = isValidDateString('2024-01-01'); // true

// AVES-specific utilities
const age = calculateAge('1990-01-01'); // Calculate customer age
const isBookingValid = isValidBookingDate('2024-06-01'); // Check if booking date is valid
```

### Validation

Built-in Zod validation with descriptive error messages:

```typescript
import { configValidationSchema } from 'aves-sdk';

// Configuration validation
const result = configValidationSchema.safeParse(config);
if (!result.success) {
  console.error('Validation errors:', result.error.issues);
}

// Request validation
import {
  SearchCustomerRequestValidation,
  CreateBookingRequestValidation,
} from 'aves-sdk';

const searchValidation =
  SearchCustomerRequestValidation.safeParse(searchRequest);
const bookingValidation =
  CreateBookingRequestValidation.safeParse(bookingRequest);
```

#### AvesValidator Class

The SDK provides a comprehensive `AvesValidator` class for advanced validation scenarios:

```typescript
import {
  AvesValidator,
  configValidationSchema,
  createValidator,
} from 'aves-sdk';

// Constructor approach - validator with default schema
const configValidator = new AvesValidator(configValidationSchema);

// Synchronous validation with error throwing
try {
  const validConfig = configValidator.validate(configData);
  console.log('Valid config:', validConfig);
} catch (error) {
  if (error instanceof ZodError) {
    console.error('Validation errors:', configValidator.getErrorMessage(error));
  }
}

// Safe validation without throwing errors
const result = configValidator.safeValidateAndParse(configData);
if (result.success) {
  console.log('Valid config:', result.data);
} else {
  console.error('Validation errors:', result.error.issues);
}

// Asynchronous validation
const asyncResult = await configValidator.asyncValidate(configData);

// Method approach - validator without default schema
const validator = new AvesValidator();

// Validate with different schemas
const configResult = validator.validate(configData, configValidationSchema);
const searchResult = validator.safeValidateAndParse(
  searchData,
  SearchCustomerRequestValidation
);

// Factory function approach
const validator = createValidator(configValidationSchema);
const result = validator.validate(configData);
```

**AvesValidator Methods:**

- `validate(data, schema?)` - Synchronous validation with error throwing
- `asyncValidate(data, schema?)` - Asynchronous validation with error throwing
- `safeValidateAndParse(data, schema?)` - Safe validation without throwing errors
- `safeAsyncValidateAndParse(data, schema?)` - Safe async validation
- `getErrorMessage(error, separator?)` - Format ZodError messages
- `getSchema()` - Get current default schema
- `setSchema(schema)` - Set new default schema

### Error Handling

Structured error handling with AVES-specific error codes:

```typescript
import { AvesErrorHandler, AvesErrorCodes } from 'aves-sdk';

@Injectable()
export class BookingService {
  constructor(
    private readonly avesService: AvesService,
    private readonly errorHandler: AvesErrorHandler
  ) {}

  async createBooking(data: CreateBookingRequest) {
    try {
      const response = await this.avesService.createBooking(data);
      return response;
    } catch (error) {
      const avesError = this.errorHandler.handleHttpError(error);

      switch (avesError.code) {
        case AvesErrorCodes.BOOKING_NOT_FOUND:
          throw new NotFoundException('Booking not found');
        case AvesErrorCodes.INVALID_REQUEST_FORMAT:
          throw new BadRequestException('Invalid booking data');
        case AvesErrorCodes.PAYMENT_FAILED:
          throw new PaymentRequiredException('Payment processing failed');
        default:
          throw new InternalServerErrorException(avesError.message);
      }
    }
  }
}
```

## Advanced Usage

### Custom Configuration Factory

```typescript
@Injectable()
export class CustomAvesConfigService implements AvesOptionsFactory {
  constructor(private configService: ConfigService) {}

  async createAvesOptions(): Promise<AvesSdkConfig> {
    // Custom logic to build configuration
    return {
      baseUrl: this.configService.get('AVES_BASE_URL')!,
      hostId: this.configService.get('AVES_HOST_ID')!,
      xtoken: await this.getTokenFromVault(),
      languageCode: '01',
      timeout: 60000,
    };
  }

  private async getTokenFromVault(): Promise<string> {
    // Custom token retrieval logic
    return 'your-secure-token';
  }
}

// Use in module
AvesModule.forRootAsync({
  useClass: CustomAvesConfigService,
});
```

### Custom Error Interceptors

```typescript
@Injectable()
export class AvesErrorInterceptor implements NestInterceptor {
  constructor(private errorHandler: AvesErrorHandler) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        const avesError = this.errorHandler.handleHttpError(error);

        // Custom error mapping
        const httpStatus = this.mapAvesErrorToHttpStatus(avesError.code);

        throw new HttpException(
          {
            message: avesError.message,
            code: avesError.code,
            timestamp: avesError.timestamp,
          },
          httpStatus
        );
      })
    );
  }

  private mapAvesErrorToHttpStatus(code: string): number {
    const statusMap: Record<string, number> = {
      [AvesErrorCodes.BOOKING_NOT_FOUND]: 404,
      [AvesErrorCodes.INVALID_REQUEST_FORMAT]: 400,
      [AvesErrorCodes.PAYMENT_FAILED]: 402,
    };

    return statusMap[code] || 500;
  }
}
```

### Type-Safe Mappers

```typescript
import {
  mapCustomerToXml,
  mapCustomerFromXml,
  mapCreateBookingToXml,
  mapBookingFromXml,
} from 'aves-sdk';

// Convert clean API data to XML format
const xmlCustomer = mapCustomerToXml(cleanCustomer);
const xmlBooking = mapCreateBookingToXml(cleanBooking);

// Convert XML response to clean API format
const cleanCustomer = mapCustomerFromXml(xmlResponse);
const cleanBooking = mapBookingFromXml(xmlResponse);
```

## Development

### Building

```bash
yarn build
```

### Testing

```bash
yarn test
```

### Linting

```bash
yarn lint
```

## Migration Guide

### From v0.x to v1.x

The SDK has been completely rewritten with clean APIs and Zod validation:

**Old (v0.x):**

```typescript
// Complex XML interfaces
const searchRequest: SearchMasterRecordRQ = {
  SearchCriteria: {
    MasterRecordType: 'CUSTOMER',
    SearchFields: {
      Field: [
        {
          '@Name': 'LastName',
          '@Value': 'Smith',
          '@Operator': 'CONTAINS',
        },
      ],
    },
  },
};
```

**New (v1.x):**

```typescript
// Clean, developer-friendly interfaces
const searchRequest: SearchCustomerRequest = {
  type: 'customer',
  fields: [
    {
      name: 'LastName',
      value: 'Smith',
      operator: 'contains',
    },
  ],
};
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:

- Create an issue on GitHub
- Check the examples in `/examples` directory
- Review the AVES technical documentation

## Changelog

### v1.0.0

- **Clean API Interfaces** - Developer-friendly interfaces abstracting XML complexity
- **Bidirectional Mappers** - Seamless conversion between clean and XML formats
- **AvesValidator Class** - Comprehensive validation class with sync/async methods and utility functions
- **Complete Type Safety** - Full TypeScript coverage with comprehensive interfaces for both clean API objects and XML structures, ensuring type safety throughout the entire request/response lifecycle
- **Customer Mapper** - Full `Customer` to `MasterRecord` conversion with `mapCustomerToXml`
- **Global Module** - NestJS global module for application-wide availability
- **Enhanced Error Handling** - Structured error handling with AVES-specific codes
- **Comprehensive Documentation** - Complete API reference and examples
- **Production Ready** - Enterprise-grade implementation following NestJS best practices

### Breaking Changes from v0.x

- Replaced `class-validator` with Zod validation
- Introduced clean API interfaces alongside XML interfaces
- Enhanced date utilities with native JavaScript Date
- Updated module configuration with enhanced validation
- Improved error handling structure
