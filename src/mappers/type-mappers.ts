// ===== CUSTOMER TYPE MAPPERS =====

import {
  CustomerStatusType,
  CustomerType,
  BookingStatusType,
} from '../types/api-interfaces';
import { PrintBookingDocumentRQ } from '../types/interfaces';

export function mapCustomerTypeToXml(
  type: string
): 'CUSTOMER' | 'SUPPLIER' | 'VOUCHER' | 'SUPPLIER_VOUCHER' {
  const mapping: Record<
    string,
    'CUSTOMER' | 'SUPPLIER' | 'VOUCHER' | 'SUPPLIER_VOUCHER'
  > = {
    [CustomerType.CUSTOMER]: 'CUSTOMER',
    [CustomerType.SUPPLIER]: 'SUPPLIER',
    [CustomerType.VOUCHER]: 'VOUCHER',
    [CustomerType.SUPPLIER_VOUCHER]: 'SUPPLIER_VOUCHER',
  };
  return mapping[type] || 'CUSTOMER';
}

export function mapCustomerTypeFromXml(type: string): CustomerType {
  const mapping: Record<string, CustomerType> = {
    CUSTOMER: CustomerType.CUSTOMER,
    SUPPLIER: CustomerType.SUPPLIER,
    VOUCHER: CustomerType.VOUCHER,
    SUPPLIER_VOUCHER: CustomerType.SUPPLIER_VOUCHER,
  };
  return mapping[type] || CustomerType.CUSTOMER;
}

export function mapCustomerStatusToXml(
  status: string
): 'ENABLED' | 'WARNING' | 'BLACKLISTED' | 'DISABLED' {
  const mapping: Record<
    string,
    'ENABLED' | 'WARNING' | 'BLACKLISTED' | 'DISABLED'
  > = {
    [CustomerStatusType.ENABLED]: 'ENABLED',
    [CustomerStatusType.WARNING]: 'WARNING',
    [CustomerStatusType.BLACKLISTED]: 'BLACKLISTED',
    [CustomerStatusType.DISABLED]: 'DISABLED',
  };
  return mapping[status] || 'ENABLED';
}

export function mapCustomerStatusFromXml(status: string): CustomerStatusType {
  const mapping: Record<string, CustomerStatusType> = {
    ENABLED: CustomerStatusType.ENABLED,
    WARNING: CustomerStatusType.WARNING,
    BLACKLISTED: CustomerStatusType.BLACKLISTED,
    DISABLED: CustomerStatusType.DISABLED,
  };
  return mapping[status] || CustomerStatusType.ENABLED;
}

// ===== BOOKING STATUS MAPPERS =====

export function mapBookingStatusToXml(
  status: string
):
  | 'QUOTATION'
  | 'WORK_IN_PROGRESS'
  | 'CONFIRMED'
  | 'OPTIONED'
  | 'NULLIFIED'
  | 'CANCELED' {
  const mapping: Record<
    string,
    | 'QUOTATION'
    | 'WORK_IN_PROGRESS'
    | 'CONFIRMED'
    | 'OPTIONED'
    | 'NULLIFIED'
    | 'CANCELED'
  > = {
    [BookingStatusType.QUOTATION]: 'QUOTATION',
    [BookingStatusType.WORK_IN_PROGRESS]: 'WORK_IN_PROGRESS',
    [BookingStatusType.CONFIRMED]: 'CONFIRMED',
    [BookingStatusType.OPTIONED]: 'OPTIONED',
    [BookingStatusType.NULLIFIED]: 'NULLIFIED',
    [BookingStatusType.CANCELED]: 'CANCELED',
  };
  return mapping[status] || 'QUOTATION';
}

export function mapBookingStatusFromXml(status: string): BookingStatusType {
  const mapping: Record<string, BookingStatusType> = {
    QUOTATION: BookingStatusType.QUOTATION,
    WORK_IN_PROGRESS: BookingStatusType.WORK_IN_PROGRESS,
    CONFIRMED: BookingStatusType.CONFIRMED,
    OPTIONED: BookingStatusType.OPTIONED,
    NULLIFIED: BookingStatusType.NULLIFIED,
    CANCELED: BookingStatusType.CANCELED,
  };
  return mapping[status] || BookingStatusType.QUOTATION;
}

// ===== DOCUMENT TYPE MAPPERS =====

export function mapDocumentTypeToXml(
  type: string
): PrintBookingDocumentRQ['InfoDocumentsToPrint']['InfoDocumentToPrint'][number]['DocumentType'] {
  const mapping: Record<
    string,
    PrintBookingDocumentRQ['InfoDocumentsToPrint']['InfoDocumentToPrint'][number]['DocumentType']
  > = {
    visa_request: 'VISA_REQUEST',
    travel_information: 'TRAVEL_INFORMATION',
    voucher: 'VOUCHER',
    booking_contract: 'BOOKING_CONTRACT',
    booking_confirmation: 'BOOKING_CONFIRMATION',
    supplier_service_list: 'SUPPLIER_SERVICE_LIST',
    invoice: 'INVOICE',
    proforma_invoice: 'PROFORMA_INVOICE',
    adeguamento: 'ADEGUAMENTO',
    reservation_form: 'RESERVATION_FORM',
    open_xml: 'OPEN_XML',
    sales_invoice: 'SALES_INVOICE',
    ticketing_tmaster: 'TICKETING_TMASTER',
    summary_form: 'SUMMARY_FORM',
  };
  return mapping[type] || 'VOUCHER';
}

// ===== GENDER MAPPERS =====

export function mapGenderToXml(gender: string): 'M' | 'F' {
  const mapping: Record<string, 'M' | 'F'> = {
    male: 'M',
    female: 'F',
  };
  return mapping[gender] || 'M';
}
