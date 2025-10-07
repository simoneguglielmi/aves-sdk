import { z } from 'zod';

// ===== ZOD VALIDATION SCHEMAS =====

export const LanguageCodeValidation = z.enum(['01', '02']);

export const configValidationSchema = z.object({
  baseUrl: z.url(),
  hostId: z.string().length(6),
  xtoken: z.string(),
  languageCode: LanguageCodeValidation.optional(),
  timeout: z.number().optional(),
});

export const AddressValidation = z.object({
  '@Type': z.enum(['HOME', 'WORK', 'BILLING', 'DELIVERY']).optional(),
  Street: z.string().max(100).optional(),
  City: z.string().max(50).optional(),
  State: z.string().max(50).optional(),
  PostalCode: z.string().max(20).optional(),
  Country: z.string().max(50).optional(),
});

export const ContactInfoValidation = z.object({
  Phone: z
    .object({
      '@Type': z.enum(['HOME', 'WORK', 'MOBILE', 'FAX']).optional(),
      '@Number': z.string(),
    })
    .optional(),
  Email: z
    .object({
      '@Type': z.enum(['HOME', 'WORK']).optional(),
      '@Address': z.string(),
    })
    .optional(),
});

export const PassengerValidation = z.object({
  '@PassengerID': z.string().min(1),
  '@Type': z.enum(['ADT', 'CHD', 'INF']),
  '@Title': z.enum(['MR', 'MRS', 'MS', 'DR', 'PROF']).optional(),
  FirstName: z.string().min(1).max(50),
  LastName: z.string().min(1).max(50),
  DateOfBirth: z.date().optional(),
  Gender: z.enum(['M', 'F']).optional(),
  Nationality: z.string().max(3).optional(),
  Address: AddressValidation.optional(),
  ContactInfo: ContactInfoValidation.optional(),
});

export const ServiceValidation = z.object({
  '@ServiceID': z.string().min(1),
  '@Type': z.enum(['FLIGHT', 'HOTEL', 'CAR', 'TRANSFER', 'INSURANCE']),
  '@Status': z.enum(['CONFIRMED', 'PENDING', 'CANCELLED']),
  ServiceDetails: z.object({
    Code: z.string().optional(),
    Name: z.string().optional(),
    Description: z.string().optional(),
    StartDate: z.string().optional(),
    EndDate: z.string().optional(),
    Price: z
      .object({
        '@Currency': z.string(),
        '@Amount': z.number(),
      })
      .optional(),
  }),
});

export const PaymentValidation = z.object({
  '@PaymentID': z.string().min(1),
  '@Type': z.enum(['CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'CASH']),
  '@Status': z.enum(['PENDING', 'CONFIRMED', 'FAILED']),
  Amount: z.object({
    '@Currency': z.string(),
    '@Amount': z.number(),
  }),
  PaymentDetails: z
    .object({
      CardNumber: z.string().optional(),
      ExpiryDate: z.string().optional(),
      CardHolderName: z.string().optional(),
    })
    .optional(),
});

export const SearchMasterRecordRQValidation = z.object({
  SearchCriteria: z.object({
    MasterRecordType: z.enum(['CUSTOMER', 'AGENT', 'SUPPLIER']),
    SearchFields: z.object({
      Field: z.array(
        z.object({
          '@Name': z.string(),
          '@Value': z.string(),
          '@Operator': z
            .enum(['EQUALS', 'CONTAINS', 'STARTS_WITH', 'ENDS_WITH'])
            .optional(),
        })
      ),
    }),
    Pagination: z
      .object({
        '@PageSize': z.number(),
        '@PageNumber': z.number(),
      })
      .optional(),
  }),
});

export const BookFileRQValidation = z.object({
  BookingDetails: z.object({
    '@BookingType': z.enum(['INDIVIDUAL', 'GROUP', 'CORPORATE']),
    '@Priority': z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']),
    CustomerInfo: z.object({
      '@CustomerID': z.string().optional(),
      CustomerDetails: z.any().optional(), // MasterRecord validation would go here
    }),
    PassengerList: z.object({
      Passenger: z.array(PassengerValidation),
    }),
    SelectedServiceList: z.object({
      Service: z.array(ServiceValidation),
    }),
    SpecialRequests: z
      .object({
        Request: z.array(
          z.object({
            '@Type': z.enum(['MEAL', 'SEAT', 'WHEELCHAIR', 'OTHER']),
            '@Description': z.string(),
          })
        ),
      })
      .optional(),
  }),
});

export const CancelFileRQValidation = z.object({
  '@BookingFileID': z.string().min(1),
  CancellationDetails: z.object({
    '@Reason': z.enum(['CUSTOMER_REQUEST', 'NO_SHOW', 'OPERATIONAL', 'OTHER']),
    '@Description': z.string().optional(),
    RefundRequest: z
      .object({
        '@Amount': z.number(),
        '@Currency': z.string(),
        '@Method': z.enum(['ORIGINAL_PAYMENT', 'CREDIT', 'CASH']),
      })
      .optional(),
  }),
});

export const PrintBookingDocumentRQValidation = z.object({
  '@BookingFileID': z.string().min(1),
  DocumentRequest: z.object({
    '@DocumentType': z.enum([
      'CONFIRMATION',
      'INVOICE',
      'VOUCHER',
      'TICKET',
      'ALL',
    ]),
    '@Format': z.enum(['PDF', 'HTML', 'XML']),
    '@Language': z.string().optional(),
    DeliveryMethod: z
      .object({
        '@Type': z.enum(['EMAIL', 'SMS', 'DOWNLOAD']),
        '@Address': z.string().optional(),
      })
      .optional(),
  }),
});

// ===== TYPE EXPORTS =====
// Export TypeScript types inferred from Zod schemas
export type AddressValidationType = z.infer<typeof AddressValidation>;
export type ContactInfoValidationType = z.infer<typeof ContactInfoValidation>;
export type PassengerValidationType = z.infer<typeof PassengerValidation>;
export type ServiceValidationType = z.infer<typeof ServiceValidation>;
export type PaymentValidationType = z.infer<typeof PaymentValidation>;
export type SearchMasterRecordRQValidationType = z.infer<
  typeof SearchMasterRecordRQValidation
>;
export type BookFileRQValidationType = z.infer<typeof BookFileRQValidation>;
export type CancelFileRQValidationType = z.infer<typeof CancelFileRQValidation>;
export type PrintBookingDocumentRQValidationType = z.infer<
  typeof PrintBookingDocumentRQValidation
>;
