import {
  Customer,
  BookingPassenger,
  BookingService,
  SearchCustomerRequest,
  CreateBookingRequest,
  CancelBookingRequest,
  PrintDocumentRequest,
  AddPaymentRequest,
  BookingStatusType,
  PassengerType,
  GenderType,
  ServiceType,
  ServiceStatusType,
} from '../types/api-interfaces';
import { createDateString } from '../utils/date-helpers';
import {
  mapCustomerTypeToXml,
  mapCustomerStatusToXml,
  mapBookingStatusToXml,
  mapDocumentTypeToXml,
  mapGenderToXml,
} from './type-mappers';
import {
  MasterRecordDetail,
  PassengerDetail,
  SearchMasterRecordRQ,
  BookFileRQ,
  CancelFileRQ,
  PrintBookingDocumentRQ,
  FilePaymentListRQ,
  ManageMasterRecordRQ,
  ModiFileHeaderRQ,
  ModFileServicesRQ,
  SetStatusRQ,
  SetStatusServiceRQ,
  SelectedServiceDetail,
  BookedServiceDetail,
} from '../types/interfaces';
import { InsertCriteria } from '../types/common';

// ===== AVES XML MAPPERS =====

export function mapPassengerFromXml(xml: PassengerDetail): BookingPassenger {
  const nameParts = (xml.Name || '').split(' ');
  const lastName = nameParts.pop() || '';
  const firstName = nameParts.join(' ') || xml.Name;

  const typeMap: Record<string, PassengerType> = {
    AD: PassengerType.ADULT,
    CH: PassengerType.CHILD,
    IN: PassengerType.INFANT,
    OV: PassengerType.SENIOR,
  };

  return {
    id: xml['@RPH'],
    type: typeMap[xml.CategoryCode] || PassengerType.ADULT,
    title: undefined,
    firstName,
    lastName,
    dateOfBirth: xml.BirthDate ? createDateString(xml.BirthDate) : undefined,
    gender: xml.Sex === 'M' ? GenderType.MALE : xml.Sex === 'F' ? GenderType.FEMALE : undefined,
    nationality: xml.NationCode || xml.CitizenshipCode,
    passport: xml.IDDocInfo
      ? {
          number: xml.IDDocInfo['@IDCode'] || '',
          expiryDate: createDateString(xml.IDDocInfo['@IDExpireDate'] || ''),
          issuingCountry: '',
        }
      : undefined,
    address: undefined,
    contact:
      xml.eMail || xml.PhoneNumber
        ? {
            email: xml.eMail ? { address: xml.eMail } : undefined,
            phone: xml.PhoneNumber ? { number: xml.PhoneNumber } : undefined,
          }
        : undefined,
  };
}

// ===== SERVICE MAPPERS =====

export function mapServiceFromXml(xml: BookedServiceDetail): BookingService {
  return {
    id: xml['@ServiceCode'],
    type: ServiceType.HOTEL, // Default, should be determined from TOServiceType
    status: ServiceStatusType.PENDING,
    code: xml['@ServiceCode'],
    name: xml.FirstDescription,
    description: xml.SecondDescription,
    startDate: xml.StartDate ? createDateString(xml.StartDate) : undefined,
    endDate: xml.EndDate ? createDateString(xml.EndDate) : undefined,
    price: xml.ServiceTotalAmountDetail?.ServiceTotalPrice
      ? {
          currency: 'EUR',
          amount: parseFloat(xml.ServiceTotalAmountDetail.ServiceTotalPrice),
        }
      : undefined,
  };
}

// ===== REQUEST MAPPERS =====

const buildSearchMasterRecordRQ = (
  request: SearchCustomerRequest,
  data: SearchMasterRecordRQ
): SearchMasterRecordRQ => {
  switch (request.type) {
    case 'code':
      data.RecordCode = request.code;
      break;
    case 'name':
      data.Name = request.name;
      if (request.city) {
        data.City = request.city;
      }
      break;
    case 'vat_code':
      data.VatCode = request.vatCode;
      if (request.phoneNumber) {
        data.PhoneNumber = request.phoneNumber;
      }
      break;
    case 'zone':
      data.ZipCode = request.zipCode;
      if (request.city) {
        data.City = request.city;
      }
      if (request.countyCode) {
        data.CountyCode = request.countyCode;
      }
      break;
    case 'category':
      data.CategoryCode = request.categoryCode;
      break;
    case 'email':
      data.Email = request.email;
      break;
    case 'last_mod_date':
      data.LastModificationDate = {
        '@MinDate': request.from,
        '@MaxDate': request.to,
      };
      break;
    case 'search_field':
      data.SearchFieldValue = request.searchField;
      break;
    case 'external_ref_code':
      data.SearchFieldValue = request.externalRefCode;
      break;
  }
  return data;
};

export function mapSearchCustomerToXml(
  request: SearchCustomerRequest
): SearchMasterRecordRQ {
  const result: SearchMasterRecordRQ = {
    SearchType:
      request.type.toUpperCase() as SearchMasterRecordRQ['SearchType'],
  };

  return buildSearchMasterRecordRQ(request, result);
}

export function mapCustomerToXml(data: Customer): MasterRecordDetail {
  const fullName = data.personalInfo
    ? `${data.personalInfo.firstName} ${data.personalInfo.lastName}`.trim()
    : data.id;

  return {
    '@RecordCode': data.id,
    RecordType: mapCustomerTypeToXml(data.type),
    Name: fullName,
    LanguageCode: data.preferences?.language || '01',

    // Personal Info
    Moniker: data.personalInfo?.title,
    Gender: data.personalInfo?.gender
      ? mapGenderToXml(data.personalInfo?.gender)
      : undefined,
    BirthDate: data.personalInfo?.dateOfBirth,
    CitizenshipCode: data.personalInfo?.nationality,

    // Contact Info
    Email: data.contact?.email?.address,
    FirstPhoneNumber: data.contact?.phone?.number,
    MobilePhone: data.contact?.phone?.number,

    // Address
    Address: data.address?.street,
    CityName: data.address?.city,
    StateCode: data.address?.country,
    ZipCode: data.address?.postalCode,

    // Business Info
    FiscalCode: data.businessInfo?.taxId,
    VatCode: data.businessInfo?.taxId,

    // Status
    RecordStatus: mapCustomerStatusToXml(data.status),

    // Preferences
    FinancialDetail: data.preferences?.currency
      ? {
          '@CurrencyCode': data.preferences.currency,
        }
      : undefined,
  };
}

export function mapCreateBookingToXml(data: CreateBookingRequest): BookFileRQ {
  const customerDetail: MasterRecordDetail = data.customerDetails
    ? mapCustomerToXml(data.customerDetails)
    : ({
        '@RecordCode': data.customerId || '',
        RecordType: 'CUSTOMER',
        Name: 'Customer',
        LanguageCode: '01',
      } as MasterRecordDetail);

  return {
    CustomerDetail: customerDetail,
    CurrencyCode: data.currency,
    BookingFileStatus: {
      '@Value': 'QUOTATION',
    },
    StatisticCodes: data.statisticCodes
      ? {
          '@sCode1': data.statisticCodes.code1,
          '@sCode2': data.statisticCodes.code2,
          '@sCode3': data.statisticCodes.code3,
          '@sCode4': data.statisticCodes.code4,
          '@sCode5': data.statisticCodes.code5,
          '@sCode6': data.statisticCodes.code6,
        }
      : undefined,
    Destination: data.destination
      ? {
          '@Code': data.destination.code,
          '@IataCode': data.destination.iataCode,
          '@NationCode': data.destination.nationCode,
        }
      : undefined,
    BookingFileDescription: data.description,
    StartDate: data.startDate,
    EndDate: data.endDate,
    BookingFileDocument:
      data.printDocument !== undefined ||
      data.sendDocumentViaEmail !== undefined
        ? {
            '@PrintDoc': data.printDocument || false,
            '@SendDocViaEmail': data.sendDocumentViaEmail || false,
          }
        : undefined,
    DeadlineList: data.deadlines
      ? {
          DeadlineDetail: data.deadlines.map((d) => ({
            '@DeadlineCode': d.code,
            '@Description': d.description,
            '@ExpireDate': d.expireDate,
          })),
        }
      : undefined,
    PassengerList: {
      PassengerDetail: data.passengers.map((p, index) =>
        mapPassengerToAvesXml(p, index + 1)
      ),
    },
    SelectedServiceList: {
      SelectedServiceDetail: data.services.map((s, index) =>
        mapServiceToAvesXml(s, index + 1)
      ),
    },
  };
}

// Helper function to map API passenger to Aves PassengerDetail
function mapPassengerToAvesXml(
  passenger: BookingPassenger,
  index: number
): PassengerDetail {
  return {
    '@RPH': String(index).padStart(3, '0'), // 001, 002, 003...
    Name: `${passenger.firstName} ${passenger.lastName}`,
    CategoryCode:
      passenger.type === PassengerType.ADULT
        ? 'AD'
        : passenger.type === PassengerType.CHILD
        ? 'CH'
        : passenger.type === PassengerType.INFANT
        ? 'IN'
        : 'OV',
    Sex: passenger.gender === GenderType.MALE ? 'M' : 'F',
    BirthDate: passenger.dateOfBirth,
    eMail: passenger.contact?.email?.address,
    PhoneNumber: passenger.contact?.phone?.number,
  };
}

// Helper function to map API service to Aves SelectedServiceDetail
function mapServiceToAvesXml(
  service: BookingService,
  sessionNumber: number
): SelectedServiceDetail {
  return {
    '@sCode': service.id,
    AvesServiceType: 'TOP', // Default - should be determined from service type
    StartDate: service.startDate || new Date().toISOString(),
    EndDate: service.endDate || new Date().toISOString(),
    Qty: 1, // Default quantity
    Pax: 1, // Default passengers
    AvesSession: sessionNumber,
  };
}

export function mapCancelBookingToXml(
  data: CancelBookingRequest
): CancelFileRQ {
  return {
    BookingFileCode: data.bookingId,
    CustomerRecordCode: data.customerId || '', // Required field
  };
}

export function mapPrintDocumentToXml(
  data: PrintDocumentRequest
): PrintBookingDocumentRQ {
  return {
    RefMasterRecordCode: data.customerId || '', // Required
    LanguageCode: data.language || '01', // Required
    BookingFileCode: data.bookingId, // Required
    InfoDocumentsToPrint: {
      InfoDocumentToPrint: [
        {
          DocumentType: mapDocumentTypeToXml(data.documentType),
        },
      ],
    },
    GetDocumentContent: data.deliveryMethod?.type === 'download',
    SendDocumentViaEmail: data.deliveryMethod?.type === 'email',
  };
}

export function mapAddPaymentToXml(data: AddPaymentRequest): FilePaymentListRQ {
  let operationType: FilePaymentListRQ['OperationType'] =
    'AbsoluteAmountsInsertion';
  if (data.operationType === 'final') {
    operationType = 'FinalAmountToAchieve';
  } else if (data.operationType === 'final_no_controls') {
    operationType = 'FinalAmountToAchieveWithoutControls';
  }

  return {
    BookingFileCode: data.bookingId,
    BookingFileRefCode: data.bookingRefCode,
    EnableMultiplePayments: data.enableMultiple ?? data.payments.length > 1,
    OperationType: operationType,
    FilePaymentList: {
      FilePaymentDetail: data.payments.map((payment) => ({
        '@PaymentDate': new Date().toISOString(),
        '@Amount': String(payment.amount?.amount || 0),
        '@PaymentType': mapPaymentTypeToAvesXml(payment.type),
      })),
    },
  };
}

// Helper to map payment type to Aves format
function mapPaymentTypeToAvesXml(
  type: string
):
  | 'C'
  | 'B'
  | 'D'
  | 'T'
  | 'P'
  | 'R'
  | 'A'
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
  | 'V' {
  const typeMap: Record<string, string> = {
    cash: 'C',
    bank: 'B',
    bank2: 'D',
    bank3: 'T',
    atm: 'P',
    creditCard: 'R',
    credit_card: 'R',
    rebate: 'A',
  };
  return (typeMap[type] || 'C') as any;
}

// ===== MASTER RECORD MANAGEMENT MAPPERS =====

export function mapCreateCustomerToXml(
  customer: Customer
): ManageMasterRecordRQ {
  const masterRecord = mapCustomerToXml(customer);
  masterRecord['@InsertCriteria'] = 'S'; // S = Insert always new record
  return {
    MasterRecordDetail: masterRecord,
  };
}

export function mapUpdateCustomerToXml(
  customer: Customer
): ManageMasterRecordRQ {
  const masterRecord = mapCustomerToXml(customer);
  masterRecord['@InsertCriteria'] = 'T'; // T = If record exists update all fields
  return {
    MasterRecordDetail: masterRecord,
  };
}

export function mapUpsertCustomerToXml(
  customer: Customer
): ManageMasterRecordRQ {
  const masterRecord = mapCustomerToXml(customer);
  masterRecord['@InsertCriteria'] = 'M'; // M = If record exists update only secondary fields
  return {
    MasterRecordDetail: masterRecord,
  };
}

export function mapUpdateBookingHeaderToXml(
  customerRecordCode: string,
  bookingFileCode: string,
  bookingFileStartDate: string,
  updates?: {
    newCustomerRecordCode?: string;
    passengers?: BookingPassenger[];
    notes?: string;
  }
): ModiFileHeaderRQ {
  return {
    BookingFileCode: bookingFileCode,
    BookingFileStartDate: bookingFileStartDate,
    CustomerRecordCode: customerRecordCode,
    NewCustomerRecordCode: updates?.newCustomerRecordCode,
    BookingNote: updates?.notes,
    PassengerList: updates?.passengers
      ? {
          PassengerDetail: updates.passengers.map((p, index) =>
            mapPassengerToAvesXml(p, index + 1)
          ),
        }
      : undefined,
  };
}

export function mapUpdateBookingServicesToXml(
  customerRecordCode: string,
  bookingFileCode: string,
  services: BookingService[]
): ModFileServicesRQ {
  return {
    CustomerRecordCode: customerRecordCode,
    BookingFileCode: bookingFileCode,
    SelectedServiceList: {
      SelectedServiceDetail: services.map((s, index) =>
        mapServiceToAvesXml(s, index + 1)
      ),
    },
  };
}

export function mapSetBookingStatusToXml(
  customerRecordCode: string,
  bookingFileCode: string,
  status: BookingStatusType,
  options?: {
    expiredDate?: string;
    optionedFileExpireDatePolicy?:
      | 'NOT_SET'
      | 'CONSIDER_HOLIDAY'
      | 'CONSIDER_HOLIDAY_AND_SATURDAY';
    backOfficeRequest?: boolean;
    printDoc?: boolean;
    sendDocViaEmail?: boolean;
    applyPenalty?: boolean;
    penaltyCode?: string;
    simulateCancelAndGetPenalty?: boolean;
  }
): SetStatusRQ {
  return {
    CustomerRecordCode: customerRecordCode,
    BookingFileCode: bookingFileCode,
    FileStatus: {
      '@Value': mapBookingStatusToXml(status),
      ...(options?.expiredDate && { '@ExpiredDate': options.expiredDate }),
      ...(options?.optionedFileExpireDatePolicy && {
        '@OptionedFileExpireDatePolicy': options.optionedFileExpireDatePolicy,
      }),
    },
    ...(options?.backOfficeRequest !== undefined && {
      BackOfficeRequest: options.backOfficeRequest,
    }),
    ...(options?.printDoc !== undefined ||
    options?.sendDocViaEmail !== undefined
      ? {
          BookingFileDocument: {
            '@PrintDoc': options.printDoc || false,
            '@SendDocViaEmail': options.sendDocViaEmail || false,
          },
        }
      : {}),
    ...(options?.applyPenalty !== undefined && {
      Penalty: {
        '@Apply': options.applyPenalty,
        ...(options.penaltyCode && { '@SpecificCode': options.penaltyCode }),
      },
    }),
    ...(options?.simulateCancelAndGetPenalty !== undefined && {
      SimulateCancelAndGetPenaltyAmount: options.simulateCancelAndGetPenalty,
    }),
  };
}

export function mapSetBookingServiceStatusToXml(
  customerRecordCode: string,
  bookingFileCode: string,
  serviceRef: string,
  statusDate?: string
): SetStatusServiceRQ {
  return {
    CustomerRecordCode: customerRecordCode,
    BookingFileCode: bookingFileCode,
    BookingServiceRef: serviceRef,
    BookingFileServiceStatus: 'NULLIFIED',
    ...(statusDate && { BookingFileServiceStatusDate: statusDate }),
  };
}
