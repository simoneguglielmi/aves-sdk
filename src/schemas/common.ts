import * as v from "valibot";
import { RsStatusValueSchema } from "./enums.js";

/**
 * Request header schema with authentication credentials
 */
export const RqHeaderSchema = v.object({
	"@HostID": v.pipe(v.string(), v.minLength(6), v.maxLength(6)),
	"@Xtoken": v.string(),
	"@Interface": v.literal("WEB"),
	"@UserName": v.literal("WEB"),
	"@LanguageCode": v.optional(
		v.pipe(v.string(), v.minLength(2), v.maxLength(2)),
	),
});

const warningsSchema = v.optional(
	v.pipe(
		v.string(),
		v.transform((input) => input.split(",")),
	),
);

/**
 * Response status schema indicating success, error, or warning
 */
export const RsStatusSchema = v.pipe(
	v.object({
		"@Status": RsStatusValueSchema,
		ErrorCode: v.optional(
			v.pipe(
				v.union([v.string(), v.number()]),
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
