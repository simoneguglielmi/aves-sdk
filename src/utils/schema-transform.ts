import { ParseResult, Schema, SchemaAST } from "effect";
import { RsStatusSchema } from "../schemas/common.js";
import { toWireBody } from "./booking-transform.js";
import {
	type Camelize,
	camelToPascalKeys,
	type Pascalize,
	pascalToCamelKeysInPlace,
	wireKey,
} from "./case-transform.js";
import type { WireShape, WireShapeFor } from "./wire-shapes.js";

type StructFields = Schema.Struct.Fields;
type StructField = StructFields[string];

/** Decode-only schemas cannot encode; encode is intentionally unsupported. */
function unsupportedEncode<A>(_b: unknown): A {
	throw new Error("Encoding is not supported for this schema");
}

/**
 * Context-pin choke point: Effect often infers `unknown` Context for dynamic
 * `Struct` / `partial` / AST rebuilds. These schemas never require services —
 * pin to `never` here only. Do not invent parallel cast helpers or grow new
 * Context-erasure patterns outside this function.
 */
export function syncSchema<A, I>(
	schema: Schema.Schema<A, I, never> | Schema.Schema<A, I, unknown>,
): Schema.Schema<A, I, never> {
	return schema as Schema.Schema<A, I, never>;
}

/**
 * Decode-only mapping that preserves Encoded and sets Type to `B`.
 * Uses `Schema.declare` for the output type — no `Schema.Any` casts.
 */
export function mapSchema<A, I, B>(
	schema: Schema.Schema<A, I, never>,
	decode: (a: A) => B,
): Schema.Schema<B, I, never> {
	return Schema.transform(
		Schema.asSchema(schema),
		Schema.declare((input: unknown): input is B => true),
		{
			strict: false,
			decode,
			encode: unsupportedEncode<A>,
		},
	);
}

/**
 * Decode `from`, map the value, then re-validate through `to`.
 * Encoded stays `Encoded<from>`; Type becomes `Type<to>`.
 * Encode is identity (dual facade keys are decode-only).
 */
export function redecodeSchema<A, I, B, J>(
	from: Schema.Schema<A, I>,
	to: Schema.Schema<B, J>,
	map: (input: A) => unknown,
): Schema.Schema<B, I, never> {
	const source = Schema.asSchema(from);
	const target = Schema.asSchema(to);
	return syncSchema(
		Schema.transformOrFail(source, target, {
			strict: false,
			decode: (input, options) =>
				ParseResult.decodeUnknown(target)(map(input), options),
			encode: ParseResult.succeed,
		}),
	);
}

/**
 * camelCase input → shape-driven list wrap → PascalCase / @attrs via required wire shape.
 * Use `elementOnlyWire` (`{}`) when the root has no attributes.
 */
export function createApiSchema<A extends object, I extends object>(
	inputSchema: Schema.Schema<A, I, never>,
	shape: WireShapeFor<A>,
): Schema.Schema<Pascalize<A>, I, never> {
	return mapSchema(syncSchema(Schema.asSchema(inputSchema)), (input) =>
		toWireBody(input, shape),
	);
}

/**
 * Normalize XML one-or-many nodes into a typed array (Effect `ArrayEnsure`).
 */
export function oneOrMany<A, I>(
	itemSchema: Schema.Schema<A, I, never>,
): Schema.ArrayEnsure<Schema.Schema<A, I, never>> {
	return Schema.ArrayEnsure(itemSchema);
}

/**
 * Wire `{ DetailKey: one|many }` → flat `Detail[]` (mirrors request list wrap).
 */
export function listDetailApiSchema<const TKey extends string, A, I>(
	detailKey: TKey,
	itemSchema: Schema.Schema<A, I, never>,
) {
	const listField = Schema.optional(oneOrMany(itemSchema));
	const fields = { [detailKey]: listField } as {
		[K in TKey]: typeof listField;
	};
	const wireStruct = syncSchema(Schema.asSchema(Schema.Struct(fields)));

	return mapSchema(wireStruct, (list): A[] => {
		const value = Reflect.get(list, detailKey);
		if (!Array.isArray(value)) return [];
		return value;
	});
}

/**
 * Creates a schema that validates the PascalCase wire response, then camelizes
 * keys **in place** on the parse output — no second tree copy.
 */
export function createResponseSchema<S extends Schema.Schema.AnyNoContext>(
	apiSchema: S,
): Schema.Schema<
	Camelize<Schema.Schema.Type<S>>,
	Schema.Schema.Encoded<S>,
	never
> {
	return mapSchema(syncSchema(Schema.asSchema(apiSchema)), (input) =>
		pascalToCamelKeysInPlace(input),
	);
}

/**
 * Search-style RS: `{ rsStatus, [listKey]: Detail[] }` with full InferOutput.
 * Pass PascalCase wire list key (e.g. `"PackageList"` → camel `packageList`).
 */
export function createListResponseSchema<const K extends string, A, I>(
	listKey: K,
	listSchema: Schema.Schema<A, I, never>,
) {
	const listField = Schema.optional(listSchema);
	const wire = syncSchema(
		Schema.asSchema(
			Schema.Struct({
				RsStatus: RsStatusSchema,
				[listKey]: listField,
			} as { RsStatus: typeof RsStatusSchema } & {
				[P in K]: typeof listField;
			}),
		),
	);
	return createResponseSchema(wire);
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
	S extends Schema.Schema.AnyNoContext,
	const K extends string,
>(
	apiSchema: S,
	detailKey: K,
): Schema.Schema<
	FlattenedResponse<Camelize<Schema.Schema.Type<S>>, K>,
	Schema.Schema.Encoded<S>,
	never
> {
	return mapSchema(createResponseSchema(apiSchema), (input) =>
		flattenResponseDetail(detailKey)(input),
	);
}

/**
 * Accept a bare value **or** `{ value, ...extras }`; always output the object form.
 * Used for booking/file status fields.
 *
 * Encoded = `I | objectEncoded` (never `I & extras` — that collapses string literals).
 */
export function valueFieldSchema<A, I, const TExtra extends StructFields>(
	valueSchema: Schema.Schema<A, I, never>,
	extraEntries: TExtra,
) {
	const valueObjectSchema = Schema.Struct({ value: valueSchema });
	const objectSchema = Schema.extend(
		valueObjectSchema,
		Schema.Struct(extraEntries),
	);

	const fromBare = Schema.transform(valueSchema, objectSchema, {
		strict: false,
		decode: (_value: A, fromI: I) => ({ value: fromI }),
		encode: (
			_toI: Schema.Schema.Encoded<typeof objectSchema>,
			toA: Schema.Schema.Type<typeof objectSchema>,
		) => toA.value,
	});

	return syncSchema(Schema.asSchema(Schema.Union(fromBare, objectSchema)));
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

/**
 * Copy facade keys onto canonical AVES keys (AVES wins); strip facade keys.
 * `aliases` is facade → AVES.
 */
export function coalesceAliases<
	const M extends Readonly<Record<string, string>>,
>(aliases: M) {
	return <T extends object>(input: T): Omit<T, keyof M & keyof T> => {
		const out: Record<string, unknown> = {
			...(input as Record<string, unknown>),
		};
		for (const [facade, aves] of Object.entries(aliases)) {
			const facadeVal = out[facade];
			delete out[facade];
			if (out[aves] === undefined && facadeVal !== undefined)
				out[aves] = facadeVal;
		}
		return out as Omit<T, keyof M & keyof T>;
	};
}

function isOptionalField(schema: unknown): boolean {
	if (!Schema.isPropertySignature(schema)) return false;
	const ast = schema.ast;
	if (ast._tag === "PropertySignatureDeclaration") return ast.isOptional;
	if (ast._tag === "PropertySignatureTransformation")
		return ast.from.isOptional;
	return false;
}

type SoftAliasTarget<
	TFields extends StructFields,
	A extends Readonly<Record<string, string>>,
> = Extract<A[keyof A], keyof TFields & string>;

/** Facade keys are always optional on dual input (AVES key or alias). */
type MappedFacades<
	TFields extends StructFields,
	A extends Readonly<Record<string, string>>,
> = {
	[K in keyof A as A[K] extends keyof TFields
		? K
		: never]: A[K] extends keyof TFields
		? TFields[A[K]] extends Schema.PropertySignature.All
			? TFields[A[K]]
			: Schema.optional<
					TFields[A[K]] extends Schema.Schema.All ? TFields[A[K]] : never
				>
		: never;
};

function optionalizeField(schema: StructField): StructField {
	if (isOptionalField(schema)) return schema;
	if (Schema.isPropertySignature(schema) && "from" in schema)
		return Schema.optional(
			Schema.asSchema((schema as { from: Schema.Schema.AnyNoContext }).from),
		);
	return Schema.optional(Schema.asSchema(schema as Schema.Schema.AnyNoContext));
}

function pickFields<T extends StructFields, S extends keyof T & string>(
	fields: T,
	keys: readonly S[],
): { [K in S]: T[K] } {
	const out: Partial<{ [K in S]: T[K] }> = {};
	for (const k of keys) out[k] = fields[k];
	return out as { [K in S]: T[K] };
}

function omitFields<T extends StructFields, S extends keyof T & string>(
	fields: T,
	keys: readonly S[],
): Omit<T, S> {
	const skip = new Set<PropertyKey>(keys);
	const out: Partial<T> = {};
	for (const k of Object.keys(fields) as (keyof T & string)[]) {
		if (!skip.has(k)) out[k] = fields[k];
	}
	return out as Omit<T, S>;
}

function mapFacadeEntries<
	TFields extends StructFields,
	const A extends Readonly<Record<string, string>>,
>(avesEntries: TFields, aliases: A): MappedFacades<TFields, A> {
	const out = {} as MappedFacades<TFields, A>;
	for (const key of Object.keys(aliases) as (keyof A & string)[]) {
		const avesKey = aliases[key];
		if (!Object.hasOwn(avesEntries, avesKey)) continue;
		const field = avesEntries[avesKey as keyof TFields];
		if (field === undefined) continue;
		out[key as keyof MappedFacades<TFields, A>] = optionalizeField(
			field,
		) as MappedFacades<TFields, A>[keyof MappedFacades<TFields, A>];
	}
	return out;
}

function collectSoftKeys<
	TFields extends StructFields,
	const A extends Readonly<Record<string, string>>,
>(avesEntries: TFields, aliases: A): SoftAliasTarget<TFields, A>[] {
	const keys: SoftAliasTarget<TFields, A>[] = [];
	const seen = new Set<string>();
	for (const avesKey of Object.values(aliases)) {
		if (!Object.hasOwn(avesEntries, avesKey) || seen.has(avesKey)) continue;
		const field = avesEntries[avesKey as keyof TFields];
		if (field === undefined || isOptionalField(field)) continue;
		seen.add(avesKey);
		keys.push(avesKey as SoftAliasTarget<TFields, A>);
	}
	return keys;
}

/**
 * Object schema that accepts AVES keys and/or facade aliases.
 * Output is AVES-only (aliases coalesced; required fields re-validated).
 *
 * Dual Encoded is inferred from Struct composition:
 * `omit(required-aliased) + partial(those) + facadeEntries` — no Schema cast.
 */
export function facadeObject<
	TFields extends StructFields,
	const A extends Readonly<Record<string, string>>,
>(avesEntries: TFields, aliases: A) {
	const aves = syncSchema(Schema.asSchema(Schema.Struct(avesEntries)));
	const applied: Record<string, string> = {};
	for (const [facade, avesKey] of Object.entries(aliases)) {
		if (!Object.hasOwn(avesEntries, avesKey)) continue;
		applied[facade] = avesKey;
	}

	const facadeEntries = mapFacadeEntries(avesEntries, aliases);
	const softKeys = collectSoftKeys(avesEntries, aliases);

	// Single expression (no soft/no-soft ternary) so return type is not a Schema union.
	const dual = Schema.extend(
		Schema.Struct({
			...omitFields(avesEntries, softKeys),
			...facadeEntries,
		}),
		Schema.partial(Schema.Struct(pickFields(avesEntries, softKeys))),
	);

	return redecodeSchema(
		syncSchema(Schema.asSchema(dual)),
		aves,
		coalesceAliases(applied),
	);
}

function isStructSchema(
	schema: unknown,
): schema is Schema.Struct<StructFields> {
	return (
		Schema.isSchema(schema) &&
		SchemaAST.isTypeLiteral(schema.ast) &&
		"fields" in schema
	);
}

function isArraySchema(
	schema: unknown,
): schema is Schema.Array$<Schema.Schema.AnyNoContext> {
	return (
		Schema.isSchema(schema) &&
		SchemaAST.isTupleType(schema.ast) &&
		schema.ast.elements.length === 0 &&
		schema.ast.rest.length === 1 &&
		"value" in schema
	);
}

function omitUndefinedUnion(ast: SchemaAST.AST): SchemaAST.AST {
	if (ast._tag !== "Union") return ast;
	const [only, ...rest] = ast.types.filter(
		(t: SchemaAST.AST) => t._tag !== "UndefinedKeyword",
	);
	return only && rest.length === 0 ? only : ast;
}

/**
 * Element AST of an array-shaped tuple (no fixed elements, exactly one rest),
 * or `undefined` for anything else. AST-level twin of {@link isArraySchema}.
 */
function arrayElementAst(ast: SchemaAST.AST): SchemaAST.AST | undefined {
	if (!SchemaAST.isTupleType(ast) || ast.elements.length > 0) return undefined;
	const [element, ...extra] = ast.rest;
	return extra.length === 0 ? element?.type : undefined;
}

/** Rebuild a usable Schema from AST (Struct.fields / Array.value must exist). */
function schemaFromAst(ast: SchemaAST.AST): Schema.Schema.AnyNoContext {
	const core = omitUndefinedUnion(ast);
	if (SchemaAST.isTypeLiteral(core)) {
		const fields: Record<string, StructField> = {};
		for (const ps of core.propertySignatures) {
			if (typeof ps.name !== "string") continue;
			const inner = schemaFromAst(ps.type);
			fields[ps.name] = ps.isOptional ? Schema.optional(inner) : inner;
		}
		return syncSchema(Schema.asSchema(Schema.Struct(fields)));
	}
	const elementAst = arrayElementAst(core);
	if (elementAst) {
		return syncSchema(Schema.asSchema(Schema.Array(schemaFromAst(elementAst))));
	}
	return syncSchema(Schema.asSchema(Schema.make(core)));
}

function unwrapOptional(schema: StructField): Schema.Schema.AnyNoContext {
	if (!Schema.isPropertySignature(schema)) {
		if (Schema.isSchema(schema)) return syncSchema(Schema.asSchema(schema));
		return schemaFromAst((schema as { ast: SchemaAST.AST }).ast);
	}
	const ast = schema.ast;
	if (ast._tag === "PropertySignatureDeclaration")
		return schemaFromAst(ast.type);
	if (ast._tag === "PropertySignatureTransformation")
		return schemaFromAst(ast.from.type);
	return schemaFromAst(ast);
}

/**
 * Recursively rewrite an input entry schema to PascalCase/@attr keys using the same
 * `wireKey` path as the encoder. Object/array nesting follows `shape.children`.
 */
function toWireEntrySchema(schema: StructField, shape: WireShape): StructField {
	if (isOptionalField(schema)) {
		const rewritten = toWireEntrySchema(unwrapOptional(schema), shape);
		const asSchema = Schema.isPropertySignature(rewritten)
			? unwrapOptional(rewritten)
			: Schema.asSchema(rewritten as Schema.Schema.AnyNoContext);
		return Schema.optional(asSchema);
	}
	if (isArraySchema(schema)) {
		const item = toWireEntrySchema(schema.value, shape);
		const itemSchema = Schema.isPropertySignature(item)
			? unwrapOptional(item)
			: Schema.asSchema(item as Schema.Schema.AnyNoContext);
		return oneOrMany(itemSchema);
	}
	if (isStructSchema(schema)) return buildApiValidationObject(schema, shape);
	return schema;
}

function buildApiValidationObject<TFields extends StructFields>(
	inputSchema: Schema.Struct<TFields>,
	shape: WireShape,
	overrides?: StructFields,
): Schema.Schema.AnyNoContext {
	const validationEntries: Record<string, StructField> = {};

	for (const [key, field] of Object.entries(inputSchema.fields)) {
		const childShape = shape.children?.[key] ?? {};
		// Wire validation uses Encoded (no defaults / request transforms).
		const forWire =
			Schema.isSchema(field) && field.ast._tag === "Transformation"
				? Schema.encodedSchema(field)
				: field;
		validationEntries[wireKey(key, shape)] = toWireEntrySchema(
			forWire as StructField,
			childShape,
		);
	}

	return syncSchema(
		Schema.asSchema(
			Schema.Struct({
				...validationEntries,
				...(overrides ?? {}),
			}),
		),
	);
}

/**
 * Validation schema for already-transformed PascalCase/@attr payloads.
 * Walks nested object entries recursively so keys cannot drift from the encoder.
 * `overrides` is only for server-only fields (not structural twins).
 */
export function createApiValidationSchema<TFields extends StructFields>(
	inputSchema: Schema.Struct<TFields>,
	shape: WireShapeFor<Schema.Schema.Type<Schema.Struct<TFields>> & object> = {},
	overrides?: StructFields,
): Schema.Schema.AnyNoContext {
	return buildApiValidationObject(inputSchema, shape, overrides);
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
export function createWireSchemaPair<TFields extends StructFields>(
	inputSchema: Schema.Struct<TFields>,
	shape: WireShapeFor<Schema.Schema.Type<Schema.Struct<TFields>> & object>,
) {
	return {
		api: createApiSchema(syncSchema(Schema.asSchema(inputSchema)), shape),
		validation: createApiValidationSchema(inputSchema, shape),
	};
}

export { camelToPascalKeys, toWireBody };
