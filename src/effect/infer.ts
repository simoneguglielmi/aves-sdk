import type { Schema } from "effect";

/** Strip `readonly` so public `Infer*` keeps mutable-array DX. */
type MutableDeep<T> =
	T extends ReadonlyArray<infer U>
		? MutableDeep<U>[]
		: T extends object
			? { -readonly [K in keyof T]: MutableDeep<T[K]> }
			: T;

/** Caller-facing input (Encoded). */
export type InferInput<S extends Schema.Schema.Any> = MutableDeep<
	Schema.Schema.Encoded<S>
>;

/** Decoded / transformed output (Type). */
export type InferOutput<S extends Schema.Schema.Any> = MutableDeep<
	Schema.Schema.Type<S>
>;
