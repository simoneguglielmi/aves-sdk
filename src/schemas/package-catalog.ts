import { Schema } from "effect";
import {
	avesSearchFacades,
	packageDetailFacades,
	packageParamsFacades,
} from "../utils/facade-aliases.js";
import {
	createApiSchema,
	createFlattenedResponseSchema,
	createListResponseSchema,
	facadeObject,
	listDetailApiSchema,
	mapSchema,
	toWireBody,
} from "../utils/schema-transform.js";
import {
	avesSearchWire,
	baseSearchWire,
	elementOnlyWire,
	packageDetailRequestWire,
} from "../utils/wire-shapes.js";
import {
	DestinationInputSchema,
	PassengerDetailCreateInputSchema,
	StatisticCodesInputSchema,
} from "./booking-file.js";
import {
	BoolishSchema,
	OptionalLanguageCodeSchema,
	RsStatusSchema,
	StatusOnlyResponseSchema,
	StringishBoolSchema,
	StringishSchema,
} from "./common.js";
import {
	AvesSearchTypeSchema,
	PaxQtyCriteria,
	PaxQtyCriteriaSchema,
} from "./enums.js";

export { PaxQtyCriteria, PaxQtyCriteriaSchema } from "./enums.js";

// ---------------------------------------------------------------------------
// Shared catalog fragments (response)
// ---------------------------------------------------------------------------

export const FeatureDetailApiSchema = Schema.Struct({
	"@Code": Schema.optional(Schema.String),
	"@Name": Schema.optional(Schema.String),
	ValueCode: Schema.optional(Schema.String),
	ValueName: Schema.optional(Schema.String),
});

export const FeatureListApiSchema = listDetailApiSchema(
	"FeatureDetail",
	FeatureDetailApiSchema,
);

export const RefPackageInfoApiSchema = Schema.Struct({
	"@PackageCode": Schema.optional(Schema.String),
	"@PackageReference": Schema.optional(Schema.String),
	"@PackageServiceType": Schema.optional(Schema.String),
	"@ServiceCodeForPackageDetail": Schema.optional(Schema.String),
});

/** Lean catalog SubService — enough for Program search/detail workflows */
export const CatalogSubServiceDetailApiSchema = Schema.Struct({
	"@ssCode": Schema.optional(Schema.String),
	FirstDescription: Schema.optional(Schema.String),
	SubServiceType: Schema.optional(Schema.String),
	SubServiceLevel: Schema.optional(StringishBoolSchema),
	StartDate: Schema.optional(Schema.String),
	EndDate: Schema.optional(Schema.String),
});

export const CatalogSubServiceListApiSchema = listDetailApiSchema(
	"SubServiceDetail",
	CatalogSubServiceDetailApiSchema,
);

/** Lean catalog Service inside a Package */
export const CatalogServiceDetailApiSchema = Schema.Struct({
	"@sCode": Schema.optional(Schema.String),
	FirstDescription: Schema.optional(Schema.String),
	SecondDescription: Schema.optional(Schema.String),
	AvesServiceType: Schema.optional(Schema.String),
	TOServiceType: Schema.optional(Schema.String),
	StartDate: Schema.optional(Schema.String),
	EndDate: Schema.optional(Schema.String),
	RefPackageInfo: Schema.optional(RefPackageInfoApiSchema),
	SubServiceList: Schema.optional(CatalogSubServiceListApiSchema),
});

export const CatalogServiceListApiSchema = listDetailApiSchema(
	"ServiceDetail",
	CatalogServiceDetailApiSchema,
);

/** Package / Program detail (SearchPackageRS + GetPackageDetail) */
export const PackageDetailApiSchema = Schema.Struct({
	"@pCode": Schema.optional(Schema.String),
	FirstDescription: Schema.optional(Schema.String),
	SecondDescription: Schema.optional(Schema.String),
	FrequencyType: Schema.optional(Schema.String),
	ProgramType: Schema.optional(Schema.String),
	StartValidation: Schema.optional(Schema.String),
	EndValidation: Schema.optional(Schema.String),
	StartDate: Schema.optional(Schema.String),
	EndDate: Schema.optional(Schema.String),
	BasePrice: Schema.optional(StringishBoolSchema),
	BasePax: Schema.optional(StringishBoolSchema),
	CanCommitPack: Schema.optional(StringishBoolSchema),
	FeatureList: Schema.optional(FeatureListApiSchema),
	ServiceList: Schema.optional(CatalogServiceListApiSchema),
});

export const PackageListApiSchema = listDetailApiSchema(
	"PackageDetail",
	PackageDetailApiSchema,
);

// ---------------------------------------------------------------------------
// SearchAvesPackages / SearchTopServices — AvesSearchRQ
// ---------------------------------------------------------------------------

const FeatureDetailInputSchema = Schema.Struct({
	code: Schema.String,
	name: Schema.optional(Schema.String),
});

const PackageParamsInputSchema = facadeObject(
	{
		getAllDeptDate: Schema.optional(BoolishSchema),
		getFlightPlan: Schema.optional(BoolishSchema),
		getAllAccomodation: Schema.optional(BoolishSchema),
		getRealAvailability: Schema.optional(BoolishSchema),
		minStay: Schema.optional(StringishSchema),
		maxStay: Schema.optional(StringishSchema),
	},
	packageParamsFacades,
);

const TopServiceParamsInputSchema = facadeObject(
	{
		compatibleAccomodation: Schema.optional(BoolishSchema),
		alternativeAccomodation: Schema.optional(BoolishSchema),
	},
	packageParamsFacades,
);

/**
 * Flat AvesSearchRQ body (camelCase) — shared by SearchAvesPackages / SearchTopServices.
 * BaseSearch fields live at the root; wire transform nests them under `BaseSearch`.
 * `packages.search` / `packages.searchServices` default `avesSearchType`; `paxQty` defaults to
 * `passengerList.length`; `paxQtyCriteria` defaults to `GREATER_OR_EQUAL`.
 * `languageCode` may come from `AvesClient` options when omitted.
 */
export const AvesSearchSchema = facadeObject(
	{
		customerRecordCode: Schema.String,
		languageCode: OptionalLanguageCodeSchema,
		currencyCode: Schema.optional(Schema.String),
		startDate: Schema.String,
		endDate: Schema.String,
		earlyBookingDate: Schema.optional(Schema.String),
		passengerList: Schema.Array(PassengerDetailCreateInputSchema).pipe(
			Schema.minItems(1),
		),
		avesSearchType: Schema.optional(AvesSearchTypeSchema),
		paxQty: Schema.optional(StringishSchema),
		paxQtyCriteria: Schema.optional(PaxQtyCriteriaSchema),
		discartNotAvailables: Schema.optional(BoolishSchema),
		discartNotAvailablesMinSales: Schema.optional(BoolishSchema),
		discartNotAvailablesDaysInOut: Schema.optional(BoolishSchema),
		discardPriceZero: Schema.optional(BoolishSchema),
		discardZeroPriceDays: Schema.optional(BoolishSchema),
		destination: Schema.optional(DestinationInputSchema),
		objectTypeCode: Schema.optional(Schema.String),
		featureList: Schema.optional(Schema.Array(FeatureDetailInputSchema)),
		servOrPackCode: Schema.optional(Schema.String),
		servOrPackDesc: Schema.optional(Schema.String),
		priceListCode: Schema.optional(Schema.String),
		costListCode: Schema.optional(Schema.String),
		suballotmentCode: Schema.optional(Schema.String),
		markupCode: Schema.optional(Schema.String),
		statisticCodes: Schema.optional(StatisticCodesInputSchema),
		mergeBoardAndAccomodation: Schema.optional(BoolishSchema),
		packageParams: Schema.optional(PackageParamsInputSchema),
		topServiceParams: Schema.optional(TopServiceParamsInputSchema),
		getDocumentation: Schema.optional(BoolishSchema),
	},
	avesSearchFacades,
);

/** After client defaults: languageCode + avesSearchType must be present. */
const AvesSearchResolvedSchema = AvesSearchSchema.pipe(
	Schema.filter(
		(i: Schema.Schema.Type<typeof AvesSearchSchema>) =>
			i.languageCode != null && i.avesSearchType != null,
		{ message: () => "languageCode and avesSearchType required" },
	),
);

/** Nest BaseSearch under AvesSearchRQ; apply paxQty / paxQtyCriteria defaults. */
function toAvesSearchApiBody(
	input: Schema.Schema.Type<typeof AvesSearchResolvedSchema>,
) {
	const {
		customerRecordCode,
		languageCode,
		currencyCode,
		startDate,
		endDate,
		earlyBookingDate,
		passengerList,
		paxQty,
		paxQtyCriteria,
		avesSearchType,
		...rest
	} = input;

	return {
		BaseSearch: toWireBody(
			{
				customerRecordCode,
				languageCode,
				currencyCode,
				startDate,
				endDate,
				earlyBookingDate,
				passengerList,
			},
			baseSearchWire,
		),
		...toWireBody(
			{
				...rest,
				avesSearchType,
				paxQty: paxQty ?? passengerList.length,
				paxQtyCriteria: paxQtyCriteria ?? PaxQtyCriteria.GREATER_OR_EQUAL,
			},
			avesSearchWire,
		),
	};
}

export const AvesSearchApiSchema = mapSchema(
	AvesSearchResolvedSchema,
	toAvesSearchApiBody,
);

export const SearchPackageResponseSchema = createListResponseSchema(
	"PackageList",
	PackageListApiSchema,
);

export const SearchServicesResponseSchema = createListResponseSchema(
	"ServiceList",
	CatalogServiceListApiSchema,
);

// ---------------------------------------------------------------------------
// GetPackageDetail — PackageDetailRQ
// ---------------------------------------------------------------------------

/** SelectedServiceDetail for GetPackageDetail (ServiceCode + PackageRow attrs). */
export const PackagePrgServiceDetailInputSchema = Schema.Struct({
	serviceCode: Schema.String,
	packageRow: Schema.String,
});

/**
 * PackageDetailRQ body (camelCase).
 * Root startDate/endDate are XML elements (not listed on packageDetailRequestWire.attrs).
 */
export const PackageDetailRequestSchema = facadeObject(
	{
		customerRecordCode: Schema.String,
		languageCode: OptionalLanguageCodeSchema,
		currencyCode: Schema.optional(Schema.String),
		packageCode: Schema.String,
		startDate: Schema.String,
		endDate: Schema.String,
		priceListCode: Schema.optional(Schema.String),
		costListCode: Schema.optional(Schema.String),
		markupCode: Schema.optional(Schema.String),
		statisticCodes: Schema.optional(StatisticCodesInputSchema),
		selectedServiceList: Schema.Array(PackagePrgServiceDetailInputSchema).pipe(
			Schema.minItems(1),
		),
		passengerList: Schema.optional(
			Schema.Array(PassengerDetailCreateInputSchema),
		),
	},
	packageDetailFacades,
);

/** Map packagePrg fields → attrs; list wrap + element dates at root. */
export const PackageDetailRequestApiSchema = createApiSchema(
	PackageDetailRequestSchema,
	packageDetailRequestWire,
);

export const PackageDetailResponseSchema = createFlattenedResponseSchema(
	Schema.Struct({
		RsStatus: RsStatusSchema,
		PackageDetail: Schema.optional(PackageDetailApiSchema),
	}),
	"packageDetail",
);

// ---------------------------------------------------------------------------
// CommitPackage — CommitPackRQ
// ---------------------------------------------------------------------------

export const CommitPackageSchema = Schema.Struct({
	packageCode: Schema.String,
});

export const CommitPackageApiSchema = createApiSchema(
	CommitPackageSchema,
	elementOnlyWire,
);

export const CommitPackageResponseSchema = StatusOnlyResponseSchema;
