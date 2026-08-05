import * as v from "valibot";
import { createResponseSchema } from "../utils/schema-transform.js";
import { RsStatusValueSchema } from "./enums.js";

/** AVES language code (`01` Italian, `02` English, …) */
export const LanguageCodeSchema = v.pipe(
	v.string(),
	v.minLength(2),
	v.maxLength(2),
);

export const OptionalLanguageCodeSchema = v.optional(LanguageCodeSchema);

/** XML often sends numbers as strings (or vice versa). */
export const StringishSchema = v.union([v.string(), v.number()]);

/** Catalog/boolish wire fields that may arrive as string | number | boolean. */
export const StringishBoolSchema = v.union([
	v.string(),
	v.number(),
	v.boolean(),
]);

export const DateRangeSchema = v.object({
	minDate: v.string(),
	maxDate: v.string(),
});

/**
 * Request header schema with authentication credentials
 */
export const RqHeaderSchema = v.object({
	"@HostID": v.pipe(v.string(), v.minLength(6), v.maxLength(6)),
	"@Xtoken": v.string(),
	"@Interface": v.literal("WEB"),
	"@UserName": v.literal("WEB"),
	"@LanguageCode": OptionalLanguageCodeSchema,
});

const warningsSchema = v.optional(v.string());

/**
 * Response status schema indicating success, error, or warning
 */
export const RsStatusSchema = v.pipe(
	v.object({
		"@Status": RsStatusValueSchema,
		ErrorCode: v.optional(
			v.pipe(
				StringishSchema,
				v.transform((val) => Number(val)),
			),
		),
		ErrorDescription: v.optional(v.string()),
		Warnings: warningsSchema,
	}),
	v.transform((input) => {
		return {
			status: input["@Status"],
			errorCode: input.ErrorCode,
			errorDescription: input.ErrorDescription,
			warnings: input.Warnings,
		};
	}),
);

/** Cancel / ModHeader / CommitPackage / InsertFilePaymentList */
export const StatusOnlyResponseSchema = createResponseSchema(
	v.object({ RsStatus: RsStatusSchema }),
);
