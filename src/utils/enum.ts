import * as v from "valibot";

/** Build a Valibot picklist from a string object enum. */
export function enumSchema<const T extends Record<string, string>>(
	enumObject: T,
) {
	const values = Object.values(enumObject);
	return v.picklist(values);
}

export type EnumValue<T extends Record<string, string>> = T[keyof T];
