import type { Context } from 'effect';
import { Effect, Layer } from 'effect';

/** Prefer override when set; otherwise the live layer. */
export function layerOrSucceed<I, S, E = never, R = never>(
  tag: Context.Tag<I, S>,
  live: Layer.Layer<I, E, R>,
  override?: S,
): Layer.Layer<I, E, R> | Layer.Layer<I> {
  return override ? Layer.succeed(tag, override) : live;
}

/**
 * `Layer.effect(tag, Effect.map(dep, make))` — one-dependency Live layers.
 * Domains: Tag ← Transport; Http: Tag ← Config.
 */
export function layerFromDep<I, S, DI, D>(
  tag: Context.Tag<I, S>,
  dep: Context.Tag<DI, D>,
  make: (service: D) => S,
): Layer.Layer<I, never, DI> {
  return Layer.effect(tag, Effect.map(dep, make));
}

/** `Layer.effect(tag, makeEffect)` when construction needs multiple deps. */
export function layerFromEffect<I, S, E, R>(
  tag: Context.Tag<I, S>,
  make: Effect.Effect<S, E, R>,
): Layer.Layer<I, E, R> {
  return Layer.effect(tag, make);
}
