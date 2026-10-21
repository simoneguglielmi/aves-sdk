import type { Context } from "effect";
import { Effect, Layer } from "effect";

/** Prefer override when set; otherwise the live layer. */
export function layerOrSucceed<I, S, E = never, R = never>(
	tag: Context.Key<I, S>,
	live: Layer.Layer<I, E, R>,
	override?: S,
): Layer.Layer<I, E, R> | Layer.Layer<I> {
	return override ? Layer.succeed(tag, override) : live;
}

/**
 * `Layer.effect(tag, Effect.map(dep, make))` — one-dependency Live layers.
 * Domains: Service ← Transport; Http: Service ← Config.
 */
export function layerFromDep<I, S, DI, D>(
	tag: Context.Key<I, S>,
	dep: Context.Key<DI, D>,
	make: (service: D) => S,
): Layer.Layer<I, never, DI> {
	return Layer.effect(tag, Effect.map(dep, make));
}
