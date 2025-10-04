// ===== TYPE DEFINITIONS =====

export type DateString = string & { readonly __brand: 'DateString' }; // YYYY-MM-DD format
export type DateTimeString = string & { readonly __brand: 'DateTimeString' }; // ISO 8601 format
export type TimeString = string & { readonly __brand: 'TimeString' }; // HH:MM:SS format

export type AddressType = 'home' | 'work' | 'billing' | 'delivery';
export type ContactType = 'home' | 'work' | 'mobile' | 'fax';
export type EmailType = 'home' | 'work';
export type PassengerType = 'adult' | 'child' | 'infant';
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
export type CustomerType = 'customer' | 'agent' | 'supplier';
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
  | 'confirmation'
  | 'invoice'
  | 'voucher'
  | 'ticket'
  | 'all';
export type DocumentFormatType = 'pdf' | 'html' | 'xml';
export type DeliveryMethodType = 'email' | 'sms' | 'download';
export type BookingStatusType =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'completed';
export type PricingItemType = 'service' | 'tax' | 'fee' | 'discount';
export type DeliveryStatusType = 'sent' | 'pending' | 'failed';
export type CustomerStatusType = 'active' | 'inactive' | 'suspended';
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
    middleName?: string;
    dateOfBirth?: DateString;
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

export interface BookingPassenger {
  id: string;
  type: PassengerType;
  title?: TitleType;
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth?: DateString;
  gender?: GenderType;
  nationality?: string;
  passport?: {
    number: string;
    expiryDate: DateString;
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
  startDate?: DateString;
  endDate?: DateString;
  price?: {
    currency: string;
    amount: number;
  };
}

export interface BookingPayment {
  id: string;
  type: PaymentType;
  status: PaymentStatusType;
  amount: {
    currency: string;
    amount: number;
  };
  details?: {
    cardNumber?: string;
    expiryDate?: string;
    cardHolderName?: string;
  };
}

// ===== REQUEST INTERFACES =====

export interface SearchCustomerRequest {
  type: CustomerType;
  fields: {
    name: string;
    value: string;
    operator?: SearchOperatorType;
  }[];
  pagination?: {
    pageSize: number;
    pageNumber: number;
  };
}

export interface CreateBookingRequest {
  type: BookingType;
  priority: PriorityType;
  customerId?: string;
  customerDetails?: any; // Will be mapped to MasterRecord
  passengers: BookingPassenger[];
  services: BookingService[];
  specialRequests?: {
    type: SpecialRequestType;
    description: string;
  }[];
}

export interface CancelBookingRequest {
  bookingId: string;
  reason: CancelReasonType;
  description?: string;
  refundRequest?: {
    amount: number;
    currency: string;
    method: RefundMethodType;
  };
}

export interface PrintDocumentRequest {
  bookingId: string;
  documentType: DocumentType;
  format: DocumentFormatType;
  language?: string;
  deliveryMethod?: {
    type: DeliveryMethodType;
    address?: string;
  };
}

export interface AddPaymentRequest {
  bookingId: string;
  payments: BookingPayment[];
}

// ===== RESPONSE INTERFACES =====

export interface BookingResponse {
  id: string;
  status: BookingStatusType;
  createdAt: DateTimeString;
  updatedAt: DateTimeString;
  customer: Customer;
  passengers: BookingPassenger[];
  services: BookingService[];
  pricing: {
    totalAmount: {
      currency: string;
      amount: number;
    };
    breakdowns?: {
      type: PricingItemType;
      description: string;
      amount: number;
    }[];
  };
}

export interface SearchResponse {
  results: Customer[];
  pagination?: {
    totalRecords: number;
    pageSize: number;
    pageNumber: number;
    totalPages: number;
  };
}

export interface DocumentResponse {
  id: string;
  type: string;
  format: string;
  size: number;
  createdAt: DateTimeString;
  downloadUrl?: string;
  deliveryStatus?: {
    status: DeliveryStatusType;
    method: string;
    address?: string;
  };
}

export interface OperationResponse {
  success: boolean;
  message?: string;
  data?: any;
}
