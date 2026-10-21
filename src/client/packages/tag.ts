import { Context } from "effect";
import type { PackageCatalogService } from "./service.js";

/** Effect service for package-catalog domain. */
export class AvesPackages extends Context.Service<
	AvesPackages,
	PackageCatalogService
>()("aves/Packages") {}
