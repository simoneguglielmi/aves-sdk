import {
	HttpClient,
	type HttpClientRequest,
	HttpClientResponse,
} from "@effect/platform";
import { Effect } from "effect";
import { beforeEach, describe, expect, it } from "vitest";
import { AvesClient } from "./client.js";
import {
	AvesApiError,
	apiError,
	isAvesError,
	unknownError,
	validationError,
} from "./error.js";

type MockReply = { status?: number; body: string };
type MockRequest = { method: string; path: string; body: string };

const requestBodyText = (
	request: HttpClientRequest.HttpClientRequest,
): string => {
	const { body } = request;
	if (body._tag === "Uint8Array") return new TextDecoder().decode(body.body);
	if (body._tag === "Raw" && typeof body.body === "string") return body.body;
	return "";
};

const mockHttp = (onRequest: (req: MockRequest) => MockReply | string) =>
	HttpClient.make((request, url) => {
		const reply = onRequest({
			method: request.method,
			path: url.pathname,
			body: requestBodyText(request),
		});
		const status = typeof reply === "string" ? 200 : (reply.status ?? 200);
		const body = typeof reply === "string" ? reply : reply.body;
		return Effect.succeed(
			HttpClientResponse.fromWeb(request, new Response(body, { status })),
		);
	});

describe("AvesClient", () => {
	let client: AvesClient;
	let onRequest: (req: MockRequest) => MockReply | string;

	const baseURL = "https://api.example.com";
	const hostID = "000000";
	const xtoken = "TOKEN000000";

	beforeEach(() => {
		onRequest = () => ({ status: 599, body: "unmocked" });
		client = new AvesClient(
			{ baseURL, hostID, xtoken },
			{ httpClient: mockHttp((req) => onRequest(req)) },
		);
	});

	describe("constructor", () => {
		it("should create client with correct configuration", () => {
			expect(client).toBeInstanceOf(AvesClient);
			expect("search" in client).toBe(false);
			expect("prepareSearch" in client).toBe(false);
		});
	});

	describe("search", () => {
		it("should make search request and return camelCase response", async () => {
			onRequest = () => ({
				status: 200,
				body: `<SearchMasterRecordRS>
          <RsStatus Status="OK"/>
          <MasterRecordList>
            <MasterRecordDetail RecordCode="508558">
              <Name>ROSSI MARIO</Name>
              <Email>mario.rossi@example.com</Email>
            </MasterRecordDetail>
          </MasterRecordList>
        </SearchMasterRecordRS>`,
			});

			const result = await client.master.search({
				searchType: "CODE",
				recordCode: "508558",
			});

			expect(result.success).toBe(true);
			if (result.success) {
				expect(Array.isArray(result.data)).toBe(true);
				expect(result.data).toHaveLength(1);
				expect(result.data[0]?.recordCode).toBe("508558");
				expect(result.data[0]?.name).toBe("ROSSI MARIO");
			}
		});

		it("should validate input parameters", async () => {
			const result = await client.master.search({
				searchType: "CODE",
				recordCode: "1234", // Too short
			});
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(isAvesError(result.error)).toBe(true);
			}
		});

		it("should handle API errors", async () => {
			onRequest = () => ({
				status: 200,
				body: `<SearchMasterRecordRS>
          <RsStatus Status="ERROR">
            <ErrorCode>1001</ErrorCode>
            <ErrorDescription>Invalid request</ErrorDescription>
          </RsStatus>
        </SearchMasterRecordRS>`,
			});

			const result = await client.master.search({
				searchType: "CODE",
				recordCode: "508558",
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(isAvesError(result.error)).toBe(true);
				expect(result.error.kind).toBe("api");
				expect(result.error.code).toBe(1001);
				expect(result.error.status).toBe("ERROR");
			}
		});

		it("should handle HTTP errors", async () => {
			onRequest = () => ({ status: 500, body: "Internal Server Error" });

			const result = await client.master.search({
				searchType: "CODE",
				recordCode: "508558",
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(isAvesError(result.error)).toBe(true);
				expect(result.error.kind).toBe("api");
				expect(result.error.status).toBe("ERROR");
				expect(result.error.code).toBe(500);
			}
		});

		it("should accept all 2xx HTTP responses", async () => {
			onRequest = () => ({
				status: 201,
				body: `<SearchMasterRecordRS><RsStatus Status="OK"/></SearchMasterRecordRS>`,
			});

			const result = await client.master.search({
				searchType: "CODE",
				recordCode: "508558",
			});

			expect(result.success).toBe(true);
			if (result.success) expect(result.data).toEqual([]);
		});

		it("should cap HTTP error response bodies", async () => {
			onRequest = () => ({ status: 500, body: "x".repeat(5_000) });

			const result = await client.master.search({
				searchType: "CODE",
				recordCode: "508558",
			});

			expect(result.success).toBe(false);
			if (!result.success) expect(result.error.message).toHaveLength(4_096);
		});

		it("should transform request to PascalCase for API", async () => {
			let capturedBody = "";
			onRequest = ({ body }) => {
				capturedBody = body;
				return {
					status: 200,
					body: `<SearchMasterRecordRS>
            <RsStatus Status="OK"/>
          </SearchMasterRecordRS>`,
				};
			};

			await client.master.search({
				searchType: "CODE",
				recordCode: "508558",
				languageCode: "02",
			});

			expect(capturedBody).toContain("<SearchType>CODE</SearchType>");
			expect(capturedBody).toContain("<RecordCode>508558</RecordCode>");
			expect(capturedBody).toContain("<LanguageCode>02</LanguageCode>");
		});
	});

	describe("upsert", () => {
		it("should make upsert request and return camelCase response", async () => {
			onRequest = () => ({
				status: 200,
				body: `<ManageMasterRecordRS>
          <RsStatus Status="OK"/>
          <MasterRecordDetail RecordCode="508558">
            <Name>John Doe</Name>
            <Email>john@example.com</Email>
            <ZipCode>12345</ZipCode>
          </MasterRecordDetail>
        </ManageMasterRecordRS>`,
			});

			const result = await client.master.upsert({
				name: "John Doe",
				email: "john@example.com",
				zipCode: "12345",
				languageCode: "02",
			});

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data).toHaveProperty("rsStatus");
				expect(result.data.rsStatus).toHaveProperty("status", "OK");
				expect(result.data).toHaveProperty("recordCode", "508558");
			}
		});

		it("should allow optional insertCriteria", async () => {
			let capturedBody = "";
			onRequest = ({ body }) => {
				capturedBody = body;
				return {
					status: 200,
					body: `<ManageMasterRecordRS>
            <RsStatus Status="OK"/>
          </ManageMasterRecordRS>`,
				};
			};

			await client.master.upsert({
				name: "John Doe",
				languageCode: "02",
			});

			expect(capturedBody).toBeDefined();
			expect(capturedBody).toContain("<Name>John Doe</Name>");
		});

		it("should transform request to PascalCase for API", async () => {
			let capturedBody = "";
			onRequest = ({ body }) => {
				capturedBody = body;
				return {
					status: 200,
					body: `<ManageMasterRecordRS>
            <RsStatus Status="OK"/>
          </ManageMasterRecordRS>`,
				};
			};

			await client.master.upsert({
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
			onRequest = () => ({
				status: 200,
				body: `<ManageMasterRecordRS>
          <RsStatus Status="ERROR">
            <ErrorCode>1002</ErrorCode>
            <ErrorDescription>Invalid record data</ErrorDescription>
          </RsStatus>
        </ManageMasterRecordRS>`,
			});

			const result = await client.master.upsert({
				name: "John Doe",
				languageCode: "02",
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(isAvesError(result.error)).toBe(true);
				expect(result.error.kind).toBe("api");
				expect(result.error.code).toBe(1002);
				expect(result.error.status).toBe("ERROR");
			}
		});
	});

	describe("create", () => {
		const minimalBookingParams = {
			customerDetail: { recordCode: "138311" },
			bookingFileStatus: { value: "QUOTATION" as const },
			startDate: "2014-12-27T00:00:00",
			endDate: "2015-01-03T00:00:00",
			selectedServiceList: [
				{
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
			],
			passengerList: [
				{
					rph: "001",
					roomRph: "001",
					name: "Adult 1",
					categoryCode: "AD" as const,
					sex: "M" as const,
				},
			],
		};

		it("should make create booking request and return camelCase response", async () => {
			onRequest = () => ({
				status: 200,
				body: `<BookingFileRS>
          <RsStatus Status="OK"/>
          <BookingFileDetail BookingFileCode="14/036657">
            <CustomerRecordCode>138311</CustomerRecordCode>
            <BookingFileStatus Value="QUOTATION"/>
            <StartDate>2014-12-27T00:00:00</StartDate>
            <EndDate>2015-01-03T00:00:00</EndDate>
          </BookingFileDetail>
        </BookingFileRS>`,
			});

			const result = await client.booking.create(minimalBookingParams);

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data).toHaveProperty("rsStatus");
				expect(result.data.rsStatus).toHaveProperty("status", "OK");
				expect(result.data).toHaveProperty("bookingFileCode", "14/036657");
			}
		});

		it("should validate input parameters", async () => {
			const result = await client.booking.create({
				...minimalBookingParams,
				bookingFileStatus: {
					value: "INVALID_STATUS" as "QUOTATION",
				},
			});
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(isAvesError(result.error)).toBe(true);
			}
		});

		it("should handle API errors", async () => {
			onRequest = () => ({
				status: 200,
				body: `<BookingFileRS>
          <RsStatus Status="ERROR">
            <ErrorCode>2001</ErrorCode>
            <ErrorDescription>Booking creation failed</ErrorDescription>
          </RsStatus>
        </BookingFileRS>`,
			});

			const result = await client.booking.create(minimalBookingParams);

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(isAvesError(result.error)).toBe(true);
				expect(result.error.kind).toBe("api");
				expect(result.error.code).toBe(2001);
				expect(result.error.status).toBe("ERROR");
			}
		});

		it("should transform request to PascalCase with BookFileRQ root", async () => {
			let capturedBody = "";
			onRequest = ({ body }) => {
				capturedBody = body;
				return {
					status: 200,
					body: `<BookingFileRS>
            <RsStatus Status="OK"/>
          </BookingFileRS>`,
				};
			};

			await client.booking.create(minimalBookingParams);

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

	describe("updateServices", () => {
		const modParams = {
			customerRecordCode: "138311",
			bookingFileCode: "14/036654",
			selectedServiceList: [
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
			cancellableBookedServiceList: [
				{
					cancelOperationType: "DELETE" as const,
					serviceRefType: "RPH" as const,
					serviceRefValue: "002",
				},
			],
			selectedPackageDetail: {
				pCode: "2014MDE0000010",
				startDate: "2015-01-22T00:00:00",
				endDate: "2015-01-25T00:00:00",
			},
		};

		it("should modify services and return typed booking file fields", async () => {
			onRequest = () => ({
				status: 200,
				body: `<BookingFileRS>
            <RsStatus Status="OK"/>
            <BookingFileDetail BookingFileCode="14/036654">
              <CustomerRecordCode>138311</CustomerRecordCode>
              <PackageCode>2014MDE0000010</PackageCode>
              <BookingFileStatus Value="QUOTATION"/>
            </BookingFileDetail>
          </BookingFileRS>`,
			});

			const result = await client.booking.updateServices(modParams);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.bookingFileCode).toBe("14/036654");
				expect(result.data.packageCode).toBe("2014MDE0000010");
			}
		});

		it("should send DELETE and package attributes in XML", async () => {
			let capturedBody = "";
			onRequest = ({ body }) => {
				capturedBody = body;
				return {
					status: 200,
					body: `<BookingFileRS><RsStatus Status="OK"/></BookingFileRS>`,
				};
			};

			await client.booking.updateServices(modParams);
			expect(capturedBody).toContain("<ModFileServicesRQ>");
			expect(capturedBody).toContain('CancelOperationType="DELETE"');
			expect(capturedBody).toContain('pCode="2014MDE0000010"');
			expect(capturedBody).toContain(
				"<BookedServiceRef>001</BookedServiceRef>",
			);
			expect(capturedBody).toContain('Cost="100.00"');
		});
	});

	describe("cancel / setStatus", () => {
		it("should cancel booking file", async () => {
			onRequest = () => ({
				status: 200,
				body: `<CancelFileRS><RsStatus Status="OK"/></CancelFileRS>`,
			});

			const result = await client.booking.cancel({
				bookingFileCode: "14/000081",
				customerRecordCode: "000170",
			});
			expect(result.success).toBe(true);
			if (result.success) expect(result.data.rsStatus.status).toBe("OK");
		});

		it("should set booking status to CANCELED", async () => {
			onRequest = () => ({
				status: 200,
				body: `<SetStatusRS>
            <RsStatus Status="OK"/>
            <BookingFileDetail BookingFileCode="14/000081">
              <CustomerRecordCode>000170</CustomerRecordCode>
              <BookingFileStatus Value="CANCELED"/>
            </BookingFileDetail>
          </SetStatusRS>`,
			});

			const result = await client.booking.setStatus({
				customerRecordCode: "000170",
				bookingFileCode: "14/000081",
				fileStatus: { value: "CANCELED" },
			});
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.bookingFileStatus?.value).toBe("CANCELED");
			}
		});

		it("should nullify a booked service line", async () => {
			onRequest = () => ({
				status: 200,
				body: `<SetStatusServiceRS>
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
			});

			const result = await client.booking.setServiceStatus({
				customerRecordCode: "000001",
				bookingFileCode: "18/000252",
				bookingServiceRef: "002",
				bookingFileServiceStatus: "NULLIFIED",
			});
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.bookedServiceList?.[0].serviceStatus).toBe(
					"NULLIFIED",
				);
			}
		});

		it("should reject setStatus with invalid status", async () => {
			const result = await client.booking.setStatus({
				customerRecordCode: "000170",
				bookingFileCode: "14/000081",
				fileStatus: { value: "INVALID" as "CANCELED" },
			});
			expect(result.success).toBe(false);
			if (!result.success) expect(isAvesError(result.error)).toBe(true);
		});
	});

	describe("updateHeader", () => {
		it("should modify header and return status-only response", async () => {
			onRequest = () => ({
				status: 200,
				body: `<ModFileHeaderRS><RsStatus Status="OK"/></ModFileHeaderRS>`,
			});

			const result = await client.booking.updateHeader({
				bookingFileCode: "14/000043",
				bookingFileStartDate: "2014-04-28",
				customerRecordCode: "103737",
				passengerList: [
					{
						rph: "001",
						name: "ADULTI 001",
						sex: "M",
						birthDate: "1964-09-26T00:00:00",
					},
				],
			});
			expect(result.success).toBe(true);
			if (result.success) expect(result.data.rsStatus.status).toBe("OK");
		});
	});

	describe("addPayments", () => {
		it("should insert payments and return status OK", async () => {
			let capturedBody = "";
			onRequest = ({ body }) => {
				capturedBody = body;
				return {
					status: 200,
					body: `<FilePaymentListRS><RsStatus Status="OK"/></FilePaymentListRS>`,
				};
			};

			const result = await client.booking.addPayments({
				bookingFileCode: "18/000172",
				paymentUser: "MLDN",
				enableMultiplePayments: true,
				operationType: "AbsoluteAmountsInsertion",
				filePaymentList: [
					{
						paymentDate: "2018-09-08",
						paymentNote: "INCASSO",
						amount: "100.00",
						paymentType: "B",
					},
				],
			});

			expect(result.success).toBe(true);
			if (result.success) expect(result.data.rsStatus.status).toBe("OK");
			expect(capturedBody).toContain("<FilePaymentListRQ");
			expect(capturedBody).toContain(
				"<BookingFileCode>18/000172</BookingFileCode>",
			);
			expect(capturedBody).toContain('PaymentUser="MLDN"');
			expect(capturedBody).toContain('PaymentType="B"');
			expect(capturedBody).toContain('Amount="100.00"');
		});

		it("should reject payload without booking file reference", async () => {
			const result = await client.booking.addPayments({
				enableMultiplePayments: true,
				operationType: "AbsoluteAmountsInsertion",
				filePaymentList: [
					{
						paymentDate: "2018-09-08",
						amount: "100.00",
						paymentType: "B",
					},
				],
			} as Parameters<typeof client.booking.addPayments>[0]);
			expect(result.success).toBe(false);
			if (!result.success) expect(isAvesError(result.error)).toBe(true);
		});
	});

	describe("search", () => {
		it("should search packages and return camelCase package list", async () => {
			let capturedBody = "";
			onRequest = ({ body }) => {
				capturedBody = body;
				return {
					status: 200,
					body: `<SearchPackageRS>
          <RsStatus Status="OK"/>
          <PackageList>
            <PackageDetail pCode="2015F041">
              <FirstDescription>FANTASIA 4 DAYS</FirstDescription>
              <CanCommitPack>false</CanCommitPack>
            </PackageDetail>
          </PackageList>
        </SearchPackageRS>`,
				};
			};

			const result = await client.packages.search({
				customerRecordCode: "138311",
				languageCode: "01",
				currencyCode: "EUR",
				startDate: "2014-12-27T00:00:00",
				endDate: "2015-01-03T00:00:00",
				passengerList: [
					{
						rph: "001",
						roomRph: "001",
						name: "ADULTI 001",
						categoryCode: "AD",
						sex: "M",
					},
				],
				servOrPackCode: "2014MDE0000010",
			});

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.rsStatus.status).toBe("OK");
				expect(result.data.packageList?.[0]).toMatchObject({
					pCode: "2015F041",
					firstDescription: "FANTASIA 4 DAYS",
				});
			}
			expect(capturedBody).toContain("<AvesSearchRQ");
			expect(capturedBody).toContain(
				"<StartDate>2014-12-27T00:00:00</StartDate>",
			);
			expect(capturedBody).toContain(
				"<AvesSearchType>PACKAGE</AvesSearchType>",
			);
			expect(capturedBody).toContain(
				"<ServOrPackCode>2014MDE0000010</ServOrPackCode>",
			);
			expect(capturedBody).toContain("<PaxQty>1</PaxQty>");
			expect(capturedBody).toContain(
				"<PaxQtyCriteria>GREATER_OR_EQUAL</PaxQtyCriteria>",
			);
		});

		it("should use client languageCode when omitted on search", async () => {
			const localized = new AvesClient(
				{ baseURL, hostID, xtoken, languageCode: "02" },
				{ httpClient: mockHttp((req) => onRequest(req)) },
			);
			let capturedBody = "";
			onRequest = ({ body }) => {
				capturedBody = body;
				return {
					status: 200,
					body: `<SearchPackageRS><RsStatus Status="OK"/></SearchPackageRS>`,
				};
			};

			const result = await localized.packages.search({
				customerRecordCode: "138311",
				startDate: "2014-12-27T00:00:00",
				endDate: "2015-01-03T00:00:00",
				passengerList: [
					{
						rph: "001",
						roomRph: "001",
						name: "ADULTI 001",
						categoryCode: "AD",
						sex: "M",
					},
				],
			});

			expect(result.success).toBe(true);
			expect(capturedBody).toContain("<LanguageCode>02</LanguageCode>");
			expect(capturedBody).toContain(
				"<AvesSearchType>PACKAGE</AvesSearchType>",
			);
		});
	});

	describe("get", () => {
		it("should get package detail", async () => {
			onRequest = () => ({
				status: 200,
				body: `<PackageDetailRS>
          <RsStatus Status="OK"/>
          <PackageDetail pCode="2015F042">
            <FirstDescription>FANTASIA 4 DAYS/3 NIGHTS</FirstDescription>
          </PackageDetail>
        </PackageDetailRS>`,
			});

			const result = await client.packages.get({
				customerRecordCode: "001692",
				packageCode: "2015F042",
				startDate: "2015-05-02T00:00:00",
				endDate: "2015-05-05T00:00:00",
				selectedServiceList: [
					{ serviceCode: "PFRM04    PAR", packageRow: "01" },
				],
			});

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data).toMatchObject({
					pCode: "2015F042",
					firstDescription: "FANTASIA 4 DAYS/3 NIGHTS",
				});
			}
		});
	});

	describe("commit", () => {
		it("should commit package", async () => {
			onRequest = () => ({
				status: 200,
				body: `<CommitPackRS><RsStatus Status="OK"/></CommitPackRS>`,
			});

			const result = await client.packages.commit({
				packageCode: "14/PACKAGE001",
			});

			expect(result.success).toBe(true);
			if (result.success) expect(result.data.rsStatus.status).toBe("OK");
		});
	});

	describe("searchBookings", () => {
		it("should search by PACKAGE_CODE", async () => {
			onRequest = () => ({
				status: 200,
				body: `<SearchFileRS>
          <RsStatus Status="OK"/>
          <BookingFileList>
            <BookingFileDetail BookingFileCode="14/036654">
              <CustomerRecordCode>138311</CustomerRecordCode>
              <PackageCode>2014MDE0000010</PackageCode>
            </BookingFileDetail>
          </BookingFileList>
        </SearchFileRS>`,
			});

			const result = await client.booking.search({
				searchType: "PACKAGE_CODE",
				customerRecordCode: "138311",
				packageCode: "2014MDE0000010",
			});

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.bookingFileList?.[0]).toMatchObject({
					bookingFileCode: "14/036654",
					packageCode: "2014MDE0000010",
				});
			}
		});
	});

	describe("exportData", () => {
		const exportResponse = `<BookingDataExportRS>
          <RsStatus Status="OK"/>
          <BookingFileList>
            <BookingFileData BookingFileCode="14/036654">
              <BookingFileStatus Value="CONFIRM"/>
              <CustomerRecordCode>138311</CustomerRecordCode>
              <CurrencyCode>EUR</CurrencyCode>
              <BookedServices>
                <BookedServiceData RPH="001" ServiceCode="HA51-2">
                  <AvesServiceType>TOP</AvesServiceType>
                  <AmountsDetail CostWithTax="210.000000"/>
                </BookedServiceData>
              </BookedServices>
              <PaymentList>
                <PaymentDetail PaymentDate="2015-03-05T10:07:02+01:00"
                 Amount="11.000000" PaymentType="C"/>
              </PaymentList>
              <BookedFileAmounts CustomerTotalAmount="280.000000"
               CustomerDueAmount="269.000000"/>
            </BookingFileData>
          </BookingFileList>
          <ExtraInfo>
            <NationList>
              <NationDetail Code="ITA" Name="ITALIA" Territoriality="IN_UE"/>
            </NationList>
          </ExtraInfo>
        </BookingDataExportRS>`;

		it("reads payments and amounts back for a booking file", async () => {
			onRequest = () => ({ status: 200, body: exportResponse });

			const result = await client.booking.exportData({
				bookingFileCode: "14/036654",
			});

			expect(result.success).toBe(true);
			if (result.success) {
				const [file] = result.data.bookingFileList ?? [];
				expect(file?.bookingFileCode).toBe("14/036654");
				expect(file?.bookingFileStatus?.value).toBe("CONFIRMED");
				expect(file?.paymentList).toEqual([
					{
						paymentDate: "2015-03-05T10:07:02+01:00",
						amount: "11.000000",
						paymentType: "C",
					},
				]);
				expect(file?.bookedFileAmounts?.customerDueAmount).toBe("269.000000");
				expect(result.data.extraInfo?.nationList?.[0]?.territoriality).toBe(
					"IN_UE",
				);
			}
		});

		it("exposes the same payload under facade alias names", async () => {
			onRequest = () => ({ status: 200, body: exportResponse });

			const result = await client.booking.exportData({
				bookingCode: "14/036654",
			});

			expect(result.success).toBe(true);
			if (result.success) {
				const [file] = result.data.bookings ?? [];
				expect(file?.bookingCode).toBe("14/036654");
				expect(file?.status?.value).toBe("CONFIRMED");
				expect(file?.payments?.[0]?.amount).toBe("11.000000");
				expect(file?.services?.[0]?.amounts?.costWithTax).toBe("210.000000");
				expect(file?.totals?.customerTotalAmount).toBe("280.000000");
			}
		});

		it("rejects a take above the AVES ceiling before sending", async () => {
			const result = await client.booking.exportData({
				limitRange: { skip: 0, take: 5000 },
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(isAvesError(result.error)).toBe(true);
				expect(result.error.kind).toBe("validation");
			}
		});

		it("surfaces AVES errors as api errors", async () => {
			onRequest = () => ({
				status: 200,
				body: `<BookingDataExportRS>
            <RsStatus Status="ERROR">
              <ErrorCode>1002</ErrorCode>
              <ErrorDescription>Booking file not found</ErrorDescription>
            </RsStatus>
          </BookingDataExportRS>`,
			});

			const result = await client.booking.exportData({
				bookingFileCode: "99/999999",
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.kind).toBe("api");
				expect(result.error.code).toBe(1002);
			}
		});
	});

	describe("AvesError", () => {
		it("should create error with correct properties", () => {
			const error = apiError("Test error message", "ERROR", 1001);

			expect(error).toBeInstanceOf(Error);
			expect(error).toBeInstanceOf(AvesApiError);
			expect(isAvesError(error)).toBe(true);
			expect(error._tag).toBe("AvesApiError");
			expect(error.kind).toBe("api");
			expect(error.message).toBe("Test error message");
			expect(error.status).toBe("ERROR");
			expect(error.code).toBe(1001);
		});

		it("preserves status casing and leaves absent code undefined", () => {
			const error = apiError("Test error message", "ERROR");

			expect(error.status).toBe("ERROR");
			expect(error.code).toBeUndefined();
		});

		it("should create validation error", () => {
			const error = validationError("Validation failed");

			expect(isAvesError(error)).toBe(true);
			expect(error._tag).toBe("AvesValidationError");
			expect(error.kind).toBe("validation");
			expect(error.message).toBe("Validation failed");
		});

		it("should create unknown error", () => {
			const error = unknownError("Unknown error occurred");

			expect(isAvesError(error)).toBe(true);
			expect(error._tag).toBe("AvesUnknownError");
			expect(error.kind).toBe("unknown");
			expect(error.message).toBe("Unknown error occurred");
		});
	});
});
