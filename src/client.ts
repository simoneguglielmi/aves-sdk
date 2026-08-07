import { Effect } from "effect";
import { AvesBooking, type BookingClient } from "./client/booking/index.js";
import { avesClientLayer } from "./client/layer.js";
import {
	AvesMaster,
	type MasterRecordsClient,
} from "./client/master/index.js";
import { AvesPackages, type PackageCatalogClient } from "./client/packages/index.js";
import {
	AvesTransport,
	type AvesTransportService,
} from "./client/transport/index.js";
import type { AvesClientDeps } from "./client/types.js";
import { toPromiseFacade } from "./effect/run-result.js";
import type { AvesClientOptions } from "./types.js";

export { AvesConfig, AvesConfigLive } from "./client/config/index.js";
export {
	type AvesAppServices,
	AvesClientLive,
	type AvesClientServices,
	avesClientLayer,
} from "./client/layer.js";
export type { AvesClientDeps } from "./client/types.js";

export type AvesClientApi = {
	readonly transport: AvesTransportService;
	readonly master: MasterRecordsClient;
	readonly booking: BookingClient;
	readonly packages: PackageCatalogClient;
};

/** Compose client from Effect Layers; Promise<Result> only at this edge. */
export function createAvesClient(
	options: AvesClientOptions,
	deps: AvesClientDeps = {},
): AvesClientApi {
	const services = Effect.runSync(
		Effect.gen(function* () {
			return {
				transport: yield* AvesTransport,
				master: yield* AvesMaster,
				booking: yield* AvesBooking,
				packages: yield* AvesPackages,
			};
		}).pipe(Effect.provide(avesClientLayer(options, deps))),
	);

	return {
		transport: services.transport,
		master: toPromiseFacade(services.master),
		booking: toPromiseFacade(services.booking),
		packages: toPromiseFacade(services.packages),
	};
}

/**
 * AVES XML REST API client — Promise<Result> facade over Effect Layers.
 * Prefer {@link createAvesClient} for a plain object; this class mirrors the same API.
 */
export class AvesClient implements AvesClientApi {
	readonly transport: AvesTransportService;
	readonly master: MasterRecordsClient;
	readonly booking: BookingClient;
	readonly packages: PackageCatalogClient;

	constructor(options: AvesClientOptions, deps: AvesClientDeps = {}) {
		const client = createAvesClient(options, deps);
		this.transport = client.transport;
		this.master = client.master;
		this.booking = client.booking;
		this.packages = client.packages;
	}
}
