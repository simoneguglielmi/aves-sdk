import {
  CustomerAddress,
  CustomerContact,
  BookingPassenger,
  BookingService,
  BookingPayment,
  SearchCustomerRequest,
  CreateBookingRequest,
  CancelBookingRequest,
  PrintDocumentRequest,
  AddPaymentRequest,
} from '../types/api-interfaces';
import { createDateString } from '../utils/date-helpers';
import {
  mapAddressTypeToXml,
  mapAddressTypeFromXml,
  mapContactTypeToXml,
  mapContactTypeFromXml,
  mapEmailTypeToXml,
  mapEmailTypeFromXml,
  mapPassengerTypeToXml,
  mapPassengerTypeFromXml,
  mapTitleToXml,
  mapTitleFromXml,
  mapServiceTypeToXml,
  mapServiceTypeFromXml,
  mapServiceStatusToXml,
  mapServiceStatusFromXml,
  mapPaymentTypeToXml,
  mapPaymentTypeFromXml,
  mapPaymentStatusToXml,
  mapPaymentStatusFromXml,
  mapCustomerTypeToXml,
  mapBookingTypeToXml,
  mapPriorityToXml,
  mapSpecialRequestTypeToXml,
  mapCancelReasonToXml,
  mapRefundMethodToXml,
  mapDocumentTypeToXml,
  mapDocumentFormatToXml,
  mapDeliveryMethodToXml,
  mapSearchOperatorToXml,
  mapGenderToXml,
  mapGenderFromXml,
} from './type-mappers';
import {
  Address as XmlAddress,
  ContactInfo as XmlContactInfo,
  Passenger as XmlPassenger,
  Service as XmlService,
  Payment as XmlPayment,
  SearchMasterRecordRQ,
  BookFileRQ,
  CancelFileRQ,
  PrintBookingDocumentRQ,
  FilePaymentListRQ,
} from '../types/interfaces';

// ===== ADDRESS MAPPERS =====

export function mapAddressToXml(clean: CustomerAddress): XmlAddress {
  return {
    '@Type': clean.type ? mapAddressTypeToXml(clean.type) : undefined,
    Street: clean.street,
    City: clean.city,
    State: clean.state,
    PostalCode: clean.postalCode,
    Country: clean.country,
  };
}

export function mapAddressFromXml(xml: XmlAddress): CustomerAddress {
  return {
    type: xml['@Type'] ? mapAddressTypeFromXml(xml['@Type']) : undefined,
    street: xml.Street,
    city: xml.City,
    state: xml.State,
    postalCode: xml.PostalCode,
    country: xml.Country,
  };
}

// ===== CONTACT MAPPERS =====

export function mapContactToXml(clean: CustomerContact): XmlContactInfo {
  return {
    Phone: clean.phone
      ? {
          '@Type': clean.phone.type
            ? mapContactTypeToXml(clean.phone.type)
            : undefined,
          '@Number': clean.phone.number,
        }
      : undefined,
    Email: clean.email
      ? {
          '@Type': clean.email.type
            ? mapEmailTypeToXml(clean.email.type)
            : undefined,
          '@Address': clean.email.address,
        }
      : undefined,
  };
}

export function mapContactFromXml(xml: XmlContactInfo): CustomerContact {
  return {
    phone: xml.Phone
      ? {
          type: xml.Phone['@Type']
            ? mapContactTypeFromXml(xml.Phone['@Type'])
            : undefined,
          number: xml.Phone['@Number'],
        }
      : undefined,
    email: xml.Email
      ? {
          type: xml.Email['@Type']
            ? mapEmailTypeFromXml(xml.Email['@Type'])
            : undefined,
          address: xml.Email['@Address'],
        }
      : undefined,
  };
}

// ===== PASSENGER MAPPERS =====

export function mapPassengerToXml(clean: BookingPassenger): XmlPassenger {
  return {
    '@PassengerID': clean.id,
    '@Type': mapPassengerTypeToXml(clean.type),
    '@Title': clean.title ? mapTitleToXml(clean.title) : undefined,
    FirstName: clean.firstName,
    LastName: clean.lastName,
    MiddleName: clean.middleName,
    DateOfBirth: clean.dateOfBirth,
    Gender: clean.gender ? mapGenderToXml(clean.gender) : undefined,
    Nationality: clean.nationality,
    Passport: clean.passport
      ? {
          '@Number': clean.passport.number,
          '@ExpiryDate': clean.passport.expiryDate,
          '@IssuingCountry': clean.passport.issuingCountry,
        }
      : undefined,
    Address: clean.address ? mapAddressToXml(clean.address) : undefined,
    ContactInfo: clean.contact ? mapContactToXml(clean.contact) : undefined,
  };
}

export function mapPassengerFromXml(xml: XmlPassenger): BookingPassenger {
  return {
    id: xml['@PassengerID'],
    type: mapPassengerTypeFromXml(xml['@Type']),
    title: xml['@Title'] ? mapTitleFromXml(xml['@Title']) : undefined,
    firstName: xml.FirstName,
    lastName: xml.LastName,
    middleName: xml.MiddleName,
    dateOfBirth: xml.DateOfBirth
      ? createDateString(xml.DateOfBirth)
      : undefined,
    gender: xml.Gender ? mapGenderFromXml(xml.Gender) : undefined,
    nationality: xml.Nationality,
    passport: xml.Passport
      ? {
          number: xml.Passport['@Number'],
          expiryDate: createDateString(xml.Passport['@ExpiryDate']),
          issuingCountry: xml.Passport['@IssuingCountry'],
        }
      : undefined,
    address: xml.Address ? mapAddressFromXml(xml.Address) : undefined,
    contact: xml.ContactInfo ? mapContactFromXml(xml.ContactInfo) : undefined,
  };
}

// ===== SERVICE MAPPERS =====

export function mapServiceToXml(clean: BookingService): XmlService {
  return {
    '@ServiceID': clean.id,
    '@Type': mapServiceTypeToXml(clean.type),
    '@Status': mapServiceStatusToXml(clean.status),
    ServiceDetails: {
      Code: clean.code,
      Name: clean.name,
      Description: clean.description,
      StartDate: clean.startDate,
      EndDate: clean.endDate,
      Price: clean.price
        ? {
            '@Currency': clean.price.currency,
            '@Amount': clean.price.amount,
          }
        : undefined,
    },
  };
}

export function mapServiceFromXml(xml: XmlService): BookingService {
  return {
    id: xml['@ServiceID'],
    type: mapServiceTypeFromXml(xml['@Type']),
    status: mapServiceStatusFromXml(xml['@Status']),
    code: xml.ServiceDetails.Code,
    name: xml.ServiceDetails.Name,
    description: xml.ServiceDetails.Description,
    startDate: xml.ServiceDetails.StartDate
      ? createDateString(xml.ServiceDetails.StartDate)
      : undefined,
    endDate: xml.ServiceDetails.EndDate
      ? createDateString(xml.ServiceDetails.EndDate)
      : undefined,
    price: xml.ServiceDetails.Price
      ? {
          currency: xml.ServiceDetails.Price['@Currency'],
          amount: xml.ServiceDetails.Price['@Amount'],
        }
      : undefined,
  };
}

// ===== PAYMENT MAPPERS =====

export function mapPaymentToXml(clean: BookingPayment): XmlPayment {
  return {
    '@PaymentID': clean.id,
    '@Type': mapPaymentTypeToXml(clean.type),
    '@Status': mapPaymentStatusToXml(clean.status),
    Amount: {
      '@Currency': clean.amount.currency,
      '@Amount': clean.amount.amount,
    },
    PaymentDetails: clean.details
      ? {
          CardNumber: clean.details.cardNumber,
          ExpiryDate: clean.details.expiryDate,
          CardHolderName: clean.details.cardHolderName,
        }
      : undefined,
  };
}

export function mapPaymentFromXml(xml: XmlPayment): BookingPayment {
  return {
    id: xml['@PaymentID'],
    type: mapPaymentTypeFromXml(xml['@Type']),
    status: mapPaymentStatusFromXml(xml['@Status']),
    amount: {
      currency: xml.Amount['@Currency'],
      amount: xml.Amount['@Amount'],
    },
    details: xml.PaymentDetails
      ? {
          cardNumber: xml.PaymentDetails.CardNumber,
          expiryDate: xml.PaymentDetails.ExpiryDate,
          cardHolderName: xml.PaymentDetails.CardHolderName,
        }
      : undefined,
  };
}

// ===== REQUEST MAPPERS =====

export function mapSearchCustomerToXml(
  clean: SearchCustomerRequest
): SearchMasterRecordRQ {
  return {
    SearchCriteria: {
      MasterRecordType: mapCustomerTypeToXml(clean.type),
      SearchFields: {
        Field: clean.fields.map((field) => ({
          '@Name': field.name,
          '@Value': field.value,
          '@Operator': field.operator
            ? mapSearchOperatorToXml(field.operator)
            : undefined,
        })),
      },
      Pagination: clean.pagination
        ? {
            '@PageSize': clean.pagination.pageSize,
            '@PageNumber': clean.pagination.pageNumber,
          }
        : undefined,
    },
  };
}

export function mapCreateBookingToXml(clean: CreateBookingRequest): BookFileRQ {
  return {
    BookingDetails: {
      '@BookingType': mapBookingTypeToXml(clean.type),
      '@Priority': mapPriorityToXml(clean.priority),
      CustomerInfo: {
        '@CustomerID': clean.customerId,
        CustomerDetails: clean.customerDetails,
      },
      PassengerList: {
        Passenger: clean.passengers.map(mapPassengerToXml),
      },
      SelectedServiceList: {
        Service: clean.services.map(mapServiceToXml),
      },
      SpecialRequests: clean.specialRequests
        ? {
            Request: clean.specialRequests.map((req) => ({
              '@Type': mapSpecialRequestTypeToXml(req.type),
              '@Description': req.description,
            })),
          }
        : undefined,
    },
  };
}

export function mapCancelBookingToXml(
  clean: CancelBookingRequest
): CancelFileRQ {
  return {
    '@BookingFileID': clean.bookingId,
    CancellationDetails: {
      '@Reason': mapCancelReasonToXml(clean.reason),
      '@Description': clean.description,
      RefundRequest: clean.refundRequest
        ? {
            '@Amount': clean.refundRequest.amount,
            '@Currency': clean.refundRequest.currency,
            '@Method': mapRefundMethodToXml(clean.refundRequest.method),
          }
        : undefined,
    },
  };
}

export function mapPrintDocumentToXml(
  clean: PrintDocumentRequest
): PrintBookingDocumentRQ {
  return {
    '@BookingFileID': clean.bookingId,
    DocumentRequest: {
      '@DocumentType': mapDocumentTypeToXml(clean.documentType),
      '@Format': mapDocumentFormatToXml(clean.format),
      '@Language': clean.language,
      DeliveryMethod: clean.deliveryMethod
        ? {
            '@Type': mapDeliveryMethodToXml(clean.deliveryMethod.type),
            '@Address': clean.deliveryMethod.address,
          }
        : undefined,
    },
  };
}

export function mapAddPaymentToXml(
  clean: AddPaymentRequest
): FilePaymentListRQ {
  return {
    '@BookingFileID': clean.bookingId,
    PaymentList: {
      Payment: clean.payments.map(mapPaymentToXml),
    },
  };
}
