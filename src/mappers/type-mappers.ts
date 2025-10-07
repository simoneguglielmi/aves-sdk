// ===== CUSTOMER TYPE MAPPERS =====

import { CustomerStatusType } from 'src/types/api-interfaces';
import { PrintBookingDocumentRQ } from 'src/types/interfaces';

export function mapCustomerTypeToXml(
  type: string
): 'CUSTOMER' | 'SUPPLIER' | 'VOUCHER' | 'SUPPLIER_VOUCHER' {
  const mapping: Record<
    string,
    'CUSTOMER' | 'SUPPLIER' | 'VOUCHER' | 'SUPPLIER_VOUCHER'
  > = {
    customer: 'CUSTOMER',
    supplier: 'SUPPLIER',
    voucher: 'VOUCHER',
    supplier_voucher: 'SUPPLIER_VOUCHER',
  };
  return mapping[type] || 'CUSTOMER';
}

export function mapCustomerTypeFromXml(
  type: string
): 'customer' | 'supplier' | 'voucher' | 'supplier_voucher' {
  const mapping: Record<
    string,
    'customer' | 'supplier' | 'voucher' | 'supplier_voucher'
  > = {
    CUSTOMER: 'customer',
    SUPPLIER: 'supplier',
    VOUCHER: 'voucher',
    SUPPLIER_VOUCHER: 'supplier_voucher',
  };
  return mapping[type] || 'customer';
}

export function mapCustomerStatusToXml(
  status: string
): 'ENABLED' | 'WARNING' | 'BLACKLISTED' | 'DISABLED' {
  const mapping: Record<
    string,
    'ENABLED' | 'WARNING' | 'BLACKLISTED' | 'DISABLED'
  > = {
    enabled: 'ENABLED',
    warning: 'WARNING',
    blacklisted: 'BLACKLISTED',
    disabled: 'DISABLED',
  };
  return mapping[status] || 'ENABLED';
}

export function mapCustomerStatusFromXml(status: string): CustomerStatusType {
  const mapping: Record<string, CustomerStatusType> = {
    ENABLED: 'enabled',
    WARNING: 'warning',
    BLACKLISTED: 'blacklisted',
    DISABLED: 'disabled',
  };
  return mapping[status] || 'enabled';
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
    quotation: 'QUOTATION',
    work_in_progress: 'WORK_IN_PROGRESS',
    confirmed: 'CONFIRMED',
    optioned: 'OPTIONED',
    nullified: 'NULLIFIED',
    canceled: 'CANCELED',
  };
  return mapping[status] || 'QUOTATION';
}

export function mapBookingStatusFromXml(
  status: string
):
  | 'quotation'
  | 'work_in_progress'
  | 'confirmed'
  | 'optioned'
  | 'nullified'
  | 'canceled' {
  const mapping: Record<
    string,
    | 'quotation'
    | 'work_in_progress'
    | 'confirmed'
    | 'optioned'
    | 'nullified'
    | 'canceled'
  > = {
    QUOTATION: 'quotation',
    WORK_IN_PROGRESS: 'work_in_progress',
    CONFIRMED: 'confirmed',
    OPTIONED: 'optioned',
    NULLIFIED: 'nullified',
    CANCELED: 'canceled',
  };
  return mapping[status] || 'quotation';
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
