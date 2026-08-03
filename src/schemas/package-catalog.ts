import * as v from "valibot";
import { wrapListDetails } from "../utils/booking-transform.js";
import {
	createApiSchema,
	createResponseSchema,
	oneOrMany,
	toWireBody,
} from "../utils/schema-transform.js";
import {
	avesSearchWire,
	baseSearchWire,
	elementOnlyWire,
	packageDetailRequestWire,
} from "../utils/wire-shapes.js";
import {
	PassengerDetailCreateInputSchema,
	StatisticCodesInputSchema,
} from "./booking-file.js";
import { BoolishSchema } from "./booking-shared.js";
import { RsStatusSchema } from "./common.js";

const stringish = v.union([v.string(), v.number(), v.boolean()]);

// ---------------------------------------------------------------------------
// Shared catalog fragments (response)
// ---------------------------------------------------------------------------

export const FeatureDetailApiSchema = v.object({
	"@Code": v.optional(v.string()),
	"@Name": v.optional(v.string()),
	ValueCode: v.optional(v.string()),
	ValueName: v.optional(v.string()),
});

export const FeatureListApiSchema = v.object({
	FeatureDetail: v.optional(oneOrMany(FeatureDetailApiSchema)),
});

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
	SubServiceLevel: v.optional(stringish),
	StartDate: v.optional(v.string()),
	EndDate: v.optional(v.string()),
});

export const CatalogSubServiceListApiSchema = v.object({
	SubServiceDetail: v.optional(oneOrMany(CatalogSubServiceDetailApiSchema)),
});

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

export const CatalogServiceListApiSchema = v.object({
	ServiceDetail: v.optional(oneOrMany(CatalogServiceDetailApiSchema)),
});

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
	BasePrice: v.optional(stringish),
	BasePax: v.optional(stringish),
	CanCommitPack: v.optional(stringish),
	FeatureList: v.optional(FeatureListApiSchema),
	ServiceList: v.optional(CatalogServiceListApiSchema),
});

export const PackageListApiSchema = v.object({
	PackageDetail: v.optional(oneOrMany(PackageDetailApiSchema)),
});

// ---------------------------------------------------------------------------
// SearchAvesPackages / SearchTopServices — AvesSearchRQ
// ---------------------------------------------------------------------------

const paxQtyCriteriaSchema = v.union([
	v.literal("GREATER_THAN"),
	v.literal("GREATER_OR_EQUAL"),
	v.literal("EQUAL_TO"),
	v.literal("LESS_OR_EQUAL"),
	v.literal("LESS_THAN"),
]);

const avesSearchTypeSchema = v.union([
	v.literal("SERVICE"),
	v.literal("PROGRAM"),
	v.literal("PACKAGE"),
]);

const SearchDestinationInputSchema = v.object({
	code: v.optional(v.string()),
	type: v.optional(
		v.union([
			v.literal("CODE"),
			v.literal("SUB_LOCALITY"),
			v.literal("LOCALITY"),
			v.literal("SUB_SUB_ISLAND"),
			v.literal("SUB_ISLAND"),
			v.literal("ISLAND_COUNTY"),
			v.literal("SUB_ARCHIPELAGO"),
			v.literal("ARCHIPELAGO"),
			v.literal("REGION_STATE"),
			v.literal("SUB_SUB_NATION"),
			v.literal("SUB_NATION"),
			v.literal("NATION"),
			v.literal("SUB_SUB_CONTINENT"),
			v.literal("SUB_CONTINENT"),
			v.literal("CONTINENT"),
		]),
	),
});

const FeatureDetailInputSchema = v.object({
	code: v.string(),
	name: v.optional(v.string()),
});

const PackageParamsInputSchema = v.object({
	getAllDeptDate: v.optional(BoolishSchema),
	getFlightPlan: v.optional(BoolishSchema),
	getAllAccomodation: v.optional(BoolishSchema),
	getRealAvailability: v.optional(BoolishSchema),
	minStay: v.optional(v.union([v.string(), v.number()])),
	maxStay: v.optional(v.union([v.string(), v.number()])),
});

const TopServiceParamsInputSchema = v.object({
	compatibleAccomodation: v.optional(BoolishSchema),
	alternativeAccomodation: v.optional(BoolishSchema),
});

const BaseSearchInputSchema = v.object({
	customerRecordCode: v.string(),
	languageCode: v.string(),
	currencyCode: v.optional(v.string()),
	startDate: v.string(),
	endDate: v.string(),
	earlyBookingDate: v.optional(v.string()),
	passengerList: v.pipe(
		v.array(PassengerDetailCreateInputSchema),
		v.minLength(1),
	),
});

/**
 * AvesSearchRQ body (camelCase) — shared by SearchAvesPackages / SearchTopServices.
 * `avesSearchType` selects PROGRAM|PACKAGE vs SERVICE; client picks the endpoint.
 */
export const AvesSearchSchema = v.object({
	baseSearch: BaseSearchInputSchema,
	avesSearchType: avesSearchTypeSchema,
	paxQty: v.union([v.string(), v.number()]),
	paxQtyCriteria: paxQtyCriteriaSchema,
	discartNotAvailables: v.optional(BoolishSchema),
	discartNotAvailablesMinSales: v.optional(BoolishSchema),
	discartNotAvailablesDaysInOut: v.optional(BoolishSchema),
	discardPriceZero: v.optional(BoolishSchema),
	discardZeroPriceDays: v.optional(BoolishSchema),
	destination: v.optional(SearchDestinationInputSchema),
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
});

/** Nest BaseSearch under AvesSearchRQ; dates stay elements via baseSearchWire. */
function toAvesSearchApiBody(input: v.InferOutput<typeof AvesSearchSchema>) {
	const { baseSearch, ...rest } = input;
	const { passengerList, ...baseWithoutList } = baseSearch;
	return {
		BaseSearch: toWireBody(
			{
				...baseWithoutList,
				passengerList: wrapListDetails(
					{ passengerList },
					{ listKeys: ["passengerList"] },
				).passengerList,
			},
			baseSearchWire,
		),
		...toWireBody(rest as Record<string, unknown>, avesSearchWire, {
			listKeys: ["featureList"],
		}),
	};
}

export const AvesSearchApiSchema = v.pipe(
	AvesSearchSchema,
	v.transform(toAvesSearchApiBody),
);

export const SearchPackageResponseSchema = createResponseSchema(
	v.object({
		RsStatus: RsStatusSchema,
		PackageList: v.optional(PackageListApiSchema),
	}),
);

export const SearchServicesResponseSchema = createResponseSchema(
	v.object({
		RsStatus: RsStatusSchema,
		ServiceList: v.optional(CatalogServiceListApiSchema),
	}),
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
export const PackageDetailRequestSchema = v.object({
	customerRecordCode: v.string(),
	languageCode: v.optional(v.string()),
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
});

const PACKAGE_DETAIL_LIST_KEYS = [
	"selectedServiceList",
	"passengerList",
] as const;

/** Map packagePrg fields → attrs; list wrap + element dates at root. */
export const PackageDetailRequestApiSchema = v.pipe(
	PackageDetailRequestSchema,
	v.transform((input) =>
		toWireBody(input as Record<string, unknown>, packageDetailRequestWire, {
			listKeys: PACKAGE_DETAIL_LIST_KEYS,
		}),
	),
);

export const PackageDetailResponseSchema = createResponseSchema(
	v.object({
		RsStatus: RsStatusSchema,
		PackageDetail: v.optional(PackageDetailApiSchema),
	}),
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

export const CommitPackageResponseSchema = createResponseSchema(
	v.object({ RsStatus: RsStatusSchema }),
);
