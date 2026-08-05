import { BookingClient } from "./client/booking.js";
import { MasterRecordsClient } from "./client/master-records.js";
import { PackageCatalogClient } from "./client/packages.js";
import { AvesTransport } from "./client/transport.js";
import type { AvesClientDeps } from "./client/types.js";
import type { AvesClientOptions } from "./types.js";

export type { AvesClientDeps } from "./client/types.js";

/** AVES XML REST API client — facade over domain clients (DI-friendly). */
export class AvesClient {
	readonly transport: AvesTransport;
	readonly master: MasterRecordsClient;
	readonly booking: BookingClient;
	readonly packages: PackageCatalogClient;

	constructor(options: AvesClientOptions, deps: AvesClientDeps = {}) {
		this.transport = deps.transport ?? new AvesTransport(options);
		this.master = deps.master ?? new MasterRecordsClient(this.transport);
		this.booking = deps.booking ?? new BookingClient(this.transport);
		this.packages = deps.packages ?? new PackageCatalogClient(this.transport);
	}
}
