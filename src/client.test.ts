import {
	type Dispatcher,
	getGlobalDispatcher,
	MockAgent,
	setGlobalDispatcher,
} from "undici";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { AvesClient } from "./client.js";
import { AvesError } from "./error.js";

const isBun = typeof process !== "undefined" && !!process.versions?.bun;
const describeHttp = isBun ? describe.skip : describe;

describeHttp("AvesClient", () => {
	let client: AvesClient;
	let mockAgent: MockAgent;
	let originalDispatcher: Dispatcher;

	const baseURL = "https://api.example.com";
	const hostID = "000000";
	const xtoken = "TOKEN000000";

	beforeEach(() => {
		originalDispatcher = getGlobalDispatcher();
		mockAgent = new MockAgent();
		mockAgent.disableNetConnect();
		setGlobalDispatcher(mockAgent);

		client = new AvesClient({ baseURL, hostID, xtoken });
	});

	afterEach(async () => {
		await mockAgent.close();
		setGlobalDispatcher(originalDispatcher);
	});

	describe("constructor", () => {
		it("should create client with correct configuration", () => {
			expect(client).toBeInstanceOf(AvesClient);
		});
	});

	describe("search", () => {
		it("should make search request and return camelCase response", async () => {
			const mockClient = mockAgent.get(baseURL);

			mockClient
				.intercept({
					path: "/interop/masterRecords/v2/rest/Search",
					method: "POST",
				})
				.reply(
					200,
					`<SearchMasterRecordRS>
          <RsStatus Status="OK"/>
          <MasterRecordList>
            <MasterRecordDetail RecordCode="508558">
              <Name>ROSSI MARIO</Name>
              <Email>mario.rossi@example.com</Email>
            </MasterRecordDetail>
          </MasterRecordList>
        </SearchMasterRecordRS>`,
				);

			const result = await client.search({
				searchType: "CODE",
				recordCode: "508558",
			});

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data).toHaveProperty("rsStatus");
				expect(result.data.rsStatus).toHaveProperty("status", "OK");
				expect(result.data).toHaveProperty("masterRecordList");
			}
		});

		it("should validate input parameters", async () => {
			const result = await client.search({
				searchType: "CODE",
				recordCode: "1234", // Too short
			});
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBeInstanceOf(AvesError);
			}
		});

		it("should handle API errors", async () => {
			const mockClient = mockAgent.get(baseURL);

			mockClient
				.intercept({
					path: "/interop/masterRecords/v2/rest/Search",
					method: "POST",
				})
				.reply(
					200,
					`<SearchMasterRecordRS>
          <RsStatus Status="ERROR">
            <ErrorCode>1001</ErrorCode>
            <ErrorDescription>Invalid request</ErrorDescription>
          </RsStatus>
        </SearchMasterRecordRS>`,
				);

			const result = await client.search({
				searchType: "CODE",
				recordCode: "508558",
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBeInstanceOf(AvesError);
				expect(result.error.kind).toBe("api");
				expect(result.error.code).toBe(1001);
				expect(result.error.status).toBe("error");
			}
		});

		it("should handle HTTP errors", async () => {
			const mockClient = mockAgent.get(baseURL);

			mockClient
				.intercept({
					path: "/interop/masterRecords/v2/rest/Search",
					method: "POST",
				})
				.reply(500, "Internal Server Error");

			const result = await client.search({
				searchType: "CODE",
				recordCode: "508558",
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBeInstanceOf(AvesError);
				expect(result.error.kind).toBe("api");
				expect(result.error.status).toBe("error");
				expect(result.error.code).toBe(500);
			}
		});

		it("should transform request to PascalCase for API", async () => {
			const mockClient = mockAgent.get(baseURL);
			let capturedBody = "";

			mockClient
				.intercept({
					path: "/interop/masterRecords/v2/rest/Search",
					method: "POST",
				})
				.reply(200, (opts) => {
					capturedBody = opts.body as string;
					return `<SearchMasterRecordRS>
            <RsStatus Status="OK"/>
          </SearchMasterRecordRS>`;
				});

			await client.search({
				searchType: "CODE",
				recordCode: "508558",
				languageCode: "02",
			});

			expect(capturedBody).toContain("<SearchType>CODE</SearchType>");
			expect(capturedBody).toContain("<RecordCode>508558</RecordCode>");
			expect(capturedBody).toContain("<LanguageCode>02</LanguageCode>");
		});
	});

	describe("upsertRecord", () => {
		it("should make upsert request and return camelCase response", async () => {
			const mockClient = mockAgent.get(baseURL);

			mockClient
				.intercept({
					path: "/interop/masterRecords/v2/rest/InsertOrUpdate",
					method: "POST",
				})
				.reply(
					200,
					`<ManageMasterRecordRS>
          <RsStatus Status="OK"/>
          <MasterRecordDetail RecordCode="508558">
            <Name>John Doe</Name>
            <Email>john@example.com</Email>
            <ZipCode>12345</ZipCode>
          </MasterRecordDetail>
        </ManageMasterRecordRS>`,
				);

			const result = await client.upsertRecord({
				name: "John Doe",
				email: "john@example.com",
				zipCode: "12345",
				languageCode: "02",
			});

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data).toHaveProperty("rsStatus");
				expect(result.data.rsStatus).toHaveProperty("status", "OK");
				expect(result.data).toHaveProperty("masterRecordDetail");
				expect(result.data.masterRecordDetail).toHaveProperty(
					"recordCode",
					"508558",
				);
			}
		});

		it("should allow optional insertCriteria", async () => {
			const mockClient = mockAgent.get(baseURL);
			let capturedBody = "";

			mockClient
				.intercept({
					path: "/interop/masterRecords/v2/rest/InsertOrUpdate",
					method: "POST",
				})
				.reply(200, (opts) => {
					capturedBody = opts.body as string;
					return `<ManageMasterRecordRS>
            <RsStatus Status="OK"/>
          </ManageMasterRecordRS>`;
				});

			await client.upsertRecord({
				name: "John Doe",
				languageCode: "02",
			});

			expect(capturedBody).toBeDefined();
			expect(capturedBody).toContain("<Name>John Doe</Name>");
		});

		it("should transform request to PascalCase for API", async () => {
			const mockClient = mockAgent.get(baseURL);
			let capturedBody = "";

			mockClient
				.intercept({
					path: "/interop/masterRecords/v2/rest/InsertOrUpdate",
					method: "POST",
				})
				.reply(200, (opts) => {
					capturedBody = opts.body as string;
					return `<ManageMasterRecordRS>
            <RsStatus Status="OK"/>
          </ManageMasterRecordRS>`;
				});

			await client.upsertRecord({
				name: "John Doe",
				email: "john@example.com",
				zipCode: "12345",
				languageCode: "02",
			});

			expect(capturedBody).toContain("<Name>John Doe</Name>");
			expect(capturedBody).toContain("<Email>john@example.com</Email>");
			expect(capturedBody).toContain("<ZipCode>12345</ZipCode>");
		});

		it("should handle API errors", async () => {
			const mockClient = mockAgent.get(baseURL);

			mockClient
				.intercept({
					path: "/interop/masterRecords/v2/rest/InsertOrUpdate",
					method: "POST",
				})
				.reply(
					200,
					`<ManageMasterRecordRS>
          <RsStatus Status="ERROR">
            <ErrorCode>1002</ErrorCode>
            <ErrorDescription>Invalid record data</ErrorDescription>
          </RsStatus>
        </ManageMasterRecordRS>`,
				);

			const result = await client.upsertRecord({
				name: "John Doe",
				languageCode: "02",
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBeInstanceOf(AvesError);
				expect(result.error.kind).toBe("api");
				expect(result.error.code).toBe(1002);
				expect(result.error.status).toBe("error");
			}
		});
	});

	describe("createBooking", () => {
		const minimalBookingParams = {
			customerDetail: { recordCode: "138311" },
			bookingFileStatus: { value: "QUOTATION" as const },
			startDate: "2014-12-27T00:00:00",
			endDate: "2015-01-03T00:00:00",
			selectedServiceList: [
				{
					selectedServiceDetail: {
						sCode: "S1",
						avesServiceType: "TOP_SS" as const,
						toServiceType: "TRANSPORT" as const,
						startDate: "2014-12-27T00:00:00",
						endDate: "2015-01-03T00:00:00",
						qty: "1",
						pax: "1",
						paxAssociated: [],
						avesSession: "1",
					},
				},
			],
			passengerList: [
				{
					passengerDetail: {
						rph: "001",
						roomRph: "001",
						name: "Adult 1",
						categoryCode: "AD" as const,
						sex: "M" as const,
					},
				},
			],
		};

		it("should make createBooking request and return camelCase response", async () => {
			const mockClient = mockAgent.get(baseURL);

			mockClient
				.intercept({
					path: "/interop/booking/v2/rest/CreateBookingFile",
					method: "POST",
				})
				.reply(
					200,
					`<BookingFileRS>
          <RsStatus Status="OK"/>
          <BookingFileDetail BookingFileCode="14/036657">
            <CustomerRecordCode>138311</CustomerRecordCode>
            <BookingFileStatus Value="QUOTATION"/>
            <StartDate>2014-12-27T00:00:00</StartDate>
            <EndDate>2015-01-03T00:00:00</EndDate>
          </BookingFileDetail>
        </BookingFileRS>`,
				);

			const result = await client.createBooking(minimalBookingParams);

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data).toHaveProperty("rsStatus");
				expect(result.data.rsStatus).toHaveProperty("status", "OK");
				expect(result.data).toHaveProperty("bookingFileDetail");
				expect(result.data.bookingFileDetail).toHaveProperty(
					"bookingFileCode",
					"14/036657",
				);
			}
		});

		it("should validate input parameters", async () => {
			const result = await client.createBooking({
				...minimalBookingParams,
				bookingFileStatus: {
					value: "INVALID_STATUS" as "QUOTATION",
				},
			});
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBeInstanceOf(AvesError);
			}
		});

		it("should handle API errors", async () => {
			const mockClient = mockAgent.get(baseURL);

			mockClient
				.intercept({
					path: "/interop/booking/v2/rest/CreateBookingFile",
					method: "POST",
				})
				.reply(
					200,
					`<BookingFileRS>
          <RsStatus Status="ERROR">
            <ErrorCode>2001</ErrorCode>
            <ErrorDescription>Booking creation failed</ErrorDescription>
          </RsStatus>
        </BookingFileRS>`,
				);

			const result = await client.createBooking(minimalBookingParams);

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBeInstanceOf(AvesError);
				expect(result.error.kind).toBe("api");
				expect(result.error.code).toBe(2001);
				expect(result.error.status).toBe("error");
			}
		});

		it("should transform request to PascalCase with BookFileRQ root", async () => {
			const mockClient = mockAgent.get(baseURL);
			let capturedBody = "";

			mockClient
				.intercept({
					path: "/interop/booking/v2/rest/CreateBookingFile",
					method: "POST",
				})
				.reply(200, (opts) => {
					capturedBody = opts.body as string;
					return `<BookingFileRS>
            <RsStatus Status="OK"/>
          </BookingFileRS>`;
				});

			await client.createBooking(minimalBookingParams);

			expect(capturedBody).toContain("<BookFileRQ>");
			expect(capturedBody).toContain("<CustomerDetail");
			expect(capturedBody).toContain('RecordCode="138311"');
			expect(capturedBody).toContain("<BookingFileStatus");
			expect(capturedBody).toContain(
				"<StartDate>2014-12-27T00:00:00</StartDate>",
			);
			expect(capturedBody).toContain("<PassengerList>");
		});
	});

	describe("modBookingServices", () => {
		const modParams = {
			customerRecordCode: "138311",
			bookingFileCode: "14/036654",
			selectedServiceList: {
				selectedServiceDetail: [
					{
						sCode: "HT00110840",
						ssCode: "DL",
						avesServiceType: "TOP" as const,
						toServiceType: "RESIDENCE" as const,
						startDate: "2015-01-22T00:00:00",
						endDate: "2015-01-25T00:00:00",
						qty: "1",
						pax: "2",
						paxAssociated: [],
						avesSession: "1",
						bookedServiceRef: "001",
						serviceFare: {
							currencyCode: "EUR",
							cost: "100.00",
							price: "120.00",
						},
					},
				],
			},
			cancellableBookedServiceList: {
				cancellableBookedServiceDetail: [
					{
						cancelOperationType: "DELETE" as const,
						serviceRefType: "RPH" as const,
						serviceRefValue: "002",
					},
				],
			},
			selectedPackageDetail: {
				pCode: "2014MDE0000010",
				startDate: "2015-01-22T00:00:00",
				endDate: "2015-01-25T00:00:00",
			},
		};

		it("should modify services and return typed bookingFileDetail", async () => {
			const mockClient = mockAgent.get(baseURL);
			mockClient
				.intercept({
					path: "/interop/booking/v2/rest/ModBookingFileServices",
					method: "POST",
				})
				.reply(
					200,
					`<BookingFileRS>
            <RsStatus Status="OK"/>
            <BookingFileDetail BookingFileCode="14/036654">
              <CustomerRecordCode>138311</CustomerRecordCode>
              <PackageCode>2014MDE0000010</PackageCode>
              <BookingFileStatus Value="QUOTATION"/>
            </BookingFileDetail>
          </BookingFileRS>`,
				);

			const result = await client.modBookingServices(modParams);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.bookingFileDetail?.bookingFileCode).toBe(
					"14/036654",
				);
				expect(result.data.bookingFileDetail?.packageCode).toBe(
					"2014MDE0000010",
				);
			}
		});

		it("should send DELETE and package attributes in XML", async () => {
			const mockClient = mockAgent.get(baseURL);
			let capturedBody = "";
			mockClient
				.intercept({
					path: "/interop/booking/v2/rest/ModBookingFileServices",
					method: "POST",
				})
				.reply(200, (opts) => {
					capturedBody = opts.body as string;
					return `<BookingFileRS><RsStatus Status="OK"/></BookingFileRS>`;
				});

			await client.modBookingServices(modParams);
			expect(capturedBody).toContain("<ModFileServicesRQ>");
			expect(capturedBody).toContain('CancelOperationType="DELETE"');
			expect(capturedBody).toContain('pCode="2014MDE0000010"');
			expect(capturedBody).toContain(
				"<BookedServiceRef>001</BookedServiceRef>",
			);
			expect(capturedBody).toContain('Cost="100.00"');
		});
	});

	describe("cancelBooking / setBookingStatus", () => {
		it("should cancel booking file", async () => {
			const mockClient = mockAgent.get(baseURL);
			mockClient
				.intercept({
					path: "/interop/booking/v2/rest/CancelBookingFile",
					method: "POST",
				})
				.reply(200, `<CancelFileRS><RsStatus Status="OK"/></CancelFileRS>`);

			const result = await client.cancelBooking({
				bookingFileCode: "14/000081",
				customerRecordCode: "000170",
			});
			expect(result.success).toBe(true);
			if (result.success) expect(result.data.rsStatus.status).toBe("OK");
		});

		it("should set booking status to CANCELED", async () => {
			const mockClient = mockAgent.get(baseURL);
			mockClient
				.intercept({
					path: "/interop/booking/v2/rest/SetBookingFileStatus",
					method: "POST",
				})
				.reply(
					200,
					`<SetStatusRS>
            <RsStatus Status="OK"/>
            <BookingFileDetail BookingFileCode="14/000081">
              <CustomerRecordCode>000170</CustomerRecordCode>
              <BookingFileStatus Value="CANCELED"/>
            </BookingFileDetail>
          </SetStatusRS>`,
				);

			const result = await client.setBookingStatus({
				customerRecordCode: "000170",
				bookingFileCode: "14/000081",
				fileStatus: { value: "CANCELED" },
			});
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.bookingFileDetail?.bookingFileStatus?.value).toBe(
					"CANCELED",
				);
			}
		});

		it("should nullify a booked service line", async () => {
			const mockClient = mockAgent.get(baseURL);
			mockClient
				.intercept({
					path: "/interop/booking/v2/rest/SetBookingFileServiceStatus",
					method: "POST",
				})
				.reply(
					200,
					`<SetStatusServiceRS>
            <RsStatus Status="OK"/>
            <BookingFileDetail BookingFileCode="18/000252">
              <CustomerRecordCode>000001</CustomerRecordCode>
              <BookedServiceList>
                <BookedServiceDetail RPH="002" ServiceCode="S1">
                  <ServiceStatus>NULLIFIED</ServiceStatus>
                </BookedServiceDetail>
              </BookedServiceList>
            </BookingFileDetail>
          </SetStatusServiceRS>`,
				);

			const result = await client.setBookingServiceStatus({
				customerRecordCode: "000001",
				bookingFileCode: "18/000252",
				bookingServiceRef: "002",
				bookingFileServiceStatus: "NULLIFIED",
			});
			expect(result.success).toBe(true);
			if (result.success) {
				expect(
					result.data.bookingFileDetail?.bookedServiceList
						?.bookedServiceDetail?.[0].serviceStatus,
				).toBe("NULLIFIED");
			}
		});

		it("should reject setBookingStatus with invalid status", async () => {
			const result = await client.setBookingStatus({
				customerRecordCode: "000170",
				bookingFileCode: "14/000081",
				fileStatus: { value: "INVALID" as "CANCELED" },
			});
			expect(result.success).toBe(false);
			if (!result.success) expect(result.error).toBeInstanceOf(AvesError);
		});
	});

	describe("modBookingHeader", () => {
		it("should modify header and return status-only response", async () => {
			const mockClient = mockAgent.get(baseURL);
			mockClient
				.intercept({
					path: "/interop/booking/v2/rest/ModBookingFileHeader",
					method: "POST",
				})
				.reply(
					200,
					`<ModFileHeaderRS><RsStatus Status="OK"/></ModFileHeaderRS>`,
				);

			const result = await client.modBookingHeader({
				bookingFileCode: "14/000043",
				bookingFileStartDate: "2014-04-28",
				customerRecordCode: "103737",
				passengerList: {
					passengerDetail: [
						{
							rph: "001",
							name: "ADULTI 001",
							sex: "M",
							birthDate: "1964-09-26T00:00:00",
						},
					],
				},
			});
			expect(result.success).toBe(true);
			if (result.success) expect(result.data.rsStatus.status).toBe("OK");
		});
	});

	describe("AvesError", () => {
		it("should create error with correct properties", () => {
			const error = new AvesError("api", "Test error message", "error", 1001);

			expect(error).toBeInstanceOf(Error);
			expect(error).toBeInstanceOf(AvesError);
			expect(error.kind).toBe("api");
			expect(error.message).toBe("Test error message");
			expect(error.status).toBe("error");
			expect(error.code).toBe(1001);
		});

		it("should create validation error", () => {
			const error = new AvesError("validation", "Validation failed");

			expect(error).toBeInstanceOf(AvesError);
			expect(error.kind).toBe("validation");
			expect(error.message).toBe("Validation failed");
		});

		it("should create unknown error", () => {
			const error = new AvesError("unknown", "Unknown error occurred");

			expect(error).toBeInstanceOf(AvesError);
			expect(error.kind).toBe("unknown");
			expect(error.message).toBe("Unknown error occurred");
		});
	});
});
