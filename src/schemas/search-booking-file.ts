import * as v from "valibot";
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
	expireDate: v.optional(v.string()),
});

const insuranceSchema = v.object({
	code: v.optional(v.string()),
	number: v.optional(v.string()),
});

const searchFileBase = {
	customerRecordCode: v.string(),
	customerPromoterCode: v.optional(v.string()),
	getSupplierInfo: v.optional(BoolishSchema),
	user: v.optional(v.string()),
	officeCode: v.optional(v.string()),
};

const FileCodeSearchSchema = facadeObject(
	{
		...searchFileBase,
		searchType: v.literal(SearchBookingFileType.FILE_CODE),
		bookingFileCode: v.string(),
	},
	searchBookingFacades,
);

const PaxNameSearchSchema = facadeObject(
	{
		...searchFileBase,
		searchType: v.literal(SearchBookingFileType.PAX_NAME),
		firstPaxName: v.string(),
	},
	searchBookingFacades,
);

const PackageCodeSearchSchema = facadeObject(
	{
		...searchFileBase,
		searchType: v.literal(SearchBookingFileType.PACKAGE_CODE),
		packageCode: v.string(),
	},
	searchBookingFacades,
);

const OtherSearchSchema = facadeObject(
	{
		...searchFileBase,
		searchType: v.literal(SearchBookingFileType.OTHER),
		fileStatus: v.optional(searchFileStatusSchema),
		startDate: v.optional(DateRangeSchema),
		createdDate: v.optional(DateRangeSchema),
		lastModificationDate: v.optional(DateRangeSchema),
		insurance: v.optional(insuranceSchema),
		isSearchForB2C: v.optional(BoolishSchema),
	},
	searchBookingFacades,
);

/**
 * SearchFileRQ body (camelCase) — discriminated by searchType.
 */
export const SearchBookingFileSchema = v.union([
	FileCodeSearchSchema,
	PaxNameSearchSchema,
	PackageCodeSearchSchema,
	OtherSearchSchema,
]);

export const SearchBookingFileApiSchema = createApiSchema(
	SearchBookingFileSchema,
	searchFileWire,
);

export const SearchBookingFileResponseSchema = createListResponseSchema(
	"BookingFileList",
	listDetailApiSchema("BookingFileDetail", BookingFileDetailApiSchema),
);
