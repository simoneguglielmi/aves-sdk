import { Schema, SchemaAST, SchemaTransformation } from "effect";
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
 * Services-pin choke point: Effect infers `unknown` Decoding/EncodingServices for
 * dynamic `Struct` fields and AST rebuilds. These schemas never require services —
 * pin to `never` here only. Do not invent parallel cast helpers or grow new
 * services-erasure patterns outside this function.
 */
export function syncSchema<A, I>(
	schema: Schema.Codec<A, I, unknown, unknown>,
): Schema.Codec<A, I> {
	return schema as Schema.Codec<A, I>;
}

/**
 * Decode-only mapping that preserves Encoded and sets Type to `B`.
 * Uses `Schema.declare` for the output type — no `Schema.Any` casts.
 */
export function mapSchema<A, I, B>(
	schema: Schema.Codec<A, I>,
	decode: (a: A) => B,
): Schema.Codec<B, I> {
	return schema.pipe(
		Schema.decodeTo(
			Schema.declare((_input: unknown): _input is B => true),
			SchemaTransformation.transform<B, A>({
				decode,
				encode: unsupportedEncode<A>,
			}),
		),
	);
}

/**
 * Decode `from`, map the value, then decode the result through `to`
 * (`to` reads the mapped value as its own Encoded input).
 * Encoded stays `Encoded<from>`; Type becomes `Type<to>`.
 * Encode is identity (dual facade keys are decode-only).
 */
export function redecodeSchema<A, I, B, J>(
	from: Schema.Codec<A, I>,
	to: Schema.Codec<B, J>,
	map: (input: A) => unknown,
): Schema.Codec<B, I> {
	return from.pipe(
		Schema.decodeTo(
			to,
			SchemaTransformation.transform<J, A>({
				decode: (input) => map(input) as J,
				encode: (input) => input as unknown as A,
			}),
		),
	);
}

/**
 * camelCase input → shape-driven list wrap → PascalCase / @attrs via required wire shape.
 * Use `elementOnlyWire` (`{}`) when the root has no attributes.
 */
export function createApiSchema<A extends object, I extends object>(
	inputSchema: Schema.Codec<A, I>,
	shape: WireShapeFor<A>,
): Schema.Codec<Pascalize<A>, I> {
	return mapSchema(inputSchema, (input) => toWireBody(input, shape));
}

/**
 * Normalize XML one-or-many nodes into a typed array (Effect `ArrayEnsure`).
 */
export function oneOrMany<A, I>(
	itemSchema: Schema.Codec<A, I>,
): Schema.ArrayEnsure<Schema.Codec<A, I>> {
	return Schema.ArrayEnsure(itemSchema);
}

/**
 * Wire `{ DetailKey: one|many }` → flat `Detail[]` (mirrors request list wrap).
 */
export function listDetailApiSchema<const TKey extends string, A, I>(
	detailKey: TKey,
	itemSchema: Schema.Codec<A, I>,
) {
	const listField = Schema.optional(oneOrMany(itemSchema));
	const fields = { [detailKey]: listField } as {
		[K in TKey]: typeof listField;
	};
	const wireStruct = syncSchema(Schema.Struct(fields));

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
export function createResponseSchema<A, I>(
	apiSchema: Schema.Codec<A, I>,
): Schema.Codec<Camelize<A>, I> {
	return mapSchema(apiSchema, (input) => pascalToCamelKeysInPlace(input));
}

/**
 * Search-style RS: `{ rsStatus, [listKey]: Detail[] }` with full InferOutput.
 * Pass PascalCase wire list key (e.g. `"PackageList"` → camel `packageList`).
 */
export function createListResponseSchema<const K extends string, A, I>(
	listKey: K,
	listSchema: Schema.Codec<A, I>,
) {
	const listField = Schema.optional(listSchema);
	const wire = syncSchema(
		Schema.Struct({
			RsStatus: RsStatusSchema,
			[listKey]: listField,
		} as { RsStatus: typeof RsStatusSchema } & {
			[P in K]: typeof listField;
		}),
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
export function createFlattenedResponseSchema<A, I, const K extends string>(
	apiSchema: Schema.Codec<A, I>,
	detailKey: K,
): Schema.Codec<FlattenedResponse<Camelize<A>, K>, I> {
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
	valueSchema: Schema.Codec<A, I>,
	extraEntries: TExtra,
) {
	const objectSchema = Schema.Struct({ value: valueSchema }).pipe(
		Schema.fieldsAssign(extraEntries),
	);
	type ValueObject = (typeof objectSchema)["Type"];

	// Bare value → `{ value }`, then checked against the object's Type side.
	const fromBare = valueSchema.pipe(
		Schema.decodeTo(
			Schema.toType(objectSchema),
			SchemaTransformation.transform<ValueObject, A>({
				decode: (value) => ({ value }) as ValueObject,
				encode: (object) => (object as { readonly value: A }).value,
			}),
		),
	);

	return syncSchema(Schema.Union([fromBare, objectSchema]));
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

/** Optional on the wire side (`Schema.optional`, decoding defaults, …). */
function isOptionalField(field: StructField): boolean {
	return SchemaAST.isOptional(SchemaAST.toEncoded(field.ast));
}

type SoftAliasTarget<
	TFields extends StructFields,
	A extends Readonly<Record<string, string>>,
> = Extract<A[keyof A], keyof TFields & string>;

type EncodedOptional = { readonly "~encoded.optionality": "optional" };

/** Facade keys are always optional on dual input (AVES key or alias). */
type MappedFacades<
	TFields extends StructFields,
	A extends Readonly<Record<string, string>>,
> = {
	[K in keyof A as A[K] extends keyof TFields
		? K
		: never]: A[K] extends keyof TFields
		? TFields[A[K]] extends EncodedOptional
			? TFields[A[K]]
			: Schema.optional<TFields[A[K]]>
		: never;
};

/** `Schema.partial` for a field record: every entry optional (`?: T | undefined`). */
type PartialFields<T extends StructFields> = {
	[K in keyof T]: Schema.optional<T[K]>;
};

function optionalizeField(field: StructField): StructField {
	if (isOptionalField(field)) return field;
	return Schema.optional(field);
}

function partialFields<T extends StructFields>(fields: T): PartialFields<T> {
	const out: Partial<Record<keyof T, StructField>> = {};
	for (const k of Object.keys(fields) as (keyof T & string)[])
		out[k] = Schema.optional(fields[k]);
	return out as PartialFields<T>;
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
 * `omit(required-aliased) + facadeEntries + partial(those)` — no Schema cast.
 */
export function facadeObject<
	TFields extends StructFields,
	const A extends Readonly<Record<string, string>>,
>(avesEntries: TFields, aliases: A) {
	const aves = syncSchema(Schema.Struct(avesEntries));
	const applied: Record<string, string> = {};
	for (const [facade, avesKey] of Object.entries(aliases)) {
		if (!Object.hasOwn(avesEntries, avesKey)) continue;
		applied[facade] = avesKey;
	}

	const facadeEntries = mapFacadeEntries(avesEntries, aliases);
	const softKeys = collectSoftKeys(avesEntries, aliases);

	const dual = Schema.Struct({
		...omitFields(avesEntries, softKeys),
		...facadeEntries,
		...partialFields(pickFields(avesEntries, softKeys)),
	});

	return redecodeSchema(syncSchema(dual), aves, coalesceAliases(applied));
}

/** `Union<[X, Undefined]>` (an optional field) → `X`; anything else unchanged. */
function omitUndefinedUnion(ast: SchemaAST.AST): SchemaAST.AST {
	if (!SchemaAST.isUnion(ast)) return ast;
	const [only, ...rest] = ast.types.filter(
		(t: SchemaAST.AST) => !SchemaAST.isUndefined(t),
	);
	return only && rest.length === 0 ? only : ast;
}

/**
 * Element AST of an array-shaped node (no fixed elements, exactly one rest),
 * or `undefined` for anything else.
 */
function arrayElementAst(ast: SchemaAST.AST): SchemaAST.AST | undefined {
	if (!SchemaAST.isArrays(ast) || ast.elements.length > 0) return undefined;
	const [element, ...extra] = ast.rest;
	return extra.length === 0 ? element : undefined;
}

/**
 * Rewrite an Encoded entry AST to PascalCase/@attr keys using the same `wireKey`
 * path as the encoder. Objects/arrays are rebuilt (arrays accept one-or-many);
 * leaves keep their AST, checks and optionality as-is.
 */
function toWireEntrySchema(ast: SchemaAST.AST, shape: WireShape): Schema.Top {
	const isOptional = SchemaAST.isOptional(ast);
	const core = isOptional ? omitUndefinedUnion(ast) : ast;
	const rebuilt = rewireCore(core, shape);
	if (!rebuilt) return Schema.make(ast);
	return isOptional ? Schema.optional(rebuilt) : rebuilt;
}

function rewireCore(
	ast: SchemaAST.AST,
	shape: WireShape,
): Schema.Top | undefined {
	if (SchemaAST.isObjects(ast)) return wireObjectSchema(ast, shape);
	const element = arrayElementAst(ast);
	if (element) return Schema.ArrayEnsure(toWireEntrySchema(element, shape));
	return undefined;
}

function wireObjectSchema(
	ast: SchemaAST.Objects,
	shape: WireShape,
	overrides?: StructFields,
): Schema.Struct<StructFields> {
	const validationEntries: Record<string, StructField> = {};
	for (const ps of ast.propertySignatures) {
		if (typeof ps.name !== "string") continue;
		const childShape = shape.children?.[ps.name] ?? {};
		validationEntries[wireKey(ps.name, shape)] = toWireEntrySchema(
			ps.type,
			childShape,
		);
	}
	return Schema.Struct({ ...validationEntries, ...(overrides ?? {}) });
}

function buildApiValidationObject<TFields extends StructFields>(
	inputSchema: Schema.Struct<TFields>,
	shape: WireShape,
	overrides?: StructFields,
): Schema.Struct<StructFields> {
	// Wire validation uses Encoded (no defaults / request transforms).
	const encoded = SchemaAST.toEncoded(inputSchema.ast);
	if (!SchemaAST.isObjects(encoded))
		throw new Error("createApiValidationSchema expects a Struct input schema");
	return wireObjectSchema(encoded, shape, overrides);
}

/**
 * Type of the wire validation struct: the input's Encoded fields under their wire keys
 * (same `Pascalize` as the encoder), with server-only overrides replacing their twins.
 */
export type ApiValidationType<
	TFields extends StructFields,
	TShape,
	TOverrides extends StructFields,
> = Omit<Pascalize<Schema.Struct.Encoded<TFields>, TShape>, keyof TOverrides> &
	Schema.Struct.Type<TOverrides>;

/**
 * Validation schema for already-transformed PascalCase/@attr payloads.
 * Walks nested object entries recursively so keys cannot drift from the encoder.
 * `overrides` is only for server-only fields (not structural twins).
 */
export function createApiValidationSchema<
	TFields extends StructFields,
	const TShape extends WireShapeFor<
		Schema.Struct.Type<TFields> & object
	> = Record<never, never>,
	TOverrides extends StructFields = Record<never, never>,
>(
	inputSchema: Schema.Struct<TFields>,
	shape: TShape = {} as TShape,
	overrides?: TOverrides,
): Schema.Codec<
	ApiValidationType<TFields, TShape, TOverrides>,
	ApiValidationType<TFields, TShape, TOverrides>
> {
	// The runtime struct is built key by key, so its type is declared here once
	// (same AST and `fields`; only the static type is narrowed).
	const struct = buildApiValidationObject(inputSchema, shape, overrides);
	return Schema.make<
		Schema.Codec<
			ApiValidationType<TFields, TShape, TOverrides>,
			ApiValidationType<TFields, TShape, TOverrides>
		>
	>(struct.ast, { fields: struct.fields });
}

/** Every key optional (`?: T | undefined`), as Effect 3 `Schema.partial` typed it. */
export type PartialOf<A> = { [K in keyof A]?: A[K] | undefined };

/**
 * `Schema.partial` for an object Codec whose type is declared (e.g. by
 * {@link createApiValidationSchema}): rebuilds the struct with every top-level
 * property optional; nested objects keep their own optionality.
 */
export function partialSchema<A extends object>(
	schema: Schema.Codec<A, A>,
): Schema.Codec<PartialOf<A>, PartialOf<A>> {
	const { ast } = schema;
	if (!SchemaAST.isObjects(ast))
		throw new Error("partialSchema expects an object schema");
	const fields: Record<string, StructField> = {};
	for (const ps of ast.propertySignatures) {
		if (typeof ps.name !== "string") continue;
		const field = Schema.make(ps.type);
		fields[ps.name] = SchemaAST.isOptional(ps.type)
			? field
			: Schema.optional(field);
	}
	const struct = Schema.Struct(fields);
	return Schema.make<Schema.Codec<PartialOf<A>, PartialOf<A>>>(struct.ast, {
		fields: struct.fields,
	});
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
	shape: WireShapeFor<Schema.Struct.Type<TFields> & object>,
) {
	return {
		api: createApiSchema(syncSchema(inputSchema), shape),
		validation: createApiValidationSchema(inputSchema, shape),
	};
}

export { camelToPascalKeys, toWireBody };
