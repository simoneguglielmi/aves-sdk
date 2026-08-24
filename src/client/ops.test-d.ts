import { describe, expectTypeOf, it } from "vitest";
import type { InferInput, InferOutput } from "../effect/infer.js";
import type {
	ExportBookingDataApiSchema,
	ExportBookingDataResponseSchema,
} from "../schemas/booking-export.js";
import type {
	BookingFileApiSchema,
	BookingFileResponseSchema,
} from "../schemas/booking-file.js";
import type {
	BookingFileDetailResponseSchema,
	BookingStatusOnlyResponseSchema,
	CancelFileApiSchema,
	FilePaymentListApiSchema,
	ModFileHeaderApiSchema,
	ModFileServicesApiSchema,
	SetFileServiceStatusApiSchema,
	SetFileStatusApiSchema,
} from "../schemas/booking-ops.js";
import type { MasterRecordDetailApiSchema } from "../schemas/master-record.js";
import type {
	AvesSearchApiSchema,
	CommitPackageApiSchema,
	CommitPackageResponseSchema,
	PackageDetailRequestApiSchema,
	PackageDetailResponseSchema,
	SearchPackageResponseSchema,
	SearchServicesResponseSchema,
} from "../schemas/package-catalog.js";
import type {
	SearchMasterRecordApiSchema,
	SearchMasterRecordResponseSchema,
} from "../schemas/search.js";
import type {
	SearchBookingFileApiSchema,
	SearchBookingFileResponseSchema,
} from "../schemas/search-booking-file.js";
import type { ManageMasterRecordResponseSchema } from "../schemas/upsert.js";
import type { OpParams, OpResult } from "./ops.js";

// Anti-drift guard for the explicit op -> type map in ops.ts.
//
// OpParams/OpResult used to be inferred straight off AVES_OPS, which made
// this invariant true by construction — and cost ~500 KB of inlined structure
// in the emitted .d.ts. They are now written out by hand against named types,
// so the invariant has to be asserted instead. Each case pins one op against
// the schema pair AVES_OPS actually passes to the transport: if a schema
// changes and the map does not follow, `yarn test:types` goes red.
//
// Excluded from tsconfig.json, so none of this reaches the published types.

describe("OpParams mirrors each op's apiSchema (Encoded)", () => {
	it("search", () => {
		expectTypeOf<OpParams<"search">>().toEqualTypeOf<
			InferInput<typeof SearchMasterRecordApiSchema>
		>();
	});
	it("upsert", () => {
		expectTypeOf<OpParams<"upsert">>().toEqualTypeOf<
			InferInput<typeof MasterRecordDetailApiSchema>
		>();
	});
	it("create", () => {
		expectTypeOf<OpParams<"create">>().toEqualTypeOf<
			InferInput<typeof BookingFileApiSchema>
		>();
	});
	it("updateServices", () => {
		expectTypeOf<OpParams<"updateServices">>().toEqualTypeOf<
			InferInput<typeof ModFileServicesApiSchema>
		>();
	});
	it("updateHeader", () => {
		expectTypeOf<OpParams<"updateHeader">>().toEqualTypeOf<
			InferInput<typeof ModFileHeaderApiSchema>
		>();
	});
	it("cancel", () => {
		expectTypeOf<OpParams<"cancel">>().toEqualTypeOf<
			InferInput<typeof CancelFileApiSchema>
		>();
	});
	it("setStatus", () => {
		expectTypeOf<OpParams<"setStatus">>().toEqualTypeOf<
			InferInput<typeof SetFileStatusApiSchema>
		>();
	});
	it("setServiceStatus", () => {
		expectTypeOf<OpParams<"setServiceStatus">>().toEqualTypeOf<
			InferInput<typeof SetFileServiceStatusApiSchema>
		>();
	});
	it("addPayments", () => {
		expectTypeOf<OpParams<"addPayments">>().toEqualTypeOf<
			InferInput<typeof FilePaymentListApiSchema>
		>();
	});
	it("searchBookings", () => {
		expectTypeOf<OpParams<"searchBookings">>().toEqualTypeOf<
			InferInput<typeof SearchBookingFileApiSchema>
		>();
	});
	it("exportData", () => {
		expectTypeOf<OpParams<"exportData">>().toEqualTypeOf<
			InferInput<typeof ExportBookingDataApiSchema>
		>();
	});
	it("searchPackages", () => {
		expectTypeOf<OpParams<"searchPackages">>().toEqualTypeOf<
			InferInput<typeof AvesSearchApiSchema>
		>();
	});
	it("searchServices", () => {
		expectTypeOf<OpParams<"searchServices">>().toEqualTypeOf<
			InferInput<typeof AvesSearchApiSchema>
		>();
	});
	it("get", () => {
		expectTypeOf<OpParams<"get">>().toEqualTypeOf<
			InferInput<typeof PackageDetailRequestApiSchema>
		>();
	});
	it("commit", () => {
		expectTypeOf<OpParams<"commit">>().toEqualTypeOf<
			InferInput<typeof CommitPackageApiSchema>
		>();
	});
});

describe("OpResult mirrors each op's responseSchema (Type)", () => {
	it("search", () => {
		expectTypeOf<OpResult<"search">>().toEqualTypeOf<
			InferOutput<typeof SearchMasterRecordResponseSchema>
		>();
	});
	it("upsert", () => {
		expectTypeOf<OpResult<"upsert">>().toEqualTypeOf<
			InferOutput<typeof ManageMasterRecordResponseSchema>
		>();
	});
	it("create", () => {
		expectTypeOf<OpResult<"create">>().toEqualTypeOf<
			InferOutput<typeof BookingFileResponseSchema>
		>();
	});
	it("updateServices", () => {
		expectTypeOf<OpResult<"updateServices">>().toEqualTypeOf<
			InferOutput<typeof BookingFileDetailResponseSchema>
		>();
	});
	it("updateHeader", () => {
		expectTypeOf<OpResult<"updateHeader">>().toEqualTypeOf<
			InferOutput<typeof BookingStatusOnlyResponseSchema>
		>();
	});
	it("cancel", () => {
		expectTypeOf<OpResult<"cancel">>().toEqualTypeOf<
			InferOutput<typeof BookingStatusOnlyResponseSchema>
		>();
	});
	it("setStatus", () => {
		expectTypeOf<OpResult<"setStatus">>().toEqualTypeOf<
			InferOutput<typeof BookingFileDetailResponseSchema>
		>();
	});
	it("setServiceStatus", () => {
		expectTypeOf<OpResult<"setServiceStatus">>().toEqualTypeOf<
			InferOutput<typeof BookingFileDetailResponseSchema>
		>();
	});
	it("addPayments", () => {
		expectTypeOf<OpResult<"addPayments">>().toEqualTypeOf<
			InferOutput<typeof BookingStatusOnlyResponseSchema>
		>();
	});
	it("searchBookings", () => {
		expectTypeOf<OpResult<"searchBookings">>().toEqualTypeOf<
			InferOutput<typeof SearchBookingFileResponseSchema>
		>();
	});
	it("exportData", () => {
		expectTypeOf<OpResult<"exportData">>().toEqualTypeOf<
			InferOutput<typeof ExportBookingDataResponseSchema>
		>();
	});
	it("searchPackages", () => {
		expectTypeOf<OpResult<"searchPackages">>().toEqualTypeOf<
			InferOutput<typeof SearchPackageResponseSchema>
		>();
	});
	it("searchServices", () => {
		expectTypeOf<OpResult<"searchServices">>().toEqualTypeOf<
			InferOutput<typeof SearchServicesResponseSchema>
		>();
	});
	it("get", () => {
		expectTypeOf<OpResult<"get">>().toEqualTypeOf<
			InferOutput<typeof PackageDetailResponseSchema>
		>();
	});
	it("commit", () => {
		expectTypeOf<OpResult<"commit">>().toEqualTypeOf<
			InferOutput<typeof CommitPackageResponseSchema>
		>();
	});
});
