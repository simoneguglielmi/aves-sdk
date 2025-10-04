// Mapper exports for clean API to XML conversion

// Request mappers (clean -> XML)
export {
  mapAddressToXml,
  mapContactToXml,
  mapPassengerToXml,
  mapServiceToXml,
  mapPaymentToXml,
  mapCustomerToXml,
  mapSearchCustomerToXml,
  mapCreateBookingToXml,
  mapCancelBookingToXml,
  mapPrintDocumentToXml,
  mapAddPaymentToXml,
} from './request-mappers';

// Response mappers (XML -> clean)
export {
  mapBookingFromXml,
  mapBookingResponseFromXml,
  mapSearchResponseFromXml,
  mapDocumentResponseFromXml,
  mapCancelResponseFromXml,
  mapPaymentResponseFromXml,
  mapMasterRecordFromXml,
} from './response-mappers';

export {
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
} from './type-mappers';
