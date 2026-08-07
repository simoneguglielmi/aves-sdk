import type { Effect } from "effect";
import type { PromiseFacade } from "../../effect/run-result.js";
import type { AvesError } from "../../error.js";
import type {
	BookingFileDetailRS,
	BookingFileRQ,
	BookingFileRS,
	BookingStatusOnlyRS,
	CancelFileRQ,
	ExportBookingDataRQ,
	ExportBookingDataRS,
	FilePaymentListRQ,
	ModFileHeaderRQ,
	ModFileServicesRQ,
	SearchBookingFileRQ,
	SearchBookingFileRS,
	SetFileServiceStatusRQ,
	SetFileStatusRQ,
} from "../../types.js";
import type { FacadeOutput } from "../../utils/facade-transform.js";

/** Effect-native booking domain. */
export type BookingService = {
	readonly create: (
		params: BookingFileRQ,
	) => Effect.Effect<FacadeOutput<BookingFileRS>, AvesError>;
	readonly updateServices: (
		params: ModFileServicesRQ,
	) => Effect.Effect<FacadeOutput<BookingFileDetailRS>, AvesError>;
	readonly updateHeader: (
		params: ModFileHeaderRQ,
	) => Effect.Effect<FacadeOutput<BookingStatusOnlyRS>, AvesError>;
	readonly cancel: (
		params: CancelFileRQ,
	) => Effect.Effect<FacadeOutput<BookingStatusOnlyRS>, AvesError>;
	readonly setStatus: (
		params: SetFileStatusRQ,
	) => Effect.Effect<FacadeOutput<BookingFileDetailRS>, AvesError>;
	readonly setServiceStatus: (
		params: SetFileServiceStatusRQ,
	) => Effect.Effect<FacadeOutput<BookingFileDetailRS>, AvesError>;
	readonly addPayments: (
		params: FilePaymentListRQ,
	) => Effect.Effect<FacadeOutput<BookingStatusOnlyRS>, AvesError>;
	readonly search: (
		params: SearchBookingFileRQ,
	) => Effect.Effect<FacadeOutput<SearchBookingFileRS>, AvesError>;
	readonly exportData: (
		params: ExportBookingDataRQ,
	) => Effect.Effect<FacadeOutput<ExportBookingDataRS>, AvesError>;
};

/** Public Promise<Result> booking API. */
export type BookingClient = PromiseFacade<BookingService>;
