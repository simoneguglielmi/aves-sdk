import type { HttpClient } from "effect/http";
import type { BookingService } from "./booking/service.js";
import type { AvesHttpService } from "./http/types.js";
import type { MasterRecordsService } from "./master/service.js";
import type { PackageCatalogService } from "./packages/service.js";
import type { AvesTransportService } from "./transport/types.js";

/** Optional Layer overrides — Effect services (not Promise facades). */
export type AvesClientDeps = {
	/** `effect/http` client (e.g. `HttpClient.make` in tests). Default: FetchHttpClient. */
	httpClient?: HttpClient.HttpClient;
	http?: AvesHttpService;
	transport?: AvesTransportService;
	master?: MasterRecordsService;
	booking?: BookingService;
	packages?: PackageCatalogService;
};
