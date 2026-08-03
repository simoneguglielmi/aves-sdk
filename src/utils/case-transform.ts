import type { WireShape } from "./wire-shapes.js";

type CamelFromDelimiter<S extends string> = S extends `${infer H}_${infer T}`
	? `${H}${Capitalize<CamelFromDelimiter<T>>}`
	: S extends `${infer H}-${infer T}`
		? `${H}${Capitalize<CamelFromDelimiter<T>>}`
		: S;

type ToCamelCase<S extends string> =
	CamelFromDelimiter<S> extends `${infer F}${infer R}`
		? `${Lowercase<F>}${R}`
		: CamelFromDelimiter<S>;

type PascalFromDelimiter<S extends string> = S extends `${infer H}_${infer T}`
	? `${Capitalize<H>}${Capitalize<PascalFromDelimiter<T>>}`
	: S extends `${infer H}-${infer T}`
		? `${Capitalize<H>}${Capitalize<PascalFromDelimiter<T>>}`
		: S;

type ToPascalCase<S extends string> =
	PascalFromDelimiter<S> extends `${infer F}${infer R}`
		? `${Capitalize<F>}${R}`
		: Capitalize<PascalFromDelimiter<S>>;

/** Keys that are preserved as-is (no recursive transform) at runtime */
type Primitive = string | number | boolean | symbol | bigint | null | undefined;
type SpecialObject =
	| Date
	| RegExp
	| Map<unknown, unknown>
	| Set<unknown>
	| Error;

/** Maps key K: strips leading @ and converts to camelCase for mapped output key */
type OverrideCamelKey<K extends string> = K extends "RPH"
	? "rph"
	: K extends "TOServiceType"
		? "toServiceType"
		: ToCamelCase<K>;

type CamelizeKey<K extends string> = K extends `@${infer Rest}`
	? OverrideCamelKey<Rest>
	: OverrideCamelKey<K>;

/** Maps key K: strips leading @ and converts to PascalCase for mapped output key */
type PascalizeKey<K extends string> = K extends `@${infer Rest}`
	? ToPascalCase<Rest>
	: ToPascalCase<K>;

/**
 * Recursively maps PascalCase/@-prefixed object keys to camelCase.
 * Reflects pascalToCamelKeys runtime: primitives and special objects preserved; arrays and plain objects recursively transformed.
 */
export type Camelize<T> = T extends Primitive
	? T
	: T extends SpecialObject
		? T
		: T extends readonly (infer U)[]
			? Camelize<U>[]
			: T extends object
				? { [K in keyof T as CamelizeKey<K & string>]: Camelize<T[K]> }
				: T;

/**
 * Recursively maps camelCase keys to PascalCase (with @ for attributes at runtime).
 * Reflects camelToPascalKeys output shape for type-level use.
 */
export type Pascalize<T> = T extends Primitive
	? T
	: T extends SpecialObject
		? T
		: T extends readonly (infer U)[]
			? Pascalize<U>[]
			: T extends object
				? { [K in keyof T as PascalizeKey<K & string>]: Pascalize<T[K]> }
				: T;

function camelToPascal(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

function pascalToCamel(str: string): string {
	return str.charAt(0).toLowerCase() + str.slice(1);
}

function isSpecialObject(obj: unknown): boolean {
	return (
		obj instanceof Date ||
		obj instanceof RegExp ||
		obj instanceof Map ||
		obj instanceof Set ||
		obj instanceof Error
	);
}

// Keys that need a custom PascalCase/XML tag name (by source camelCase key)
const pascalKeyOverrides = new Map<string, string>([
	["toServiceType", "TOServiceType"],
	["rph", "RPH"],
]);

const camelKeyOverrides = new Map<string, string>([
	["TOServiceType", "toServiceType"],
	["RPH", "rph"],
]);

function formatAttributeField(
	pascalKey: string,
	originalField: string,
	preserveCamel: boolean,
) {
	return preserveCamel ? `@${originalField}` : `@${pascalKey}`;
}

/**
 * camelCase → PascalCase. `@` attrs only for fields listed on the current {@link WireShape}.
 * Child objects/arrays use `shape.children[key]` (same shape for each array item).
 * Omit shape only for nested keys with no child entry (all elements at that level).
 */
export function camelToPascalKeys<T>(
	input: T,
	shape?: WireShape,
): Pascalize<T> {
	if (!input || typeof input !== "object" || isSpecialObject(input)) {
		return input as Pascalize<T>;
	}

	if (Array.isArray(input)) {
		return input.map((item) => camelToPascalKeys(item, shape)) as Pascalize<T>;
	}

	const attrs = shape?.attrs;
	const preserve = shape?.preserveCamel;
	const result: Record<string, unknown> = {};

	for (const [key, value] of Object.entries(input)) {
		const pascalKey = pascalKeyOverrides.get(key) ?? camelToPascal(key);
		const treatAsAttr = Boolean(attrs?.includes(key));
		const finalKey = treatAsAttr
			? formatAttributeField(pascalKey, key, Boolean(preserve?.includes(key)))
			: pascalKey;

		const childShape = shape?.children?.[key];
		result[finalKey] = transformValue(value, (val) =>
			camelToPascalKeys(val, childShape),
		);
	}

	return result as Pascalize<T>;
}

/**
 * PascalCase / @attrs → camelCase. Strips `@` only; no shape needed.
 */
export function pascalToCamelKeys<T>(input: T): Camelize<T> {
	if (input === null || typeof input !== "object" || isSpecialObject(input)) {
		return input as Camelize<T>;
	}

	if (Array.isArray(input)) {
		return input.map((item) => pascalToCamelKeys(item)) as Camelize<T>;
	}

	const result: Record<string, unknown> = {};

	for (const [key, value] of Object.entries(input)) {
		const parsedKey = key.startsWith("@") ? key.slice(1) : key;
		const camelKey =
			camelKeyOverrides.get(parsedKey) ?? pascalToCamel(parsedKey);
		result[camelKey] = transformValue(value, pascalToCamelKeys);
	}

	return result as Camelize<T>;
}

function transformValue(
	value: unknown,
	transformObject: (obj: Record<string, unknown>) => unknown,
): unknown {
	if (!value || typeof value !== "object" || isSpecialObject(value)) {
		return value;
	}

	if (Array.isArray(value)) {
		return value.map((item) => transformValue(item, transformObject));
	}

	return transformObject(value as Record<string, unknown>);
}
