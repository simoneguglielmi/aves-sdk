import type { Schema } from "effect";
import type { InferOutput } from "../effect/infer.js";
import {
	ExportBookingDataApiSchema,
	ExportBookingDataResponseSchema,
} from "../schemas/booking-export.js";
import {
	BookingFileApiSchema,
	BookingFileResponseSchema,
} from "../schemas/booking-file.js";
import {
	BookingFileDetailResponseSchema,
	BookingStatusOnlyResponseSchema,
	CancelFileApiSchema,
	FilePaymentListApiSchema,
	ModFileHeaderApiSchema,
	ModFileServicesApiSchema,
	SetFileServiceStatusApiSchema,
	SetFileStatusApiSchema,
} from "../schemas/booking-ops.js";
import type { RsStatusSchema } from "../schemas/common.js";
import { OpBodyKey } from "../schemas/enums.js";
import { MasterRecordDetailApiSchema } from "../schemas/master-record.js";
import {
	AvesSearchApiSchema,
	CommitPackageApiSchema,
	CommitPackageResponseSchema,
	PackageDetailRequestApiSchema,
	PackageDetailResponseSchema,
	SearchPackageResponseSchema,
	SearchServicesResponseSchema,
} from "../schemas/package-catalog.js";
import {
	SearchMasterRecordApiSchema,
	SearchMasterRecordResponseSchema,
} from "../schemas/search.js";
import {
	SearchBookingFileApiSchema,
	SearchBookingFileResponseSchema,
} from "../schemas/search-booking-file.js";
import { ManageMasterRecordResponseSchema } from "../schemas/upsert.js";
import type {
	AvesSearchRQ,
	BookingFileDetailRS,
	BookingFileRQ,
	BookingFileRS,
	BookingStatusOnlyRS,
	CancelFileRQ,
	CommitPackageRQ,
	CommitPackageRS,
	ExportBookingDataRQ,
	ExportBookingDataRS,
	FilePaymentListRQ,
	ManageMasterRecordRS,
	MasterRecordDetail,
	ModFileHeaderRQ,
	ModFileServicesRQ,
	PackageDetailRQ,
	PackageDetailRS,
	SearchBookingFileRQ,
	SearchBookingFileRS,
	SearchMasterRecord,
	SearchPackageRS,
	SearchServicesRS,
	SetFileServiceStatusRQ,
	SetFileStatusRQ,
} from "../types.js";
import { type EnumValue, enumSchema } from "../utils/enum.js";
import { XML_ROOT_ELEMENTS, type XMLRootElementValues } from "../xml/root.js";
import { AVES_ENDPOINTS } from "./endpoints.js";

function defineOp<
	A extends object,
	I,
	B extends { rsStatus: InferOutput<typeof RsStatusSchema> },
	J,
>(config: {
	endpoint: string;
	requestRoot: XMLRootElementValues;
	responseRoot: string;
	apiSchema: Schema.Schema<A, I, never>;
	responseSchema: Schema.Schema<B, J, never>;
	bodyKey?: OpBodyKey;
}) {
	return config;
}

/**
 * Object enum of `AVES_OPS` / `transport.ops` keys.
 * Prefer `AvesOp.create` over string literals where a key token is needed.
 */
export const AvesOp = {
	search: "search",
	upsert: "upsert",
	create: "create",
	updateServices: "updateServices",
	updateHeader: "updateHeader",
	cancel: "cancel",
	setStatus: "setStatus",
	setServiceStatus: "setServiceStatus",
	addPayments: "addPayments",
	searchBookings: "searchBookings",
	exportData: "exportData",
	searchPackages: "searchPackages",
	searchServices: "searchServices",
	get: "get",
	commit: "commit",
} as const;
export type AvesOp = EnumValue<typeof AvesOp>;
export const AvesOpSchema = enumSchema(AvesOp);

/**
 * Static descriptor per AVES operation: endpoint, XML roots, schemas, optional body nest.
 * Domains call `transport.ops.*` — keys match public method names where unique;
 * collisions across namespaces use a short domain qualifier (`searchBookings`, `searchPackages`).
 */
export const AVES_OPS = {
	[AvesOp.search]: defineOp({
		endpoint: AVES_ENDPOINTS.search,
		requestRoot: XML_ROOT_ELEMENTS.SEARCH_REQUEST,
		responseRoot: XML_ROOT_ELEMENTS.SEARCH_RESPONSE,
		apiSchema: SearchMasterRecordApiSchema,
		responseSchema: SearchMasterRecordResponseSchema,
	}),
	[AvesOp.upsert]: defineOp({
		endpoint: AVES_ENDPOINTS.upsert,
		requestRoot: XML_ROOT_ELEMENTS.UPSERT_REQUEST,
		responseRoot: XML_ROOT_ELEMENTS.UPSERT_RESPONSE,
		apiSchema: MasterRecordDetailApiSchema,
		responseSchema: ManageMasterRecordResponseSchema,
		bodyKey: OpBodyKey.MasterRecordDetail,
	}),
	[AvesOp.create]: defineOp({
		endpoint: AVES_ENDPOINTS.createBooking,
		requestRoot: XML_ROOT_ELEMENTS.BOOKING_REQUEST,
		responseRoot: XML_ROOT_ELEMENTS.BOOKING_RESPONSE,
		apiSchema: BookingFileApiSchema,
		responseSchema: BookingFileResponseSchema,
	}),
	[AvesOp.updateServices]: defineOp({
		endpoint: AVES_ENDPOINTS.modBookingServices,
		requestRoot: XML_ROOT_ELEMENTS.MOD_FILE_SERVICES_REQUEST,
		responseRoot: XML_ROOT_ELEMENTS.BOOKING_RESPONSE,
		apiSchema: ModFileServicesApiSchema,
		responseSchema: BookingFileDetailResponseSchema,
	}),
	[AvesOp.updateHeader]: defineOp({
		endpoint: AVES_ENDPOINTS.modBookingHeader,
		requestRoot: XML_ROOT_ELEMENTS.MOD_FILE_HEADER_REQUEST,
		responseRoot: XML_ROOT_ELEMENTS.MOD_FILE_HEADER_RESPONSE,
		apiSchema: ModFileHeaderApiSchema,
		responseSchema: BookingStatusOnlyResponseSchema,
	}),
	[AvesOp.cancel]: defineOp({
		endpoint: AVES_ENDPOINTS.cancelBooking,
		requestRoot: XML_ROOT_ELEMENTS.CANCEL_FILE_REQUEST,
		responseRoot: XML_ROOT_ELEMENTS.CANCEL_FILE_RESPONSE,
		apiSchema: CancelFileApiSchema,
		responseSchema: BookingStatusOnlyResponseSchema,
	}),
	[AvesOp.setStatus]: defineOp({
		endpoint: AVES_ENDPOINTS.setBookingStatus,
		requestRoot: XML_ROOT_ELEMENTS.SET_STATUS_REQUEST,
		responseRoot: XML_ROOT_ELEMENTS.SET_STATUS_RESPONSE,
		apiSchema: SetFileStatusApiSchema,
		responseSchema: BookingFileDetailResponseSchema,
	}),
	[AvesOp.setServiceStatus]: defineOp({
		endpoint: AVES_ENDPOINTS.setBookingServiceStatus,
		requestRoot: XML_ROOT_ELEMENTS.SET_STATUS_SERVICE_REQUEST,
		responseRoot: XML_ROOT_ELEMENTS.SET_STATUS_SERVICE_RESPONSE,
		apiSchema: SetFileServiceStatusApiSchema,
		responseSchema: BookingFileDetailResponseSchema,
	}),
	[AvesOp.addPayments]: defineOp({
		endpoint: AVES_ENDPOINTS.insertFilePaymentList,
		requestRoot: XML_ROOT_ELEMENTS.FILE_PAYMENT_LIST_REQUEST,
		responseRoot: XML_ROOT_ELEMENTS.FILE_PAYMENT_LIST_RESPONSE,
		apiSchema: FilePaymentListApiSchema,
		responseSchema: BookingStatusOnlyResponseSchema,
	}),
	[AvesOp.searchBookings]: defineOp({
		endpoint: AVES_ENDPOINTS.searchBookingFile,
		requestRoot: XML_ROOT_ELEMENTS.SEARCH_BOOKING_FILE_REQUEST,
		responseRoot: XML_ROOT_ELEMENTS.SEARCH_BOOKING_FILE_RESPONSE,
		apiSchema: SearchBookingFileApiSchema,
		responseSchema: SearchBookingFileResponseSchema,
	}),
	[AvesOp.exportData]: defineOp({
		endpoint: AVES_ENDPOINTS.exportBookingData,
		requestRoot: XML_ROOT_ELEMENTS.EXPORT_BOOKING_DATA_REQUEST,
		responseRoot: XML_ROOT_ELEMENTS.EXPORT_BOOKING_DATA_RESPONSE,
		apiSchema: ExportBookingDataApiSchema,
		responseSchema: ExportBookingDataResponseSchema,
	}),
	[AvesOp.searchPackages]: defineOp({
		endpoint: AVES_ENDPOINTS.searchAvesPackages,
		requestRoot: XML_ROOT_ELEMENTS.AVES_SEARCH_REQUEST,
		responseRoot: XML_ROOT_ELEMENTS.SEARCH_PACKAGE_RESPONSE,
		apiSchema: AvesSearchApiSchema,
		responseSchema: SearchPackageResponseSchema,
	}),
	[AvesOp.searchServices]: defineOp({
		endpoint: AVES_ENDPOINTS.searchTopServices,
		requestRoot: XML_ROOT_ELEMENTS.AVES_SEARCH_REQUEST,
		responseRoot: XML_ROOT_ELEMENTS.SEARCH_SERVICES_RESPONSE,
		apiSchema: AvesSearchApiSchema,
		responseSchema: SearchServicesResponseSchema,
	}),
	[AvesOp.get]: defineOp({
		endpoint: AVES_ENDPOINTS.getPackageDetail,
		requestRoot: XML_ROOT_ELEMENTS.PACKAGE_DETAIL_REQUEST,
		responseRoot: XML_ROOT_ELEMENTS.PACKAGE_DETAIL_RESPONSE,
		apiSchema: PackageDetailRequestApiSchema,
		responseSchema: PackageDetailResponseSchema,
	}),
	[AvesOp.commit]: defineOp({
		endpoint: AVES_ENDPOINTS.commitPackage,
		requestRoot: XML_ROOT_ELEMENTS.COMMIT_PACKAGE_REQUEST,
		responseRoot: XML_ROOT_ELEMENTS.COMMIT_PACKAGE_RESPONSE,
		apiSchema: CommitPackageApiSchema,
		responseSchema: CommitPackageResponseSchema,
	}),
} as const;

/**
 * Transport-level master search response, before the facade flattens it to the
 * public {@link SearchMasterRecordRS} array. Internal: the flat array is the
 * contract callers see.
 */
type SearchMasterRecordEnvelope = InferOutput<
	typeof SearchMasterRecordResponseSchema
>;

/**
 * Per-op request/response types, written out against named types on purpose.
 *
 * Deriving these from `typeof AVES_OPS` was true by construction, but it forced
 * the declaration emitter to inline every schema's full structure into the
 * published `.d.ts` — ~500 KB of the 1.2 MB it used to weigh, and unreadable
 * anonymous blobs in consumer type errors. The contract is identical; only the
 * emitted form changes, from a copied structure to a reference.
 *
 * Two things keep this map honest: `ops.test-d.ts` pins every entry against the
 * schema pair `AVES_OPS` actually passes to the transport, and the `invoke`
 * calls in `transport/service.ts` reject a params type the schema will not
 * accept. Indexing by `AvesOp` below also makes a missing key a compile error.
 */
type OpTypes = {
	readonly search: {
		readonly params: SearchMasterRecord;
		readonly result: SearchMasterRecordEnvelope;
	};
	readonly upsert: {
		readonly params: MasterRecordDetail;
		readonly result: ManageMasterRecordRS;
	};
	readonly create: {
		readonly params: BookingFileRQ;
		readonly result: BookingFileRS;
	};
	readonly updateServices: {
		readonly params: ModFileServicesRQ;
		readonly result: BookingFileDetailRS;
	};
	readonly updateHeader: {
		readonly params: ModFileHeaderRQ;
		readonly result: BookingStatusOnlyRS;
	};
	readonly cancel: {
		readonly params: CancelFileRQ;
		readonly result: BookingStatusOnlyRS;
	};
	readonly setStatus: {
		readonly params: SetFileStatusRQ;
		readonly result: BookingFileDetailRS;
	};
	readonly setServiceStatus: {
		readonly params: SetFileServiceStatusRQ;
		readonly result: BookingFileDetailRS;
	};
	readonly addPayments: {
		readonly params: FilePaymentListRQ;
		readonly result: BookingStatusOnlyRS;
	};
	readonly searchBookings: {
		readonly params: SearchBookingFileRQ;
		readonly result: SearchBookingFileRS;
	};
	readonly exportData: {
		readonly params: ExportBookingDataRQ;
		readonly result: ExportBookingDataRS;
	};
	readonly searchPackages: {
		readonly params: AvesSearchRQ;
		readonly result: SearchPackageRS;
	};
	readonly searchServices: {
		readonly params: AvesSearchRQ;
		readonly result: SearchServicesRS;
	};
	readonly get: {
		readonly params: PackageDetailRQ;
		readonly result: PackageDetailRS;
	};
	readonly commit: {
		readonly params: CommitPackageRQ;
		readonly result: CommitPackageRS;
	};
};

/** Runtime input accepted by an op's API schema (facade + AVES dual keys). */
export type OpParams<K extends AvesOp> = OpTypes[K]["params"];

/** Parsed success payload for an op (before facade aliases). */
export type OpResult<K extends AvesOp> = OpTypes[K]["result"];
