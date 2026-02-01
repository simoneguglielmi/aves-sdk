import type { BaseSchema, ObjectEntries } from "valibot";
import * as v from "valibot";
import {
	ATTRIBUTE_FIELDS,
	camelToPascalKeys,
	pascalToCamelKeys,
} from "./case-transform.js";

/**
 * Creates a schema that transforms camelCase input to PascalCase for API requests
 */
export function createApiSchema<
	TInput extends BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
>(inputSchema: TInput) {
	return v.pipe(
		inputSchema,
		v.transform((input) => camelToPascalKeys(input)),
	);
}

/**
 * Creates a schema that transforms PascalCase API responses to camelCase
 */
export function createResponseSchema<
	TApi extends BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
>(apiSchema: TApi) {
	return v.pipe(
		apiSchema,
		v.transform((input) => pascalToCamelKeys(input)),
	);
}

/**
 * Creates a validation schema for already-transformed PascalCase data with @ attributes
 * Used for nested objects like AccountPolicies, FinancialDetail, DynamicFields
 * Takes the same input schema used in createApiSchema and generates the validation schema
 * by directly using the ATTRIBUTE_FIELDS logic to determine which fields become attributes
 */
export function createApiValidationSchema<
	TEntries extends ObjectEntries,
	TMessage extends v.ErrorMessage<v.ObjectIssue> | undefined,
>(inputSchema: v.ObjectSchema<TEntries, TMessage>) {
	const validationEntries: Record<string, unknown> = {};

	// Build validation schema based on ATTRIBUTE_FIELDS
	for (const key in inputSchema.entries) {
		const isAttribute = ATTRIBUTE_FIELDS.has(key);
		const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
		const finalKey = isAttribute ? `@${pascalKey}` : pascalKey;

		validationEntries[finalKey] = inputSchema.entries[key];
	}

	return v.object(validationEntries as TEntries);
}
