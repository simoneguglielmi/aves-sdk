import { Schema } from 'effect';

export type EnumValue<T extends Record<string, string>> = T[keyof T];

/**
 * Build an Effect Literal union from a string object enum.
 * The cast is required: inside a generic, `Object.values` resolves against the
 * constraint (`Record<string, string>`) and yields `string[]`, which collapses
 * the literal union to `string`.
 */
export function enumSchema<const T extends Record<string, string>>(
  enumObject: T,
) {
  const values = Object.values(enumObject) as [EnumValue<T>, ...EnumValue<T>[]];
  return Schema.Literal(...values);
}
