import { BookingClient } from "./client/booking.js";
import { attachFlatAliases } from "./client/flat-aliases.js";
import { MasterRecordsClient } from "./client/master-records.js";
import { PackageCatalogClient } from "./client/packages.js";
import { AvesTransport } from "./client/transport.js";
import type { AvesClientDeps, AvesClientFlat } from "./client/types.js";
import type { AvesClientOptions } from "./types.js";

export type { AvesClientDeps, AvesClientFlat } from "./client/types.js";

/**
 * AVES XML REST API client — facade over domain clients (DI-friendly).
 *
 * Canonical: `client.booking.createBooking(...)`, `client.master.search(...)`
 * Flat compat aliases are bound automatically from domain prototypes.
 */
class AvesClientBase {
	readonly transport: AvesTransport;
	readonly master: MasterRecordsClient;
	readonly booking: BookingClient;
	readonly packages: PackageCatalogClient;

	constructor(options: AvesClientOptions, deps: AvesClientDeps = {}) {
		this.transport = deps.transport ?? new AvesTransport(options);
		this.master = deps.master ?? new MasterRecordsClient(this.transport);
		this.booking = deps.booking ?? new BookingClient(this.transport);
		this.packages = deps.packages ?? new PackageCatalogClient(this.transport);
		attachFlatAliases(this);
	}
}

export type AvesClient = AvesClientBase & AvesClientFlat;

export const AvesClient: {
	new (options: AvesClientOptions, deps?: AvesClientDeps): AvesClient;
} = AvesClientBase as {
	new (options: AvesClientOptions, deps?: AvesClientDeps): AvesClient;
};
