import { Schema } from "effect";
import { searchBookingFacades } from "../utils/facade-aliases.js";
import {
	createApiSchema,
	createListResponseSchema,
	facadeObject,
	listDetailApiSchema,
	valueFieldSchema,
} from "../utils/schema-transform.js";
import { searchFileWire } from "../utils/wire-shapes.js";
import { BookingFileDetailApiSchema } from "./booking-response.js";
import { BookingFileStatusWireSchema } from "./booking-shared.js";
import { BoolishSchema, DateRangeSchema } from "./common.js";
import { SearchBookingFileType } from "./enums.js";

const searchFileStatusSchema = valueFieldSchema(BookingFileStatusWireSchema, {
	expireDate: Schema.optional(Schema.String),
});

const insuranceSchema = Schema.Struct({
	code: Schema.optional(Schema.String),
	number: Schema.optional(Schema.String),
});

const searchFileBase = {
	customerRecordCode: Schema.String,
	customerPromoterCode: Schema.optional(Schema.String),
	getSupplierInfo: Schema.optional(BoolishSchema),
	user: Schema.optional(Schema.String),
	officeCode: Schema.optional(Schema.String),
};

const FileCodeSearchSchema = facadeObject(
	{
		...searchFileBase,
		searchType: Schema.Literal(SearchBookingFileType.FILE_CODE),
		bookingFileCode: Schema.String,
	},
	searchBookingFacades,
);

const PaxNameSearchSchema = facadeObject(
	{
		...searchFileBase,
		searchType: Schema.Literal(SearchBookingFileType.PAX_NAME),
		firstPaxName: Schema.String,
	},
	searchBookingFacades,
);

const PackageCodeSearchSchema = facadeObject(
	{
		...searchFileBase,
		searchType: Schema.Literal(SearchBookingFileType.PACKAGE_CODE),
		packageCode: Schema.String,
	},
	searchBookingFacades,
);

const OtherSearchSchema = facadeObject(
	{
		...searchFileBase,
		searchType: Schema.Literal(SearchBookingFileType.OTHER),
		fileStatus: Schema.optional(searchFileStatusSchema),
		startDate: Schema.optional(DateRangeSchema),
		createdDate: Schema.optional(DateRangeSchema),
		lastModificationDate: Schema.optional(DateRangeSchema),
		insurance: Schema.optional(insuranceSchema),
		isSearchForB2C: Schema.optional(BoolishSchema),
	},
	searchBookingFacades,
);

/**
 * SearchFileRQ body (camelCase) — discriminated by searchType.
 */
export const SearchBookingFileSchema = Schema.Union(
	FileCodeSearchSchema,
	PaxNameSearchSchema,
	PackageCodeSearchSchema,
	OtherSearchSchema,
);

export const SearchBookingFileApiSchema = createApiSchema(
	SearchBookingFileSchema,
	searchFileWire,
);

export const SearchBookingFileResponseSchema = createListResponseSchema(
	"BookingFileList",
	listDetailApiSchema("BookingFileDetail", BookingFileDetailApiSchema),
);
