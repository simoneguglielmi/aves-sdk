import type { BaseIssue, BaseSchema, InferInput, InferOutput } from "valibot";
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
import { type EnumValue, enumSchema } from "../utils/enum.js";
import { XML_ROOT_ELEMENTS, type XMLRootElementValues } from "../xml/root.js";
import { AVES_ENDPOINTS } from "./endpoints.js";

type RsStatus = InferOutput<typeof RsStatusSchema>;

type OpConfig<
	TIn,
	TApiBody extends Record<string, unknown>,
	TOut extends { rsStatus: RsStatus },
> = {
	endpoint: string;
	requestRoot: XMLRootElementValues;
	responseRoot: string;
	apiSchema: BaseSchema<TIn, TApiBody, BaseIssue<unknown>>;
	responseSchema: BaseSchema<unknown, TOut, BaseIssue<unknown>>;
	bodyKey?: OpBodyKey;
};

function defineOp<
	TIn,
	TApiBody extends Record<string, unknown>,
	TOut extends { rsStatus: RsStatus },
>(config: OpConfig<TIn, TApiBody, TOut>) {
	return config;
}

/**
 * Object enum of `invokeOp` / `AVES_OPS` keys.
 * Prefer `AvesOp.create` over string literals in domain clients.
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
	searchPackages: "searchPackages",
	searchServices: "searchServices",
	get: "get",
	commit: "commit",
} as const;
export type AvesOp = EnumValue<typeof AvesOp>;
export const AvesOpSchema = enumSchema(AvesOp);

/**
 * Static descriptor per AVES operation: endpoint, XML roots, schemas, optional body nest.
 * Domains call `invokeOp(AvesOp.*, params)` — keys match public method names where unique;
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

/** Runtime input accepted by an op's API schema (facade + AVES dual keys). */
export type OpParams<K extends AvesOp> = InferInput<
	(typeof AVES_OPS)[K]["apiSchema"]
>;

/** Parsed success payload for an op (before facade aliases). */
export type OpResult<K extends AvesOp> = InferOutput<
	(typeof AVES_OPS)[K]["responseSchema"]
>;
