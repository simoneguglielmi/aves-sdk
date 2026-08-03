import type { AvesError } from "../error.js";
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
import {
	SearchBookingFileApiSchema,
	SearchBookingFileResponseSchema,
} from "../schemas/search-booking-file.js";
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
import type { Result } from "../utils/result.js";
import { XML_ROOT_ELEMENTS } from "../xml/root.js";
import { AVES_ENDPOINTS } from "./endpoints.js";
import type { AvesTransport } from "./transport.js";

export class BookingClient {
	constructor(private readonly transport: AvesTransport) {}

	/** Create a booking file (CreateBookingFile). */
	createBooking(
		params: BookingFileRQ,
	): Promise<Result<BookingFileRS, AvesError>> {
		return this.transport.invokeOp({
			op: "createBooking",
			params,
			apiSchema: BookingFileApiSchema,
			endpoint: AVES_ENDPOINTS.createBooking,
			requestRoot: XML_ROOT_ELEMENTS.BOOKING_REQUEST,
			responseRoot: XML_ROOT_ELEMENTS.BOOKING_RESPONSE,
			responseSchema: BookingFileResponseSchema,
		});
	}

	/** Add/replace services, assign package, delete/nullify cost items. */
	modBookingServices(
		params: ModFileServicesRQ,
	): Promise<Result<BookingFileDetailRS, AvesError>> {
		return this.transport.invokeOp({
			op: "modBookingServices",
			params,
			apiSchema: ModFileServicesApiSchema,
			endpoint: AVES_ENDPOINTS.modBookingServices,
			requestRoot: XML_ROOT_ELEMENTS.MOD_FILE_SERVICES_REQUEST,
			responseRoot: XML_ROOT_ELEMENTS.BOOKING_RESPONSE,
			responseSchema: BookingFileDetailResponseSchema,
		});
	}

	/** Header only (pax, notes, billing) — no costs. */
	modBookingHeader(
		params: ModFileHeaderRQ,
	): Promise<Result<BookingStatusOnlyRS, AvesError>> {
		return this.transport.invokeOp({
			op: "modBookingHeader",
			params,
			apiSchema: ModFileHeaderApiSchema,
			endpoint: AVES_ENDPOINTS.modBookingHeader,
			requestRoot: XML_ROOT_ELEMENTS.MOD_FILE_HEADER_REQUEST,
			responseRoot: XML_ROOT_ELEMENTS.MOD_FILE_HEADER_RESPONSE,
			responseSchema: BookingStatusOnlyResponseSchema,
		});
	}

	/** Delete a booking file (CancelBookingFile). */
	cancelBooking(
		params: CancelFileRQ,
	): Promise<Result<BookingStatusOnlyRS, AvesError>> {
		return this.transport.invokeOp({
			op: "cancelBooking",
			params,
			apiSchema: CancelFileApiSchema,
			endpoint: AVES_ENDPOINTS.cancelBooking,
			requestRoot: XML_ROOT_ELEMENTS.CANCEL_FILE_REQUEST,
			responseRoot: XML_ROOT_ELEMENTS.CANCEL_FILE_RESPONSE,
			responseSchema: BookingStatusOnlyResponseSchema,
		});
	}

	/** Change booking file status (incl. CANCELED / NULLIFIED). */
	setBookingStatus(
		params: SetFileStatusRQ,
	): Promise<Result<BookingFileDetailRS, AvesError>> {
		return this.transport.invokeOp({
			op: "setBookingStatus",
			params,
			apiSchema: SetFileStatusApiSchema,
			endpoint: AVES_ENDPOINTS.setBookingStatus,
			requestRoot: XML_ROOT_ELEMENTS.SET_STATUS_REQUEST,
			responseRoot: XML_ROOT_ELEMENTS.SET_STATUS_RESPONSE,
			responseSchema: BookingFileDetailResponseSchema,
		});
	}

	/** Nullify a single booked service line. */
	setBookingServiceStatus(
		params: SetFileServiceStatusRQ,
	): Promise<Result<BookingFileDetailRS, AvesError>> {
		return this.transport.invokeOp({
			op: "setBookingServiceStatus",
			params,
			apiSchema: SetFileServiceStatusApiSchema,
			endpoint: AVES_ENDPOINTS.setBookingServiceStatus,
			requestRoot: XML_ROOT_ELEMENTS.SET_STATUS_SERVICE_REQUEST,
			responseRoot: XML_ROOT_ELEMENTS.SET_STATUS_SERVICE_RESPONSE,
			responseSchema: BookingFileDetailResponseSchema,
		});
	}

	/** Register one or more payments on a booking file. */
	insertFilePaymentList(
		params: FilePaymentListRQ,
	): Promise<Result<BookingStatusOnlyRS, AvesError>> {
		return this.transport.invokeOp({
			op: "insertFilePaymentList",
			params,
			apiSchema: FilePaymentListApiSchema,
			endpoint: AVES_ENDPOINTS.insertFilePaymentList,
			requestRoot: XML_ROOT_ELEMENTS.FILE_PAYMENT_LIST_REQUEST,
			responseRoot: XML_ROOT_ELEMENTS.FILE_PAYMENT_LIST_RESPONSE,
			responseSchema: BookingStatusOnlyResponseSchema,
		});
	}

	/** Search booking files, incl. by PACKAGE_CODE. */
	searchBookingFiles(
		params: SearchBookingFileRQ,
	): Promise<Result<SearchBookingFileRS, AvesError>> {
		return this.transport.invokeOp({
			op: "searchBookingFiles",
			params,
			apiSchema: SearchBookingFileApiSchema,
			endpoint: AVES_ENDPOINTS.searchBookingFile,
			requestRoot: XML_ROOT_ELEMENTS.SEARCH_BOOKING_FILE_REQUEST,
			responseRoot: XML_ROOT_ELEMENTS.SEARCH_BOOKING_FILE_RESPONSE,
			responseSchema: SearchBookingFileResponseSchema,
		});
	}
}
