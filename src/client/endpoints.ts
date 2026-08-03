export const AVES_ENDPOINTS = {
	search: "/interop/masterRecords/v2/rest/Search",
	upsert: "/interop/masterRecords/v2/rest/InsertOrUpdate",
	createBooking: "/interop/booking/v2/rest/CreateBookingFile",
	modBookingServices: "/interop/booking/v2/rest/ModBookingFileServices",
	modBookingHeader: "/interop/booking/v2/rest/ModBookingFileHeader",
	cancelBooking: "/interop/booking/v2/rest/CancelBookingFile",
	setBookingStatus: "/interop/booking/v2/rest/SetBookingFileStatus",
	setBookingServiceStatus:
		"/interop/booking/v2/rest/SetBookingFileServiceStatus",
	insertFilePaymentList: "/interop/booking/v2/rest/InsertFilePaymentList",
	searchAvesPackages: "/interop/booking/v2/rest/SearchAvesPackages",
	searchTopServices: "/interop/booking/v2/rest/SearchTopServices",
	getPackageDetail: "/interop/booking/v2/rest/GetPackageDetail",
	commitPackage: "/interop/booking/v2/rest/CommitPackage",
	searchBookingFile: "/interop/booking/v2/rest/SearchBookingFile",
} as const;

export type AvesEndpointKey = keyof typeof AVES_ENDPOINTS;
