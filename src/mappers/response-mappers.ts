import {
  BookingResponse,
  CustomerSearchResult,
  DocumentPrintResult,
  OperationResponse,
  Customer,
  CancelResponseData,
  PaymentResponseData,
  GenderType,
  CustomerStatusType,
  PricingItemType,
} from '../types/api-interfaces';
import { createDateTimeString, createDateString } from '../utils/date-helpers';
import {
  mapCustomerTypeFromXml,
  mapCustomerStatusFromXml,
  mapBookingStatusFromXml,
} from './type-mappers';
import {
  BookingFile,
  SearchMasterRecordRS,
  PrintBookingDocumentRS,
  BookingFileRS,
  CancelFileRS,
  FilePaymentListRS,
  MasterRecordDetail,
  CustomerRecordRS,
} from '../types/interfaces';
import { mapPassengerFromXml, mapServiceFromXml } from './request-mappers';

// ===== CUSTOMER MAPPERS =====

export function mapCustomerFromXml(xml: MasterRecordDetail): Customer {
  const nameParts = (xml.Name ?? '').split(' ');
  const lastName = nameParts.pop() ?? '';
  const firstName = nameParts.join(' ') ?? xml.Name;

  return {
    id: xml['@RecordCode'],
    type: mapCustomerTypeFromXml(xml.RecordType),
    status: mapCustomerStatusFromXml(xml.RecordStatus ?? ''),
    personalInfo: {
      title: xml.Moniker,
      firstName,
      lastName,
      dateOfBirth: xml.BirthDate ? createDateString(xml.BirthDate) : undefined,
      gender:
        xml.Gender === 'M' ? GenderType.MALE : xml.Gender === 'F' ? GenderType.FEMALE : undefined,
      nationality: xml.CitizenshipCode,
    },
    contact: {
      email: xml.Email ? { address: xml.Email } : undefined,
      phone: xml.FirstPhoneNumber
        ? { number: xml.FirstPhoneNumber }
        : undefined,
      mobile: xml.MobilePhone ? { number: xml.MobilePhone } : undefined,
    },
    address: xml.Address
      ? {
          street: xml.Address,
          city: xml.CityName,
          state: xml.CountyCode,
          postalCode: xml.ZipCode,
          country: xml.StateCode,
        }
      : undefined,
    businessInfo:
      xml.VatCode || xml.FiscalCode
        ? {
            companyName: undefined,
            taxId: xml.VatCode || xml.FiscalCode,
            licenseNumber: undefined,
          }
        : undefined,
    preferences: {
      language: xml.LanguageCode,
      currency: xml.FinancialDetail?.['@CurrencyCode'],
      communicationMethod: undefined,
    },
  };
}

export function mapCustomerResponseFromXml(
  xml: CustomerRecordRS | undefined
): OperationResponse<Customer> {
  if (!xml) {
    return {
      success: false,
      message: 'Invalid XML response',
      data: undefined,
    };
  }

  if (!xml.MasterRecordDetail) {
    return {
      success: false,
      message: 'No master record in response',
      data: undefined,
    };
  }

  const customer = mapCustomerFromXml(xml.MasterRecordDetail);
  return {
    success: true,
    message: 'Operation successful',
    data: customer,
  };
}

// ===== BOOKING RESPONSE MAPPERS =====

export function mapBookingFromXml(xml: BookingFile): BookingResponse {
  return {
    id: xml.BookingFileCode,
    status: mapBookingStatusFromXml(xml.BookingFileStatus['@Value']),
    createdAt: createDateTimeString(xml.CreationDate),
    updatedAt: createDateTimeString(xml.CreationDate), // Aves doesn't have LastModified in same format
    customer: mapCustomerFromXml({
      '@RecordCode': xml.CustomerRecordCode,
      RecordType: 'CUSTOMER',
      Name: xml.CustomerName,
      LanguageCode: '01',
      Email: xml.CustomerEmail,
    }),
    passengers: xml.PassengerList.PassengerDetail.map(mapPassengerFromXml),
    services:
      xml.BookedServiceList?.BookedServiceDetail.map(mapServiceFromXml) || [],
    pricing: {
      totalAmount: {
        currency: xml.TotalAmountDetail?.CurrencyCode || 'EUR',
        amount: parseFloat(
          xml.TotalAmountDetail?.TotalAmountAfterDiscount || '0'
        ),
      },
      breakdowns: undefined,
    },
  };
}

export function mapBookingResponseFromXml(
  xml: BookingFileRS | undefined
): OperationResponse<BookingResponse> {
  if (!xml) {
    return {
      success: false,
      message: 'Invalid XML response',
      data: undefined,
    };
  }

  const success = xml.OperationResult['@Status'] === 'SUCCESS';

  if (!success || !xml.BookingFile) {
    return {
      success,
      message: xml?.OperationResult['@Message'],
      data: undefined,
    };
  }

  const booking = mapBookingFromXml(xml.BookingFile);
  return {
    success,
    message: xml.OperationResult['@Message'],
    data: booking,
  };
}

// ===== SEARCH RESPONSE MAPPERS =====

export function mapSearchResponseFromXml(
  xml: SearchMasterRecordRS | undefined,
  requestPagination?: { pages: number; page: number }
): CustomerSearchResult {
  const defaultPages = 50;
  const defaultPage = 1;

  const pageSize = requestPagination?.pages || defaultPages;
  const page = requestPagination?.page || defaultPage;

  if (!xml || !xml.MasterRecordList) {
    return {
      customers: [],
      pagination: {
        page,
        pages: 1,
        totalItems: 0,
        hasMore: false,
      },
    };
  }

  const customers =
    xml.MasterRecordList.MasterRecordDetail.map(mapCustomerFromXml);
  const totalItems = customers.length;
  const hasMore = totalItems === pageSize;
  const pages = hasMore ? page + 1 : page;

  return {
    customers,
    pagination: {
      page,
      pages,
      totalItems,
      hasMore,
    },
  };
}

// ===== DOCUMENT RESPONSE MAPPERS =====

export function mapDocumentResponseFromXml(
  xml: PrintBookingDocumentRS | undefined
): OperationResponse<DocumentPrintResult> {
  if (!xml) {
    return {
      success: false,
      message: 'Invalid XML response',
      data: undefined,
    };
  }

  const documents =
    xml.BaseDocumentAndAttachments?.SingleBaseDocumentOrAttachment.map(
      (doc) => ({
        fileName: doc.DocFileName,
        content: doc.Base64DocContent,
        contentSize: doc.Base64DocContent?.length || 0,
      })
    ) || [];

  const additionalDocuments = xml.AdditionalDocuments?.AdditionalDocument.map(
    (additionalDoc) => ({
      emailRecipient: additionalDoc.EmailRecipient,
      documents:
        additionalDoc.BaseDocumentAndAttachments?.SingleBaseDocumentOrAttachment.map(
          (doc) => ({
            fileName: doc.DocFileName,
            content: doc.Base64DocContent,
            contentSize: doc.Base64DocContent?.length || 0,
          })
        ) || [],
    })
  );

  const result: DocumentPrintResult = {
    emailRecipient: xml.EmailRecipient,
    documents,
    additionalDocuments,
  };

  return {
    success: true,
    message: 'Documents generated successfully',
    data: result,
  };
}

// ===== CANCEL RESPONSE MAPPERS =====

export function mapCancelResponseFromXml(
  xml: CancelFileRS | undefined
): OperationResponse<CancelResponseData> {
  if (!xml) {
    return {
      success: false,
      message: 'Invalid XML response',
      data: undefined,
    };
  }

  const success = xml.OperationResult['@Status'] === 'SUCCESS';

  if (!success) {
    return {
      success,
      message: xml?.OperationResult['@Message'],
      data: undefined,
    };
  }

  return {
    success,
    message: xml.OperationResult['@Message'],
    data: {
      refundInfo: xml.OperationResult.RefundInfo
        ? {
            refundAmount: xml.OperationResult.RefundInfo['@RefundAmount'],
            currency: xml.OperationResult.RefundInfo['@Currency'],
            refundMethod: xml.OperationResult.RefundInfo['@RefundMethod'],
            processingTime: xml.OperationResult.RefundInfo['@ProcessingTime'],
          }
        : undefined,
    },
  };
}

// ===== PAYMENT RESPONSE MAPPERS =====

export function mapPaymentResponseFromXml(
  xml: FilePaymentListRS | undefined
): OperationResponse<PaymentResponseData> {
  if (!xml) {
    return {
      success: false,
      message: 'Invalid XML response',
      data: undefined,
    };
  }

  return {
    success: true,
    message: 'Payment registered successfully',
    data: {
      booking: undefined as any, // Simplified response structure
      paymentSummary: {
        totalPaid: {
          currency: 'EUR',
          amount: 0,
        },
        outstandingAmount: {
          currency: 'EUR',
          amount: 0,
        },
        paymentHistory: [],
      },
    },
  };
}
