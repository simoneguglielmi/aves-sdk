/**
 * AVES API Endpoints
 */

export const AvesEndpoints = {
  // Master Record Operations
  SEARCH_MASTER_RECORDS: '/interop/masterRecords/v2/rest/Search',
  INSERT_OR_UPDATE_MASTER_RECORD:
    '/interop/masterRecords/v2/rest/InsertOrUpdate',

  // Booking File Operations
  CREATE_BOOKING_FILE: '/interop/booking/v2/rest/CreateBookingFile',
  MOD_BOOKING_FILE_HEADER: '/interop/booking/v2/rest/ModBookingFileHeader',
  MOD_BOOKING_FILE_SERVICES: '/interop/booking/v2/rest/ModBookingFileServices',
  SET_BOOKING_FILE_STATUS: '/interop/booking/v2/rest/SetBookingFileStatus',
  SET_BOOKING_FILE_SERVICE_STATUS:
    '/interop/booking/v2/rest/SetBookingFileServiceStatus',
  CANCEL_BOOKING_FILE: '/interop/booking/v2/rest/CancelBookingFile',

  // Payment Operations
  INSERT_FILE_PAYMENT_LIST: '/interop/booking/v2/rest/InsertFilePaymentList',

  // Document Operations
  PRINT_BOOKING_DOCUMENT: '/interop/document/v2/rest/PrintBookingDocument',
} as const;

export type AvesEndpoint = (typeof AvesEndpoints)[keyof typeof AvesEndpoints];
