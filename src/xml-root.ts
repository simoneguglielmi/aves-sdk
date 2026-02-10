export const XML_ROOT_ELEMENTS = {
	SEARCH_REQUEST: "SearchMasterRecordRQ",
	SEARCH_RESPONSE: "SearchMasterRecordRS",
	UPSERT_REQUEST: "ManageMasterRecordRQ",
	UPSERT_RESPONSE: "ManageMasterRecordRS",
	BOOKING_REQUEST: "BookFileRQ",
	BOOKING_RESPONSE: "BookingFileRS",
} as const;

export type XMLRootElementValues =
	(typeof XML_ROOT_ELEMENTS)[keyof typeof XML_ROOT_ELEMENTS];

export function createRootElement<T>(name: XMLRootElementValues, object: T) {
	return { [name]: object };
}
