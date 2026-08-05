import * as v from "valibot";

export type EnumValue<T extends Record<string, string>> = T[keyof T];

/**
 * Build a Valibot picklist from a string object enum.
 * The cast is required: inside a generic, `Object.values` resolves against the
 * constraint (`Record<string, string>`) and yields `string[]`, which collapses
 * the picklist's in/out types to `string`.
 */
export function enumSchema<const T extends Record<string, string>>(
	enumObject: T,
) {
	return v.picklist(Object.values(enumObject) as EnumValue<T>[]);
}
