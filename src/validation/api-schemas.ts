import { z } from 'zod';

// ===== CONST OBJECTS (Single Source of Truth) =====

export const PassengerType = {
  ADULT: 'adult',
  CHILD: 'child',
  INFANT: 'infant',
  SENIOR: 'senior',
} as const;

export const GenderType = {
  MALE: 'male',
  FEMALE: 'female',
} as const;

export const ServiceType = {
  FLIGHT: 'flight',
  HOTEL: 'hotel',
  CAR: 'car',
  TRANSFER: 'transfer',
  INSURANCE: 'insurance',
} as const;

export const ServiceStatusType = {
  CONFIRMED: 'confirmed',
  PENDING: 'pending',
  CANCELLED: 'cancelled',
} as const;

export const PaymentType = {
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  BANK_TRANSFER: 'bank_transfer',
  CASH: 'cash',
} as const;

export const PaymentStatusType = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  FAILED: 'failed',
} as const;

export const CustomerType = {
  CUSTOMER: 'customer',
  SUPPLIER: 'supplier',
  VOUCHER: 'voucher',
  SUPPLIER_VOUCHER: 'supplier_voucher',
} as const;

export const CustomerStatusType = {
  ENABLED: 'enabled',
  WARNING: 'warning',
  BLACKLISTED: 'blacklisted',
  DISABLED: 'disabled',
} as const;

export const BookingStatusType = {
  QUOTATION: 'quotation',
  WORK_IN_PROGRESS: 'work_in_progress',
  CONFIRMED: 'confirmed',
  OPTIONED: 'optioned',
  NULLIFIED: 'nullified',
  CANCELED: 'canceled',
} as const;

export const DocumentType = {
  VISA_REQUEST: 'visa_request',
  TRAVEL_INFORMATION: 'travel_information',
  VOUCHER: 'voucher',
  BOOKING_CONTRACT: 'booking_contract',
  BOOKING_CONFIRMATION: 'booking_confirmation',
  SUPPLIER_SERVICE_LIST: 'supplier_service_list',
  INVOICE: 'invoice',
  PROFORMA_INVOICE: 'proforma_invoice',
  ADEGUAMENTO: 'adeguamento',
  RESERVATION_FORM: 'reservation_form',
  OPEN_XML: 'open_xml',
  SALES_INVOICE: 'sales_invoice',
  TICKETING_TMASTER: 'ticketing_tmaster',
  SUMMARY_FORM: 'summary_form',
} as const;

export const DocumentFormatType = {
  PDF: 'pdf',
  HTML: 'html',
  XML: 'xml',
} as const;

export const DeliveryMethodType = {
  EMAIL: 'email',
  SMS: 'sms',
  DOWNLOAD: 'download',
} as const;

export const CancelReasonType = {
  CUSTOMER_REQUEST: 'customer_request',
  NO_SHOW: 'no_show',
  OPERATIONAL: 'operational',
  OTHER: 'other',
} as const;

export const RefundMethodType = {
  ORIGINAL_PAYMENT: 'original_payment',
  CREDIT: 'credit',
  CASH: 'cash',
} as const;

export const PricingItemType = {
  SERVICE: 'service',
  TAX: 'tax',
  FEE: 'fee',
  DISCOUNT: 'discount',
} as const;

export const DeliveryStatusType = {
  SENT: 'sent',
  PENDING: 'pending',
  FAILED: 'failed',
} as const;

// ===== TYPE ALIASES FOR CONST OBJECTS =====
// These are needed for type inference from const object values

export type PassengerTypeValue =
  (typeof PassengerType)[keyof typeof PassengerType];
export type GenderTypeValue = (typeof GenderType)[keyof typeof GenderType];
export type ServiceTypeValue = (typeof ServiceType)[keyof typeof ServiceType];
export type ServiceStatusTypeValue =
  (typeof ServiceStatusType)[keyof typeof ServiceStatusType];
export type PaymentTypeValue = (typeof PaymentType)[keyof typeof PaymentType];
export type PaymentStatusTypeValue =
  (typeof PaymentStatusType)[keyof typeof PaymentStatusType];
export type CustomerTypeValue =
  (typeof CustomerType)[keyof typeof CustomerType];
export type CustomerStatusTypeValue =
  (typeof CustomerStatusType)[keyof typeof CustomerStatusType];
export type BookingStatusTypeValue =
  (typeof BookingStatusType)[keyof typeof BookingStatusType];
export type DocumentTypeValue =
  (typeof DocumentType)[keyof typeof DocumentType];
export type DocumentFormatTypeValue =
  (typeof DocumentFormatType)[keyof typeof DocumentFormatType];
export type DeliveryMethodTypeValue =
  (typeof DeliveryMethodType)[keyof typeof DeliveryMethodType];
export type CancelReasonTypeValue =
  (typeof CancelReasonType)[keyof typeof CancelReasonType];
export type RefundMethodTypeValue =
  (typeof RefundMethodType)[keyof typeof RefundMethodType];
export type PricingItemTypeValue =
  (typeof PricingItemType)[keyof typeof PricingItemType];
export type DeliveryStatusTypeValue =
  (typeof DeliveryStatusType)[keyof typeof DeliveryStatusType];

// ===== TYPE SCHEMAS (Based on Aves XML Documentation) =====

export const addressTypeSchema = z.enum([
  'home',
  'work',
  'billing',
  'delivery',
]);
export const contactTypeSchema = z.enum(['home', 'work', 'mobile', 'fax']);
export const emailTypeSchema = z.enum(['home', 'work']);
export const passengerTypeSchema = z.enum([
  PassengerType.ADULT,
  PassengerType.CHILD,
  PassengerType.INFANT,
  PassengerType.SENIOR,
]);
export const titleTypeSchema = z.enum(['mr', 'mrs', 'ms', 'dr', 'prof']);
export const genderTypeSchema = z.enum([GenderType.MALE, GenderType.FEMALE]);
export const serviceTypeSchema = z.enum([
  ServiceType.FLIGHT,
  ServiceType.HOTEL,
  ServiceType.CAR,
  ServiceType.TRANSFER,
  ServiceType.INSURANCE,
]);
export const serviceStatusTypeSchema = z.enum([
  ServiceStatusType.CONFIRMED,
  ServiceStatusType.PENDING,
  ServiceStatusType.CANCELLED,
]);
export const paymentTypeSchema = z.enum([
  PaymentType.CREDIT_CARD,
  PaymentType.DEBIT_CARD,
  PaymentType.BANK_TRANSFER,
  PaymentType.CASH,
]);
export const paymentStatusTypeSchema = z.enum([
  PaymentStatusType.PENDING,
  PaymentStatusType.CONFIRMED,
  PaymentStatusType.FAILED,
]);
export const customerTypeSchema = z.enum([
  CustomerType.CUSTOMER,
  CustomerType.SUPPLIER,
  CustomerType.VOUCHER,
  CustomerType.SUPPLIER_VOUCHER,
]);
export const searchOperatorTypeSchema = z.enum([
  'equals',
  'contains',
  'starts_with',
  'ends_with',
]);
export const bookingTypeSchema = z.enum(['individual', 'group', 'corporate']);
export const priorityTypeSchema = z.enum(['low', 'normal', 'high', 'urgent']);
export const specialRequestTypeSchema = z.enum([
  'meal',
  'seat',
  'wheelchair',
  'other',
]);
export const cancelReasonTypeSchema = z.enum([
  CancelReasonType.CUSTOMER_REQUEST,
  CancelReasonType.NO_SHOW,
  CancelReasonType.OPERATIONAL,
  CancelReasonType.OTHER,
]);
export const refundMethodTypeSchema = z.enum([
  RefundMethodType.ORIGINAL_PAYMENT,
  RefundMethodType.CREDIT,
  RefundMethodType.CASH,
]);
export const documentTypeSchema = z.enum([
  DocumentType.VISA_REQUEST,
  DocumentType.TRAVEL_INFORMATION,
  DocumentType.VOUCHER,
  DocumentType.BOOKING_CONTRACT,
  DocumentType.BOOKING_CONFIRMATION,
  DocumentType.SUPPLIER_SERVICE_LIST,
  DocumentType.INVOICE,
  DocumentType.PROFORMA_INVOICE,
  DocumentType.ADEGUAMENTO,
  DocumentType.RESERVATION_FORM,
  DocumentType.OPEN_XML,
  DocumentType.SALES_INVOICE,
  DocumentType.TICKETING_TMASTER,
  DocumentType.SUMMARY_FORM,
]);
export const documentFormatTypeSchema = z.enum([
  DocumentFormatType.PDF,
  DocumentFormatType.HTML,
  DocumentFormatType.XML,
]);
export const deliveryMethodTypeSchema = z.enum([
  DeliveryMethodType.EMAIL,
  DeliveryMethodType.SMS,
  DeliveryMethodType.DOWNLOAD,
]);
export const bookingStatusTypeSchema = z.enum([
  BookingStatusType.QUOTATION,
  BookingStatusType.WORK_IN_PROGRESS,
  BookingStatusType.CONFIRMED,
  BookingStatusType.OPTIONED,
  BookingStatusType.NULLIFIED,
  BookingStatusType.CANCELED,
]);
export const pricingItemTypeSchema = z.enum([
  PricingItemType.SERVICE,
  PricingItemType.TAX,
  PricingItemType.FEE,
  PricingItemType.DISCOUNT,
]);
export const deliveryStatusTypeSchema = z.enum([
  DeliveryStatusType.SENT,
  DeliveryStatusType.PENDING,
  DeliveryStatusType.FAILED,
]);
export const customerStatusTypeSchema = z.enum([
  CustomerStatusType.ENABLED,
  CustomerStatusType.WARNING,
  CustomerStatusType.BLACKLISTED,
  CustomerStatusType.DISABLED,
]);
export const communicationMethodTypeSchema = z.enum(['email', 'sms', 'phone']);

// ===== DATE VALIDATION HELPERS =====

const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');
const dateTimeStringSchema = z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/,
    'DateTime must be in ISO 8601 format'
  );

// ===== COMMON API SCHEMAS =====

export const customerAddressSchema = z.object({
  type: addressTypeSchema.optional(),
  street: z
    .string()
    .max(100, 'Street must be 100 characters or less')
    .optional(),
  city: z.string().max(50, 'City must be 50 characters or less').optional(),
  state: z.string().max(50, 'State must be 50 characters or less').optional(),
  postalCode: z
    .string()
    .max(20, 'Postal code must be 20 characters or less')
    .optional(),
  country: z
    .string()
    .max(50, 'Country must be 50 characters or less')
    .optional(),
});

export const customerContactSchema = z.object({
  phone: z
    .object({
      type: contactTypeSchema.optional(),
      number: z
        .string()
        .min(1, 'Phone number is required')
        .max(30, 'Phone number must be 30 characters or less'),
    })
    .optional(),
  email: z
    .object({
      type: emailTypeSchema.optional(),
      address: z
        .string()
        .email('Valid email address is required')
        .max(100, 'Email must be 100 characters or less'),
    })
    .optional(),
  mobile: z
    .object({
      type: contactTypeSchema.optional(),
      number: z
        .string()
        .min(1, 'Mobile number is required')
        .max(30, 'Mobile number must be 30 characters or less'),
    })
    .optional(),
});

export const customerSchema = z.object({
  id: z.string().max(6, 'Customer ID must be 6 characters or less'),
  type: customerTypeSchema,
  status: customerStatusTypeSchema,
  personalInfo: z
    .object({
      title: z
        .string()
        .max(10, 'Title must be 10 characters or less')
        .optional(),
      firstName: z
        .string()
        .min(1, 'First name is required')
        .max(50, 'First name must be 50 characters or less'),
      lastName: z
        .string()
        .min(1, 'Last name is required')
        .max(50, 'Last name must be 50 characters or less'),
      dateOfBirth: dateStringSchema.optional(),
      gender: genderTypeSchema.optional(),
      nationality: z
        .string()
        .max(3, 'Nationality code must be 3 characters or less')
        .optional(),
    })
    .optional(),
  contact: customerContactSchema.optional(),
  address: customerAddressSchema.optional(),
  businessInfo: z
    .object({
      companyName: z
        .string()
        .max(100, 'Company name must be 100 characters or less')
        .optional(),
      taxId: z
        .string()
        .max(30, 'Tax ID must be 30 characters or less')
        .optional(),
      vatCode: z
        .string()
        .max(30, 'VAT code must be 30 characters or less')
        .optional(),
      fiscalCode: z
        .string()
        .max(30, 'Fiscal code must be 30 characters or less')
        .optional(),
      licenseNumber: z
        .string()
        .max(50, 'License number must be 50 characters or less')
        .optional(),
    })
    .optional(),
  preferences: z
    .object({
      language: z
        .string()
        .length(2, 'Language code must be exactly 2 characters')
        .optional(),
      currency: z
        .string()
        .length(3, 'Currency code must be exactly 3 characters')
        .optional(),
      communicationMethod: communicationMethodTypeSchema.optional(),
    })
    .optional(),
});

export const bookingPassengerSchema = z.object({
  id: z
    .string()
    .regex(/^\d{3}$/, 'Passenger ID must be 3 digits (001, 002, etc.)'),
  type: passengerTypeSchema,
  title: titleTypeSchema.optional(),
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be 50 characters or less'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be 50 characters or less'),
  dateOfBirth: dateStringSchema.optional(),
  gender: genderTypeSchema.optional(),
  nationality: z
    .string()
    .max(3, 'Nationality code must be 3 characters or less')
    .optional(),
  passport: z
    .object({
      number: z
        .string()
        .min(1, 'Passport number is required')
        .max(20, 'Passport number must be 20 characters or less'),
      expiryDate: dateStringSchema,
      issuingCountry: z
        .string()
        .min(1, 'Issuing country is required')
        .max(3, 'Country code must be 3 characters or less'),
    })
    .optional(),
  address: customerAddressSchema.optional(),
  contact: customerContactSchema.optional(),
});

export const bookingServiceSchema = z.object({
  id: z.string().min(1, 'Service ID is required'),
  type: serviceTypeSchema,
  status: serviceStatusTypeSchema,
  code: z
    .string()
    .max(50, 'Service code must be 50 characters or less')
    .optional(),
  name: z
    .string()
    .max(200, 'Service name must be 200 characters or less')
    .optional(),
  description: z
    .string()
    .max(500, 'Description must be 500 characters or less')
    .optional(),
  startDate: dateStringSchema.optional(),
  endDate: dateStringSchema.optional(),
  price: z
    .object({
      currency: z
        .string()
        .length(3, 'Currency code must be exactly 3 characters'),
      amount: z.number().nonnegative('Amount must be non-negative'),
    })
    .optional(),
});

export const bookingPaymentSchema = z.object({
  id: z.string().min(1, 'Payment ID is required'),
  type: paymentTypeSchema,
  status: paymentStatusTypeSchema,
  amount: z.object({
    currency: z
      .string()
      .length(3, 'Currency code must be exactly 3 characters'),
    amount: z.number().positive('Amount must be positive'),
  }),
  details: z
    .object({
      cardNumber: z
        .string()
        .max(20, 'Card number must be 20 characters or less')
        .optional(),
      expiryDate: z
        .string()
        .regex(/^\d{2}\/\d{2}$/, 'Expiry date must be in MM/YY format')
        .optional(),
      cardHolderName: z
        .string()
        .max(100, 'Cardholder name must be 100 characters or less')
        .optional(),
    })
    .optional(),
});

// ===== REQUEST SCHEMAS =====

const paginationSchema = z
  .object({
    pages: z
      .number()
      .int()
      .positive('Pages must be positive')
      .max(100, 'Pages cannot exceed 100'),
    page: z.number().int().min(1, 'Page must be at least 1'),
  })
  .optional();

export const searchCustomerRequestSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('code'),
    code: z
      .string()
      .min(1, 'Code is required')
      .max(6, 'Code must be 6 characters or less'),
    pagination: paginationSchema,
  }),
  z.object({
    type: z.literal('name'),
    name: z.string().min(1, 'Name is required'),
    city: z.string().max(50, 'City must be 50 characters or less').optional(),
    pagination: paginationSchema,
  }),
  z.object({
    type: z.literal('vat_code'),
    vatCode: z.string().min(1, 'VAT code is required'),
    phoneNumber: z
      .string()
      .max(30, 'Phone number must be 30 characters or less')
      .optional(),
    pagination: paginationSchema,
  }),
  z.object({
    type: z.literal('zone'),
    zipCode: z.string().min(1, 'Zip code is required'),
    city: z.string().max(50, 'City must be 50 characters or less').optional(),
    countyCode: z
      .string()
      .max(10, 'County code must be 10 characters or less')
      .optional(),
    pagination: paginationSchema,
  }),
  z.object({
    type: z.literal('category'),
    categoryCode: z.string().min(1, 'Category code is required'),
    pagination: paginationSchema,
  }),
  z.object({
    type: z.literal('email'),
    email: z.email('Valid email is required'),
    pagination: paginationSchema,
  }),
  z.object({
    type: z.literal('last_mod_date'),
    from: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    to: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    pagination: paginationSchema,
  }),
  z.object({
    type: z.literal('search_field'),
    searchField: z.string().min(1, 'Search field is required'),
    pagination: paginationSchema,
  }),
  z.object({
    type: z.literal('external_ref_code'),
    externalRefCode: z.string().min(1, 'External ref code is required'),
    pagination: paginationSchema,
  }),
]);

const baseBookingRequestSchema = z.object({
  description: z
    .string()
    .max(200, 'Description must be 200 characters or less')
    .optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  currency: z
    .string()
    .max(3, 'Currency code must be 3 characters or less')
    .optional(),
  passengers: z
    .array(bookingPassengerSchema)
    .min(1, 'At least one passenger is required')
    .max(99, 'Maximum 99 passengers allowed'),
  services: z
    .array(bookingServiceSchema)
    .min(1, 'At least one service is required')
    .max(50, 'Maximum 50 services allowed'),
  statisticCodes: z
    .object({
      code1: z
        .string()
        .max(4, 'Statistic code must be 4 characters or less')
        .optional(),
      code2: z
        .string()
        .max(4, 'Statistic code must be 4 characters or less')
        .optional(),
      code3: z
        .string()
        .max(4, 'Statistic code must be 4 characters or less')
        .optional(),
      code4: z
        .string()
        .max(4, 'Statistic code must be 4 characters or less')
        .optional(),
      code5: z
        .string()
        .max(4, 'Statistic code must be 4 characters or less')
        .optional(),
      code6: z
        .string()
        .max(4, 'Statistic code must be 4 characters or less')
        .optional(),
    })
    .optional(),
  destination: z
    .object({
      code: z.string().optional(),
      iataCode: z.string().optional(),
      nationCode: z.string().optional(),
    })
    .optional(),
  deadlines: z
    .array(
      z.object({
        code: z.string().min(1, 'Deadline code is required'),
        description: z.string().optional(),
        expireDate: z.string().optional(),
      })
    )
    .optional(),
  printDocument: z.boolean().optional(),
  sendDocumentViaEmail: z.boolean().optional(),
});

export const createBookingRequestSchema = z.union([
  baseBookingRequestSchema.extend({
    customerId: z
      .string()
      .max(6, 'Customer ID must be 6 characters or less')
      .min(1, 'Customer ID is required'),
    customerDetails: z.never().optional(),
  }),
  baseBookingRequestSchema.extend({
    customerId: z.never().optional(),
    customerDetails: customerSchema,
  }),
]);

export const cancelBookingRequestSchema = z.object({
  bookingId: z
    .string()
    .min(1, 'Booking ID is required')
    .max(20, 'Booking ID must be 20 characters or less'),
  customerId: z
    .string()
    .max(6, 'Customer ID must be 6 characters or less')
    .optional(),
  reason: cancelReasonTypeSchema,
  description: z
    .string()
    .max(500, 'Description must be 500 characters or less')
    .optional(),
  refundRequest: z
    .object({
      amount: z.number().positive('Refund amount must be positive'),
      currency: z
        .string()
        .length(3, 'Currency code must be exactly 3 characters'),
      method: refundMethodTypeSchema,
    })
    .optional(),
});

export const printDocumentRequestSchema = z.object({
  bookingId: z
    .string()
    .min(1, 'Booking ID is required')
    .max(20, 'Booking ID must be 20 characters or less'),
  customerId: z
    .string()
    .max(6, 'Customer ID must be 6 characters or less')
    .optional(),
  documentType: documentTypeSchema,
  format: documentFormatTypeSchema.optional(),
  language: z
    .string()
    .length(2, 'Language code must be exactly 2 characters')
    .optional(),
  deliveryMethod: z
    .object({
      type: deliveryMethodTypeSchema,
      address: z
        .string()
        .max(100, 'Delivery address must be 100 characters or less')
        .optional(),
    })
    .optional(),
});

export const addPaymentRequestSchema = z.union([
  z.object({
    bookingId: z
      .string()
      .min(1, 'Booking ID is required')
      .max(20, 'Booking ID must be 20 characters or less'),
    bookingRefCode: z.never().optional(),
    payments: z
      .array(bookingPaymentSchema)
      .min(1, 'At least one payment is required')
      .max(20, 'Maximum 20 payments allowed'),
    enableMultiple: z.boolean().optional(),
    operationType: z
      .enum(['absolute', 'final', 'final_no_controls'])
      .optional(),
  }),
  z.object({
    bookingId: z.never().optional(),
    bookingRefCode: z
      .string()
      .min(1, 'Booking reference code is required')
      .max(20, 'Booking reference code must be 20 characters or less'),
    payments: z
      .array(bookingPaymentSchema)
      .min(1, 'At least one payment is required')
      .max(20, 'Maximum 20 payments allowed'),
    enableMultiple: z.boolean().optional(),
    operationType: z
      .enum(['absolute', 'final', 'final_no_controls'])
      .optional(),
  }),
]);

export const updateBookingHeaderSchema = z.object({
  bookingId: z
    .string()
    .min(1, 'Booking ID is required')
    .max(20, 'Booking ID must be 20 characters or less'),
  customerId: z.string().max(6, 'Customer ID must be 6 characters or less'),
  startDate: dateStringSchema,
  passengers: z.array(bookingPassengerSchema).optional(),
  notes: z.string().max(999, 'Notes must be 999 characters or less').optional(),
  statisticCodes: z
    .object({
      code1: z
        .string()
        .max(4, 'Statistic code must be 4 characters or less')
        .optional(),
      code2: z
        .string()
        .max(4, 'Statistic code must be 4 characters or less')
        .optional(),
      code3: z
        .string()
        .max(4, 'Statistic code must be 4 characters or less')
        .optional(),
      code4: z
        .string()
        .max(4, 'Statistic code must be 4 characters or less')
        .optional(),
      code5: z
        .string()
        .max(4, 'Statistic code must be 4 characters or less')
        .optional(),
      code6: z
        .string()
        .max(4, 'Statistic code must be 4 characters or less')
        .optional(),
    })
    .optional(),
});

export const updateBookingServicesSchema = z.object({
  bookingId: z
    .string()
    .min(1, 'Booking ID is required')
    .max(20, 'Booking ID must be 20 characters or less'),
  customerId: z.string().max(6, 'Customer ID must be 6 characters or less'),
  services: z
    .array(bookingServiceSchema)
    .min(1, 'At least one service is required')
    .max(50, 'Maximum 50 services allowed'),
});

export const setBookingStatusSchema = z.object({
  bookingId: z
    .string()
    .min(1, 'Booking ID is required')
    .max(20, 'Booking ID must be 20 characters or less'),
  customerId: z.string().max(6, 'Customer ID must be 6 characters or less'),
  status: bookingStatusTypeSchema,
  expireDate: dateStringSchema.optional(),
});

// ===== RESPONSE SCHEMAS =====

export const bookingResponseSchema = z.object({
  id: z.string().min(1, 'Booking ID is required'),
  status: bookingStatusTypeSchema,
  createdAt: dateTimeStringSchema,
  updatedAt: dateTimeStringSchema,
  customer: customerSchema,
  passengers: z.array(bookingPassengerSchema),
  services: z.array(bookingServiceSchema),
  pricing: z.object({
    totalAmount: z.object({
      currency: z
        .string()
        .length(3, 'Currency code must be exactly 3 characters'),
      amount: z.number().nonnegative('Amount must be non-negative'),
    }),
    breakdowns: z
      .array(
        z.object({
          type: pricingItemTypeSchema,
          description: z.string().min(1, 'Description is required'),
          amount: z.number(),
        })
      )
      .optional(),
  }),
});

export const customerSearchResultSchema = z.object({
  customers: z.array(customerSchema),
  pagination: z.object({
    page: z.number().int().min(1, 'Page must be at least 1'),
    pages: z.number().int().min(1, 'Pages must be at least 1'),
    totalItems: z.number().int().min(0, 'Total items must be non-negative'),
    hasMore: z.boolean(),
  }),
});

export const printedDocumentSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  content: z.string().optional(),
  contentSize: z.number().int().min(0, 'Content size must be non-negative'),
});

export const documentPrintResultSchema = z.object({
  emailRecipient: z.email('Valid email address is required').optional(),
  documents: z
    .array(printedDocumentSchema)
    .min(0, 'Documents array is required'),
  additionalDocuments: z
    .array(
      z.object({
        emailRecipient: z.string().email('Valid email address is required'),
        documents: z.array(printedDocumentSchema),
      })
    )
    .optional(),
});

export const operationResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
});

// ===== EXPORT ALL SCHEMAS =====

export const apiSchemas = {
  // Type schemas
  addressType: addressTypeSchema,
  contactType: contactTypeSchema,
  emailType: emailTypeSchema,
  passengerType: passengerTypeSchema,
  titleType: titleTypeSchema,
  genderType: genderTypeSchema,
  serviceType: serviceTypeSchema,
  serviceStatusType: serviceStatusTypeSchema,
  paymentType: paymentTypeSchema,
  paymentStatusType: paymentStatusTypeSchema,
  customerType: customerTypeSchema,
  searchOperatorType: searchOperatorTypeSchema,
  bookingType: bookingTypeSchema,
  priorityType: priorityTypeSchema,
  specialRequestType: specialRequestTypeSchema,
  cancelReasonType: cancelReasonTypeSchema,
  refundMethodType: refundMethodTypeSchema,
  documentType: documentTypeSchema,
  documentFormatType: documentFormatTypeSchema,
  deliveryMethodType: deliveryMethodTypeSchema,
  bookingStatusType: bookingStatusTypeSchema,
  pricingItemType: pricingItemTypeSchema,
  deliveryStatusType: deliveryStatusTypeSchema,
  customerStatusType: customerStatusTypeSchema,
  communicationMethodType: communicationMethodTypeSchema,

  // Common schemas
  customerAddress: customerAddressSchema,
  customerContact: customerContactSchema,
  customer: customerSchema,
  bookingPassenger: bookingPassengerSchema,
  bookingService: bookingServiceSchema,
  bookingPayment: bookingPaymentSchema,

  // Request schemas
  searchCustomerRequest: searchCustomerRequestSchema,
  createBookingRequest: createBookingRequestSchema,
  cancelBookingRequest: cancelBookingRequestSchema,
  printDocumentRequest: printDocumentRequestSchema,
  addPaymentRequest: addPaymentRequestSchema,
  updateBookingHeader: updateBookingHeaderSchema,
  updateBookingServices: updateBookingServicesSchema,
  setBookingStatus: setBookingStatusSchema,

  // Response schemas
  bookingResponse: bookingResponseSchema,
  customerSearchResult: customerSearchResultSchema,
  printedDocument: printedDocumentSchema,
  documentPrintResult: documentPrintResultSchema,
  operationResponse: operationResponseSchema,
} as const;

// ===== INFERRED TYPES =====

export type AddressType = z.infer<typeof addressTypeSchema>;
export type ContactType = z.infer<typeof contactTypeSchema>;
export type EmailType = z.infer<typeof emailTypeSchema>;
export type TitleType = z.infer<typeof titleTypeSchema>;
export type SearchOperatorType = z.infer<typeof searchOperatorTypeSchema>;
export type BookingType = z.infer<typeof bookingTypeSchema>;
export type PriorityType = z.infer<typeof priorityTypeSchema>;
export type SpecialRequestType = z.infer<typeof specialRequestTypeSchema>;
export type CommunicationMethodType = z.infer<
  typeof communicationMethodTypeSchema
>;

export type CustomerAddress = z.infer<typeof customerAddressSchema>;
export type CustomerContact = z.infer<typeof customerContactSchema>;
export type Customer = z.infer<typeof customerSchema>;
export type Price = {
  currency: string;
  amount: number;
};
export type BookingPassenger = z.infer<typeof bookingPassengerSchema>;
export type BookingService = z.infer<typeof bookingServiceSchema>;
export type BookingPayment = z.infer<typeof bookingPaymentSchema>;

export type SearchCustomerRequest = z.infer<typeof searchCustomerRequestSchema>;
export type CreateBookingRequest = z.infer<typeof createBookingRequestSchema>;
export type CancelBookingRequest = z.infer<typeof cancelBookingRequestSchema>;
export type PrintDocumentRequest = z.infer<typeof printDocumentRequestSchema>;
export type AddPaymentRequest = z.infer<typeof addPaymentRequestSchema>;
export type UpdateBookingHeaderRequest = z.infer<
  typeof updateBookingHeaderSchema
>;
export type UpdateBookingServicesRequest = z.infer<
  typeof updateBookingServicesSchema
>;
export type SetBookingStatusRequest = z.infer<typeof setBookingStatusSchema>;

export type BookingResponse = z.infer<typeof bookingResponseSchema>;
export type CustomerSearchResult = z.infer<typeof customerSearchResultSchema>;
export type PrintedDocument = z.infer<typeof printedDocumentSchema>;
export type DocumentPrintResult = z.infer<typeof documentPrintResultSchema>;
export type OperationResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
};

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

export type DocumentFormatType =
  (typeof DocumentFormatType)[keyof typeof DocumentFormatType];
export type DeliveryMethodType =
  (typeof DeliveryMethodType)[keyof typeof DeliveryMethodType];
