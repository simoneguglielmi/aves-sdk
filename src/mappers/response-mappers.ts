// Mappers to convert XML responses to clean API responses
import {
  BookingResponse,
  SearchResponse,
  DocumentResponse,
  OperationResponse,
  Customer,
} from '../types/api-interfaces';
import { createDateTimeString, createDateString } from '../utils/date-helpers';
import {
  mapCustomerTypeFromXml,
  mapCustomerStatusFromXml,
  mapCommunicationMethodFromXml,
  mapBookingStatusFromXml,
  mapPricingItemTypeFromXml,
  mapDeliveryStatusFromXml,
} from './type-mappers';
import {
  BookingFile,
  SearchMasterRecordRS,
  PrintBookingDocumentRS,
  BookingFileRS,
  CancelFileRS,
  FilePaymentListRS,
  MasterRecord,
} from '../types/interfaces';
import {
  mapPassengerFromXml,
  mapServiceFromXml,
  mapPaymentFromXml,
  mapAddressFromXml,
  mapContactFromXml,
} from './request-mappers';

// ===== CUSTOMER MAPPERS =====

export function mapCustomerFromXml(xml: MasterRecord): Customer {
  return {
    id: xml['@MasterRecordID'],
    type: mapCustomerTypeFromXml(xml['@Type']),
    status: mapCustomerStatusFromXml(xml['@Status']),
    personalInfo: xml.PersonalInfo
      ? {
          title: xml.PersonalInfo.Title,
          firstName: xml.PersonalInfo.FirstName,
          lastName: xml.PersonalInfo.LastName,
          middleName: xml.PersonalInfo.MiddleName,
          dateOfBirth: xml.PersonalInfo.DateOfBirth
            ? createDateString(xml.PersonalInfo.DateOfBirth)
            : undefined,
          gender: xml.PersonalInfo.Gender === 'M' ? 'male' : 'female',
          nationality: xml.PersonalInfo.Nationality,
        }
      : undefined,
    contact: xml.ContactInfo ? mapContactFromXml(xml.ContactInfo) : undefined,
    address: xml.Address ? mapAddressFromXml(xml.Address) : undefined,
    businessInfo: xml.BusinessInfo
      ? {
          companyName: xml.BusinessInfo.CompanyName,
          taxId: xml.BusinessInfo.TaxID,
          licenseNumber: xml.BusinessInfo.LicenseNumber,
        }
      : undefined,
    preferences: xml.Preferences
      ? {
          language: xml.Preferences.Language,
          currency: xml.Preferences.Currency,
          communicationMethod: xml.Preferences.CommunicationMethod
            ? mapCommunicationMethodFromXml(xml.Preferences.CommunicationMethod)
            : undefined,
        }
      : undefined,
  };
}

// ===== BOOKING RESPONSE MAPPERS =====

export function mapBookingFromXml(xml: BookingFile): BookingResponse {
  return {
    id: xml['@BookingFileID'],
    status: mapBookingStatusFromXml(xml['@Status']),
    createdAt: createDateTimeString(xml['@CreationDate']),
    updatedAt: createDateTimeString(xml['@LastModified']),
    customer: mapCustomerFromXml(xml.CustomerInfo),
    passengers: xml.PassengerList.Passenger.map(mapPassengerFromXml),
    services: xml.ServiceList.Service.map(mapServiceFromXml),
    pricing: {
      totalAmount: {
        currency: xml.Pricing.TotalAmount['@Currency'],
        amount: xml.Pricing.TotalAmount['@Amount'],
      },
      breakdowns: xml.Pricing.Breakdown?.Item.map((item) => ({
        type: mapPricingItemTypeFromXml(item['@Type']),
        description: item['@Description'],
        amount: item['@Amount'],
      })),
    },
  };
}

export function mapBookingResponseFromXml(
  xml: BookingFileRS
): BookingResponse & OperationResponse {
  const booking = mapBookingFromXml(xml.BookingFile);
  return {
    ...booking,
    success: xml.OperationResult['@Status'] === 'SUCCESS',
    message: xml.OperationResult['@Message'],
    data: booking,
  };
}

// ===== SEARCH RESPONSE MAPPERS =====

export function mapSearchResponseFromXml(
  xml: SearchMasterRecordRS
): SearchResponse {
  return {
    results: xml.SearchResults.MasterRecord.map(mapCustomerFromXml),
    pagination: xml.SearchResults.PaginationInfo
      ? {
          totalRecords: xml.SearchResults.PaginationInfo['@TotalRecords'],
          pageSize: xml.SearchResults.PaginationInfo['@PageSize'],
          pageNumber: xml.SearchResults.PaginationInfo['@PageNumber'],
          totalPages: xml.SearchResults.PaginationInfo['@TotalPages'],
        }
      : undefined,
  };
}

// ===== DOCUMENT RESPONSE MAPPERS =====

export function mapDocumentResponseFromXml(
  xml: PrintBookingDocumentRS
): DocumentResponse & OperationResponse {
  return {
    id: xml.DocumentInfo['@DocumentID'],
    type: xml.DocumentInfo['@DocumentType'],
    format: xml.DocumentInfo['@Format'],
    size: xml.DocumentInfo['@Size'],
    createdAt: createDateTimeString(xml.DocumentInfo['@CreationDate']),
    downloadUrl: xml.DocumentInfo.DownloadURL,
    deliveryStatus: xml.DocumentInfo.DeliveryStatus
      ? {
          status: mapDeliveryStatusFromXml(
            xml.DocumentInfo.DeliveryStatus['@Status']
          ),
          method: xml.DocumentInfo.DeliveryStatus['@Method'],
          address: xml.DocumentInfo.DeliveryStatus['@Address'],
        }
      : undefined,
    success: xml.OperationResult['@Status'] === 'SUCCESS',
    message: xml.OperationResult['@Message'],
  };
}

// ===== CANCEL RESPONSE MAPPERS =====

export function mapCancelResponseFromXml(xml: CancelFileRS): OperationResponse {
  return {
    success: xml.OperationResult['@Status'] === 'SUCCESS',
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
  xml: FilePaymentListRS
): OperationResponse {
  const booking = mapBookingFromXml(xml.BookingFile);
  return {
    success: xml.OperationResult['@Status'] === 'SUCCESS',
    message: xml.OperationResult['@Message'],
    data: {
      booking,
      paymentSummary: {
        totalPaid: {
          currency: xml.PaymentSummary.TotalPaid['@Currency'],
          amount: xml.PaymentSummary.TotalPaid['@Amount'],
        },
        outstandingAmount: {
          currency: xml.PaymentSummary.OutstandingAmount['@Currency'],
          amount: xml.PaymentSummary.OutstandingAmount['@Amount'],
        },
        paymentHistory:
          xml.PaymentSummary.PaymentHistory.Payment.map(mapPaymentFromXml),
      },
    },
  };
}

// ===== MASTER RECORD MAPPERS =====

export function mapMasterRecordFromXml(xml: MasterRecord): any {
  return {
    id: xml['@MasterRecordID'],
    type: xml['@Type'].toLowerCase(),
    status: xml['@Status'].toLowerCase(),
    personalInfo: xml.PersonalInfo
      ? {
          title: xml.PersonalInfo.Title,
          firstName: xml.PersonalInfo.FirstName,
          lastName: xml.PersonalInfo.LastName,
          middleName: xml.PersonalInfo.MiddleName,
          dateOfBirth: xml.PersonalInfo.DateOfBirth,
          gender: xml.PersonalInfo.Gender?.toLowerCase(),
          nationality: xml.PersonalInfo.Nationality,
        }
      : undefined,
    contact: xml.ContactInfo ? mapContactFromXml(xml.ContactInfo) : undefined,
    address: xml.Address ? mapAddressFromXml(xml.Address) : undefined,
    businessInfo: xml.BusinessInfo
      ? {
          companyName: xml.BusinessInfo.CompanyName,
          taxId: xml.BusinessInfo.TaxID,
          licenseNumber: xml.BusinessInfo.LicenseNumber,
        }
      : undefined,
    preferences: xml.Preferences
      ? {
          language: xml.Preferences.Language,
          currency: xml.Preferences.Currency,
          communicationMethod:
            xml.Preferences.CommunicationMethod?.toLowerCase(),
        }
      : undefined,
  };
}
