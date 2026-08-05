import type { BaseIssue, BaseSchema, ObjectEntries } from "valibot";
import * as v from "valibot";
import { RsStatusSchema } from "../schemas/common.js";
import { toWireBody } from "./booking-transform.js";
import {
	camelToPascalKeys,
	pascalToCamelKeys,
	wireKey,
} from "./case-transform.js";
import type { WireShape, WireShapeFor } from "./wire-shapes.js";

/**
 * camelCase input → shape-driven list wrap → PascalCase / @attrs via required wire shape.
 * Use `elementOnlyWire` (`{}`) when the root has no attributes.
 */
export function createApiSchema<
	TSchema extends v.GenericSchema<object, object>,
>(inputSchema: TSchema, shape: WireShapeFor<v.InferInput<TSchema>>) {
	return v.pipe(
		inputSchema,
		v.transform((input) => toWireBody(input, shape)),
	);
}

/**
 * Normalize XML one-or-many nodes into a typed array.
 */
export function oneOrMany<TSchema extends v.GenericSchema>(
	itemSchema: TSchema,
) {
	return v.pipe(
		v.union([v.array(itemSchema), itemSchema]),
		v.transform((input): v.InferOutput<TSchema>[] =>
			Array.isArray(input) ? input : [input],
		),
	);
}

/**
 * Wire `{ DetailKey: one|many }` → flat `Detail[]` (mirrors request list wrap).
 */
export function listDetailApiSchema<
	const TKey extends string,
	TSchema extends v.GenericSchema,
>(detailKey: TKey, itemSchema: TSchema) {
	const itemList = v.optional(oneOrMany(itemSchema));
	return v.pipe(
		v.object({ [detailKey]: itemList } as {
			[K in TKey]: typeof itemList;
		}),
		v.transform((list): v.InferOutput<TSchema>[] => list[detailKey] ?? []),
	);
}

/**
 * Creates a schema that transforms PascalCase API responses to camelCase
 */
export function createResponseSchema<TSchema extends v.GenericSchema>(
	apiSchema: TSchema,
) {
	return v.pipe(
		apiSchema,
		v.transform((input) => pascalToCamelKeys(input)),
	);
}

/**
 * Search-style RS: `{ rsStatus, [listKey]: Detail[] }` with full InferOutput.
 * Pass PascalCase wire list key (e.g. `"PackageList"` → camel `packageList`).
 */
export function createListResponseSchema<
	const K extends string,
	TList extends v.GenericSchema,
>(listKey: K, listSchema: TList) {
	const listEntries = { [listKey]: v.optional(listSchema) } as {
		[P in K]: v.OptionalSchema<TList, undefined>;
	};
	return createResponseSchema(
		v.object({
			RsStatus: RsStatusSchema,
			...listEntries,
		}),
	);
}

/** Result of spreading optional detail key `K` onto object `T`. */
export type FlattenedResponse<T, K extends string> = T extends object
	? K extends keyof T
		? Omit<T, K> & NonNullable<T[K]>
		: T
	: T;

/**
 * Spread an optional nested detail object onto the response root (immutable).
 * e.g. `{ rsStatus, bookingFileDetail: { code } }` → `{ rsStatus, code }`
 */
export function flattenResponseDetail<const K extends string>(detailKey: K) {
	return <T>(input: T): FlattenedResponse<T, K> => {
		if (input === null || typeof input !== "object")
			return input as FlattenedResponse<T, K>;
		const record = input as Record<string, unknown>;
		const detail = record[detailKey];
		const { [detailKey]: _, ...rest } = record;
		if (!detail || typeof detail !== "object" || Array.isArray(detail))
			return rest as FlattenedResponse<T, K>;
		return { ...rest, ...detail } as FlattenedResponse<T, K>;
	};
}

/**
 * camelCase response + spread a single `*Detail` onto the root.
 */
export function createFlattenedResponseSchema<
	TSchema extends v.GenericSchema,
	const K extends string,
>(apiSchema: TSchema, detailKey: K) {
	return v.pipe(
		createResponseSchema(apiSchema),
		v.transform((input) => flattenResponseDetail(detailKey)(input)),
	);
}

/**
 * Accept a bare value **or** `{ value, ...extras }`; always output the object form.
 * Used for booking/file status fields.
 */
export function valueFieldSchema<
	TValue extends v.GenericSchema,
	TExtra extends ObjectEntries,
>(valueSchema: TValue, extraEntries?: TExtra) {
	const objectSchema = v.object({
		value: valueSchema,
		...(extraEntries ?? {}),
	} as { value: TValue } & TExtra);
	return v.pipe(
		v.union([valueSchema, objectSchema]),
		v.transform((input) =>
			input !== null && typeof input === "object" ? input : { value: input },
		),
	);
}

/**
 * `selectedPackageList: [item]` → `selectedPackageDetail: item` (keeps explicit singular).
 */
export function coalesceListHead<
	const ListKey extends string,
	const ItemKey extends string,
>(listKey: ListKey, itemKey: ItemKey) {
	return <T extends object>(input: T): Omit<T, ListKey> => {
		const list = Reflect.get(input, listKey);
		const item = Reflect.get(input, itemKey);
		const next = { ...input };
		Reflect.deleteProperty(next, listKey);
		Reflect.set(
			next,
			itemKey,
			item ?? (Array.isArray(list) ? list[0] : undefined),
		);
		return next as Omit<T, ListKey>;
	};
}

/**
 * `customerRecordCode` shorthand → `customerDetail.recordCode`.
 */
export function coalesceCustomerRecordCode<
	T extends {
		customerDetail?: { recordCode?: string } | undefined;
		customerRecordCode?: string | undefined;
	},
>(input: T) {
	const { customerRecordCode, customerDetail, ...rest } = input;
	return {
		...rest,
		customerDetail: {
			...customerDetail,
			recordCode: customerDetail?.recordCode ?? customerRecordCode,
		},
	};
}

function isObjectSchema(
	schema: v.GenericSchema,
): schema is v.ObjectSchema<
	ObjectEntries,
	v.ErrorMessage<v.ObjectIssue> | undefined
> {
	return schema.type === "object" && "entries" in schema;
}

function isOptionalSchema(
	schema: v.GenericSchema,
): schema is v.OptionalSchema<v.GenericSchema, unknown> {
	return schema.type === "optional" && "wrapped" in schema;
}

function isArraySchema(
	schema: v.GenericSchema,
): schema is v.ArraySchema<
	v.GenericSchema,
	v.ErrorMessage<v.ArrayIssue> | undefined
> {
	return schema.type === "array" && "item" in schema;
}

/**
 * Recursively rewrite an input entry schema to PascalCase/@attr keys using the same
 * `wireKey` path as the encoder. Object/array nesting follows `shape.children`.
 */
function toWireEntrySchema(
	schema: v.GenericSchema,
	shape: WireShape,
): BaseSchema<unknown, unknown, BaseIssue<unknown>> {
	if (isOptionalSchema(schema)) {
		const inner = toWireEntrySchema(schema.wrapped, shape);
		return schema.default !== undefined
			? v.optional(inner, schema.default as never)
			: v.optional(inner);
	}
	if (isArraySchema(schema))
		return oneOrMany(toWireEntrySchema(schema.item, shape));
	if (isObjectSchema(schema)) return buildApiValidationObject(schema, shape);
	return schema;
}

function buildApiValidationObject(
	inputSchema: v.ObjectSchema<
		ObjectEntries,
		v.ErrorMessage<v.ObjectIssue> | undefined
	>,
	shape: WireShape,
	overrides?: ObjectEntries,
) {
	const validationEntries = {} as {
		[K in string]: BaseSchema<unknown, unknown, BaseIssue<unknown>>;
	};

	for (const key in inputSchema.entries) {
		const childShape = shape.children?.[key] ?? {};
		validationEntries[wireKey(key, shape)] = toWireEntrySchema(
			inputSchema.entries[key],
			childShape,
		);
	}

	return v.object({ ...validationEntries, ...overrides });
}

/**
 * Validation schema for already-transformed PascalCase/@attr payloads.
 * Walks nested object entries recursively so keys cannot drift from the encoder.
 * `overrides` is only for server-only fields (not structural twins).
 */
export function createApiValidationSchema<
	TEntries extends ObjectEntries,
	TMessage extends v.ErrorMessage<v.ObjectIssue> | undefined,
	TOverrides extends ObjectEntries = Record<never, never>,
>(
	inputSchema: v.ObjectSchema<TEntries, TMessage>,
	shape: WireShapeFor<v.InferInput<typeof inputSchema>> = {},
	overrides?: TOverrides,
) {
	return buildApiValidationObject(
		inputSchema,
		shape,
		overrides,
	) as v.ObjectSchema<TEntries & TOverrides, undefined>;
}

/**
 * Prefer first defined candidate for each output key; drop alias keys.
 * e.g. `{ "@FromExternalProvider": [canonical, alias] }`
 */
export function coalesceWireAliases<
	T extends object,
	const TRules extends Readonly<Record<string, readonly string[]>>,
>(
	input: T,
	rules: TRules,
): Omit<
	T,
	Exclude<Extract<TRules[keyof TRules][number], PropertyKey>, keyof TRules>
> {
	const out: Record<string, unknown> = {
		...(input as Record<string, unknown>),
	};
	for (const [outKey, candidates] of Object.entries(rules)) {
		let value: unknown;
		for (const key of candidates) {
			if (out[key] !== undefined && out[key] !== null) {
				value = out[key];
				break;
			}
		}
		for (const key of candidates) {
			if (key !== outKey) delete out[key];
		}
		if (value !== undefined) out[outKey] = value;
		else delete out[outKey];
	}
	return out as Omit<
		T,
		Exclude<Extract<TRules[keyof TRules][number], PropertyKey>, keyof TRules>
	>;
}

/**
 * createApiSchema + createApiValidationSchema for the same input/shape pair.
 */
export function createWireSchemaPair<
	TEntries extends ObjectEntries,
	TMessage extends v.ErrorMessage<v.ObjectIssue> | undefined,
>(
	inputSchema: v.ObjectSchema<TEntries, TMessage>,
	shape: WireShapeFor<v.InferInput<typeof inputSchema>>,
) {
	return {
		api: createApiSchema(inputSchema, shape),
		validation: createApiValidationSchema(inputSchema, shape),
	};
}

export { camelToPascalKeys, toWireBody };
