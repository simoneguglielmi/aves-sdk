import type { AvesError } from "../error.js";
import type {
	BookingFileDetailRS,
	BookingFileRQ,
	BookingFileRS,
	BookingStatusOnlyRS,
	CancelFileRQ,
	FilePaymentListRQ,
	ModFileHeaderRQ,
	ModFileServicesRQ,
	SearchBookingFileRQ,
	SearchBookingFileRS,
	SetFileServiceStatusRQ,
	SetFileStatusRQ,
} from "../types.js";
import {
	type FacadeOutput,
	toFacadeResult,
} from "../utils/facade-transform.js";
import type { Result } from "../utils/result.js";
import type { AvesTransport } from "./transport.js";

export class BookingClient {
	constructor(private readonly transport: AvesTransport) {}

	/** Create a booking file (CreateBookingFile). */
	async create(
		params: BookingFileRQ,
	): Promise<Result<FacadeOutput<BookingFileRS>, AvesError>> {
		const result = await this.transport.invokeOp("create", params);
		return toFacadeResult(result);
	}

	/** Add/replace services, assign package, delete/nullify cost items. */
	async updateServices(
		params: ModFileServicesRQ,
	): Promise<Result<FacadeOutput<BookingFileDetailRS>, AvesError>> {
		const result = await this.transport.invokeOp("updateServices", params);
		return toFacadeResult(result);
	}

	/** Header only (pax, notes, billing) — no costs. */
	async updateHeader(
		params: ModFileHeaderRQ,
	): Promise<Result<FacadeOutput<BookingStatusOnlyRS>, AvesError>> {
		const result = await this.transport.invokeOp("updateHeader", params);
		return toFacadeResult(result);
	}

	/** Delete a booking file (CancelBookingFile). */
	async cancel(
		params: CancelFileRQ,
	): Promise<Result<FacadeOutput<BookingStatusOnlyRS>, AvesError>> {
		const result = await this.transport.invokeOp("cancel", params);
		return toFacadeResult(result);
	}

	/** Change booking file status (incl. CANCELED / NULLIFIED). */
	async setStatus(
		params: SetFileStatusRQ,
	): Promise<Result<FacadeOutput<BookingFileDetailRS>, AvesError>> {
		const result = await this.transport.invokeOp("setStatus", params);
		return toFacadeResult(result);
	}

	/** Nullify a single booked service line. */
	async setServiceStatus(
		params: SetFileServiceStatusRQ,
	): Promise<Result<FacadeOutput<BookingFileDetailRS>, AvesError>> {
		const result = await this.transport.invokeOp("setServiceStatus", params);
		return toFacadeResult(result);
	}

	/** Register one or more payments on a booking file. */
	async addPayments(
		params: FilePaymentListRQ,
	): Promise<Result<FacadeOutput<BookingStatusOnlyRS>, AvesError>> {
		const result = await this.transport.invokeOp("addPayments", params);
		return toFacadeResult(result);
	}

	/** Search booking files, incl. by PACKAGE_CODE. */
	async search(
		params: SearchBookingFileRQ,
	): Promise<Result<FacadeOutput<SearchBookingFileRS>, AvesError>> {
		const result = await this.transport.invokeOp("searchBookings", params);
		return toFacadeResult(result);
	}
}
