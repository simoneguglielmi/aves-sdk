// Main client

export { BookingClient } from "./client/booking.js";
export { MasterRecordsClient } from "./client/master-records.js";
export { PackageCatalogClient } from "./client/packages.js";
export { AvesTransport } from "./client/transport.js";
export {
	AvesClient,
	type AvesClientDeps,
	type AvesClientFlat,
} from "./client.js";
export { AvesError } from "./error.js";

// Types
export type {
	AccountPolicies,
	AvesClientOptions,
	AvesSearchRQ,
	BookingFileDetailRS,
	// Booking file (CreateBookingFile + ops)
	BookingFileRQ,
	BookingFileRS,
	BookingStatusOnlyRS,
	CancelFileRQ,
	CommitPackageRQ,
	CommitPackageRS,
	DynamicFields,
	FilePaymentListRQ,
	// Master record types
	FinancialDetail,
	IdDocumentDetail,
	// Upsert types
	ManageMasterRecordRequest,
	ManageMasterRecordRS,
	MasterRecordDetail,
	MasterRecordDetailResponse,
	ModFileHeaderRQ,
	ModFileServicesRQ,
	PackageDetailRQ,
	PackageDetailRS,
	RqHeader,
	RsStatus,
	SearchBookingFileRQ,
	SearchBookingFileRS,
	// Search types
	SearchMasterRecord,
	SearchMasterRecordRS,
	SearchPackageRS,
	SearchServicesRS,
	SetFileServiceStatusRQ,
	SetFileStatusRQ,
} from "./types.js";
