# AVES SDK for NestJS

A comprehensive TypeScript SDK for integrating with the AVES XML REST API in NestJS applications. This SDK provides full type safety, validation, error handling, and follows NestJS best practices.

## Features

- 🚀 **Full NestJS Integration** - Native module with `forRoot`/`forRootAsync` support
- 🔒 **Type Safety** - Comprehensive TypeScript interfaces for all AVES operations
- ✅ **Validation** - Built-in validation using class-validator decorators
- 🛡️ **Error Handling** - Structured error handling with AVES-specific error codes
- ⚙️ **Configuration** - Environment-based configuration with `@nestjs/config`
- 🔄 **Dependency Injection** - Interface-based DI following NestJS patterns
- 📦 **Production Ready** - Built for npm deployment with proper exports

## Installation

```bash
npm install aves-sdk
# or
yarn add aves-sdk
```

## Quick Start

### 1. Environment Configuration

Create a `.env` file:

```env
AVES_BASE_URL=https://api.aves.example.com
AVES_HOST_ID=123456
AVES_XTOKEN=your_xtoken_here
AVES_LANGUAGE_CODE=EN
AVES_TIMEOUT=30000
```

### 2. Module Setup

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AvesModule, avesConfig } from 'aves-sdk';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [avesConfig],
    }),
    AvesModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config) => ({
        baseUrl: config.baseUrl,
        hostId: config.hostId,
        xtoken: config.xtoken,
        languageCode: config.languageCode,
        timeout: config.timeout,
      }),
      inject: [getConfigToken('AVES_SDK_CONFIG')],
    }),
  ],
})
export class AppModule {}
```

### 3. Service Usage

```typescript
import { Injectable } from '@nestjs/common';
import { AvesService, SearchMasterRecordRQ, BookFileRQ } from 'aves-sdk';

@Injectable()
export class BookingService {
  constructor(private readonly avesService: AvesService) {}

  async searchCustomers(searchTerm: string) {
    const searchRequest: SearchMasterRecordRQ = {
      SearchCriteria: {
        MasterRecordType: 'CUSTOMER',
        SearchFields: {
          Field: [
            {
              '@Name': 'LastName',
              '@Value': searchTerm,
              '@Operator': 'CONTAINS',
            },
          ],
        },
      },
    };

    const response = await this.avesService.searchMasterRecord(searchRequest);
    return response.Response.Body?.SearchResults.MasterRecord || [];
  }

  async createBooking(bookingData: any) {
    const bookingRequest: BookFileRQ = {
      BookingDetails: {
        '@BookingType': 'INDIVIDUAL',
        '@Priority': 'NORMAL',
        CustomerInfo: { '@CustomerID': bookingData.customerId },
        PassengerList: { Passenger: bookingData.passengers },
        SelectedServiceList: { Service: bookingData.services },
      },
    };

    const response = await this.avesService.createBookingFile(bookingRequest);
    return response.Response.Body?.BookingFile;
  }
}
```

## API Reference

### Core Services

#### AvesService

The main service for interacting with the AVES API.

**Methods:**

- `searchMasterRecord(payload: SearchMasterRecordRQ)` - Search for master records
- `insertOrUpdateMasterRecord(payload: ManageMasterRecordRQ)` - Create/update master records
- `createBookingFile(payload: BookFileRQ)` - Create new booking
- `modBookingFileHeader(payload: ModiFileHeaderRQ)` - Modify booking header
- `modBookingFileServices(payload: ModFileServicesRQ)` - Modify booking services
- `setBookingStatus(payload: SetStatusRQ)` - Change booking status
- `cancelBookingFile(payload: CancelFileRQ)` - Cancel booking
- `getFilePaymentList(payload: FilePaymentListRQ)` - Get payment information
- `printBookingDocument(payload: PrintBookingDocumentRQ)` - Generate documents

### Configuration

#### AvesSdkConfig

```typescript
interface AvesSdkConfig {
  baseUrl: string; // AVES API base URL
  hostId: string; // Your host ID
  xtoken: string; // Authentication token
  languageCode?: string; // Language code (default: 'EN')
  timeout?: number; // Request timeout in ms (default: 30000)
}
```

### Types

#### Core Types

- `Passenger` - Passenger information with passport details
- `Service` - Service details with pricing
- `Payment` - Payment information
- `MasterRecord` - Customer/agent/supplier records
- `BookingFile` - Complete booking information

#### Request/Response Types

- `SearchMasterRecordRQ/RS` - Master record search
- `BookFileRQ/RS` - Booking creation
- `CancelFileRQ/RS` - Booking cancellation
- `PrintBookingDocumentRQ/RS` - Document generation

### Error Handling

The SDK provides structured error handling with AVES-specific error codes:

```typescript
import { AvesErrorHandler, AvesErrorCodes } from 'aves-sdk';

@Injectable()
export class BookingService {
  constructor(
    private readonly avesService: AvesService,
    private readonly errorHandler: AvesErrorHandler
  ) {}

  async createBooking(data: any) {
    try {
      const response = await this.avesService.createBookingFile(data);
      return response;
    } catch (error) {
      const avesError = this.errorHandler.handleHttpError(error);

      if (avesError.code === AvesErrorCodes.BOOKING_NOT_FOUND) {
        throw new NotFoundException('Booking not found');
      }

      throw new InternalServerErrorException(avesError.message);
    }
  }
}
```

### Validation

Built-in validation classes for request validation:

```typescript
import {
  SearchMasterRecordRQValidation,
  BookFileRQValidation,
  CancelFileRQValidation,
} from 'aves-sdk';

// Use with class-validator
const validation = new SearchMasterRecordRQValidation();
const errors = await validate(validation);
```

## Advanced Usage

### Custom Configuration

```typescript
AvesModule.forRootAsync({
  useFactory: async (configService: ConfigService) => {
    const config = await configService.get('AVES_SDK_CONFIG');
    return {
      baseUrl: config.baseUrl,
      hostId: config.hostId,
      xtoken: config.xtoken,
      timeout: 60000, // Custom timeout
    };
  },
  inject: [ConfigService],
});
```

### Custom HTTP Client

```typescript
AvesModule.forRootAsync({
  useClass: CustomAvesConfigService,
});
```

### Error Interceptors

```typescript
@Injectable()
export class AvesErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        const avesError = this.errorHandler.handleHttpError(error);
        throw new HttpException(avesError.message, 500);
      })
    );
  }
}
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
- Review the AVES XML documentation

## Changelog

### v1.0.0

- Initial release
- Full NestJS integration
- Comprehensive TypeScript interfaces
- Validation and error handling
- Production-ready build
