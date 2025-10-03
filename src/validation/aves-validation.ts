import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  IsNumber,
  IsEmail,
  IsDateString,
  IsObject,
  MinLength,
  MaxLength,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

// ===== VALIDATION CLASSES =====

export class AddressValidation {
  @IsOptional()
  @IsEnum(['HOME', 'WORK', 'BILLING', 'DELIVERY'])
  '@Type'?: 'HOME' | 'WORK' | 'BILLING' | 'DELIVERY';

  @IsOptional()
  @IsString()
  @MaxLength(100)
  Street?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  City?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  State?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  PostalCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  Country?: string;
}

export class ContactInfoValidation {
  @IsOptional()
  @IsObject()
  Phone?: {
    '@Type'?: 'HOME' | 'WORK' | 'MOBILE' | 'FAX';
    '@Number': string;
  };

  @IsOptional()
  @IsObject()
  Email?: {
    '@Type'?: 'HOME' | 'WORK';
    '@Address': string;
  };
}

export class PassengerValidation {
  @IsString()
  @MinLength(1)
  '@PassengerID': string;

  @IsEnum(['ADT', 'CHD', 'INF'])
  '@Type': 'ADT' | 'CHD' | 'INF';

  @IsOptional()
  @IsEnum(['MR', 'MRS', 'MS', 'DR', 'PROF'])
  '@Title'?: 'MR' | 'MRS' | 'MS' | 'DR' | 'PROF';

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  FirstName: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  LastName: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  MiddleName?: string;

  @IsOptional()
  @IsDateString()
  DateOfBirth?: string;

  @IsOptional()
  @IsEnum(['M', 'F'])
  Gender?: 'M' | 'F';

  @IsOptional()
  @IsString()
  @MaxLength(3)
  Nationality?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressValidation)
  Address?: AddressValidation;

  @IsOptional()
  @ValidateNested()
  @Type(() => ContactInfoValidation)
  ContactInfo?: ContactInfoValidation;
}

export class ServiceValidation {
  @IsString()
  @MinLength(1)
  '@ServiceID': string;

  @IsEnum(['FLIGHT', 'HOTEL', 'CAR', 'TRANSFER', 'INSURANCE'])
  '@Type': 'FLIGHT' | 'HOTEL' | 'CAR' | 'TRANSFER' | 'INSURANCE';

  @IsEnum(['CONFIRMED', 'PENDING', 'CANCELLED'])
  '@Status': 'CONFIRMED' | 'PENDING' | 'CANCELLED';

  @IsObject()
  ServiceDetails: {
    Code?: string;
    Name?: string;
    Description?: string;
    StartDate?: string;
    EndDate?: string;
    Price?: {
      '@Currency': string;
      '@Amount': number;
    };
  };
}

export class PaymentValidation {
  @IsString()
  @MinLength(1)
  '@PaymentID': string;

  @IsEnum(['CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'CASH'])
  '@Type': 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER' | 'CASH';

  @IsEnum(['PENDING', 'CONFIRMED', 'FAILED'])
  '@Status': 'PENDING' | 'CONFIRMED' | 'FAILED';

  @IsObject()
  Amount: {
    '@Currency': string;
    '@Amount': number;
  };

  @IsOptional()
  @IsObject()
  PaymentDetails?: {
    CardNumber?: string;
    ExpiryDate?: string;
    CardHolderName?: string;
  };
}

export class SearchMasterRecordRQValidation {
  @IsObject()
  SearchCriteria: {
    MasterRecordType: 'CUSTOMER' | 'AGENT' | 'SUPPLIER';
    SearchFields: {
      Field: {
        '@Name': string;
        '@Value': string;
        '@Operator'?: 'EQUALS' | 'CONTAINS' | 'STARTS_WITH' | 'ENDS_WITH';
      }[];
    };
    Pagination?: {
      '@PageSize': number;
      '@PageNumber': number;
    };
  };
}

export class BookFileRQValidation {
  @IsObject()
  BookingDetails: {
    '@BookingType': 'INDIVIDUAL' | 'GROUP' | 'CORPORATE';
    '@Priority': 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
    CustomerInfo: {
      '@CustomerID'?: string;
      CustomerDetails?: any; // MasterRecord validation would go here
    };
    PassengerList: {
      Passenger: PassengerValidation[];
    };
    SelectedServiceList: {
      Service: ServiceValidation[];
    };
    SpecialRequests?: {
      Request: {
        '@Type': 'MEAL' | 'SEAT' | 'WHEELCHAIR' | 'OTHER';
        '@Description': string;
      }[];
    };
  };
}

export class CancelFileRQValidation {
  @IsString()
  @MinLength(1)
  '@BookingFileID': string;

  @IsObject()
  CancellationDetails: {
    '@Reason': 'CUSTOMER_REQUEST' | 'NO_SHOW' | 'OPERATIONAL' | 'OTHER';
    '@Description'?: string;
    RefundRequest?: {
      '@Amount': number;
      '@Currency': string;
      '@Method': 'ORIGINAL_PAYMENT' | 'CREDIT' | 'CASH';
    };
  };
}

export class PrintBookingDocumentRQValidation {
  @IsString()
  @MinLength(1)
  '@BookingFileID': string;

  @IsObject()
  DocumentRequest: {
    '@DocumentType': 'CONFIRMATION' | 'INVOICE' | 'VOUCHER' | 'TICKET' | 'ALL';
    '@Format': 'PDF' | 'HTML' | 'XML';
    '@Language'?: string;
    DeliveryMethod?: {
      '@Type': 'EMAIL' | 'SMS' | 'DOWNLOAD';
      '@Address'?: string;
    };
  };
}
