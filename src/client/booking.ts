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
	async createBooking(
		params: BookingFileRQ,
	): Promise<Result<FacadeOutput<BookingFileRS>, AvesError>> {
		const result = await this.transport.invokeOp("createBooking", params);
		return toFacadeResult(result);
	}

	/** Add/replace services, assign package, delete/nullify cost items. */
	async modBookingServices(
		params: ModFileServicesRQ,
	): Promise<Result<FacadeOutput<BookingFileDetailRS>, AvesError>> {
		const result = await this.transport.invokeOp("modBookingServices", params);
		return toFacadeResult(result);
	}

	/** Header only (pax, notes, billing) — no costs. */
	async modBookingHeader(
		params: ModFileHeaderRQ,
	): Promise<Result<FacadeOutput<BookingStatusOnlyRS>, AvesError>> {
		const result = await this.transport.invokeOp("modBookingHeader", params);
		return toFacadeResult(result);
	}

	/** Delete a booking file (CancelBookingFile). */
	async cancelBooking(
		params: CancelFileRQ,
	): Promise<Result<FacadeOutput<BookingStatusOnlyRS>, AvesError>> {
		const result = await this.transport.invokeOp("cancelBooking", params);
		return toFacadeResult(result);
	}

	/** Change booking file status (incl. CANCELED / NULLIFIED). */
	async setBookingStatus(
		params: SetFileStatusRQ,
	): Promise<Result<FacadeOutput<BookingFileDetailRS>, AvesError>> {
		const result = await this.transport.invokeOp("setBookingStatus", params);
		return toFacadeResult(result);
	}

	/** Nullify a single booked service line. */
	async setBookingServiceStatus(
		params: SetFileServiceStatusRQ,
	): Promise<Result<FacadeOutput<BookingFileDetailRS>, AvesError>> {
		const result = await this.transport.invokeOp(
			"setBookingServiceStatus",
			params,
		);
		return toFacadeResult(result);
	}

	/** Register one or more payments on a booking file. */
	async insertFilePaymentList(
		params: FilePaymentListRQ,
	): Promise<Result<FacadeOutput<BookingStatusOnlyRS>, AvesError>> {
		const result = await this.transport.invokeOp(
			"insertFilePaymentList",
			params,
		);
		return toFacadeResult(result);
	}

	/** Search booking files, incl. by PACKAGE_CODE. */
	async searchBookingFiles(
		params: SearchBookingFileRQ,
	): Promise<Result<FacadeOutput<SearchBookingFileRS>, AvesError>> {
		const result = await this.transport.invokeOp("searchBookingFiles", params);
		return toFacadeResult(result);
	}
}
