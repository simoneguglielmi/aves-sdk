// Minimal placeholder interfaces for key flows; extend per AVES spec
export interface SearchMasterRecordRQ {
  // Extend with AVES search filters
}

export interface SearchMasterRecordRS {
  // Extend with result structures
}

export interface ManageMasterRecordRQ {
  // Include MasterRecordDetail and @InsertCriteria
}

export interface CustomerRecordRS {
  // Result of insert/update
}

export interface BookFileRQ {
  // SelectedServiceList, PassengerList, etc.
}

export interface BookingFileRS {
  // Booking file info
}

export interface ModiFileHeaderRQ {}
export interface ModiFileHeaderRS {}

export interface ModFileServicesRQ {}

export interface SetStatusRQ {}
export interface SetStatusServiceRS {}

export interface CancelFileRQ {}
export interface CancelFileRS {}

export interface FilePaymentListRQ {}
export interface FilePaymentListRS {}

export interface PrintBookingDocumentRQ {}
export interface PrintBookingDocumentRS {}

