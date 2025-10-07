// ===== TYPE DEFINITIONS =====

/** Address classification type */
export type AddressType = 'home' | 'work' | 'billing' | 'delivery';

/** Contact phone classification type */
export type ContactType = 'home' | 'work' | 'mobile' | 'fax';

/** Email classification type */
export type EmailType = 'home' | 'work';

/**
 * Passenger category type (Aves CategoryCode).
 * - ADULT: AD - Adult passenger
 * - CHILD: CH - Child passenger
 * - INFANT: IN - Infant passenger
 * - SENIOR: OV - Senior passenger
 */
export enum PassengerType {
  ADULT = 'adult',
  CHILD = 'child',
  INFANT = 'infant',
  SENIOR = 'senior',
}

/** Customer title/honorific */
export type TitleType = 'mr' | 'mrs' | 'ms' | 'dr' | 'prof';

/**
 * Gender type (Aves Sex field).
 * - MALE: M
 * - FEMALE: F
 */
export enum GenderType {
  MALE = 'male',
  FEMALE = 'female',
}

/** Service type classification */
export enum ServiceType {
  FLIGHT = 'flight',
  HOTEL = 'hotel',
  CAR = 'car',
  TRANSFER = 'transfer',
  INSURANCE = 'insurance',
}

/** Service booking status */
export enum ServiceStatusType {
  CONFIRMED = 'confirmed',
  PENDING = 'pending',
  CANCELLED = 'cancelled',
}

/**
 * Payment method type.
 * Maps to Aves PaymentType codes (C, B, D, T, P, R, etc.)
 */
export enum PaymentType {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_TRANSFER = 'bank_transfer',
  CASH = 'cash',
}

/** Payment transaction status */
export enum PaymentStatusType {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
}

/**
 * Customer/Master Record type (Aves RecordType).
 * - CUSTOMER: CUSTOMER - Standard customer
 * - SUPPLIER: SUPPLIER - Service provider
 * - VOUCHER: VOUCHER - Voucher holder
 * - SUPPLIER_VOUCHER: SUPPLIER_VOUCHER - Supplier with voucher
 */
export enum CustomerType {
  CUSTOMER = 'customer',
  SUPPLIER = 'supplier',
  VOUCHER = 'voucher',
  SUPPLIER_VOUCHER = 'supplier_voucher',
}

/** Search operator for query filtering */
export type SearchOperatorType =
  | 'equals'
  | 'contains'
  | 'starts_with'
  | 'ends_with';

/** Booking file classification */
export type BookingType = 'individual' | 'group' | 'corporate';

/** Priority level for bookings */
export type PriorityType = 'low' | 'normal' | 'high' | 'urgent';

/** Special request category for passengers */
export type SpecialRequestType = 'meal' | 'seat' | 'wheelchair' | 'other';

/** Reason for booking cancellation */
export enum CancelReasonType {
  CUSTOMER_REQUEST = 'customer_request',
  NO_SHOW = 'no_show',
  OPERATIONAL = 'operational',
  OTHER = 'other',
}

/** Refund processing method */
export enum RefundMethodType {
  ORIGINAL_PAYMENT = 'original_payment',
  CREDIT = 'credit',
  CASH = 'cash',
}

/**
 * Document type for printing (Aves DocumentType).
 * Corresponds to Aves document generation types.
 */
export enum DocumentType {
  /** VISA_REQUEST - Visa request document */
  VISA_REQUEST = 'visa_request',
  /** TRAVEL_INFORMATION - Travel information document */
  TRAVEL_INFORMATION = 'travel_information',
  /** VOUCHER - Service voucher */
  VOUCHER = 'voucher',
  /** BOOKING_CONTRACT - Booking contract */
  BOOKING_CONTRACT = 'booking_contract',
  /** BOOKING_CONFIRMATION - Booking confirmation */
  BOOKING_CONFIRMATION = 'booking_confirmation',
  /** SUPPLIER_SERVICE_LIST - List of supplier services */
  SUPPLIER_SERVICE_LIST = 'supplier_service_list',
  /** INVOICE - Standard invoice */
  INVOICE = 'invoice',
  /** PROFORMA_INVOICE - Proforma invoice */
  PROFORMA_INVOICE = 'proforma_invoice',
  /** ADEGUAMENTO - Adjustment document */
  ADEGUAMENTO = 'adeguamento',
  /** RESERVATION_FORM - Reservation form */
  RESERVATION_FORM = 'reservation_form',
  /** OPEN_XML - Open XML format */
  OPEN_XML = 'open_xml',
  /** SALES_INVOICE - Sales invoice */
  SALES_INVOICE = 'sales_invoice',
  /** TICKETING_TMASTER - TMaster ticketing document */
  TICKETING_TMASTER = 'ticketing_tmaster',
  /** SUMMARY_FORM - Summary form */
  SUMMARY_FORM = 'summary_form',
}

/** Document output format */
export enum DocumentFormatType {
  PDF = 'pdf',
  HTML = 'html',
  XML = 'xml',
}

/** Document delivery method */
export enum DeliveryMethodType {
  EMAIL = 'email',
  SMS = 'sms',
  DOWNLOAD = 'download',
}

/**
 * Booking file status (Aves BookingFileStatus).
 * - QUOTATION: QUOTATION - Initial quote, no commitment
 * - WORK_IN_PROGRESS: WORK_IN_PROGRESS - Being processed
 * - CONFIRMED: CONFIRMED - Confirmed booking
 * - OPTIONED: OPTIONED - On hold/option
 * - NULLIFIED: NULLIFIED - Voided/nullified
 * - CANCELED: CANCELED - Cancelled booking
 */
export enum BookingStatusType {
  QUOTATION = 'quotation',
  WORK_IN_PROGRESS = 'work_in_progress',
  CONFIRMED = 'confirmed',
  OPTIONED = 'optioned',
  NULLIFIED = 'nullified',
  CANCELED = 'canceled',
}

/** Pricing breakdown item type */
export enum PricingItemType {
  SERVICE = 'service',
  TAX = 'tax',
  FEE = 'fee',
  DISCOUNT = 'discount',
}

/** Document delivery status */
export enum DeliveryStatusType {
  SENT = 'sent',
  PENDING = 'pending',
  FAILED = 'failed',
}

/**
 * Customer record status (Aves RecordStatus).
 * - ENABLED: ENABLED - Active customer
 * - WARNING: WARNING - Customer with warnings
 * - BLACKLISTED: BLACKLISTED - Blacklisted customer
 * - DISABLED: DISABLED - Inactive customer
 */
export enum CustomerStatusType {
  ENABLED = 'enabled',
  WARNING = 'warning',
  BLACKLISTED = 'blacklisted',
  DISABLED = 'disabled',
}

/** Preferred communication method */
export type CommunicationMethodType = 'email' | 'sms' | 'phone';

// ===== COMMON API TYPES =====

/**
 * Customer address information.
 * Maps to Aves MasterRecordDetail address fields (Address, CityName, StateCode, ZipCode).
 */
export interface CustomerAddress {
  /** Address type classification */
  type?: AddressType;
  /** Street address (Aves: Address) */
  street?: string;
  /** City name (Aves: CityName) */
  city?: string;
  /** State/Province (Aves: StateCode) */
  state?: string;
  /** Postal/ZIP code (Aves: ZipCode) */
  postalCode?: string;
  /** Country code (Aves: StateCode for country) */
  country?: string;
}

/**
 * Customer contact information.
 * Maps to Aves MasterRecordDetail contact fields (FirstPhoneNumber, MobilePhone, Email).
 */
export interface CustomerContact {
  /** Primary phone number (Aves: FirstPhoneNumber) */
  phone?: {
    type?: ContactType;
    number: string;
  };
  /** Mobile phone number (Aves: MobilePhone) */
  mobile?: {
    type?: ContactType;
    number: string;
  };
  /** Email address (Aves: Email) */
  email?: {
    type?: EmailType;
    address: string;
  };
}

/**
 * Customer/Master Record.
 * Represents an Aves MasterRecordDetail with simplified API-friendly structure.
 * Used for customer management operations (create, update, search).
 */
export interface Customer {
  /** Customer code/ID (Aves: @RecordCode) - max 6 chars */
  id: string;
  /** Customer type (Aves: RecordType) */
  type: CustomerType;
  /** Customer status (Aves: RecordStatus) */
  status: CustomerStatusType;
  /** Personal information */
  personalInfo?: {
    /** Title/Moniker (Aves: Moniker) */
    title?: string;
    /** First name (part of Aves: Name) */
    firstName: string;
    /** Last name (part of Aves: Name) */
    lastName: string;
    /** Date of birth (Aves: BirthDate) */
    dateOfBirth?: string;
    /** Gender (Aves: Gender) */
    gender?: GenderType;
    /** Nationality/Citizenship (Aves: CitizenshipCode) */
    nationality?: string;
  };
  /** Contact information */
  contact?: CustomerContact;
  /** Address information */
  address?: CustomerAddress;
  /** Business/Company information */
  businessInfo?: {
    /** Company name */
    companyName?: string;
    /** Tax ID / VAT Code (Aves: VatCode, FiscalCode) */
    taxId?: string;
    /** Business license number */
    licenseNumber?: string;
  };
  /** Customer preferences */
  preferences?: {
    /** Language code (Aves: LanguageCode) */
    language?: string;
    /** Currency code (Aves: FinancialDetail/@CurrencyCode) */
    currency?: string;
    /** Preferred communication method */
    communicationMethod?: CommunicationMethodType;
  };
}

/**
 * Price/Amount with currency.
 */
export interface Price {
  /** ISO currency code (e.g., EUR, USD) */
  currency: string;
  /** Amount value */
  amount: number;
}

/**
 * Booking passenger information.
 * Maps to Aves PassengerDetail structure.
 */
export interface BookingPassenger {
  /** Passenger reference ID (Aves: @RPH) */
  id: string;
  /** Passenger category (Aves: CategoryCode) */
  type: PassengerType;
  /** Title/honorific */
  title?: TitleType;
  /** First name (part of Aves: Name) */
  firstName: string;
  /** Last name (part of Aves: Name) */
  lastName: string;
  /** Date of birth (Aves: BirthDate) */
  dateOfBirth?: string;
  /** Gender (Aves: Sex) */
  gender?: GenderType;
  /** Nationality (Aves: NationCode, CitizenshipCode) */
  nationality?: string;
  /** Passport/ID document information (Aves: IDDocInfo) */
  passport?: {
    /** Document number (Aves: @IDCode) */
    number: string;
    /** Expiry date (Aves: @IDExpireDate) */
    expiryDate: string;
    /** Issuing country */
    issuingCountry: string;
  };
  /** Passenger address */
  address?: CustomerAddress;
  /** Passenger contact info (Aves: eMail, PhoneNumber) */
  contact?: CustomerContact;
}

/**
 * Booking service/product.
 * Maps to Aves SelectedServiceDetail/BookedServiceDetail structures.
 */
export interface BookingService {
  /** Service code (Aves: @sCode, @ServiceCode) */
  id: string;
  /** Service type classification */
  type: ServiceType;
  /** Service status */
  status: ServiceStatusType;
  /** Service code reference */
  code?: string;
  /** Service name/description (Aves: FirstDescription) */
  name?: string;
  /** Additional description (Aves: SecondDescription) */
  description?: string;
  /** Service start date (Aves: StartDate) */
  startDate?: string;
  /** Service end date (Aves: EndDate) */
  endDate?: string;
  /** Service price (Aves: ServiceTotalAmountDetail/ServiceTotalPrice) */
  price?: Price;
}

// ===== PAYMENT MANAGEMENT =====

/**
 * Booking payment record.
 * Maps to Aves FilePaymentDetail structure.
 */
export interface BookingPayment {
  /** Payment ID/reference */
  id: string;
  /** Payment method type (Aves: @PaymentType) */
  type: PaymentType;
  /** Payment status */
  status: PaymentStatusType;
  /** Payment amount (Aves: @Amount) */
  amount: Price;
  /** Payment details (card info, etc.) */
  details?: {
    /** Card number (masked/tokenized) */
    cardNumber?: string;
    /** Card expiry date */
    expiryDate?: string;
    /** Cardholder name */
    cardHolderName?: string;
  };
}

// ===== REQUEST INTERFACES =====

/**
 * Customer search request (discriminated union by search type).
 * Maps to Aves SearchMasterRecordRQ with different SearchType values.
 *
 * Each search type activates specific fields:
 * - code: Search by customer code (SearchType=CODE)
 * - name: Search by name and optionally city (SearchType=NAME)
 * - vat_code: Search by VAT/fiscal code (SearchType=VATCODE)
 * - zone: Search by postal zone (SearchType=ZONE)
 * - category: Search by category code (SearchType=CATEGORY)
 * - email: Search by email (SearchType=EMAIL)
 * - last_mod_date: Search by last modification date range (SearchType=LASTMODDATE)
 * - search_field: Generic search field (SearchType=SEARCH_FIELD)
 * - external_ref_code: Search by external reference (SearchType=EXTERNAL_REF_CODE)
 */
export type SearchCustomerRequest =
  | {
      /** Search by customer code */
      type: 'code';
      /** Customer code (Aves: RecordCode) */
      code: string;
      /** Pagination control */
      pagination?: { pages: number; page: number };
    }
  | {
      /** Search by name */
      type: 'name';
      /** Customer name (Aves: Name) */
      name: string;
      /** Optional city filter (Aves: City) */
      city?: string;
      /** Pagination control */
      pagination?: { pages: number; page: number };
    }
  | {
      /** Search by VAT/fiscal code */
      type: 'vat_code';
      /** VAT code (Aves: VatCode) */
      vatCode: string;
      /** Optional phone filter (Aves: PhoneNumber) */
      phoneNumber?: string;
      /** Pagination control */
      pagination?: { pages: number; page: number };
    }
  | {
      /** Search by postal zone */
      type: 'zone';
      /** Postal/ZIP code (Aves: ZipCode) */
      zipCode: string;
      /** Optional city filter (Aves: City) */
      city?: string;
      /** Optional county code (Aves: CountyCode) */
      countyCode?: string;
      /** Pagination control */
      pagination?: { pages: number; page: number };
    }
  | {
      /** Search by category */
      type: 'category';
      /** Category code (Aves: CategoryCode) */
      categoryCode: string;
      /** Pagination control */
      pagination?: { pages: number; page: number };
    }
  | {
      /** Search by email */
      type: 'email';
      /** Email address (Aves: Email) */
      email: string;
      /** Pagination control */
      pagination?: { pages: number; page: number };
    }
  | {
      /** Search by last modification date range */
      type: 'last_mod_date';
      /** Start date (Aves: LastModificationDate/@MinDate) */
      from: string;
      /** End date (Aves: LastModificationDate/@MaxDate) */
      to: string;
      /** Pagination control */
      pagination?: { pages: number; page: number };
    }
  | {
      /** Search by generic search field */
      type: 'search_field';
      /** Search field value (Aves: SearchFieldValue) */
      searchField: string;
      /** Pagination control */
      pagination?: { pages: number; page: number };
    }
  | {
      /** Search by external reference code */
      type: 'external_ref_code';
      /** External reference code (Aves: SearchFieldValue) */
      externalRefCode: string;
      /** Pagination control */
      pagination?: { pages: number; page: number };
    };

/**
 * Base booking request fields shared between all booking creation types.
 * Maps to Aves BookFileRQ structure.
 */
type BaseBookingRequest = {
  /** Booking file description (Aves: BookingFileDescription) */
  description?: string;
  /** Vacation start date (Aves: StartDate) */
  startDate: string;
  /** Vacation end date (Aves: EndDate) */
  endDate: string;
  /** Currency code (Aves: CurrencyCode) */
  currency?: string;
  /** List of passengers (Aves: PassengerList/PassengerDetail) */
  passengers: BookingPassenger[];
  /** List of services/products (Aves: SelectedServiceList/SelectedServiceDetail) */
  services: BookingService[];
  /** Statistical codes for reporting (Aves: StatisticCodes) */
  statisticCodes?: {
    /** Statistic code 1 (Aves: @sCode1) - max 4 chars */
    code1?: string;
    /** Statistic code 2 (Aves: @sCode2) - max 4 chars */
    code2?: string;
    /** Statistic code 3 (Aves: @sCode3) - max 4 chars */
    code3?: string;
    /** Statistic code 4 (Aves: @sCode4) - max 4 chars */
    code4?: string;
    /** Statistic code 5 (Aves: @sCode5) - max 4 chars */
    code5?: string;
    /** Statistic code 6 (Aves: @sCode6) - max 4 chars */
    code6?: string;
  };
  /** Travel destination (Aves: Destination) */
  destination?: {
    /** Destination code (Aves: @Code) */
    code?: string;
    /** IATA code (Aves: @IataCode) */
    iataCode?: string;
    /** Nation code (Aves: @NationCode) */
    nationCode?: string;
  };
  /** List of deadlines (Aves: DeadlineList/DeadlineDetail) */
  deadlines?: {
    /** Deadline code (Aves: @DeadlineCode) */
    code: string;
    /** Deadline description (Aves: @Description) */
    description?: string;
    /** Expiry date (Aves: @ExpireDate) */
    expireDate?: string;
  }[];
  /** Print document after creation (Aves: BookingFileDocument/@PrintDoc) */
  printDocument?: boolean;
  /** Send document via email (Aves: BookingFileDocument/@SendDocViaEmail) */
  sendDocumentViaEmail?: boolean;
};

/**
 * Create booking file request.
 * Must specify either customerId (existing customer) OR customerDetails (new customer).
 * Maps to Aves BookFileRQ.
 */
export type CreateBookingRequest =
  | (BaseBookingRequest & {
      /** Existing customer code (Aves: CustomerDetail/@RecordCode) - max 6 chars */
      customerId: string;
      customerDetails?: never;
    })
  | (BaseBookingRequest & {
      customerId?: never;
      /** New customer details (Aves: CustomerDetail/MasterRecordDetail) */
      customerDetails: Customer;
    });

/**
 * Cancel booking file request.
 * Maps to Aves CancelFileRQ.
 */
export interface CancelBookingRequest {
  /** Booking file code (Aves: BookingFileCode) - max 20 chars */
  bookingId: string;
  /** Customer record code (Aves: CustomerRecordCode) - Required for internal check */
  customerId: string;
  /** Cancellation reason (not directly mapped to Aves) */
  reason?: CancelReasonType;
  /** Cancellation description/notes */
  description?: string;
  /** Refund request details (not directly mapped to Aves) */
  refundRequest?: {
    /** Refund amount */
    amount: number;
    /** Currency code */
    currency: string;
    /** Refund method */
    method: RefundMethodType;
  };
}

/**
 * Print/generate booking document request.
 * Maps to Aves PrintBookingDocumentRQ.
 */
export interface PrintDocumentRequest {
  /** Booking file code (Aves: BookingFileCode) */
  bookingId: string;
  /** Customer record code (Aves: RefMasterRecordCode) - Required */
  customerId: string;
  /** Document type to generate (Aves: InfoDocumentsToPrint/InfoDocumentToPrint/DocumentType) */
  documentType: DocumentType;
  /** Document format (not directly in Aves, handled by system) */
  format?: DocumentFormatType;
  /** Language code for document (Aves: LanguageCode) - defaults to '01' */
  language?: string;
  /** Delivery method configuration */
  deliveryMethod?: {
    /** Delivery type (Aves: GetDocumentContent, SendDocumentViaEmail) */
    type: DeliveryMethodType;
    /** Email address for delivery */
    address?: string;
  };
}

type BasePaymentRequest = {
  /** Array of payment records to insert */
  payments: BookingPayment[];

  /**
   * Enable multiple payment insert for single booking file.
   * - When true: allows inserting multiple payment records at once
   * - When false: restricts to a single payment insert
   * - If not specified, defaults to true when payments.length > 1
   *
   * Note: Some operationType values only allow single payment:
   * - 'final' and 'final_no_controls' require enableMultiple to be false or single payment
   */
  enableMultiple?: boolean;

  /**
   * Payment operation type:
   * - 'absolute' (default): Insert absolute amounts. Allows multiple payments.
   * - 'final': Calculate difference between this amount and existing payments. Single payment only.
   * - 'final_no_controls': Same as 'final' but without balance validation. Single payment only.
   */
  operationType?: 'absolute' | 'final' | 'final_no_controls';
};

/**
 * Request to add payment(s) to a booking file.
 * Must specify either bookingId OR bookingRefCode (mutually exclusive).
 */
export type AddPaymentRequest =
  | (BasePaymentRequest & {
      /** Booking file code (e.g., "14/036657") */
      bookingId: string;
      bookingRefCode?: never;
    })
  | (BasePaymentRequest & {
      bookingId?: never;
      /** Booking file reference code from external system */
      bookingRefCode: string;
    });

// ===== RESPONSE INTERFACES =====

/**
 * Booking file response structure.
 * Maps from Aves BookingFileDetail structure.
 */
export interface BookingResponse {
  /** Booking file code (Aves: @BookingFileCode) */
  id: string;
  /** Booking status (Aves: BookingFileStatus/@Value) */
  status: BookingStatusType;
  /** Creation date (Aves: CreationDate) */
  createdAt: string;
  /** Last update date */
  updatedAt: string;
  /** Customer information (Aves: CustomerRecordCode, CustomerName, CustomerEmail) */
  customer: Customer;
  /** List of passengers (Aves: PassengerList/PassengerDetail) */
  passengers: BookingPassenger[];
  /** List of services (Aves: BookedServiceList/BookedServiceDetail) */
  services: BookingService[];
  /** Pricing information (Aves: ServiceTotalAmountDetail) */
  pricing: {
    /** Total amount */
    totalAmount: Price;
    /** Price breakdowns */
    breakdowns?: {
      /** Item type */
      type: PricingItemType;
      /** Item description */
      description: string;
      /** Item amount */
      amount: number;
    }[];
  };
}

/**
 * Customer search result with pagination.
 * Maps from Aves SearchMasterRecordRS.
 */
export interface CustomerSearchResult {
  /** List of matching customers (Aves: MasterRecordList/MasterRecordDetail) */
  customers: Customer[];
  /** Pagination information */
  pagination: {
    /** Current page number */
    page: number;
    /** Total number of pages */
    pages: number;
    /** Total number of items */
    totalItems: number;
    /** Whether more pages exist */
    hasMore: boolean;
  };
}

/**
 * Single printed document.
 * Maps from Aves BaseDocumentAndAttachments/Document structure.
 */
export interface PrintedDocument {
  /** Document file name (Aves: @Name) */
  fileName: string;
  /** Document content (base64) if requested (Aves: @ContentBase64) */
  content?: string;
  /** Document size in bytes (Aves: @LenghtContentBase64) */
  contentSize: number;
}

/**
 * Document print result with multiple documents and email recipients.
 * Maps from Aves PrintBookingDocumentRS structure.
 */
export interface DocumentPrintResult {
  /** Primary email recipient (Aves: BaseDocumentAndAttachments/@EmailRecipients) */
  emailRecipient?: string;
  /** Primary documents (Aves: BaseDocumentAndAttachments/Document) */
  documents: PrintedDocument[];
  /** Additional document sets for other recipients (Aves: AdditionalDocuments) */
  additionalDocuments?: {
    /** Email recipient (Aves: @EmailRecipients) */
    emailRecipient: string;
    /** Documents for this recipient */
    documents: PrintedDocument[];
  }[];
}

/**
 * Cancellation response data.
 */
export type CancelResponseData = {
  /** Refund information if applicable */
  refundInfo?: {
    /** Refund amount */
    refundAmount: number;
    /** Currency code */
    currency: string;
    /** Refund method used */
    refundMethod: string;
    /** Estimated processing time */
    processingTime: string;
  };
};

/**
 * Payment operation response data.
 * Maps from Aves FilePaymentListRS.
 */
export type PaymentResponseData = {
  /** Updated booking information */
  booking: BookingResponse;
  /** Payment summary */
  paymentSummary: {
    /** Total amount paid */
    totalPaid: {
      /** Currency code */
      currency: string;
      /** Total paid amount */
      amount: number;
    };
    /** Outstanding/remaining amount */
    outstandingAmount: {
      /** Currency code */
      currency: string;
      /** Outstanding amount */
      amount: number;
    };
    /** Payment history list */
    paymentHistory: BookingPayment[];
  };
};

/**
 * Generic operation response wrapper.
 * Maps from Aves RsStatus structure.
 */
export interface OperationResponse<T> {
  /** Operation success status (Aves: RsStatus/@Status === 'OK') */
  success: boolean;
  /** Response message (Aves: RsStatus/@Message) */
  message?: string;
  /** Response data payload */
  data?: T;
}
