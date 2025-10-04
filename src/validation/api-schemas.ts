import { z } from 'zod';

// ===== TYPE SCHEMAS =====

export const addressTypeSchema = z.enum([
  'home',
  'work',
  'billing',
  'delivery',
]);
export const contactTypeSchema = z.enum(['home', 'work', 'mobile', 'fax']);
export const emailTypeSchema = z.enum(['home', 'work']);
export const passengerTypeSchema = z.enum(['adult', 'child', 'infant']);
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
export const customerTypeSchema = z.enum(['customer', 'agent', 'supplier']);
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
  'confirmation',
  'invoice',
  'voucher',
  'ticket',
  'all',
]);
export const documentFormatTypeSchema = z.enum(['pdf', 'html', 'xml']);
export const deliveryMethodTypeSchema = z.enum(['email', 'sms', 'download']);
export const bookingStatusTypeSchema = z.enum([
  'pending',
  'confirmed',
  'cancelled',
  'completed',
]);
export const pricingItemTypeSchema = z.enum([
  'service',
  'tax',
  'fee',
  'discount',
]);
export const deliveryStatusTypeSchema = z.enum(['sent', 'pending', 'failed']);
export const customerStatusTypeSchema = z.enum([
  'active',
  'inactive',
  'suspended',
]);
export const communicationMethodTypeSchema = z.enum(['email', 'sms', 'phone']);

// ===== DATE VALIDATION HELPERS =====

const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');
const timeStringSchema = z
  .string()
  .regex(/^\d{2}:\d{2}:\d{2}$/, 'Time must be in HH:MM:SS format');
const dateTimeStringSchema = z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/,
    'DateTime must be in ISO 8601 format'
  );

// ===== COMMON API SCHEMAS =====

export const customerAddressSchema = z.object({
  type: addressTypeSchema.optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
});

export const customerContactSchema = z.object({
  phone: z
    .object({
      type: contactTypeSchema.optional(),
      number: z.string().min(1, 'Phone number is required'),
    })
    .optional(),
  email: z
    .object({
      type: emailTypeSchema.optional(),
      address: z.string().email('Valid email address is required'),
    })
    .optional(),
});

export const customerSchema = z.object({
  id: z.string().min(1, 'Customer ID is required'),
  type: customerTypeSchema,
  status: customerStatusTypeSchema,
  personalInfo: z
    .object({
      title: z.string().optional(),
      firstName: z.string().min(1, 'First name is required'),
      lastName: z.string().min(1, 'Last name is required'),
      middleName: z.string().optional(),
      dateOfBirth: dateStringSchema.optional(),
      gender: genderTypeSchema.optional(),
      nationality: z.string().optional(),
    })
    .optional(),
  contact: customerContactSchema.optional(),
  address: customerAddressSchema.optional(),
  businessInfo: z
    .object({
      companyName: z.string().optional(),
      taxId: z.string().optional(),
      licenseNumber: z.string().optional(),
    })
    .optional(),
  preferences: z
    .object({
      language: z.string().optional(),
      currency: z.string().optional(),
      communicationMethod: communicationMethodTypeSchema.optional(),
    })
    .optional(),
});

export const bookingPassengerSchema = z.object({
  id: z.string().min(1, 'Passenger ID is required'),
  type: passengerTypeSchema,
  title: titleTypeSchema.optional(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  middleName: z.string().optional(),
  dateOfBirth: dateStringSchema.optional(),
  gender: genderTypeSchema.optional(),
  nationality: z.string().optional(),
  passport: z
    .object({
      number: z.string().min(1, 'Passport number is required'),
      expiryDate: dateStringSchema,
      issuingCountry: z.string().min(1, 'Issuing country is required'),
    })
    .optional(),
  address: customerAddressSchema.optional(),
  contact: customerContactSchema.optional(),
});

export const bookingServiceSchema = z.object({
  id: z.string().min(1, 'Service ID is required'),
  type: serviceTypeSchema,
  status: serviceStatusTypeSchema,
  code: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  startDate: dateStringSchema.optional(),
  endDate: dateStringSchema.optional(),
  price: z
    .object({
      currency: z.string().min(1, 'Currency is required'),
      amount: z.number().positive('Amount must be positive'),
    })
    .optional(),
});

export const bookingPaymentSchema = z.object({
  id: z.string().min(1, 'Payment ID is required'),
  type: paymentTypeSchema,
  status: paymentStatusTypeSchema,
  amount: z.object({
    currency: z.string().min(1, 'Currency is required'),
    amount: z.number().positive('Amount must be positive'),
  }),
  details: z
    .object({
      cardNumber: z.string().optional(),
      expiryDate: z.string().optional(),
      cardHolderName: z.string().optional(),
    })
    .optional(),
});

// ===== REQUEST SCHEMAS =====

export const searchCustomerRequestSchema = z.object({
  type: customerTypeSchema,
  fields: z
    .array(
      z.object({
        name: z.string().min(1, 'Field name is required'),
        value: z.string().min(1, 'Field value is required'),
        operator: searchOperatorTypeSchema.optional(),
      })
    )
    .min(1, 'At least one search field is required'),
  pagination: z
    .object({
      pageSize: z
        .number()
        .int()
        .positive('Page size must be a positive integer'),
      pageNumber: z.number().int().min(1, 'Page number must be at least 1'),
    })
    .optional(),
});

export const createBookingRequestSchema = z.object({
  type: bookingTypeSchema,
  priority: priorityTypeSchema,
  customerId: z.string().optional(),
  customerDetails: customerSchema.optional(),
  passengers: z
    .array(bookingPassengerSchema)
    .min(1, 'At least one passenger is required'),
  services: z
    .array(bookingServiceSchema)
    .min(1, 'At least one service is required'),
  specialRequests: z
    .array(
      z.object({
        type: specialRequestTypeSchema,
        description: z
          .string()
          .min(1, 'Special request description is required'),
      })
    )
    .optional(),
});

export const cancelBookingRequestSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  reason: cancelReasonTypeSchema,
  description: z.string().optional(),
  refundRequest: z
    .object({
      amount: z.number().positive('Refund amount must be positive'),
      currency: z.string().min(1, 'Currency is required'),
      method: refundMethodTypeSchema,
    })
    .optional(),
});

export const printDocumentRequestSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  documentType: documentTypeSchema,
  format: documentFormatTypeSchema,
  language: z.string().optional(),
  deliveryMethod: z
    .object({
      type: deliveryMethodTypeSchema,
      address: z.string().optional(),
    })
    .optional(),
});

export const addPaymentRequestSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  payments: z
    .array(bookingPaymentSchema)
    .min(1, 'At least one payment is required'),
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
      currency: z.string().min(1, 'Currency is required'),
      amount: z.number().positive('Amount must be positive'),
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

export const searchResponseSchema = z.object({
  results: z.array(customerSchema),
  pagination: z
    .object({
      totalRecords: z.number().int().min(0),
      pageSize: z.number().int().positive(),
      pageNumber: z.number().int().min(1),
      totalPages: z.number().int().min(0),
    })
    .optional(),
});

export const documentResponseSchema = z.object({
  id: z.string().min(1, 'Document ID is required'),
  type: z.string().min(1, 'Document type is required'),
  format: z.string().min(1, 'Document format is required'),
  size: z.number().int().positive('Document size must be positive'),
  createdAt: dateTimeStringSchema,
  downloadUrl: z.string().url('Download URL must be valid').optional(),
  deliveryStatus: z
    .object({
      status: deliveryStatusTypeSchema,
      method: z.string().min(1, 'Delivery method is required'),
      address: z.string().optional(),
    })
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

  // Response schemas
  bookingResponse: bookingResponseSchema,
  searchResponse: searchResponseSchema,
  documentResponse: documentResponseSchema,
  operationResponse: operationResponseSchema,
} as const;
