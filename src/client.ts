import { request as r } from "undici";
import {
	type BaseIssue,
	type BaseSchema,
	parse,
	safeParse,
	ValiError,
} from "valibot";
import {
	AvesError,
	apiError,
	buildDetails,
	isAbortError,
	unknownError,
	validationError,
} from "./error.js";
import {
	BookingFileApiSchema,
	BookingFileResponseSchema,
} from "./schemas/booking-file.js";
import {
	BookingFileDetailResponseSchema,
	BookingStatusOnlyResponseSchema,
	CancelFileApiSchema,
	FilePaymentListApiSchema,
	ModFileHeaderApiSchema,
	ModFileServicesApiSchema,
	SetFileServiceStatusApiSchema,
	SetFileStatusApiSchema,
} from "./schemas/booking-ops.js";
import { MasterRecordDetailApiSchema } from "./schemas/master-record.js";
import {
	SearchMasterRecordRequestSchema,
	SearchMasterRecordResponseSchema,
} from "./schemas/search.js";
import {
	ManageMasterRecordRequestSchema,
	ManageMasterRecordResponseSchema,
} from "./schemas/upsert.js";
import type {
	AvesClientOptions,
	BookingFileDetailRS,
	BookingFileRQ,
	BookingFileRS,
	BookingStatusOnlyRS,
	CancelFileRQ,
	FilePaymentListRQ,
	ManageMasterRecordRS,
	MasterRecordDetail,
	ModFileHeaderRQ,
	ModFileServicesRQ,
	RsStatus,
	SearchMasterRecord,
	SearchMasterRecordRS,
	SetFileServiceStatusRQ,
	SetFileStatusRQ,
} from "./types.js";
import { err, isOk, ok, type Result } from "./utils/result.js";
import { createTimeoutSignal } from "./utils/timeout.js";
import { parseUrl } from "./utils/url.js";
import { jsonToXml, xmlToJson } from "./xml-client.js";
import {
	createRootElement,
	XML_ROOT_ELEMENTS,
	type XMLRootElementValues,
} from "./xml-root.js";

/**
 * AVES XML REST API client
 */
export class AvesClient {
	/**
	 * @param options - Client configuration options
	 * @param options.baseURL - Base URL of the AVES API
	 * @param options.hostID - 6-digit identification code
	 * @param options.xtoken - Authentication token
	 * @param options.languageCode - Optional 2-digit language code
	 * @param options.timeoutMs - Optional request timeout in milliseconds
	 */
	constructor(private readonly options: AvesClientOptions) {}

	private createRqHeader() {
		return {
			"@HostID": this.options.hostID,
			"@Xtoken": this.options.xtoken,
			"@Interface": "WEB" as const,
			"@UserName": "WEB" as const,
			...(this.options.languageCode && {
				"@LanguageCode": this.options.languageCode,
			}),
		};
	}

	private createUrl(endpoint: string) {
		return parseUrl(this.options.baseURL, endpoint);
	}

	private get endpoints() {
		return {
			search: "/interop/masterRecords/v2/rest/Search",
			upsert: "/interop/masterRecords/v2/rest/InsertOrUpdate",
			createBooking: "/interop/booking/v2/rest/CreateBookingFile",
			modBookingServices: "/interop/booking/v2/rest/ModBookingFileServices",
			modBookingHeader: "/interop/booking/v2/rest/ModBookingFileHeader",
			cancelBooking: "/interop/booking/v2/rest/CancelBookingFile",
			setBookingStatus: "/interop/booking/v2/rest/SetBookingFileStatus",
			setBookingServiceStatus:
				"/interop/booking/v2/rest/SetBookingFileServiceStatus",
			insertFilePaymentList: "/interop/booking/v2/rest/InsertFilePaymentList",
		} as const;
	}

	private handleApiStatus<T extends { rsStatus: RsStatus }>(
		output: T,
	): Result<T, AvesError> {
		const rsStatus = output.rsStatus;
		const status = rsStatus?.status;

		if (status !== "OK") {
			return err(
				apiError(
					rsStatus.errorDescription as string,
					status,
					rsStatus.errorCode,
				),
			);
		}

		return ok(output);
	}

	private toAvesError(error: unknown, defaultMessage: string): AvesError {
		if (error instanceof AvesError) {
			return error;
		}
		if (error instanceof ValiError) {
			const details = buildDetails(error.issues);
			return validationError(`Validation error: ${details}`);
		}
		if (error instanceof Error) {
			return unknownError(error.message);
		}
		return unknownError(defaultMessage);
	}

	private async request<T extends { rsStatus: RsStatus }>(
		endpoint: string,
		requestBody: Record<string, unknown>,
		responseRootKey: string,
		responseSchema: BaseSchema<unknown, T, BaseIssue<unknown>>,
	): Promise<Result<T, AvesError>> {
		const { signal, clear } = createTimeoutSignal(
			this.options.timeoutMs ?? 30_000,
		);

		try {
			const url = this.createUrl(endpoint);
			const xmlBody = jsonToXml(requestBody);

			const response = await r(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/xml",
				},
				body: xmlBody,
				signal,
			});

			const responseText = await response.body.text();

			if (!isOk(response.statusCode)) {
				return err(apiError(responseText, "ERROR", response.statusCode));
			}

			const jsonResponse = xmlToJson(responseText);
			const rootElement = jsonResponse[responseRootKey];

			if (!rootElement) {
				return err(
					validationError(
						`Invalid response structure: missing root element '${responseRootKey}'`,
					),
				);
			}

			const parseResult = safeParse(responseSchema, rootElement);
			if (!parseResult.success) {
				const details = buildDetails(parseResult.issues);
				return err(validationError(`Invalid response format: ${details}`));
			}
			return this.handleApiStatus(parseResult.output);
		} catch (error) {
			if (isAbortError(error)) {
				return err(apiError("Request timed out", "TIMEOUT"));
			}
			return err(this.toAvesError(error, "Unknown error occurred"));
		} finally {
			clear?.();
		}
	}

	/**
	 * Shared booking/master request path: validate → wrap RqHeader → POST → parse response.
	 */
	private async invokeOp<
		TIn,
		TApiBody extends Record<string, unknown>,
		TOut extends { rsStatus: RsStatus },
	>(opts: {
		op: string;
		params: TIn;
		apiSchema: BaseSchema<TIn, TApiBody, BaseIssue<unknown>>;
		endpoint: string;
		requestRoot: XMLRootElementValues;
		responseRoot: string;
		responseSchema: BaseSchema<unknown, TOut, BaseIssue<unknown>>;
	}): Promise<Result<TOut, AvesError>> {
		try {
			const apiBody = parse(opts.apiSchema, opts.params);
			return this.request(
				opts.endpoint,
				createRootElement(opts.requestRoot, {
					RqHeader: this.createRqHeader(),
					...apiBody,
				}),
				opts.responseRoot,
				opts.responseSchema,
			);
		} catch (error) {
			return err(
				this.toAvesError(error, `Validation error occurred during ${opts.op}`),
			);
		}
	}

	/**
	 * Search for master records
	 * @param params - Search master record request body in camelCase ({@link SearchMasterRecord})
	 * @returns Result containing list of matching master records in camelCase or error
	 */
	async search(
		params: SearchMasterRecord,
	): Promise<Result<SearchMasterRecordRS, AvesError>> {
		try {
			const requestData = parse(SearchMasterRecordRequestSchema, {
				RqHeader: this.createRqHeader(),
				SearchMasterRecord: params,
			});

			const requestBody = createRootElement(
				XML_ROOT_ELEMENTS.SEARCH_REQUEST,
				requestData,
			);

			return this.request<SearchMasterRecordRS>(
				this.endpoints.search,
				requestBody,
				XML_ROOT_ELEMENTS.SEARCH_RESPONSE,
				SearchMasterRecordResponseSchema,
			);
		} catch (error) {
			return err(
				this.toAvesError(error, "Validation error occurred during search"),
			);
		}
	}

	/**
	 * Insert or update a master record
	 * @param record - Master record data in camelCase ({@link MasterRecordDetail})
	 * @returns Result containing response with customer record code in camelCase or error
	 */
	async upsertRecord(
		record: MasterRecordDetail,
	): Promise<Result<ManageMasterRecordRS, AvesError>> {
		try {
			const apiRecord = parse(MasterRecordDetailApiSchema, record);

			const requestData = parse(ManageMasterRecordRequestSchema, {
				RqHeader: this.createRqHeader(),
				MasterRecordDetail: apiRecord,
			});

			const requestBody = createRootElement(
				XML_ROOT_ELEMENTS.UPSERT_REQUEST,
				requestData,
			);

			return this.request<ManageMasterRecordRS>(
				this.endpoints.upsert,
				requestBody,
				XML_ROOT_ELEMENTS.UPSERT_RESPONSE,
				ManageMasterRecordResponseSchema,
			);
		} catch (error) {
			return err(
				this.toAvesError(error, "Validation error occurred during upsert"),
			);
		}
	}

	/**
	 * Create a booking file (CreateBookingFile).
	 * @param params - Booking file request body in camelCase ({@link BookingFileRQ})
	 */
	async createBooking(
		params: BookingFileRQ,
	): Promise<Result<BookingFileRS, AvesError>> {
		return this.invokeOp({
			op: "createBooking",
			params,
			apiSchema: BookingFileApiSchema,
			endpoint: this.endpoints.createBooking,
			requestRoot: XML_ROOT_ELEMENTS.BOOKING_REQUEST,
			responseRoot: XML_ROOT_ELEMENTS.BOOKING_RESPONSE,
			responseSchema: BookingFileResponseSchema,
		});
	}

	/**
	 * Modify booked services: add/replace lines, assign package, delete/nullify cost items.
	 * @param params - ModFileServicesRQ body in camelCase ({@link ModFileServicesRQ})
	 */
	async modBookingServices(
		params: ModFileServicesRQ,
	): Promise<Result<BookingFileDetailRS, AvesError>> {
		return this.invokeOp({
			op: "modBookingServices",
			params,
			apiSchema: ModFileServicesApiSchema,
			endpoint: this.endpoints.modBookingServices,
			requestRoot: XML_ROOT_ELEMENTS.MOD_FILE_SERVICES_REQUEST,
			responseRoot: XML_ROOT_ELEMENTS.BOOKING_RESPONSE,
			responseSchema: BookingFileDetailResponseSchema,
		});
	}

	/**
	 * Modify booking file header (customer, passengers, notes, financial info).
	 * Does not change package or cost lines.
	 * @param params - ModFileHeaderRQ body in camelCase ({@link ModFileHeaderRQ})
	 */
	async modBookingHeader(
		params: ModFileHeaderRQ,
	): Promise<Result<BookingStatusOnlyRS, AvesError>> {
		return this.invokeOp({
			op: "modBookingHeader",
			params,
			apiSchema: ModFileHeaderApiSchema,
			endpoint: this.endpoints.modBookingHeader,
			requestRoot: XML_ROOT_ELEMENTS.MOD_FILE_HEADER_REQUEST,
			responseRoot: XML_ROOT_ELEMENTS.MOD_FILE_HEADER_RESPONSE,
			responseSchema: BookingStatusOnlyResponseSchema,
		});
	}

	/**
	 * Delete a booking file (CancelBookingFile).
	 * @param params - CancelFileRQ body in camelCase ({@link CancelFileRQ})
	 */
	async cancelBooking(
		params: CancelFileRQ,
	): Promise<Result<BookingStatusOnlyRS, AvesError>> {
		return this.invokeOp({
			op: "cancelBooking",
			params,
			apiSchema: CancelFileApiSchema,
			endpoint: this.endpoints.cancelBooking,
			requestRoot: XML_ROOT_ELEMENTS.CANCEL_FILE_REQUEST,
			responseRoot: XML_ROOT_ELEMENTS.CANCEL_FILE_RESPONSE,
			responseSchema: BookingStatusOnlyResponseSchema,
		});
	}

	/**
	 * Change booking file status (incl. CANCELED / NULLIFIED).
	 * @param params - SetStatusRQ body in camelCase ({@link SetFileStatusRQ})
	 */
	async setBookingStatus(
		params: SetFileStatusRQ,
	): Promise<Result<BookingFileDetailRS, AvesError>> {
		return this.invokeOp({
			op: "setBookingStatus",
			params,
			apiSchema: SetFileStatusApiSchema,
			endpoint: this.endpoints.setBookingStatus,
			requestRoot: XML_ROOT_ELEMENTS.SET_STATUS_REQUEST,
			responseRoot: XML_ROOT_ELEMENTS.SET_STATUS_RESPONSE,
			responseSchema: BookingFileDetailResponseSchema,
		});
	}

	/**
	 * Nullify a single booked service line (SetBookingFileServiceStatus).
	 * @param params - SetStatusServiceRQ body in camelCase ({@link SetFileServiceStatusRQ})
	 */
	async setBookingServiceStatus(
		params: SetFileServiceStatusRQ,
	): Promise<Result<BookingFileDetailRS, AvesError>> {
		return this.invokeOp({
			op: "setBookingServiceStatus",
			params,
			apiSchema: SetFileServiceStatusApiSchema,
			endpoint: this.endpoints.setBookingServiceStatus,
			requestRoot: XML_ROOT_ELEMENTS.SET_STATUS_SERVICE_REQUEST,
			responseRoot: XML_ROOT_ELEMENTS.SET_STATUS_SERVICE_RESPONSE,
			responseSchema: BookingFileDetailResponseSchema,
		});
	}

	/**
	 * Register one or more payments on a booking file (InsertFilePaymentList).
	 * @param params - FilePaymentListRQ body in camelCase ({@link FilePaymentListRQ})
	 */
	async insertFilePaymentList(
		params: FilePaymentListRQ,
	): Promise<Result<BookingStatusOnlyRS, AvesError>> {
		return this.invokeOp({
			op: "insertFilePaymentList",
			params,
			apiSchema: FilePaymentListApiSchema,
			endpoint: this.endpoints.insertFilePaymentList,
			requestRoot: XML_ROOT_ELEMENTS.FILE_PAYMENT_LIST_REQUEST,
			responseRoot: XML_ROOT_ELEMENTS.FILE_PAYMENT_LIST_RESPONSE,
			responseSchema: BookingStatusOnlyResponseSchema,
		});
	}
}
