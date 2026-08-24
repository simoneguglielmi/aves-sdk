import type { PromiseFacade } from "../../effect/run-result.js";
import { toPromiseFacade } from "../../effect/run-result.js";
import { facadeMethod } from "../../utils/facade-transform.js";
import type { AvesTransportService, FacadeOp } from "../transport/types.js";

/** Effect-native booking domain. */
export type BookingService = {
	create: FacadeOp<"create">;
	updateServices: FacadeOp<"updateServices">;
	updateHeader: FacadeOp<"updateHeader">;
	cancel: FacadeOp<"cancel">;
	setStatus: FacadeOp<"setStatus">;
	setServiceStatus: FacadeOp<"setServiceStatus">;
	addPayments: FacadeOp<"addPayments">;
	search: FacadeOp<"searchBookings">;
	exportData: FacadeOp<"exportData">;
};

export function makeBookingService(
	transport: AvesTransportService,
): BookingService {
	const { ops } = transport;
	return {
		create: facadeMethod(ops.create),
		updateServices: facadeMethod(ops.updateServices),
		updateHeader: facadeMethod(ops.updateHeader),
		cancel: facadeMethod(ops.cancel),
		setStatus: facadeMethod(ops.setStatus),
		setServiceStatus: facadeMethod(ops.setServiceStatus),
		addPayments: facadeMethod(ops.addPayments),
		search: facadeMethod(ops.searchBookings),
		exportData: facadeMethod(ops.exportData),
	};
}

export type BookingClient = PromiseFacade<BookingService>;

/** Promise<Result> booking facade over {@link makeBookingService}. */
export function makeBookingClient(
	transport: AvesTransportService,
): BookingClient {
	return toPromiseFacade(makeBookingService(transport));
}
