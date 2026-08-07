import type { HttpClient } from "@effect/platform";
import type { BookingService } from "./booking/types.js";
import type { AvesHttpService } from "./http/types.js";
import type { MasterRecordsService } from "./master/types.js";
import type { PackageCatalogService } from "./packages/types.js";
import type { AvesTransportService } from "./transport/types.js";

/** Optional Layer overrides — Effect services (not Promise facades). */
export type AvesClientDeps = {
	/** Platform HTTP client (e.g. `HttpClient.make` in tests). Default: FetchHttpClient. */
	httpClient?: HttpClient.HttpClient;
	http?: AvesHttpService;
	transport?: AvesTransportService;
	master?: MasterRecordsService;
	booking?: BookingService;
	packages?: PackageCatalogService;
};
