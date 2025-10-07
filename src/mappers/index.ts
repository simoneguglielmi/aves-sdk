// Request mappers
export {
  mapCustomerToXml,
  mapSearchCustomerToXml,
  mapCreateBookingToXml,
  mapCancelBookingToXml,
  mapPrintDocumentToXml,
  mapAddPaymentToXml,
  mapCreateCustomerToXml,
  mapUpdateCustomerToXml,
  mapUpsertCustomerToXml,
  mapUpdateBookingHeaderToXml,
  mapUpdateBookingServicesToXml,
  mapSetBookingStatusToXml,
  mapSetBookingServiceStatusToXml,
} from './request-mappers';

// Response mappers
export {
  mapBookingFromXml,
  mapBookingResponseFromXml,
  mapCustomerResponseFromXml,
  mapSearchResponseFromXml,
  mapDocumentResponseFromXml,
  mapCancelResponseFromXml,
  mapPaymentResponseFromXml,
} from './response-mappers';

// Type mappers
export {
  mapCustomerTypeToXml,
  mapCustomerStatusToXml,
  mapBookingStatusToXml,
  mapDocumentTypeToXml,
  mapGenderToXml,
} from './type-mappers';
