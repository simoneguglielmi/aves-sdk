// NestJS Integration
export * from './nest/aves.module';
export * from './nest/aves.service';

// Public API Types & Const Objects (not schemas - internal use only)
export {
  // Const objects
  PassengerType,
  GenderType,
  ServiceType,
  ServiceStatusType,
  PaymentType,
  PaymentStatusType,
  CustomerType,
  CustomerStatusType,
  BookingStatusType,
  DocumentType,
  DocumentFormatType,
  DeliveryMethodType,
  CancelReasonType,
  RefundMethodType,
  PricingItemType,
  DeliveryStatusType,
} from './validation/api-schemas';

export type {
  // Type aliases
  PassengerTypeValue,
  GenderTypeValue,
  ServiceTypeValue,
  ServiceStatusTypeValue,
  PaymentTypeValue,
  PaymentStatusTypeValue,
  CustomerTypeValue,
  CustomerStatusTypeValue,
  BookingStatusTypeValue,
  DocumentTypeValue,
  DocumentFormatTypeValue,
  DeliveryMethodTypeValue,
  CancelReasonTypeValue,
  RefundMethodTypeValue,
  PricingItemTypeValue,
  DeliveryStatusTypeValue,
  // API Types
  AddressType,
  ContactType,
  EmailType,
  TitleType,
  SearchOperatorType,
  BookingType,
  PriorityType,
  SpecialRequestType,
  CommunicationMethodType,
  CustomerAddress,
  CustomerContact,
  Customer,
  Price,
  BookingPassenger,
  BookingService,
  BookingPayment,
  SearchCustomerRequest,
  CreateBookingRequest,
  CancelBookingRequest,
  PrintDocumentRequest,
  AddPaymentRequest,
  BookingResponse,
  CustomerSearchResult,
  PrintedDocument,
  DocumentPrintResult,
  OperationResponse,
  CancelResponseData,
  PaymentResponseData,
} from './validation/api-schemas';

// Error Handling
export * from './errors/aves-error-handler';
export * from './errors/aves-error';
