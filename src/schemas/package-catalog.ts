import * as v from "valibot";
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

export const FeatureDetailApiSchema = v.object({
	"@Code": v.optional(v.string()),
	"@Name": v.optional(v.string()),
	ValueCode: v.optional(v.string()),
	ValueName: v.optional(v.string()),
});

export const FeatureListApiSchema = listDetailApiSchema(
	"FeatureDetail",
	FeatureDetailApiSchema,
);

export const RefPackageInfoApiSchema = v.object({
	"@PackageCode": v.optional(v.string()),
	"@PackageReference": v.optional(v.string()),
	"@PackageServiceType": v.optional(v.string()),
	"@ServiceCodeForPackageDetail": v.optional(v.string()),
});

/** Lean catalog SubService — enough for Program search/detail workflows */
export const CatalogSubServiceDetailApiSchema = v.object({
	"@ssCode": v.optional(v.string()),
	FirstDescription: v.optional(v.string()),
	SubServiceType: v.optional(v.string()),
	SubServiceLevel: v.optional(StringishBoolSchema),
	StartDate: v.optional(v.string()),
	EndDate: v.optional(v.string()),
});

export const CatalogSubServiceListApiSchema = listDetailApiSchema(
	"SubServiceDetail",
	CatalogSubServiceDetailApiSchema,
);

/** Lean catalog Service inside a Package */
export const CatalogServiceDetailApiSchema = v.object({
	"@sCode": v.optional(v.string()),
	FirstDescription: v.optional(v.string()),
	SecondDescription: v.optional(v.string()),
	AvesServiceType: v.optional(v.string()),
	TOServiceType: v.optional(v.string()),
	StartDate: v.optional(v.string()),
	EndDate: v.optional(v.string()),
	RefPackageInfo: v.optional(RefPackageInfoApiSchema),
	SubServiceList: v.optional(CatalogSubServiceListApiSchema),
});

export const CatalogServiceListApiSchema = listDetailApiSchema(
	"ServiceDetail",
	CatalogServiceDetailApiSchema,
);

/** Package / Program detail (SearchPackageRS + GetPackageDetail) */
export const PackageDetailApiSchema = v.object({
	"@pCode": v.optional(v.string()),
	FirstDescription: v.optional(v.string()),
	SecondDescription: v.optional(v.string()),
	FrequencyType: v.optional(v.string()),
	ProgramType: v.optional(v.string()),
	StartValidation: v.optional(v.string()),
	EndValidation: v.optional(v.string()),
	StartDate: v.optional(v.string()),
	EndDate: v.optional(v.string()),
	BasePrice: v.optional(StringishBoolSchema),
	BasePax: v.optional(StringishBoolSchema),
	CanCommitPack: v.optional(StringishBoolSchema),
	FeatureList: v.optional(FeatureListApiSchema),
	ServiceList: v.optional(CatalogServiceListApiSchema),
});

export const PackageListApiSchema = listDetailApiSchema(
	"PackageDetail",
	PackageDetailApiSchema,
);

// ---------------------------------------------------------------------------
// SearchAvesPackages / SearchTopServices — AvesSearchRQ
// ---------------------------------------------------------------------------

const FeatureDetailInputSchema = v.object({
	code: v.string(),
	name: v.optional(v.string()),
});

const PackageParamsInputSchema = facadeObject(
	{
		getAllDeptDate: v.optional(BoolishSchema),
		getFlightPlan: v.optional(BoolishSchema),
		getAllAccomodation: v.optional(BoolishSchema),
		getRealAvailability: v.optional(BoolishSchema),
		minStay: v.optional(StringishSchema),
		maxStay: v.optional(StringishSchema),
	},
	packageParamsFacades,
);

const TopServiceParamsInputSchema = facadeObject(
	{
		compatibleAccomodation: v.optional(BoolishSchema),
		alternativeAccomodation: v.optional(BoolishSchema),
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
		customerRecordCode: v.string(),
		languageCode: OptionalLanguageCodeSchema,
		currencyCode: v.optional(v.string()),
		startDate: v.string(),
		endDate: v.string(),
		earlyBookingDate: v.optional(v.string()),
		passengerList: v.pipe(
			v.array(PassengerDetailCreateInputSchema),
			v.minLength(1),
		),
		avesSearchType: v.optional(AvesSearchTypeSchema),
		paxQty: v.optional(StringishSchema),
		paxQtyCriteria: v.optional(PaxQtyCriteriaSchema),
		discartNotAvailables: v.optional(BoolishSchema),
		discartNotAvailablesMinSales: v.optional(BoolishSchema),
		discartNotAvailablesDaysInOut: v.optional(BoolishSchema),
		discardPriceZero: v.optional(BoolishSchema),
		discardZeroPriceDays: v.optional(BoolishSchema),
		destination: v.optional(DestinationInputSchema),
		objectTypeCode: v.optional(v.string()),
		featureList: v.optional(v.array(FeatureDetailInputSchema)),
		servOrPackCode: v.optional(v.string()),
		servOrPackDesc: v.optional(v.string()),
		priceListCode: v.optional(v.string()),
		costListCode: v.optional(v.string()),
		suballotmentCode: v.optional(v.string()),
		markupCode: v.optional(v.string()),
		statisticCodes: v.optional(StatisticCodesInputSchema),
		mergeBoardAndAccomodation: v.optional(BoolishSchema),
		packageParams: v.optional(PackageParamsInputSchema),
		topServiceParams: v.optional(TopServiceParamsInputSchema),
		getDocumentation: v.optional(BoolishSchema),
	},
	avesSearchFacades,
);

/** After client defaults: languageCode + avesSearchType must be present. */
const AvesSearchResolvedSchema = v.pipe(
	AvesSearchSchema,
	v.check(
		(i) => i.languageCode != null && i.avesSearchType != null,
		"languageCode and avesSearchType required",
	),
);

/** Nest BaseSearch under AvesSearchRQ; apply paxQty / paxQtyCriteria defaults. */
function toAvesSearchApiBody(
	input: v.InferOutput<typeof AvesSearchResolvedSchema>,
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

export const AvesSearchApiSchema = v.pipe(
	AvesSearchResolvedSchema,
	v.transform(toAvesSearchApiBody),
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
export const PackagePrgServiceDetailInputSchema = v.object({
	serviceCode: v.string(),
	packageRow: v.string(),
});

/**
 * PackageDetailRQ body (camelCase).
 * Root startDate/endDate are XML elements (not listed on packageDetailRequestWire.attrs).
 */
export const PackageDetailRequestSchema = facadeObject(
	{
		customerRecordCode: v.string(),
		languageCode: OptionalLanguageCodeSchema,
		currencyCode: v.optional(v.string()),
		packageCode: v.string(),
		startDate: v.string(),
		endDate: v.string(),
		priceListCode: v.optional(v.string()),
		costListCode: v.optional(v.string()),
		markupCode: v.optional(v.string()),
		statisticCodes: v.optional(StatisticCodesInputSchema),
		selectedServiceList: v.pipe(
			v.array(PackagePrgServiceDetailInputSchema),
			v.minLength(1),
		),
		passengerList: v.optional(v.array(PassengerDetailCreateInputSchema)),
	},
	packageDetailFacades,
);

/** Map packagePrg fields → attrs; list wrap + element dates at root. */
export const PackageDetailRequestApiSchema = createApiSchema(
	PackageDetailRequestSchema,
	packageDetailRequestWire,
);

export const PackageDetailResponseSchema = createFlattenedResponseSchema(
	v.object({
		RsStatus: RsStatusSchema,
		PackageDetail: v.optional(PackageDetailApiSchema),
	}),
	"packageDetail",
);

// ---------------------------------------------------------------------------
// CommitPackage — CommitPackRQ
// ---------------------------------------------------------------------------

export const CommitPackageSchema = v.object({
	packageCode: v.string(),
});

export const CommitPackageApiSchema = createApiSchema(
	CommitPackageSchema,
	elementOnlyWire,
);

export const CommitPackageResponseSchema = StatusOnlyResponseSchema;
