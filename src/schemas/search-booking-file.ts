import * as v from "valibot";
import {
	createApiSchema,
	listDetailApiSchema,
	valueFieldSchema,
} from "../utils/schema-transform.js";
import { searchFileWire } from "../utils/wire-shapes.js";
import { BookingFileDetailApiSchema } from "./booking-response.js";
import {
	BookingFileStatusWireSchema,
	BoolishSchema,
} from "./booking-shared.js";
import { createListResponseSchema, DateRangeSchema } from "./common.js";
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

const FileCodeSearchSchema = v.object({
	...searchFileBase,
	searchType: v.literal(SearchBookingFileType.FILE_CODE),
	bookingFileCode: v.string(),
});

const PaxNameSearchSchema = v.object({
	...searchFileBase,
	searchType: v.literal(SearchBookingFileType.PAX_NAME),
	firstPaxName: v.string(),
});

const PackageCodeSearchSchema = v.object({
	...searchFileBase,
	searchType: v.literal(SearchBookingFileType.PACKAGE_CODE),
	packageCode: v.string(),
});

const OtherSearchSchema = v.object({
	...searchFileBase,
	searchType: v.literal(SearchBookingFileType.OTHER),
	fileStatus: v.optional(searchFileStatusSchema),
	startDate: v.optional(DateRangeSchema),
	createdDate: v.optional(DateRangeSchema),
	lastModificationDate: v.optional(DateRangeSchema),
	insurance: v.optional(insuranceSchema),
	isSearchForB2C: v.optional(BoolishSchema),
});

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
