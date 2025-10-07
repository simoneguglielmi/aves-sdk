// ===== TYPE DEFINITIONS =====

export type AddressType = 'home' | 'work' | 'billing' | 'delivery';
export type ContactType = 'home' | 'work' | 'mobile' | 'fax';
export type EmailType = 'home' | 'work';
export type PassengerType = 'adult' | 'child' | 'infant' | 'senior';
export type TitleType = 'mr' | 'mrs' | 'ms' | 'dr' | 'prof';
export type GenderType = 'male' | 'female';
export type ServiceType = 'flight' | 'hotel' | 'car' | 'transfer' | 'insurance';
export type ServiceStatusType = 'confirmed' | 'pending' | 'cancelled';
export type PaymentType =
  | 'credit_card'
  | 'debit_card'
  | 'bank_transfer'
  | 'cash';
export type PaymentStatusType = 'pending' | 'confirmed' | 'failed';
export type CustomerType =
  | 'customer'
  | 'supplier'
  | 'voucher'
  | 'supplier_voucher';
export type SearchOperatorType =
  | 'equals'
  | 'contains'
  | 'starts_with'
  | 'ends_with';
export type BookingType = 'individual' | 'group' | 'corporate';
export type PriorityType = 'low' | 'normal' | 'high' | 'urgent';
export type SpecialRequestType = 'meal' | 'seat' | 'wheelchair' | 'other';
export type CancelReasonType =
  | 'customer_request'
  | 'no_show'
  | 'operational'
  | 'other';
export type RefundMethodType = 'original_payment' | 'credit' | 'cash';
export type DocumentType =
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
export type DocumentFormatType = 'pdf' | 'html' | 'xml';
export type DeliveryMethodType = 'email' | 'sms' | 'download';
export type BookingStatusType =
  | 'quotation'
  | 'work_in_progress'
  | 'confirmed'
  | 'optioned'
  | 'nullified'
  | 'canceled';
export type PricingItemType = 'service' | 'tax' | 'fee' | 'discount';
export type DeliveryStatusType = 'sent' | 'pending' | 'failed';
export type CustomerStatusType =
  | 'enabled'
  | 'warning'
  | 'blacklisted'
  | 'disabled';
export type CommunicationMethodType = 'email' | 'sms' | 'phone';

// ===== COMMON API TYPES =====

export interface CustomerAddress {
  type?: AddressType;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface CustomerContact {
  phone?: {
    type?: ContactType;
    number: string;
  };
  mobile?: {
    type?: ContactType;
    number: string;
  };
  email?: {
    type?: EmailType;
    address: string;
  };
}

export interface Customer {
  id: string;
  type: CustomerType;
  status: CustomerStatusType;
  personalInfo?: {
    title?: string;
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    gender?: GenderType;
    nationality?: string;
  };
  contact?: CustomerContact;
  address?: CustomerAddress;
  businessInfo?: {
    companyName?: string;
    taxId?: string;
    licenseNumber?: string;
  };
  preferences?: {
    language?: string;
    currency?: string;
    communicationMethod?: CommunicationMethodType;
  };
}

export interface Price {
  currency: string;
  amount: number;
}

export interface BookingPassenger {
  id: string;
  type: PassengerType;
  title?: TitleType;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: GenderType;
  nationality?: string;
  passport?: {
    number: string;
    expiryDate: string;
    issuingCountry: string;
  };
  address?: CustomerAddress;
  contact?: CustomerContact;
}

export interface BookingService {
  id: string;
  type: ServiceType;
  status: ServiceStatusType;
  code?: string;
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  price?: Price;
}

// ===== PAYMENT MANAGEMENT =====
export interface BookingPayment {
  id: string;
  type: PaymentType;
  status: PaymentStatusType;
  amount: Price;
  details?: {
    cardNumber?: string;
    expiryDate?: string;
    cardHolderName?: string;
  };
}

// ===== REQUEST INTERFACES =====

export type SearchCustomerRequest =
  | {
      type: 'code';
      code: string;
      pagination?: { pages: number; page: number };
    }
  | {
      type: 'name';
      name: string;
      city?: string;
      pagination?: { pages: number; page: number };
    }
  | {
      type: 'vat_code';
      vatCode: string;
      phoneNumber?: string;
      pagination?: { pages: number; page: number };
    }
  | {
      type: 'zone';
      zipCode: string;
      city?: string;
      countyCode?: string;
      pagination?: { pages: number; page: number };
    }
  | {
      type: 'category';
      categoryCode: string;
      pagination?: { pages: number; page: number };
    }
  | {
      type: 'email';
      email: string;
      pagination?: { pages: number; page: number };
    }
  | {
      type: 'last_mod_date';
      from: string;
      to: string;
      pagination?: { pages: number; page: number };
    }
  | {
      type: 'search_field';
      searchField: string;
      pagination?: { pages: number; page: number };
    }
  | {
      type: 'external_ref_code';
      externalRefCode: string;
      pagination?: { pages: number; page: number };
    };

type BaseBookingRequest = {
  description?: string;
  startDate: string;
  endDate: string;
  currency?: string;
  passengers: BookingPassenger[];
  services: BookingService[];
  statisticCodes?: {
    code1?: string;
    code2?: string;
    code3?: string;
    code4?: string;
    code5?: string;
    code6?: string;
  };
  destination?: {
    code?: string;
    iataCode?: string;
    nationCode?: string;
  };
  deadlines?: {
    code: string;
    description?: string;
    expireDate?: string;
  }[];
  printDocument?: boolean;
  sendDocumentViaEmail?: boolean;
};

export type CreateBookingRequest =
  | (BaseBookingRequest & {
      customerId: string;
      customerDetails?: never;
    })
  | (BaseBookingRequest & {
      customerId?: never;
      customerDetails: Customer;
    });

export interface CancelBookingRequest {
  bookingId: string;
  customerId: string; // Required by Aves API
  reason?: CancelReasonType;
  description?: string;
  refundRequest?: {
    amount: number;
    currency: string;
    method: RefundMethodType;
  };
}

export interface PrintDocumentRequest {
  bookingId: string;
  customerId: string; // Required by Aves API
  documentType: DocumentType;
  format?: DocumentFormatType;
  language?: string;
  deliveryMethod?: {
    type: DeliveryMethodType;
    address?: string;
  };
}

type BasePaymentRequest = {
  payments: BookingPayment[];
  enableMultiple?: boolean;
  operationType?: 'absolute' | 'final' | 'final_no_controls';
};

export type AddPaymentRequest =
  | (BasePaymentRequest & {
      bookingId: string;
      bookingRefCode?: never;
    })
  | (BasePaymentRequest & {
      bookingId?: never;
      bookingRefCode: string;
    });

// ===== RESPONSE INTERFACES =====

export interface BookingResponse {
  id: string;
  status: BookingStatusType;
  createdAt: string;
  updatedAt: string;
  customer: Customer;
  passengers: BookingPassenger[];
  services: BookingService[];
  pricing: {
    totalAmount: Price;
    breakdowns?: {
      type: PricingItemType;
      description: string;
      amount: number;
    }[];
  };
}

export interface CustomerSearchResult {
  customers: Customer[];
  pagination: {
    page: number;
    pages: number;
    totalItems: number;
    hasMore: boolean;
  };
}

export interface PrintedDocument {
  fileName: string;
  content?: string;
  contentSize: number;
}

export interface DocumentPrintResult {
  emailRecipient?: string;
  documents: PrintedDocument[];
  additionalDocuments?: {
    emailRecipient: string;
    documents: PrintedDocument[];
  }[];
}

export type CancelResponseData = {
  refundInfo?: {
    refundAmount: number;
    currency: string;
    refundMethod: string;
    processingTime: string;
  };
};

export type PaymentResponseData = {
  booking: BookingResponse;
  paymentSummary: {
    totalPaid: {
      currency: string;
      amount: number;
    };
    outstandingAmount: {
      currency: string;
      amount: number;
    };
    paymentHistory: BookingPayment[];
  };
};

export interface OperationResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}
