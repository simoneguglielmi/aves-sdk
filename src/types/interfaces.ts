// AVES XML Schema Interfaces - Exact Aves API 1.8.0 specification

import { InsertCriteria } from './common';

// ===== PASSENGER STRUCTURES =====

export interface PassengerDetail {
  '@RPH': string; // Passenger progressive number (001, 002, 003...)
  '@RoomRPH'?: string; // Room progressive number (001, 002, 003...)
  '@BillingHolder'?: boolean;
  MasterRecordCode?: string;
  Name: string;
  CategoryCode: 'AD' | 'CH' | 'IN' | 'OV'; // adult, child, infant, senior
  Sex?: 'M' | 'F';
  BirthDate?: string; // Mandatory when CategoryCode <> AD
  BirthPlace?: string;
  NationCode?: string;
  CitizenshipCode?: string;
  FiscalCode?: string;
  PhoneNumber?: string;
  eMail?: string;
  Notes?: {
    Note: {
      '@nType':
        | 'ROOMING_LIST'
        | 'LEAVING_LIST'
        | 'TRANSFER_LIST'
        | 'CHECK_LIST';
    }[];
  };
  FlagStatus?: string;
  OfferCode?: string;
  IDDocInfo?: {
    '@IDType'?: string;
    '@IDCode'?: string;
    '@IDIssueLocation'?: string;
    '@IDIssueCounty'?: string;
    '@IDIssueDate'?: string;
    '@IDExpireDate'?: string;
  };
}

// ===== MASTER RECORDS =====

export interface SearchMasterRecordRQ {
  SearchType:
    | 'CODE'
    | 'NAME'
    | 'VATCODE'
    | 'ZONE'
    | 'CATEGORY'
    | 'EMAIL'
    | 'LASTMODDATE'
    | 'SEARCH_FIELD'
    | 'EXTERNAL_REF_CODE';
  RecordCode?: string;
  Name?: string;
  VatCode?: string;
  ZipCode?: string;
  City?: string;
  CountyCode?: string;
  PhoneNumber?: string;
  CategoryCode?: string;
  Email?: string;
  LastModificationDate?: {
    '@MinDate': string;
    '@MaxDate': string;
  };
  SearchFieldValue?: string;
}

export interface MasterRecordDetail {
  '@RecordCode': string;
  '@InsertCriteria'?: 'S' | 'N' | 'T' | 'M';

  // REQUIRED FIELDS
  RecordType: 'CUSTOMER' | 'SUPPLIER' | 'VOUCHER' | 'SUPPLIER_VOUCHER';
  Name: string;
  LanguageCode: string;

  // OPTIONAL FLAT FIELDS
  CreatedDate?: string;
  ModifiedDate?: string;
  LoginType?:
    | 'WEB_BOOKING'
    | 'BUSINESS_TRAVEL'
    | 'GROUP_TRAVEL'
    | 'SUPPLIER'
    | 'ADMINISTRATOR';
  RecordStatus?: 'ENABLED' | 'WARNING' | 'BLACKLISTED' | 'DISABLED';
  ThirdPartRecordCode?: string;
  Moniker?: string;
  SearchField?: string;
  ExtraInfo?: string;
  Address?: string;
  ZipCode?: string;
  CityName?: string;
  CountyCode?: string;
  StateCode?: string;
  CitizenshipCode?: string;
  ZoneCode?: string;
  AreaCode?: string;
  BranchOfficeCode?: string;
  CategoryCode?: string;
  ActivityCode?: string;
  PromoterCode?: string;
  NetworkCode?: string;
  FirstPhoneNumber?: string;
  SecondPhoneNumber?: string;
  FaxNumber?: string;
  MobilePhone?: string;
  Email?: string;
  WebUrl?: string;
  Password?: string;
  EncryptedPassword?: boolean;
  Gender?: 'M' | 'F';
  BirthDate?: string;
  BirthCity?: string;
  BirthCounty?: string;
  FiscalCode?: string;
  VatCode?: string;
  PriceListCode?: string;
  CostListCode?: string;
  DiscountCode?: string;
  CardNumber?: string;
  ElectronicInvoiceCertifiedMail?: string;

  // NESTED STRUCTURES
  SupplierRefMasterRecords?: {
    '@BillingRefCode'?: string;
    '@PaymentRefCode'?: string;
    '@VoucherRefCode'?: string;
    '@SupplierRefCode'?: string;
    '@CompanyMainBusinessType'?: 'NOT_SET' | 'GENERIC' | 'TOURISTIC';
    '@CarrierType'?:
      | 'NOT_SET'
      | 'FLIGHT'
      | 'SHIP'
      | 'TRAIN'
      | 'RENTCAR'
      | 'BUS'
      | 'DP_HOTEL'
      | 'TO_HOTEL'
      | 'TO_TOUR'
      | 'TO_HOTEL_AND_TOUR'
      | 'DP_AUTO'
      | 'DP_GDS_NAVI'
      | 'DP_GDS_VOLI'
      | 'TOUR_OPERATOR'
      | 'TICKETING_EV'
      | 'OTHER';
    '@CarrierCompanyCode'?: string;
    '@CarrierCompanyNumber'?: string;
  };
  CustomerRefMasterRecords?: {
    '@BillingRefCode'?: string;
    '@PaymentRefCode'?: string;
  };
  IdDocumentDetail?: {
    '@IDType'?: string;
    '@IDCode'?: string;
    '@IDIssueLocation'?: string;
    '@IDIssueCounty'?: string;
    '@IDIssueDate'?: string;
    '@IDExpireDate'?: string;
  };
  FinancialDetail?: {
    '@CurrencyCode'?: string;
    '@CreditLimit'?: string;
    '@C_PaymentType'?: 'CASH' | 'BANK' | 'RID' | 'RIBA' | 'SPECIFIC_CODE';
    '@C_SpecPaymentTypeCode'?: string;
    '@C_BookingPayConditionCode'?: string;
    '@C_BillingPayConditionCode'?: string;
    '@C_CodMastro'?: string;
    '@C_CodConto'?: string;
    '@S_PaymentType'?: 'CASH' | 'BANK' | 'RID' | 'RIBA' | 'SPECIFIC_CODE';
    '@S_SpecPaymentTypeCode'?: string;
    '@S_BookingPayConditionCode'?: string;
    '@S_BillingPayConditionCode'?: string;
    '@S_CodMastro'?: string;
    '@S_CodConto'?: string;
    '@EInvoicingEnabled'?: boolean;
    '@ElectronicInvoicingType'?: 'XML_SDI' | 'XML_BAVEL';
  };
  BankDetail?: {
    '@Name'?: string;
    '@BranchOffice'?: string;
    '@Location'?: string;
    '@CountyCode'?: string;
    '@IbanCode'?: string;
    '@SwiftCode'?: string;
  };
  PaInfo?: {
    PaOfficeCode?: string;
    PaAdministrativeRefCode?: string;
    VatSplitPaymentEnabled?: boolean;
    InvoiceIntermediateServicesEnabled?: boolean;
  };
  CarrierDetail?: {
    '@CarrierType'?: 'AIRLINE' | 'FERRIES' | 'RAILWAY' | 'OTHER';
    '@IataCode'?: string;
    '@CarrierNumber'?: string;
    '@BSPAssociated'?: boolean;
  };
  NatFlightCommission?: {
    '@SupplierRecordCode'?: string;
    '@Amount'?: string;
  };
  InterFlightCommission?: {
    '@SupplierRecordCode'?: string;
    '@Amount'?: string;
  };
  NatRailCommission?: {
    '@SupplierRecordCode'?: string;
    '@Amount'?: string;
  };
  InterRailCommission?: {
    '@SupplierRecordCode'?: string;
    '@Amount'?: string;
  };
  InterNavalCommission?: {
    '@SupplierRecordCode'?: string;
    '@Amount'?: string;
  };
  Notes?: {
    Note: {
      '@nType': string;
      '@Title'?: string;
      Text: string;
    }[];
  };
  AccountPolicies?: {
    '@AcceptProfilingPolicies'?: boolean;
    '@AcceptPrivacyPolicies'?: boolean;
    '@AcceptNewsletterPolicies'?: boolean;
  };
  BadgeDetail?: {
    '@BadgeNumber': string;
    '@IssueDate'?: string;
    '@ExpireDate'?: string;
  };
}

export interface SearchMasterRecordRS {
  MasterRecordList?: {
    MasterRecordDetail: MasterRecordDetail[];
  };
}

export interface ManageMasterRecordRQ {
  CopyDataToCrm?: boolean;
  CheckExistenceMasterCodeWithOtherManagement?:
    | 'YES_STRICTLY_THE_SAME'
    | 'YES_IF_NOT_EXIST_CONTINUE_WITH_THE_OTHER_CHECKS'
    | 'NO';
  MasterRecordDetail: MasterRecordDetail;
}

export interface CustomerRecordRS {
  MasterRecordDetail: MasterRecordDetail;
}

// ===== BOOKING =====

export interface BookFileRQ {
  CreateDate?: string;
  BookingFileRefCode?: string;
  TravelAgentCode?: string;
  ClerkName?: string;
  CustomerDetail: MasterRecordDetail; // Can be just RecordCode or full detail
  CurrencyCode?: string;
  MarkupCode?: string;
  BookingFileStatus: {
    '@Value':
      | 'QUOTATION'
      | 'WORK_IN_PROGRESS'
      | 'CONFIRMED'
      | 'OPTIONED'
      | 'CANCELED';
    '@ExpiredDate'?: string;
  };
  StatisticCodes?: {
    '@sCode1'?: string;
    '@sCode2'?: string;
    '@sCode3'?: string;
    '@sCode4'?: string;
    '@sCode5'?: string;
    '@sCode6'?: string;
  };
  Destination?: {
    '@Code'?: string;
    '@IataCode'?: string;
    '@NationCode'?: string;
  };
  BookingFileDescription?: string;
  StartDate: string; // Required
  EndDate: string; // Required
  EarlyBookingDate?: string;
  CupCode?: string;
  CigCode?: string;
  CustomerPromoterCode?: string;
  BillingReferenceCode?: string;
  PaymentReferenceCode?: string;
  BookingFileDocument?: {
    '@PrintDoc': boolean;
    '@SendDocViaEmail': boolean;
    InfoDocumentsToPrint?: {
      InfoDocumentToPrint: {
        DocumentType: string;
        DocumentCustomizablePrintParameters?: any; // Complex union type
      }[];
    };
  };
  FinancialDeadlineList?: {
    DeadlineDetail: {
      '@ReschedulingCode': string;
      '@ExpireDate'?: string;
      '@TotalAmount'?: string;
    }[];
  };
  DeadlineList?: {
    DeadlineDetail: {
      '@DeadlineCode': string;
      '@Description'?: string;
      '@ExpireDate'?: string;
    }[];
  };
  PaymentList?: {
    PaymentDetail: {
      '@PaymentDate': string;
      '@PaumentNote'?: string;
      '@Amount': string;
      '@PaymentUser'?: string;
      '@PaymentType': string; // C, B, D, T, P, R, A, H-V
    }[];
  };
  SelectedPackageList?: {
    SelectedPackageDetail: {
      '@pCode': string;
      '@StartDate': string;
      '@EndDate': string;
      '@GetServicesFromPackage'?: boolean;
    }[];
  };
  SelectedServiceList: {
    SelectedServiceDetail: SelectedServiceDetail[];
  };
  ExtraQuotaRefCode?: string;
  ExtraQuoteServiceList?: {
    ExtraQuoteServiceDetail: SelectedServiceDetail[];
  };
  GetExtraQuoteFromSystem?: boolean;
  PassengerList: {
    PassengerDetail: PassengerDetail[];
  };
  NoteList?: {
    NoteDetail: {
      '@nType': string;
      '@Title'?: string;
      Text: string;
    }[];
  };
  BookingFinancialInfo?: {
    '@Customer_PaymentType':
      | 'CASH'
      | 'BANK'
      | 'RID'
      | 'RIBA'
      | 'SPECIFIC_CODE'
      | 'NOT_SET';
    '@Customer_SpecPaymentTypeCode'?: string;
  };
  BookingFileCode?: string;
  GroupingPaxPolicy?: 'GROUPED_PAX' | 'NOT_GROUPED_PAX' | 'ONE_PAX_ONLY';
  GroupBookingFile?: boolean;
  TypeDownloadFile?: 'AVES2AVES' | 'AVES2AVESVIA' | 'AVES2AVESITA';
  SetBookingFileCodeFromStartDate?: boolean;
}

export interface SelectedServiceDetail {
  '@sCode': string; // Service code
  '@ssCode'?: string; // Subservice code
  AvesServiceType: 'TOP' | 'TOP_SS' | 'ADV' | 'GRP' | 'OTHER';
  TOServiceType?: string;
  FirstDescription?: string;
  SecondDescription?: string;
  StartDate: string;
  EndDate: string;
  CreateDate?: string;
  Qty: number;
  Pax: number;
  PaxAssociated?: {
    Pax: string[]; // ['001', '002', '003'...]
  };
  VoucherMasterCode?: string;
  SupplierMasterCode?: string;
  AvesServiceInfo?: {
    '@PackageCode'?: string;
    '@PackageReference'?: string;
    '@SuballotmentCode'?: string;
    '@PriceListCode'?: string;
    '@CostListCode'?: string;
    '@ExternalFileCode'?: string;
    '@ExternalReference'?: string;
    '@CreditCard'?: string;
    '@PaymentAtType'?: 'OUR_AGENCY' | 'OPERATOR' | 'DEPOSIT';
    '@ServiceStatus'?: string;
    '@ServiceStatisticCode'?: string;
    ServiceFare?: any; // Complex structure
    TransferRouteList?: any;
    PullmanRouteList?: any;
    FlightRouteList?: any;
  };
  HotelServiceInfo?: any; // Complex external provider structure
  CarRentalServiceInfo?: any;
  FlightServiceInfo?: any;
  ShipServiceInfo?: any;
  TicketServiceInfo?: any;
  Commission?: any;
  NoteList?: {
    NoteDetail: {
      '@nType': string;
      '@Title'?: string;
      Text: string;
    }[];
  };
  BookedServiceRef?: string;
  VoucherInfo?: {
    '@AccomodationCode'?: string;
    '@BoardCode'?: string;
  };
  AvesSession: number; // Required - counter for service changes
}

// ===== BOOKED SERVICE (Response structure) =====

export interface BookedServiceDetail {
  '@RPH': string;
  '@ServiceCode': string;
  '@FromExternalProvider': boolean;
  AvesServiceType: 'TOP' | 'TOP_SS' | 'ADV' | 'GRP' | 'OTHER';
  TOServiceType?: string;
  FirstDescription: string;
  SecondDescription?: string;
  ThirdDescription?: string;
  FourthDescription?: string;
  ServiceStatus: string;
  StartDate: string;
  EndDate: string;
  Qty: number;
  Pax: number;
  PeriodType?: string;
  PaxMultiplier?: string;
  ExternalProviderCode?: string;
  WebStatistic?: {
    '@Code'?: string;
    '@Description'?: string;
  };
  SupplierInfo?: {
    '@Code'?: string;
    '@Name'?: string;
    '@Email'?: string;
    '@LanguageCode'?: string;
  };
  ServiceTotalAmountDetail?: {
    CommissionCode?: string;
    CommissionPercentage?: string;
    CommissionAmount?: string;
    PriceListCode?: string;
    CostListCode?: string;
    ServiceTotalPrice?: string;
  };
}

export interface BookingFile {
  BookingFileCode: string;
  CustomerRecordCode: string;
  CustomerName: string;
  CustomerEmail?: string;
  BookingFileStatus: {
    '@Value': string;
    '@ExpiredDate'?: string;
  };
  Description: string;
  Nation?: string;
  Destination?: string;
  CreationDate: string;
  FirstConfirmationDate?: string;
  StartDate: string;
  EndDate: string;
  PackageCode?: string;
  BookedServiceList?: {
    BookedServiceDetail: BookedServiceDetail[];
  };
  TotalAmountDetail?: {
    CurrencyCode: string;
    TotalAmountBeforeDiscount: string;
    TotalAmountAfterDiscount: string;
    TotalDiscount: string;
    TotalAmountWithoutVat: string;
    DueAmount: string;
    PaiedAmount: string;
    Balance: string;
  };
  PaxNumber: number;
  PassengerList: {
    PassengerDetail: PassengerDetail[];
  };
  Reference?: string;
  ClerkName?: string;
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
  BookingFileCode: string; // Required
  BookingFileStartDate: string; // Required
  CustomerRecordCode: string; // Required
  NewCustomerRecordCode?: string;
  BookingFileReferenceName?: string;
  TravelAgentCode?: string;
  BillingReferenceCode?: string;
  PaymentReferenceCode?: string;
  CupCode?: string;
  CigCode?: string;
  CustomerPromoterCode?: string;
  BookingNote?: string; // Max 999 characters
  PassengerList?: {
    PassengerDetail: PassengerDetail[];
  };
  StatisticCodes?: {
    '@sCode1'?: string;
    '@sCode2'?: string;
    '@sCode3'?: string;
    '@sCode4'?: string;
    '@sCode5'?: string;
    '@sCode6'?: string;
  };
  BookingFinancialInfo?: {
    '@Customer_PaymentType':
      | 'CASH'
      | 'BANK'
      | 'RID'
      | 'RIBA'
      | 'SPECIFIC_CODE'
      | 'NOT_SET';
    '@Customer_SpecPaymentTypeCode'?: string;
  };
  FinancialDeadlineList?: {
    DeadlineDetail: {
      '@ReschedulingCode': string;
      '@ExpireDate': string;
      '@TotalAmount': string;
    }[];
  };
}

export interface ModiFileHeaderRS {
  // Response follows common RsStatus structure
}

export interface ModFileServicesRQ {
  CustomerRecordCode: string; // Required
  BookingFileCode: string; // Required
  DeadlineList?: {
    DeadlineDetail: {
      ReschedulingCode: string;
      Description?: string;
      ExpireDate?: string;
    }[];
  };
  CancellableBookedServiceList?: {
    CancellableBookedServiceDetail: {
      '@CancelOperationType': 'NULLIFY' | 'DELETE';
      '@ServiceRefType': 'RPH' | 'FILE';
      '@ServiceRefValue': string;
    }[];
  };
  SelectedPackageDetail?: {
    '@pCode': string;
    '@StartDate': string;
    '@EndDate': string;
    '@GetServicesFromPackage'?: boolean;
  };
  SelectedServiceList: {
    SelectedServiceDetail: SelectedServiceDetail[];
  };
  PassengerList?: {
    PassengerDetail: PassengerDetail[];
  };
}

export interface SetStatusRQ {
  CustomerRecordCode: string;
  BookingFileCode: string;
  FileStatus: {
    '@Value':
      | 'QUOTATION'
      | 'WORK_IN_PROGRESS'
      | 'CONFIRMED'
      | 'OPTIONED'
      | 'NULLIFIED'
      | 'CANCELED';
    '@ExpiredDate'?: string;
    '@OptionedFileExpireDatePolicy'?:
      | 'NOT_SET'
      | 'CONSIDER_HOLIDAY'
      | 'CONSIDER_HOLIDAY_AND_SATURDAY';
  };
  BackOfficeRequest?: boolean;
  BookingFileDocument?: {
    '@PrintDoc': boolean;
    '@SendDocViaEmail': boolean;
  };
  Penalty?: {
    '@Apply': boolean;
    '@SpecificCode'?: string;
  };
  SimulateCancelAndGetPenaltyAmount?: boolean;
}

export interface SetStatusServiceRQ {
  CustomerRecordCode: string;
  BookingFileCode: string;
  BookingServiceRef: string;
  BookingFileServiceStatus: 'NULLIFIED';
  BookingFileServiceStatusDate?: string;
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
  BookingFileCode: string; // Required
  CustomerRecordCode: string; // Required
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
  BookingFileCode?: string; // Required if BookingFileRefCode not provided
  BookingFileRefCode?: string; // Required if BookingFileCode not provided
  PaymentUser?: string;
  EnableMultiplePayments: boolean; // Required
  OperationType:
    | 'AbsoluteAmountsInsertion'
    | 'FinalAmountToAchieve'
    | 'FinalAmountToAchieveWithoutControls'; // Required
  FilePaymentList: {
    FilePaymentDetail: {
      '@PaymentDate': string; // Required
      '@PaymentNote'?: string;
      '@PayerMasterCode'?: string;
      '@PayerName'?: string;
      '@Amount': string; // Required
      '@PaymentType': // Required
      | 'C' // cash
        | 'B' // bank 1
        | 'D' // bank 2
        | 'T' // bank 3
        | 'P' // ATM
        | 'R' // credit card
        | 'A' // rebate
        | 'H'
        | 'I'
        | 'J'
        | 'K'
        | 'L'
        | 'M'
        | 'N'
        | 'O'
        | 'Q'
        | 'S'
        | 'U'
        | 'V';
    }[];
  };
}

export interface FilePaymentListRS {
  // Response follows common RsStatus structure
}

// ===== DOCUMENTS =====

export interface PrintBookingDocumentRQ {
  RefMasterRecordCode: string; // Required
  LanguageCode: string; // Required
  BookingFileCode: string; // Required
  InfoDocumentsToPrint: {
    InfoDocumentToPrint: {
      DocumentType:
        | 'VISA_REQUEST'
        | 'TRAVEL_INFORMATION'
        | 'VOUCHER'
        | 'BOOKING_CONTRACT'
        | 'BOOKING_CONFIRMATION'
        | 'SUPPLIER_SERVICE_LIST'
        | 'INVOICE'
        | 'PROFORMA_INVOICE'
        | 'ADEGUAMENTO'
        | 'RESERVATION_FORM'
        | 'OPEN_XML'
        | 'SALES_INVOICE'
        | 'TICKETING_TMASTER'
        | 'SUMMARY_FORM';
      DocumentCustomizablePrintParameters?:
        | {
            // ReservationFormCustomizablePrintParameters
            '@MakeDocumentTo': 'BOOKING_CUSTOMER' | 'FIRST_PASSENGER';
          }
        | {
            // TravelInformationCustomizablePrintParameters
            FillInCode: string;
          };
    }[];
  };
  ReprintDocument?: boolean;
  PrintDocumentWithZeroTotalAmount?: boolean;
  GetDocumentContent?: boolean;
  SendDocumentViaEmail?: boolean;
  SkipCustomerCodeControl?: boolean;
}

export interface PrintBookingDocumentRS {
  EmailRecipient?: string;
  DocFileName?: string;
  Base64DocContent?: string;
  BaseDocumentAndAttachments?: {
    SingleBaseDocumentOrAttachment: {
      DocFileName: string;
      Base64DocContent?: string;
    }[];
  };
  AdditionalDocuments?: {
    AdditionalDocument: {
      EmailRecipient: string;
      DocFileName: string;
      Base64DocContent?: string;
      BaseDocumentAndAttachments?: {
        SingleBaseDocumentOrAttachment: {
          DocFileName: string;
          Base64DocContent?: string;
        }[];
      };
    }[];
  };
}
