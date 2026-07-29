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
} as const;

export type XMLRootElementValues =
	(typeof XML_ROOT_ELEMENTS)[keyof typeof XML_ROOT_ELEMENTS];

export function createRootElement<T>(name: XMLRootElementValues, object: T) {
	return { [name]: object };
}
