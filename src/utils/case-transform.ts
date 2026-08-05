import type { WireShape } from "./wire-shapes.js";

/**
 * camelCase key → wire spelling that a plain Capitalize can't produce.
 * Single source of truth for both directions (Pascalize/Camelize types, wireKey/pascalToCamel
 * runtime) — the camel-side lookup is derived from this table, never hand-mirrored.
 *
 * `text → #text` is the XML text-content convention (fast-xml-parser).
 */
const KEY_OVERRIDES = {
	rph: "RPH",
	toServiceType: "TOServiceType",
	text: "#text",
} as const;

/** Inverts a camel→pascal table into pascal→camel. Derived, never hand-maintained. */
type InvertOverrides<T extends Record<string, string>> = {
	[K in keyof T as T[K]]: K;
};

type CamelOverrides = InvertOverrides<typeof KEY_OVERRIDES>;

const CAMEL_OVERRIDES: Record<string, string | undefined> = Object.fromEntries(
	Object.entries(KEY_OVERRIDES).map(([camel, pascal]) => [pascal, camel]),
);

/** Keys that are preserved as-is (no recursive transform) at runtime */
type Primitive = string | number | boolean | symbol | bigint | null | undefined;
type SpecialObject =
	| Date
	| RegExp
	| Map<unknown, unknown>
	| Set<unknown>
	| Error;

type PascalizeKey<K extends string> = K extends keyof typeof KEY_OVERRIDES
	? (typeof KEY_OVERRIDES)[K]
	: Capitalize<K>;

type CamelizeKeyBase<K extends string> = K extends keyof CamelOverrides
	? CamelOverrides[K]
	: Uncapitalize<K>;

/** Maps key K: strips leading @ and converts to camelCase for mapped output key */
type CamelizeKey<K extends string> = K extends `@${infer Rest}`
	? CamelizeKeyBase<Rest>
	: CamelizeKeyBase<K>;

type ShapeRename<S> = S extends { readonly rename?: infer R }
	? R extends Readonly<Partial<Record<string, string>>>
		? R
		: undefined
	: undefined;

type ShapeTextContent<S> = S extends { readonly textContent?: infer T }
	? T extends string
		? T
		: undefined
	: undefined;

type ShapeChildren<S> = S extends { readonly children?: infer C }
	? C
	: undefined;

type ChildShapeOf<S, K extends PropertyKey> =
	ShapeChildren<S> extends infer C
		? C extends object
			? K extends keyof C
				? C[K]
				: undefined
			: undefined
		: undefined;

/** Wire pascal tag for key K under shape S (rename → textContent → KEY_OVERRIDES → Capitalize). */
type WirePascalKey<K extends string, S> =
	ShapeTextContent<S> extends K
		? "#text"
		: ShapeRename<S> extends Readonly<Partial<Record<string, string>>>
			? K extends keyof ShapeRename<S>
				? Extract<ShapeRename<S>[K], string>
				: PascalizeKey<K>
			: PascalizeKey<K>;

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
 * Recursively maps camelCase keys to wire PascalCase / `#text` / rename tags.
 * `S` is the const WireShape at this level so rename/textContent cannot drift from runtime.
 */
export type Pascalize<T, S = undefined> = T extends Primitive
	? T
	: T extends SpecialObject
		? T
		: T extends readonly (infer U)[]
			? Pascalize<U, S>[]
			: T extends object
				? {
						[K in keyof T as WirePascalKey<K & string, S>]: Pascalize<
							T[K],
							ChildShapeOf<S, K>
						>;
					}
				: T;

function isSpecialObject(obj: unknown): boolean {
	return (
		obj instanceof Date ||
		obj instanceof RegExp ||
		obj instanceof Map ||
		obj instanceof Set ||
		obj instanceof Error
	);
}

/**
 * `key as keyof typeof KEY_OVERRIDES` narrows a general `string` to the table's finite key
 * set so the lookup type-checks; the runtime lookup still yields `undefined` for any key
 * outside the table, which the `??` fallback below relies on.
 */
function camelToPascal(key: string): string {
	return (
		KEY_OVERRIDES[key as keyof typeof KEY_OVERRIDES] ??
		key.charAt(0).toUpperCase() + key.slice(1)
	);
}

function pascalToCamel(key: string): string {
	return CAMEL_OVERRIDES[key] ?? key.charAt(0).toLowerCase() + key.slice(1);
}

/**
 * camelCase key → wire key: `"@RPH"` | `"RPH"` | `"@rph"` | `"#text"`.
 * Resolution order: `textContent` → `shape.rename` → global `KEY_OVERRIDES` → `Capitalize`;
 * then `@`-prefix when listed in `shape.attrs` (skipped for `#text`).
 */
export function wireKey(camelKey: string, shape?: WireShape): string {
	const baseKey =
		shape?.textContent === camelKey
			? "#text"
			: (shape?.rename?.[camelKey] ?? camelToPascal(camelKey));
	if (baseKey === "#text" || !shape?.attrs?.includes(camelKey)) return baseKey;
	return shape.preserveCamel?.includes(camelKey)
		? `@${camelKey}`
		: `@${baseKey}`;
}

/** Strip listWrap metadata so item encode/walk uses attrs/children only. */
export function itemShape(shape: WireShape): WireShape {
	const { listWrap: _, detailKey: __, ...rest } = shape;
	return rest;
}

/**
 * After list-wrap, a list field's value is `{ detailKey: items }` / `[{ detailKey }]`.
 * Synthesize the wrapper child shape from the item shape that carries `listWrap`.
 */
export function encodeShapeFor(
	listKey: string,
	shape: WireShape | undefined,
): WireShape | undefined {
	if (!shape?.listWrap) return shape;
	const detailKey =
		shape.detailKey ??
		(listKey.endsWith("List")
			? `${listKey.slice(0, -4)}Detail`
			: `${listKey}Detail`);
	return { children: { [detailKey]: itemShape(shape) } };
}

/**
 * camelCase → PascalCase. `@` attrs only for fields listed on the current {@link WireShape}.
 * Child objects/arrays use `shape.children[key]` (same shape for each array item).
 * List fields with `listWrap` synthesize a Detail wrapper shape for the post-wrap value.
 *
 * Return type is `Pascalize<T>` (shape erased) so call-site spreads stay usable; rename /
 * textContent still apply at runtime via `wireKey`, and `Pascalize<T, S>` remains for
 * explicit type-level checks against a const shape.
 */
export function camelToPascalKeys<T>(
	input: T,
	shape?: WireShape,
): Pascalize<T> {
	if (input === null || typeof input === "undefined")
		return input as Pascalize<T>;
	if (typeof input !== "object" || isSpecialObject(input))
		return input as Pascalize<T>;

	if (Array.isArray(input)) {
		return input.map((item) => camelToPascalKeys(item, shape)) as Pascalize<T>;
	}

	const result: Record<string, unknown> = {};

	for (const [key, value] of Object.entries(input)) {
		const child = shape?.children?.[key];
		result[wireKey(key, shape)] = camelToPascalKeys(
			value,
			encodeShapeFor(key, child),
		);
	}

	return result as Pascalize<T>;
}

/**
 * PascalCase / @attrs → camelCase. Strips `@` only; no shape needed.
 * `#text` reverses via KEY_OVERRIDES to `text`.
 */
export function pascalToCamelKeys<T>(input: T): Camelize<T> {
	if (input === null || typeof input === "undefined")
		return input as Camelize<T>;
	if (typeof input !== "object" || isSpecialObject(input))
		return input as Camelize<T>;

	if (Array.isArray(input)) {
		return input.map((item) => pascalToCamelKeys(item)) as Camelize<T>;
	}

	const result: Record<string, unknown> = {};

	for (const [key, value] of Object.entries(input)) {
		const parsedKey = key.startsWith("@") ? key.slice(1) : key;
		result[pascalToCamel(parsedKey)] = pascalToCamelKeys(value);
	}

	return result as Camelize<T>;
}
