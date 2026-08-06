import type { AvesError } from "../error.js";
import { AvesSearchType } from "../schemas/enums.js";
import type {
	AvesSearchRQ,
	CommitPackageRQ,
	CommitPackageRS,
	PackageDetailRQ,
	PackageDetailRS,
	SearchPackageRS,
	SearchServicesRS,
} from "../types.js";
import {
	type FacadeOutput,
	toFacadeResult,
} from "../utils/facade-transform.js";
import type { Result } from "../utils/result.js";
import { AvesOp } from "./ops.js";
import type { AvesTransport } from "./transport.js";

export class PackageCatalogClient {
	constructor(private readonly transport: AvesTransport) {}

	/** Merge client languageCode + method default avesSearchType (params win). */
	#prepareSearch(
		params: AvesSearchRQ,
		defaultType: (typeof AvesSearchType)[keyof typeof AvesSearchType],
	): AvesSearchRQ {
		return {
			...(this.transport.languageCode && {
				languageCode: this.transport.languageCode,
			}),
			...params,
			avesSearchType: params.avesSearchType ?? params.searchType ?? defaultType,
		};
	}

	/** Search packages / programs. Defaults `avesSearchType` to `PACKAGE`. */
	async search(
		params: AvesSearchRQ,
	): Promise<Result<FacadeOutput<SearchPackageRS>, AvesError>> {
		const result = await this.transport.invokeOp(
			AvesOp.searchPackages,
			this.#prepareSearch(params, AvesSearchType.PACKAGE),
		);
		return toFacadeResult(result);
	}

	/** Search TOP services. Defaults `avesSearchType` to `SERVICE`. */
	async searchServices(
		params: AvesSearchRQ,
	): Promise<Result<FacadeOutput<SearchServicesRS>, AvesError>> {
		const result = await this.transport.invokeOp(
			AvesOp.searchServices,
			this.#prepareSearch(params, AvesSearchType.SERVICE),
		);
		return toFacadeResult(result);
	}

	/** Package / program detail + service list. */
	async get(
		params: PackageDetailRQ,
	): Promise<Result<FacadeOutput<PackageDetailRS>, AvesError>> {
		const result = await this.transport.invokeOp(AvesOp.get, params);
		return toFacadeResult(result);
	}

	/** Publish an existing package. Does not create packages. */
	async commit(
		params: CommitPackageRQ,
	): Promise<Result<FacadeOutput<CommitPackageRS>, AvesError>> {
		const result = await this.transport.invokeOp(AvesOp.commit, params);
		return toFacadeResult(result);
	}
}
