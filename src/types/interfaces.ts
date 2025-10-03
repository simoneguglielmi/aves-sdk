// AVES XML Schema Interfaces - Comprehensive implementation

// ===== COMMON TYPES =====

export interface Address {
  '@Type'?: 'HOME' | 'WORK' | 'BILLING' | 'DELIVERY';
  Street?: string;
  City?: string;
  State?: string;
  PostalCode?: string;
  Country?: string;
}

export interface ContactInfo {
  Phone?: {
    '@Type'?: 'HOME' | 'WORK' | 'MOBILE' | 'FAX';
    '@Number': string;
  };
  Email?: {
    '@Type'?: 'HOME' | 'WORK';
    '@Address': string;
  };
}

export interface Passenger {
  '@PassengerID': string;
  '@Type': 'ADT' | 'CHD' | 'INF';
  '@Title'?: 'MR' | 'MRS' | 'MS' | 'DR' | 'PROF';
  FirstName: string;
  LastName: string;
  MiddleName?: string;
  DateOfBirth?: string; // YYYY-MM-DD
  Gender?: 'M' | 'F';
  Nationality?: string;
  Passport?: {
    '@Number': string;
    '@ExpiryDate': string;
    '@IssuingCountry': string;
  };
  Address?: Address;
  ContactInfo?: ContactInfo;
}

export interface Service {
  '@ServiceID': string;
  '@Type': 'FLIGHT' | 'HOTEL' | 'CAR' | 'TRANSFER' | 'INSURANCE';
  '@Status': 'CONFIRMED' | 'PENDING' | 'CANCELLED';
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

export interface Payment {
  '@PaymentID': string;
  '@Type': 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER' | 'CASH';
  '@Status': 'PENDING' | 'CONFIRMED' | 'FAILED';
  Amount: {
    '@Currency': string;
    '@Amount': number;
  };
  PaymentDetails?: {
    CardNumber?: string;
    ExpiryDate?: string;
    CardHolderName?: string;
  };
}

// ===== MASTER RECORDS =====

export interface SearchMasterRecordRQ {
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

export interface MasterRecord {
  '@MasterRecordID': string;
  '@Type': 'CUSTOMER' | 'AGENT' | 'SUPPLIER';
  '@Status': 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  PersonalInfo?: {
    Title?: string;
    FirstName: string;
    LastName: string;
    MiddleName?: string;
    DateOfBirth?: string;
    Gender?: 'M' | 'F';
    Nationality?: string;
  };
  ContactInfo?: ContactInfo;
  Address?: Address;
  BusinessInfo?: {
    CompanyName?: string;
    TaxID?: string;
    LicenseNumber?: string;
  };
  Preferences?: {
    Language?: string;
    Currency?: string;
    CommunicationMethod?: 'EMAIL' | 'SMS' | 'PHONE';
  };
}

export interface SearchMasterRecordRS {
  SearchResults: {
    MasterRecord: MasterRecord[];
    PaginationInfo?: {
      '@TotalRecords': number;
      '@PageSize': number;
      '@PageNumber': number;
      '@TotalPages': number;
    };
  };
}

export interface ManageMasterRecordRQ {
  '@InsertCriteria': 'INSERT' | 'UPDATE' | 'UPSERT';
  MasterRecordDetail: MasterRecord;
}

export interface CustomerRecordRS {
  MasterRecord: MasterRecord;
  OperationResult: {
    '@Status': 'SUCCESS' | 'FAILED';
    '@Message'?: string;
    '@MasterRecordID'?: string;
  };
}

// ===== BOOKING =====

export interface BookFileRQ {
  BookingDetails: {
    '@BookingType': 'INDIVIDUAL' | 'GROUP' | 'CORPORATE';
    '@Priority': 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
    CustomerInfo: {
      '@CustomerID'?: string;
      CustomerDetails?: MasterRecord;
    };
    PassengerList: {
      Passenger: Passenger[];
    };
    SelectedServiceList: {
      Service: Service[];
    };
    SpecialRequests?: {
      Request: {
        '@Type': 'MEAL' | 'SEAT' | 'WHEELCHAIR' | 'OTHER';
        '@Description': string;
      }[];
    };
  };
}

export interface BookingFile {
  '@BookingFileID': string;
  '@Status': 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  '@CreationDate': string;
  '@LastModified': string;
  CustomerInfo: MasterRecord;
  PassengerList: {
    Passenger: Passenger[];
  };
  ServiceList: {
    Service: Service[];
  };
  Pricing: {
    TotalAmount: {
      '@Currency': string;
      '@Amount': number;
    };
    Breakdown?: {
      Item: {
        '@Type': 'SERVICE' | 'TAX' | 'FEE' | 'DISCOUNT';
        '@Description': string;
        '@Amount': number;
      }[];
    };
  };
}

export interface BookingFileRS {
  BookingFile: BookingFile;
  OperationResult: {
    '@Status': 'SUCCESS' | 'FAILED';
    '@Message'?: string;
    '@BookingFileID'?: string;
  };
}

export interface ModiFileHeaderRQ {
  '@BookingFileID': string;
  HeaderModifications: {
    CustomerInfo?: MasterRecord;
    SpecialRequests?: {
      Request: {
        '@Type': string;
        '@Description': string;
      }[];
    };
    Notes?: {
      '@Type': 'GENERAL' | 'INTERNAL' | 'CUSTOMER';
      '@Content': string;
    }[];
  };
}

export interface ModiFileHeaderRS {
  BookingFile: BookingFile;
  OperationResult: {
    '@Status': 'SUCCESS' | 'FAILED';
    '@Message'?: string;
  };
}

export interface ModFileServicesRQ {
  '@BookingFileID': string;
  ServiceModifications: {
    AddServices?: {
      Service: Service[];
    };
    RemoveServices?: {
      ServiceID: string[];
    };
    ModifyServices?: {
      Service: Service[];
    };
  };
}

export interface SetStatusRQ {
  '@BookingFileID': string;
  '@NewStatus': 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  Reason?: {
    '@Code': string;
    '@Description': string;
  };
}

export interface SetStatusServiceRS {
  BookingFile: BookingFile;
  OperationResult: {
    '@Status': 'SUCCESS' | 'FAILED';
    '@Message'?: string;
    '@PreviousStatus'?: string;
  };
}

export interface CancelFileRQ {
  '@BookingFileID': string;
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

export interface CancelFileRS {
  BookingFile: BookingFile;
  OperationResult: {
    '@Status': 'SUCCESS' | 'FAILED';
    '@Message'?: string;
    RefundInfo?: {
      '@RefundAmount': number;
      '@Currency': string;
      '@RefundMethod': string;
      '@ProcessingTime': string;
    };
  };
}

// ===== PAYMENTS =====

export interface FilePaymentListRQ {
  '@BookingFileID': string;
  PaymentList: {
    Payment: Payment[];
  };
}

export interface FilePaymentListRS {
  BookingFile: BookingFile;
  PaymentSummary: {
    TotalPaid: {
      '@Currency': string;
      '@Amount': number;
    };
    OutstandingAmount: {
      '@Currency': string;
      '@Amount': number;
    };
    PaymentHistory: {
      Payment: Payment[];
    };
  };
  OperationResult: {
    '@Status': 'SUCCESS' | 'FAILED';
    '@Message'?: string;
  };
}

// ===== DOCUMENTS =====

export interface PrintBookingDocumentRQ {
  '@BookingFileID': string;
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

export interface PrintBookingDocumentRS {
  DocumentInfo: {
    '@DocumentID': string;
    '@DocumentType': string;
    '@Format': string;
    '@Size': number;
    '@CreationDate': string;
    DownloadURL?: string;
    DeliveryStatus?: {
      '@Status': 'SENT' | 'PENDING' | 'FAILED';
      '@Method': string;
      '@Address'?: string;
    };
  };
  OperationResult: {
    '@Status': 'SUCCESS' | 'FAILED';
    '@Message'?: string;
  };
}
