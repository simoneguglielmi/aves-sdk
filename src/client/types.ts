import type { BookingClient } from "./booking.js";
import type { MasterRecordsClient } from "./master-records.js";
import type { PackageCatalogClient } from "./packages.js";
import type { AvesTransport } from "./transport.js";

export type AvesClientDeps = {
	transport?: AvesTransport;
	master?: MasterRecordsClient;
	booking?: BookingClient;
	packages?: PackageCatalogClient;
};

type MethodKeys<T> = {
	[K in keyof T]-?: T[K] extends (...args: never[]) => unknown ? K : never;
}[keyof T];

type PickMethods<T> = Pick<T, MethodKeys<T>>;

/** Flat aliases of domain client methods (compat). Prefer `client.booking.*` etc. */
export type AvesClientFlat = PickMethods<MasterRecordsClient> &
	PickMethods<BookingClient> &
	PickMethods<PackageCatalogClient>;

export type FlatAliasHost = {
	master: MasterRecordsClient;
	booking: BookingClient;
	packages: PackageCatalogClient;
};
