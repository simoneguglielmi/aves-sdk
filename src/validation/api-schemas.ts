import { z } from 'zod';

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
  'adult',
  'child',
  'infant',
  'senior',
]);
export const titleTypeSchema = z.enum(['mr', 'mrs', 'ms', 'dr', 'prof']);
export const genderTypeSchema = z.enum(['male', 'female']);
export const serviceTypeSchema = z.enum([
  'flight',
  'hotel',
  'car',
  'transfer',
  'insurance',
]);
export const serviceStatusTypeSchema = z.enum([
  'confirmed',
  'pending',
  'cancelled',
]);
export const paymentTypeSchema = z.enum([
  'credit_card',
  'debit_card',
  'bank_transfer',
  'cash',
]);
export const paymentStatusTypeSchema = z.enum([
  'pending',
  'confirmed',
  'failed',
]);
export const customerTypeSchema = z.enum([
  'customer',
  'supplier',
  'voucher',
  'supplier_voucher',
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
  'customer_request',
  'no_show',
  'operational',
  'other',
]);
export const refundMethodTypeSchema = z.enum([
  'original_payment',
  'credit',
  'cash',
]);
export const documentTypeSchema = z.enum([
  'visa_request',
  'travel_information',
  'voucher',
  'booking_contract',
  'booking_confirmation',
  'supplier_service_list',
  'invoice',
  'proforma_invoice',
  'adeguamento',
  'reservation_form',
  'open_xml',
  'sales_invoice',
  'ticketing_tmaster',
  'summary_form',
]);
export const documentFormatTypeSchema = z.enum(['pdf', 'html', 'xml']);
export const deliveryMethodTypeSchema = z.enum(['email', 'sms', 'download']);
export const bookingStatusTypeSchema = z.enum([
  'quotation',
  'work_in_progress',
  'confirmed',
  'optioned',
  'nullified',
  'canceled',
]);
export const pricingItemTypeSchema = z.enum([
  'service',
  'tax',
  'fee',
  'discount',
]);
export const deliveryStatusTypeSchema = z.enum(['sent', 'pending', 'failed']);
export const customerStatusTypeSchema = z.enum([
  'enabled',
  'warning',
  'blacklisted',
  'disabled',
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
