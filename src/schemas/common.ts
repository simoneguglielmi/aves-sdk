import { Schema } from "effect";
import { createResponseSchema, mapSchema } from "../utils/schema-transform.js";
import { RsStatusValueSchema } from "./enums.js";

/** AVES language code (`01` Italian, `02` English, …) */
export const LanguageCodeSchema = Schema.String.pipe(
	Schema.minLength(2),
	Schema.maxLength(2),
);

export const OptionalLanguageCodeSchema = Schema.optional(LanguageCodeSchema);

/** XML often sends numbers as strings (or vice versa). */
export const StringishSchema = Schema.Union(Schema.String, Schema.Number);

/** Catalog/boolish wire fields that may arrive as string | number | boolean. */
export const StringishBoolSchema = Schema.Union(
	Schema.String,
	Schema.Number,
	Schema.Boolean,
);

/** AVES bool-ish wire values */
export const BoolishSchema = Schema.Union(
	Schema.Literal("true"),
	Schema.Literal("false"),
	Schema.Boolean,
);

export const DateRangeSchema = Schema.Struct({
	minDate: Schema.String,
	maxDate: Schema.String,
});

/**
 * Request header schema with authentication credentials
 */
export const RqHeaderSchema = Schema.Struct({
	"@HostID": Schema.String.pipe(Schema.minLength(6), Schema.maxLength(6)),
	"@Xtoken": Schema.String,
	"@Interface": Schema.Literal("WEB"),
	"@UserName": Schema.Literal("WEB"),
	"@LanguageCode": OptionalLanguageCodeSchema,
});

const warningsSchema = Schema.optional(Schema.String);

const ErrorCodeSchema = Schema.optional(
	mapSchema(StringishSchema, (val) => Number(val)),
);

/**
 * Response status schema indicating success, error, or warning
 */
export const RsStatusSchema = mapSchema(
	Schema.Struct({
		"@Status": RsStatusValueSchema,
		ErrorCode: ErrorCodeSchema,
		ErrorDescription: Schema.optional(Schema.String),
		Warnings: warningsSchema,
	}),
	(input) => ({
		status: input["@Status"],
		errorCode: input.ErrorCode,
		errorDescription: input.ErrorDescription,
		warnings: input.Warnings,
	}),
);

/** Cancel / ModHeader / CommitPackage / InsertFilePaymentList */
export const StatusOnlyResponseSchema = createResponseSchema(
	Schema.Struct({ RsStatus: RsStatusSchema }),
);
