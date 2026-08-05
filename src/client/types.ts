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
