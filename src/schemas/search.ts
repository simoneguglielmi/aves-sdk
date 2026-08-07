import { Schema } from "effect";
import {
	createApiSchema,
	createListResponseSchema,
	listDetailApiSchema,
	mapSchema,
} from "../utils/schema-transform.js";
import { searchMasterWire } from "../utils/wire-shapes.js";
import {
	DateRangeSchema,
	OptionalLanguageCodeSchema,
	RqHeaderSchema,
} from "./common.js";
import { SearchMasterType } from "./enums.js";
import { MasterRecordDetailApiValidationSchema } from "./master-record.js";

const LastModificationDateInputSchema = DateRangeSchema;
const languageCodeField = OptionalLanguageCodeSchema;

/**
 * Search by CODE - requires recordCode
 */
const CodeSearchSchema = Schema.Struct({
	searchType: Schema.Literal(SearchMasterType.CODE),
	recordCode: Schema.String.pipe(Schema.minLength(5), Schema.maxLength(6)),
	languageCode: languageCodeField,
});

/**
 * Search by NAME - requires name, optionally city
 */
const NameSearchSchema = Schema.Struct({
	searchType: Schema.Literal(SearchMasterType.NAME),
	name: Schema.String,
	city: Schema.optional(Schema.String),
	languageCode: languageCodeField,
});

/**
 * Search by VATCODE - requires vatCode, optionally phoneNumber
 */
const VatCodeSearchSchema = Schema.Struct({
	searchType: Schema.Literal(SearchMasterType.VATCODE),
	vatCode: Schema.String,
	phoneNumber: Schema.optional(Schema.String),
	languageCode: languageCodeField,
});

/**
 * Search by ZONE - requires zipCode and countyCode, optionally city
 */
const ZoneSearchSchema = Schema.Struct({
	searchType: Schema.Literal(SearchMasterType.ZONE),
	zipCode: Schema.String,
	countyCode: Schema.String,
	city: Schema.optional(Schema.String),
	languageCode: languageCodeField,
});

/**
 * Search by CATEGORY - requires categoryCode
 */
const CategorySearchSchema = Schema.Struct({
	searchType: Schema.Literal(SearchMasterType.CATEGORY),
	categoryCode: Schema.String,
	languageCode: languageCodeField,
});

/**
 * Search by EMAIL - requires email
 */
const EmailSearchSchema = Schema.Struct({
	searchType: Schema.Literal(SearchMasterType.EMAIL),
	email: Schema.String,
	languageCode: languageCodeField,
});

/**
 * Search by LASTMODDATE - requires lastModificationDate
 */
const LastModDateSearchSchema = Schema.Struct({
	searchType: Schema.Literal(SearchMasterType.LASTMODDATE),
	lastModificationDate: LastModificationDateInputSchema,
	languageCode: languageCodeField,
});

/**
 * Search by SEARCH FIELD - requires searchFieldValue
 */
const SearchFieldSearchSchema = Schema.Struct({
	searchType: Schema.Literal(SearchMasterType.SEARCH_FIELD),
	searchFieldValue: Schema.String,
	languageCode: languageCodeField,
});

/**
 * Search by EXTERNAL_REF_CODE - requires searchFieldValue
 */
const ExternalRefCodeSearchSchema = Schema.Struct({
	searchType: Schema.Literal(SearchMasterType.EXTERNAL_REF_CODE),
	searchFieldValue: Schema.String,
	languageCode: languageCodeField,
});

/**
 * Search master record input schema (camelCase)
 * Conditional fields based on searchType
 */
export const SearchMasterRecordSchema = Schema.Union(
	CodeSearchSchema,
	NameSearchSchema,
	VatCodeSearchSchema,
	ZoneSearchSchema,
	CategorySearchSchema,
	EmailSearchSchema,
	LastModDateSearchSchema,
	SearchFieldSearchSchema,
	ExternalRefCodeSearchSchema,
);

/**
 * Search master record schema for API requests (transforms to PascalCase).
 * recordCode stays an element (not @attr) via {@link searchMasterWire}.
 */
export const SearchMasterRecordApiSchema = createApiSchema(
	SearchMasterRecordSchema,
	searchMasterWire,
);

/**
 * Complete search request schema with header
 * Flattens SearchMasterRecord fields to root level
 */
export const SearchMasterRecordRequestSchema = mapSchema(Schema.Struct({
		RqHeader: RqHeaderSchema,
		SearchMasterRecord: SearchMasterRecordApiSchema,
	}), (input) => {
		const { SearchMasterRecord: searchFields, RqHeader, ...rest } = input;
		return {
			RqHeader,
			...searchFields,
			...rest,
		};
	});

const MasterRecordListApiSchema = listDetailApiSchema(
	"MasterRecordDetail",
	MasterRecordDetailApiValidationSchema,
);

/** Wire RS parser (internal): `{ rsStatus, masterRecordList }` after camelCase transform. */
export const SearchMasterRecordResponseSchema = createListResponseSchema(
	"MasterRecordList",
	MasterRecordListApiSchema,
);
