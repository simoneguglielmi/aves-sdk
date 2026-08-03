import type { BaseSchema, ObjectEntries } from "valibot";
import * as v from "valibot";
import { type ListWrapOptions, toWireBody } from "./booking-transform.js";
import { camelToPascalKeys, pascalToCamelKeys } from "./case-transform.js";
import type { WireShape } from "./wire-shapes.js";

/**
 * camelCase input → optional list wrap → PascalCase / @attrs via required wire shape.
 * Use `elementOnlyWire` (`{}`) when the root has no attributes.
 */
export function createApiSchema<
	TInput extends BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
>(inputSchema: TInput, shape: WireShape, wrap?: ListWrapOptions) {
	return v.pipe(
		inputSchema,
		v.transform((input) =>
			toWireBody(input as Record<string, unknown>, shape, wrap),
		),
	);
}

/**
 * Normalize XML one-or-many nodes into a typed array.
 */
export function oneOrMany<
	TSchema extends BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
>(itemSchema: TSchema) {
	return v.pipe(
		v.union([v.array(itemSchema), itemSchema]),
		v.transform((input): v.InferOutput<TSchema>[] =>
			Array.isArray(input) ? input : [input],
		),
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
 * Validation schema for already-transformed PascalCase/@attr payloads.
 * Uses `shape.attrs` (not a global field set) to decide `@` vs element.
 */
export function createApiValidationSchema<
	TEntries extends ObjectEntries,
	TMessage extends v.ErrorMessage<v.ObjectIssue> | undefined,
>(inputSchema: v.ObjectSchema<TEntries, TMessage>, shape: WireShape = {}) {
	const validationEntries: Record<string, unknown> = {};
	const attrs = shape.attrs ?? [];
	const preserve = shape.preserveCamel ?? [];

	for (const key in inputSchema.entries) {
		const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
		const isAttribute = attrs.includes(key);
		const finalKey = isAttribute
			? preserve.includes(key)
				? `@${key}`
				: `@${pascalKey}`
			: pascalKey;
		validationEntries[finalKey] = inputSchema.entries[key];
	}

	return v.object(validationEntries as TEntries);
}

export { camelToPascalKeys, toWireBody };
