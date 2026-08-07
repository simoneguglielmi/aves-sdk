import type { Effect } from "effect";
import type { PromiseFacade } from "../../effect/run-result.js";
import type { AvesError } from "../../error.js";
import type {
	AvesSearchRQ,
	CommitPackageRQ,
	CommitPackageRS,
	PackageDetailRQ,
	PackageDetailRS,
	SearchPackageRS,
	SearchServicesRS,
} from "../../types.js";
import type { FacadeOutput } from "../../utils/facade-transform.js";

/** Effect-native package-catalog domain. */
export type PackageCatalogService = {
	readonly search: (
		params: AvesSearchRQ,
	) => Effect.Effect<FacadeOutput<SearchPackageRS>, AvesError>;
	readonly searchServices: (
		params: AvesSearchRQ,
	) => Effect.Effect<FacadeOutput<SearchServicesRS>, AvesError>;
	readonly get: (
		params: PackageDetailRQ,
	) => Effect.Effect<FacadeOutput<PackageDetailRS>, AvesError>;
	readonly commit: (
		params: CommitPackageRQ,
	) => Effect.Effect<FacadeOutput<CommitPackageRS>, AvesError>;
};

/** Public Promise<Result> package-catalog API. */
export type PackageCatalogClient = PromiseFacade<PackageCatalogService>;
