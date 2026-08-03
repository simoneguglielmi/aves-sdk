import * as v from "valibot";
import {
	createResponseSchema,
	oneOrMany,
	toWireBody,
} from "../utils/schema-transform.js";
import { searchFileWire } from "../utils/wire-shapes.js";
import { BookingFileDetailApiSchema } from "./booking-response.js";
import {
	BookingFileStatusWireSchema,
	BoolishSchema,
} from "./booking-shared.js";
import { RsStatusSchema } from "./common.js";

const dateRangeSchema = v.object({
	minDate: v.string(),
	maxDate: v.string(),
});

const searchFileStatusSchema = v.object({
	value: BookingFileStatusWireSchema,
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
	searchType: v.literal("FILE_CODE"),
	bookingFileCode: v.string(),
});

const PaxNameSearchSchema = v.object({
	...searchFileBase,
	searchType: v.literal("PAX_NAME"),
	firstPaxName: v.string(),
});

const PackageCodeSearchSchema = v.object({
	...searchFileBase,
	searchType: v.literal("PACKAGE_CODE"),
	packageCode: v.string(),
});

const OtherSearchSchema = v.object({
	...searchFileBase,
	searchType: v.literal("OTHER"),
	fileStatus: v.optional(searchFileStatusSchema),
	startDate: v.optional(dateRangeSchema),
	createdDate: v.optional(dateRangeSchema),
	lastModificationDate: v.optional(dateRangeSchema),
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

export const SearchBookingFileApiSchema = v.pipe(
	SearchBookingFileSchema,
	v.transform((input) => toWireBody(input, searchFileWire)),
);

export const SearchBookingFileResponseSchema = createResponseSchema(
	v.object({
		RsStatus: RsStatusSchema,
		BookingFileList: v.optional(
			v.object({
				BookingFileDetail: v.optional(oneOrMany(BookingFileDetailApiSchema)),
			}),
		),
	}),
);
