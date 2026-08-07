export const XML_ROOT_ELEMENTS = {
	SEARCH_REQUEST: "SearchMasterRecordRQ",
	SEARCH_RESPONSE: "SearchMasterRecordRS",
	UPSERT_REQUEST: "ManageMasterRecordRQ",
	UPSERT_RESPONSE: "ManageMasterRecordRS",
	BOOKING_REQUEST: "BookFileRQ",
	BOOKING_RESPONSE: "BookingFileRS",
	MOD_FILE_SERVICES_REQUEST: "ModFileServicesRQ",
	MOD_FILE_HEADER_REQUEST: "ModFileHeaderRQ",
	MOD_FILE_HEADER_RESPONSE: "ModFileHeaderRS",
	CANCEL_FILE_REQUEST: "CancelFileRQ",
	CANCEL_FILE_RESPONSE: "CancelFileRS",
	SET_STATUS_REQUEST: "SetStatusRQ",
	SET_STATUS_RESPONSE: "SetStatusRS",
	SET_STATUS_SERVICE_REQUEST: "SetStatusServiceRQ",
	SET_STATUS_SERVICE_RESPONSE: "SetStatusServiceRS",
	FILE_PAYMENT_LIST_REQUEST: "FilePaymentListRQ",
	FILE_PAYMENT_LIST_RESPONSE: "FilePaymentListRS",
	AVES_SEARCH_REQUEST: "AvesSearchRQ",
	SEARCH_PACKAGE_RESPONSE: "SearchPackageRS",
	SEARCH_SERVICES_RESPONSE: "SearchServicesRS",
	PACKAGE_DETAIL_REQUEST: "PackageDetailRQ",
	PACKAGE_DETAIL_RESPONSE: "PackageDetailRS",
	COMMIT_PACKAGE_REQUEST: "CommitPackRQ",
	COMMIT_PACKAGE_RESPONSE: "CommitPackRS",
	SEARCH_BOOKING_FILE_REQUEST: "SearchFileRQ",
	SEARCH_BOOKING_FILE_RESPONSE: "SearchFileRS",
	/**
	 * ExportBookingData roots are `BookingDataExport*`, not `ExportBookingData*`.
	 * The section tables label the endpoint; the index (Booking.txt:385-386) and both
	 * XML examples (Booking.txt:11110, :11702) agree on the element names below.
	 */
	EXPORT_BOOKING_DATA_REQUEST: "BookingDataExportRQ",
	EXPORT_BOOKING_DATA_RESPONSE: "BookingDataExportRS",
} as const;

export type XMLRootElementValues =
	(typeof XML_ROOT_ELEMENTS)[keyof typeof XML_ROOT_ELEMENTS];

export function createRootElement<T>(name: XMLRootElementValues, object: T) {
	return { [name]: object };
}
