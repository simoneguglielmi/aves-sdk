/**
 * AVES XML Root Element Names
 *
 * This file contains all the root element names used in AVES API requests.
 * These are used as the root tag when serializing XML requests.
 */

export const RootElementNames = {
  // Master Record Operations
  SEARCH_MASTER_RECORD: 'SearchMasterRecordRQ',
  MANAGE_MASTER_RECORD: 'ManageMasterRecordRQ',

  // Booking File Operations
  BOOK_FILE: 'BookFileRQ',
  MODI_FILE_HEADER: 'ModiFileHeaderRQ',
  MOD_FILE_SERVICES: 'ModFileServicesRQ',
  SET_STATUS: 'SetStatusRQ',
  SET_STATUS_SERVICE: 'SetStatusServiceRQ',
  CANCEL_FILE: 'CancelFileRQ',

  // Payment Operations
  FILE_PAYMENT_LIST: 'FilePaymentListRQ',

  // Document Operations
  PRINT_BOOKING_DOCUMENT: 'PrintBookingDocumentRQ',
} as const;

export type RootElementName =
  (typeof RootElementNames)[keyof typeof RootElementNames];
