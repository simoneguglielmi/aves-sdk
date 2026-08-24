import { Context } from "effect";
import type { PackageCatalogService } from "./service.js";

/** Effect service tag for package-catalog domain. */
export class AvesPackages extends Context.Tag("aves/Packages")<
	AvesPackages,
	PackageCatalogService
>() {}
