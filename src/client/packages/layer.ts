import { layerFromDep } from "../layer-utils.js";
import { AvesTransport } from "../transport/tag.js";
import { makePackageCatalogService } from "./service.js";
import { AvesPackages } from "./tag.js";

/** Live package-catalog — requires {@link AvesTransport}. */
export const AvesPackagesLive = layerFromDep(
	AvesPackages,
	AvesTransport,
	makePackageCatalogService,
);
