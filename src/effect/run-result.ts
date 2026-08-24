import { Cause, Effect, Exit, Option } from "effect";
import {
	type AvesError,
	apiError,
	toAvesError,
	unknownError,
} from "../error.js";
import { err, ok, type Result } from "../utils/result.js";

/**
 * Run an Effect that fails with `AvesError` (or unexpected defects) into the
 * public `Result` ADT — keeps end-user DX free of Effect syntax.
 */
export async function runToResult<A>(
	effect: Effect.Effect<A, AvesError>,
): Promise<Result<A, AvesError>> {
	const exit = await Effect.runPromiseExit(effect);
	if (Exit.isSuccess(exit)) return ok(exit.value);
	return err(causeToAvesError(exit.cause));
}

function causeToAvesError(cause: Cause.Cause<AvesError>): AvesError {
	const failure = Cause.failureOption(cause);
	if (Option.isSome(failure)) return failure.value;

	if (Cause.isInterruptedOnly(cause))
		return apiError("Request timed out", "TIMEOUT");

	const defect = Cause.dieOption(cause);
	if (Option.isSome(defect))
		return toAvesError(defect.value, "Unknown error occurred");

	return unknownError(Cause.pretty(cause));
}

/** Lift a sync `Result` into an Effect that fails with `AvesError`. */
export function fromResult<A>(
	result: Result<A, AvesError>,
): Effect.Effect<A, AvesError> {
	return result.success
		? Effect.succeed(result.data)
		: Effect.fail(result.error);
}

type EffectFn = (...args: never[]) => Effect.Effect<unknown, AvesError>;

/** Map an Effect-returning service to Promise&lt;Result&gt; methods (public DX edge). */
export type PromiseFacade<S extends { readonly [K in keyof S]: EffectFn }> = {
	readonly [K in keyof S]: (
		...args: Parameters<S[K]>
	) => Promise<Result<Effect.Effect.Success<ReturnType<S[K]>>, AvesError>>;
};

export function toPromiseFacade<
	S extends { readonly [K in keyof S]: EffectFn },
>(service: S): PromiseFacade<S> {
	const out = {} as { -readonly [K in keyof S]: PromiseFacade<S>[K] };
	for (const key of Object.keys(service) as (keyof S)[]) {
		const fn = service[key];
		out[key] = ((...args: Parameters<typeof fn>) =>
			runToResult(fn(...args))) as PromiseFacade<S>[typeof key];
	}
	return out;
}
