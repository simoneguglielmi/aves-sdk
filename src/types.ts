import type { InferInput, InferOutput } from "valibot";
import type {
	BookingFileResponseSchema,
	BookingFileSchema,
} from "./schemas/booking-file.js";
import type {
	BookingStatusOnlyResponseSchema,
	CancelFileSchema,
	FilePaymentListSchema,
	ModFileHeaderSchema,
	ModFileServicesSchema,
	SetFileServiceStatusSchema,
	SetFileStatusSchema,
} from "./schemas/booking-ops.js";
import type { BookingFileDetailApiSchema } from "./schemas/booking-response.js";
import type { RqHeaderSchema, RsStatusSchema } from "./schemas/common.js";
import type {
	AccountPoliciesSchema,
	DynamicFieldsInputSchema,
	FinancialDetailSchema,
	IdDocumentDetailSchema,
	MasterRecordDetailResponseSchema,
	MasterRecordDetailSchema,
	SupplierRefMasterRecordsSchema,
} from "./schemas/master-record.js";
import type {
	AvesSearchSchema,
	CommitPackageResponseSchema,
	CommitPackageSchema,
	PackageDetailRequestSchema,
	PackageDetailResponseSchema,
	SearchPackageResponseSchema,
	SearchServicesResponseSchema,
} from "./schemas/package-catalog.js";
import type { SearchMasterRecordSchema } from "./schemas/search.js";
import type { SearchBookingFileSchema } from "./schemas/search-booking-file.js";
import type {
	ManageMasterRecordRequestSchema,
	ManageMasterRecordResponseSchema,
} from "./schemas/upsert.js";
import type { Camelize } from "./utils/case-transform.js";
import type { FacadeOutput } from "./utils/facade-transform.js";

// ============================================================================
// Common Types
// ============================================================================

/**
 * Request header containing authentication credentials for AVES API calls.
 *
 * @property hostID - 6-digit identification code assigned to your organization
 * @property xtoken - Authentication token for API access
 * @property interface - Interface type, always 'WEB'
 * @property userName - Username for the request, always 'WEB'
 * @property languageCode - Optional 2-digit AVES language code (e.g., '01' for Italian)
 */
export type RqHeader = InferInput<typeof RqHeaderSchema>;

/**
 * Response status returned by all AVES API operations.
 *
 * @property status - Result status: 'OK' (success), 'ERROR' (failure), 'WARNING' (partial success), 'TIMEOUT'
 * @property errorCode - Numeric error code when status is 'ERROR' (e.g., 1001, 1002)
 * @property errorDescription - Human-readable error message
 * @property warnings - Raw warning text when status is 'WARNING'
 *
 * @example
 * ```typescript
 * if (response.rsStatus.status === 'OK') {
 *   // Process successful response
 * } else {
 *   console.error(response.rsStatus.errorDescription);
 * }
 * ```
 */
export type RsStatus = InferOutput<typeof RsStatusSchema>;

// ============================================================================
// Master Record Types
// ============================================================================

/**
 * Financial and payment details for a master record.
 *
 * @property currencyCode - ISO currency code (e.g., 'EUR', 'USD')
 * @property creditLimit - Maximum credit amount as a string
 * @property c_PaymentType - Customer payment type: 'CASH' | 'BANK' | 'RID' | 'RIBA' | 'SPECIFIC_CODE'
 * @property c_SpecPaymentTypeCode - Specific payment code when c_PaymentType is 'SPECIFIC_CODE'
 * @property s_PaymentType - Supplier payment type: 'CASH' | 'BANK' | 'RID' | 'RIBA' | 'SPECIFIC_CODE'
 * @property s_SpecPaymentTypeCode - Specific payment code when s_PaymentType is 'SPECIFIC_CODE'
 * @property enableElectronicInvoicing - Enable electronic invoicing (accepts boolean or 'true'/'false' string)
 * @property electronicInvoicingType - Type of electronic invoicing when enabled
 */
export type FinancialDetail = InferInput<typeof FinancialDetailSchema>;

/**
 * Identity document details for a master record.
 *
 * @property idType - Document type code (e.g., 'PASSPORT', 'ID_CARD')
 * @property idCode - Document number/identifier
 * @property idIssueLocation - Location where the document was issued
 * @property idIssueCounty - County/region code where issued
 * @property idIssueDate - Issue date in ISO format (YYYY-MM-DD)
 * @property idExpireDate - Expiration date in ISO format (YYYY-MM-DD)
 */
export type IdDocumentDetail = InferInput<typeof IdDocumentDetailSchema>;

/**
 * Privacy and marketing policy acceptance flags.
 *
 * @property acceptProfilingPolicies - User consent for profiling (0 = not accepted, 1 = accepted)
 * @property acceptPrivacyPolicies - User consent for privacy policy (0 = not accepted, 1 = accepted)
 * @property acceptNewsletterPolicies - User consent for newsletter (0 = not accepted, 1 = accepted)
 */
export type AccountPolicies = InferInput<typeof AccountPoliciesSchema>;

/**
 * Custom key-value field for extending master record data.
 *
 * @property key - Unique identifier for the dynamic field
 * @property value - Value associated with the key
 *
 * @example
 * ```typescript
 * const dynamicField: DynamicFields = {
 *   key: 'loyalty_tier',
 *   value: 'gold'
 * };
 * ```
 */
export type DynamicFields = InferInput<typeof DynamicFieldsInputSchema>;

/**
 * Supplier reference master records for a master record.
 *
 * @property supplierRefCode - Supplier reference code
 * @property companyMainBusinessType - Company main business type
 * @property carrierType - Carrier type
 */
export type SupplierRefMasterRecords = InferInput<
	typeof SupplierRefMasterRecordsSchema
>;

/**
 * Master record detail for creating or updating customer, supplier, or general records.
 *
 * This is the primary input type for the `upsertRecord` method.
 *
 * @property recordCode - 6-character unique identifier (auto-generated if not provided)
 * @property insertCriteria - Duplicate handling strategy:
 *   - 'S': Always insert
 *   - 'N': Skip if a record exists
 *   - 'T': Update all fields (default)
 *   - 'M': Update secondary fields only
 * @property createdDate - Record creation date in ISO format
 * @property recordType - Classification: 'CUSTOMER' | 'SUPPLIER' | 'GENERAL' (defaults to 'CUSTOMER')
 * @property recordStatus - Status: 'ENABLED' | 'DISABLED' | 'WARNING' | 'BLACKLISTED' (defaults to 'ENABLED')
 * @property moniker - Short display name or alias
 * @property name - Full name (person or company)
 * @property extraInfo - Additional information field
 * @property languageCode - Required 2-digit AVES language code (e.g., '01' for Italian, '02' for English)
 * @property address - Street address
 * @property zipCode - Postal/ZIP code
 * @property cityName - City name
 * @property countyCode - County/province code
 * @property stateCode - Country/state code
 * @property categoryCode - Category classification code
 * @property firstPhoneNumber - Primary phone number
 * @property mobilePhoneNumber - Mobile phone number
 * @property email - Email address
 * @property gender - Gender: 'M' (male) | 'F' (female)
 * @property birthDate - Date of birth in ISO format (YYYY-MM-DD)
 * @property birthCity - City of birth
 * @property birthCounty - County of birth
 * @property fiscalCode - Tax/fiscal identification code
 * @property vatCode - VAT number
 * @property thirdPartRecordCode - External system reference code
 * @property idDocumentDetail - Identity document information
 * @property accountPolicies - Privacy and marketing consent flags
 * @property financialDetail - Financial and payment details
 * @property dynamicFields - Custom key-value fields
 * @property supplierRefMasterRecords - Supplier reference master records
 * @example
 * ```typescript
 * const record: MasterRecordDetail = {
 *   languageCode: '01',
 *   name: 'Mario Rossi',
 *   email: 'mario.rossi@example.com',
 *   recordType: 'CUSTOMER',
 *   insertCriteria: 'M',
 *   accountPolicies: {
 *     acceptPrivacyPolicies: 1,
 *     acceptNewsletterPolicies: 0,
 *   },
 *   supplierRefMasterRecords: {
 *     supplierRefCode: 'SUP456',
 *     companyMainBusinessType: 'TOUR_OPERATOR',
 *     carrierType: 'OTHER',
 *   },
 * };
 * ```
 */
export type MasterRecordDetail = InferInput<typeof MasterRecordDetailSchema>;

/**
 * Master record detail as returned by the API (camelCase transformed).
 *
 * Contains all fields from {@link MasterRecordDetail} plus additional read-only fields
 * populated by the server (e.g., `modifiedDate`, `loginType`).
 */
export type MasterRecordDetailResponse = InferOutput<
	typeof MasterRecordDetailResponseSchema
>;

// ============================================================================
// Search Types
// ============================================================================

/**
 * Search parameters for finding master records.
 *
 * This is a discriminated union based on `searchType`. Each search type requires
 * different parameters:
 *
 * | searchType | Required Fields | Optional Fields |
 * |------------|-----------------|-----------------|
 * | 'CODE' | recordCode | languageCode |
 * | 'NAME' | name | city, languageCode |
 * | 'VATCODE' | vatCode | phoneNumber, languageCode |
 * | 'ZONE' | zipCode, countyCode | city, languageCode |
 * | 'CATEGORY' | categoryCode | languageCode |
 * | 'EMAIL' | email | languageCode |
 * | 'LASTMODDATE' | lastModificationDate | languageCode |
 * | 'SEARCH_FIELD' | searchFieldValue | languageCode |
 * | 'EXTERNAL_REF_CODE' | searchFieldValue | languageCode |
 *
 * @example
 * ```typescript
 * // Search by customer code
 * const byCode: SearchMasterRecord = {
 *   searchType: 'CODE',
 *   recordCode: '508558',
 * };
 *
 * // Search by name and city
 * const byName: SearchMasterRecord = {
 *   searchType: 'NAME',
 *   name: 'Rossi',
 *   city: 'Milano',
 * };
 *
 * // Search by last modification date range
 * const byDate: SearchMasterRecord = {
 *   searchType: 'LASTMODDATE',
 *   lastModificationDate: {
 *     minDate: '2024-01-01',
 *     maxDate: '2024-12-31',
 *   },
 * };
 * ```
 */
export type SearchMasterRecord = InferInput<typeof SearchMasterRecordSchema>;

/**
 * Response from a master record search operation.
 *
 * On success, `result.data` is always a flat array of matching records
 * (including a single-element array for one match, or `[]` when none).
 * Non-OK AVES status is surfaced as `result.error` — there is no `rsStatus` on success.
 *
 * @example
 * ```typescript
 * const result = await client.master.search({
 *   searchType: 'CODE',
 *   recordCode: '508558',
 * });
 * if (result.success) {
 *   const [record] = result.data;
 *   console.log(record?.recordCode);
 * }
 * ```
 */
export type SearchMasterRecordRS = MasterRecordDetailResponse[];

// ============================================================================
// Upsert Types
// ============================================================================

/**
 * Complete request structure for insert/update operations (internal use).
 *
 * @property RqHeader - Authentication header
 * @property MasterRecordDetail - Record data to insert or update
 *
 * @internal This type is primarily for internal SDK use. Use {@link MasterRecordDetail}
 * as the input type for `client.master.upsertRecord()`.
 */
export type ManageMasterRecordRequest = InferInput<
	typeof ManageMasterRecordRequestSchema
>;

/**
 * Response from an insert/update operation.
 *
 * `MasterRecordDetail` fields are spread onto `data` (e.g. `data.recordCode`).
 *
 * @property rsStatus - Operation status (check for 'OK' to confirm success)
 *
 * @example
 * ```typescript
 * const result = await client.master.upsertRecord({
 *   languageCode: '02',
 *   name: 'New Customer',
 *   insertCriteria: 'N',
 * });
 *
 * if (result.success) {
 *   console.log(`Created record with code: ${result.data.recordCode}`);
 * }
 * ```
 */
export type ManageMasterRecordRS = InferOutput<
	typeof ManageMasterRecordResponseSchema
>;

// ============================================================================
// Booking File Types (CreateBookingFile)
// ============================================================================

/**
 * Request body for CreateBookingFile (BookFileRQ).
 * Maps to AVES XML 1.8.0 "BookingFileRQ" / BookFileRQ structure.
 *
 * @property createDate - Creation date of booking file (optional; Aves uses system date if omitted)
 * @property bookingFileRefCode - Reference code of an external booking system
 * @property travelAgentCode - Travel agent code
 * @property clerkName - Clerk name
 * @property customerDetail - Customer: record code if in Aves DB, or full data to insert (see Common Structures)
 * @property currencyCode - Currency code
 * @property markupCode - Markup code applied
 * @property bookingFileStatus - Status (QUOTATION | WORK_IN_PROGRESS | CONFIRM | CONFIRMED | OPTION | OPTIONED | REQUEST | CANCELED); ExpiredDate only for OPTIONED
 * @property statisticCodes - Statistic codes (sCode1..sCode6, string up to 4)
 * @property destination - Destination (code, iataCode, nationCode)
 * @property bookingFileDescription - Booking file description
 * @property startDate - Start date of booking file (required)
 * @property endDate - End date of booking file (required)
 * @property earlyBookingDate - Early booking date for discount
 * @property cupCode - CupCode
 * @property cigCode - CigCode
 * @property customerPromoterCode - Customer promoter code
 * @property billingReferenceCode - Aves code for billing
 * @property paymentReferenceCode - Aves code for payment
 * @property bookingFileDocument - Print/send document options and infoDocumentsToPrint
 * @property financialDeadlineList - List of financial deadlines
 * @property deadlineList - List of deadlines
 * @property paymentList - List of payments
 * @property selectedPackageList - List of selected packages (pCode, startDate, endDate, getServicesFromPackage)
 * @property selectedServiceList - List of selected services (required)
 * @property extraQuotaRefCode - Code of program with extra services (e.g. insurance)
 * @property extraQuoteServiceList - List of extra services
 * @property getExtraQuoteFromSystem - Force Aves to get extra quotes from DB
 * @property passengerList - List of passengers (required)
 * @property noteList - Notes
 * @property bookingFinancialInfo - Payment type (Customer_PaymentType, Customer_SpecPaymentTypeCode)
 * @property bookingFileCode - Booking file code
 * @property groupingPaxPolicy - GROUPED_PAX | NOT_GROUPED_PAX | ONE_PAX_ONLY
 * @property groupBookingFile - true/false for group booking
 * @property typeDownloadFile - AVES2AVES | AVES2AVESVIA | AVES2AVESITA
 * @property setBookingFileCodeFromStartDate - Set booking code from departure date
 */
export type BookingFileRQ = InferInput<typeof BookingFileSchema>;

/**
 * Response from CreateBookingFile (BookingFileRS).
 *
 * `BookingFileDetail` fields are spread onto `data` (e.g. `data.bookingFileCode`).
 *
 * @property rsStatus - Operation status (check for 'OK' before using result)
 */
export type BookingFileRS = InferOutput<typeof BookingFileResponseSchema>;

/**
 * Request body for ModBookingFileServices (ModFileServicesRQ).
 */
export type ModFileServicesRQ = InferInput<typeof ModFileServicesSchema>;

/**
 * Request body for ModBookingFileHeader (ModFileHeaderRQ).
 */
export type ModFileHeaderRQ = InferInput<typeof ModFileHeaderSchema>;

/**
 * Request body for CancelBookingFile (CancelFileRQ).
 */
export type CancelFileRQ = InferInput<typeof CancelFileSchema>;

/**
 * Request body for SetBookingFileStatus (SetStatusRQ).
 */
export type SetFileStatusRQ = InferInput<typeof SetFileStatusSchema>;

/**
 * Request body for SetBookingFileServiceStatus (SetStatusServiceRQ).
 */
export type SetFileServiceStatusRQ = InferInput<
	typeof SetFileServiceStatusSchema
>;

/**
 * Request body for InsertFilePaymentList (FilePaymentListRQ).
 */
export type FilePaymentListRQ = InferInput<typeof FilePaymentListSchema>;

/**
 * Response for ModServices / SetStatus / SetStatusService — same shape as CreateBookingFile.
 */
export type BookingFileDetailRS = BookingFileRS;

/**
 * Response for booking ops that return only RsStatus (Cancel / ModHeader / InsertFilePaymentList).
 */
export type BookingStatusOnlyRS = InferOutput<
	typeof BookingStatusOnlyResponseSchema
>;

// ============================================================================
// Package / Program catalog
// ============================================================================

/**
 * Request body for SearchAvesPackages / SearchTopServices (AvesSearchRQ).
 */
export type AvesSearchRQ = InferInput<typeof AvesSearchSchema>;

/**
 * Response from SearchAvesPackages (SearchPackageRS).
 */
export type SearchPackageRS = InferOutput<typeof SearchPackageResponseSchema>;

/**
 * Response from SearchTopServices (SearchServicesRS).
 */
export type SearchServicesRS = InferOutput<typeof SearchServicesResponseSchema>;

/**
 * Request body for GetPackageDetail (PackageDetailRQ).
 */
export type PackageDetailRQ = InferInput<typeof PackageDetailRequestSchema>;

/**
 * Response from GetPackageDetail (PackageDetailRS).
 */
export type PackageDetailRS = InferOutput<typeof PackageDetailResponseSchema>;

/**
 * Request body for CommitPackage (CommitPackRQ).
 */
export type CommitPackageRQ = InferInput<typeof CommitPackageSchema>;

/**
 * Response from CommitPackage (CommitPackRS).
 */
export type CommitPackageRS = InferOutput<typeof CommitPackageResponseSchema>;

/**
 * Request body for SearchBookingFile (SearchFileRQ).
 */
export type SearchBookingFileRQ = InferInput<typeof SearchBookingFileSchema>;

/** One row in `SearchBookingFileRS.bookingFileList` (camelCase RS shape). */
export type SearchBookingFileDetail = Camelize<
	InferOutput<typeof BookingFileDetailApiSchema>
>;

/**
 * Response from SearchBookingFile (SearchFileRS).
 *
 * Explicit shape — avoids excessively deep `InferOutput` on nested list schemas.
 */
export type SearchBookingFileRS = {
	rsStatus: RsStatus;
	bookingFileList?: SearchBookingFileDetail[];
};

// ============================================================================
// Simplified facade types
// ============================================================================

/** Dual-key inputs already live on RQ types; outputs add concise aliases. */
export type MasterRecordInput = MasterRecordDetail;
export type MasterRecord = FacadeOutput<MasterRecordDetailResponse>;
export type MasterSearchInput = SearchMasterRecord;
export type MasterSearchResult = FacadeOutput<SearchMasterRecordRS>;
export type BookingInput = BookingFileRQ;
export type Booking = FacadeOutput<BookingFileRS>;
export type ServiceUpdateInput = ModFileServicesRQ;
export type BookingHeaderInput = ModFileHeaderRQ;
export type BookingCancelInput = CancelFileRQ;
export type BookingStatusInput = SetFileStatusRQ;
export type ServiceStatusInput = SetFileServiceStatusRQ;
export type PaymentInput = FilePaymentListRQ;
export type BookingSearchInput = SearchBookingFileRQ;
export type BookingSearchResult = FacadeOutput<SearchBookingFileRS>;
export type CatalogSearchInput = AvesSearchRQ;
export type PackageSearchResult = FacadeOutput<SearchPackageRS>;
export type ServiceSearchResult = FacadeOutput<SearchServicesRS>;
export type PackageInput = PackageDetailRQ;
export type Package = FacadeOutput<PackageDetailRS>;
export type CommitInput = CommitPackageRQ;
export type OperationStatus = FacadeOutput<BookingStatusOnlyRS>;

// ============================================================================
// Client Configuration
// ============================================================================

/**
 * Configuration options for the AVES API client.
 *
 * @property baseURL - Base URL of the AVES API (e.g., 'https://api.aves.example.com')
 * @property hostID - 6-digit identification code assigned to your organization
 * @property xtoken - Authentication token for API access
 * @property languageCode - Optional default 2-character language code for all requests
 * @property timeoutMs - Optional request timeout in milliseconds (default: 30000)
 *
 * @example
 * ```typescript
 * const client = new AvesClient({
 *   baseURL: 'https://api.aves.example.com',
 *   hostID: '025706',
 *   xtoken: 'TOKEN025706',
 *   languageCode: '02',
 *   timeoutMs: 10000,
 * });
 * ```
 */
export interface AvesClientOptions {
	/** Base URL of the AVES API (e.g., 'https://api.aves.example.com') */
	baseURL: string;
	/** 6-digit identification code assigned to your organization */
	hostID: string;
	/** Authentication token for API access */
	xtoken: string;
	/** Optional default 2-character language code for all requests */
	languageCode?: string;
	/** Optional request timeout in milliseconds (default: 30000) */
	timeoutMs?: number;
}
