import type { Effect } from "effect";
import { describe, expectTypeOf, it } from "vitest";
import type { InferInput, InferOutput } from "../effect/infer.js";
import type { AvesError } from "../error.js";
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
import type {
	MasterRecordDetailApiSchema,
	MasterRecordDetailResponseSchema,
} from "../schemas/master-record.js";
import type {
	AvesSearchApiSchema,
	CommitPackageApiSchema,
	CommitPackageResponseSchema,
	PackageDetailRequestApiSchema,
	PackageDetailResponseSchema,
	SearchPackageResponseSchema,
	SearchServicesResponseSchema,
} from "../schemas/package-catalog.js";
import type { SearchMasterRecordApiSchema } from "../schemas/search.js";
import type {
	SearchBookingFileApiSchema,
	SearchBookingFileResponseSchema,
} from "../schemas/search-booking-file.js";
import type { ManageMasterRecordResponseSchema } from "../schemas/upsert.js";
import type { FacadeOutput } from "../utils/facade-transform.js";
import type { BookingService } from "./booking/service.js";
import type { MasterRecordsService } from "./master/service.js";
import type { PackageCatalogService } from "./packages/service.js";

// End-to-end guard for the hand-written domain service types.
//
// Each case rebuilds a method's signature straight from the schemas the
// registry passes to the transport, and pins the published type against it.
// Together with ops.test-d.ts this covers the whole chain that used to be
// inferred: schema -> OpTypes -> FacadeOp -> service -> Context.Tag.

describe("BookingService methods match their schemas", () => {
	it("create", () => {
		expectTypeOf<BookingService["create"]>().toEqualTypeOf<
			(
				params: InferInput<typeof BookingFileApiSchema>,
			) => Effect.Effect<
				FacadeOutput<InferOutput<typeof BookingFileResponseSchema>>,
				AvesError
			>
		>();
	});
	it("updateServices", () => {
		expectTypeOf<BookingService["updateServices"]>().toEqualTypeOf<
			(
				params: InferInput<typeof ModFileServicesApiSchema>,
			) => Effect.Effect<
				FacadeOutput<InferOutput<typeof BookingFileDetailResponseSchema>>,
				AvesError
			>
		>();
	});
	it("updateHeader", () => {
		expectTypeOf<BookingService["updateHeader"]>().toEqualTypeOf<
			(
				params: InferInput<typeof ModFileHeaderApiSchema>,
			) => Effect.Effect<
				FacadeOutput<InferOutput<typeof BookingStatusOnlyResponseSchema>>,
				AvesError
			>
		>();
	});
	it("cancel", () => {
		expectTypeOf<BookingService["cancel"]>().toEqualTypeOf<
			(
				params: InferInput<typeof CancelFileApiSchema>,
			) => Effect.Effect<
				FacadeOutput<InferOutput<typeof BookingStatusOnlyResponseSchema>>,
				AvesError
			>
		>();
	});
	it("setStatus", () => {
		expectTypeOf<BookingService["setStatus"]>().toEqualTypeOf<
			(
				params: InferInput<typeof SetFileStatusApiSchema>,
			) => Effect.Effect<
				FacadeOutput<InferOutput<typeof BookingFileDetailResponseSchema>>,
				AvesError
			>
		>();
	});
	it("setServiceStatus", () => {
		expectTypeOf<BookingService["setServiceStatus"]>().toEqualTypeOf<
			(
				params: InferInput<typeof SetFileServiceStatusApiSchema>,
			) => Effect.Effect<
				FacadeOutput<InferOutput<typeof BookingFileDetailResponseSchema>>,
				AvesError
			>
		>();
	});
	it("addPayments", () => {
		expectTypeOf<BookingService["addPayments"]>().toEqualTypeOf<
			(
				params: InferInput<typeof FilePaymentListApiSchema>,
			) => Effect.Effect<
				FacadeOutput<InferOutput<typeof BookingStatusOnlyResponseSchema>>,
				AvesError
			>
		>();
	});
	it("search", () => {
		expectTypeOf<BookingService["search"]>().toEqualTypeOf<
			(
				params: InferInput<typeof SearchBookingFileApiSchema>,
			) => Effect.Effect<
				FacadeOutput<InferOutput<typeof SearchBookingFileResponseSchema>>,
				AvesError
			>
		>();
	});
	it("exportData", () => {
		expectTypeOf<BookingService["exportData"]>().toEqualTypeOf<
			(
				params: InferInput<typeof ExportBookingDataApiSchema>,
			) => Effect.Effect<
				FacadeOutput<InferOutput<typeof ExportBookingDataResponseSchema>>,
				AvesError
			>
		>();
	});
});

describe("PackageCatalogService methods match their schemas", () => {
	it("search", () => {
		expectTypeOf<PackageCatalogService["search"]>().toEqualTypeOf<
			(
				params: InferInput<typeof AvesSearchApiSchema>,
			) => Effect.Effect<
				FacadeOutput<InferOutput<typeof SearchPackageResponseSchema>>,
				AvesError
			>
		>();
	});
	it("searchServices", () => {
		expectTypeOf<PackageCatalogService["searchServices"]>().toEqualTypeOf<
			(
				params: InferInput<typeof AvesSearchApiSchema>,
			) => Effect.Effect<
				FacadeOutput<InferOutput<typeof SearchServicesResponseSchema>>,
				AvesError
			>
		>();
	});
	it("get", () => {
		expectTypeOf<PackageCatalogService["get"]>().toEqualTypeOf<
			(
				params: InferInput<typeof PackageDetailRequestApiSchema>,
			) => Effect.Effect<
				FacadeOutput<InferOutput<typeof PackageDetailResponseSchema>>,
				AvesError
			>
		>();
	});
	it("commit", () => {
		expectTypeOf<PackageCatalogService["commit"]>().toEqualTypeOf<
			(
				params: InferInput<typeof CommitPackageApiSchema>,
			) => Effect.Effect<
				FacadeOutput<InferOutput<typeof CommitPackageResponseSchema>>,
				AvesError
			>
		>();
	});
});

describe("MasterRecordsService methods match their schemas", () => {
	it("search flattens the envelope to the public array", () => {
		expectTypeOf<MasterRecordsService["search"]>().toEqualTypeOf<
			(
				params: InferInput<typeof SearchMasterRecordApiSchema>,
			) => Effect.Effect<
				FacadeOutput<InferOutput<typeof MasterRecordDetailResponseSchema>[]>,
				AvesError
			>
		>();
	});
	it("upsert", () => {
		expectTypeOf<MasterRecordsService["upsert"]>().toEqualTypeOf<
			(
				params: InferInput<typeof MasterRecordDetailApiSchema>,
			) => Effect.Effect<
				FacadeOutput<InferOutput<typeof ManageMasterRecordResponseSchema>>,
				AvesError
			>
		>();
	});
});
