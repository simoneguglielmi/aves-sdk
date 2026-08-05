import type { AvesError } from "../error.js";
import { AvesSearchType } from "../schemas/enums.js";
import {
	AvesSearchApiSchema,
	CommitPackageApiSchema,
	CommitPackageResponseSchema,
	PackageDetailRequestApiSchema,
	PackageDetailResponseSchema,
	SearchPackageResponseSchema,
	SearchServicesResponseSchema,
} from "../schemas/package-catalog.js";
import type {
	AvesSearchRQ,
	CommitPackageRQ,
	CommitPackageRS,
	PackageDetailRQ,
	PackageDetailRS,
	SearchPackageRS,
	SearchServicesRS,
} from "../types.js";
import type { Result } from "../utils/result.js";
import { XML_ROOT_ELEMENTS } from "../xml/root.js";
import { AVES_ENDPOINTS } from "./endpoints.js";
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
			avesSearchType: defaultType,
			...params,
		};
	}

	/** Search packages / programs. Defaults `avesSearchType` to `PACKAGE`. */
	searchPackages(
		params: AvesSearchRQ,
	): Promise<Result<SearchPackageRS, AvesError>> {
		return this.transport.invokeOp({
			op: "searchPackages",
			params: this.#prepareSearch(params, AvesSearchType.PACKAGE),
			apiSchema: AvesSearchApiSchema,
			endpoint: AVES_ENDPOINTS.searchAvesPackages,
			requestRoot: XML_ROOT_ELEMENTS.AVES_SEARCH_REQUEST,
			responseRoot: XML_ROOT_ELEMENTS.SEARCH_PACKAGE_RESPONSE,
			responseSchema: SearchPackageResponseSchema,
		});
	}

	/** Search TOP services. Defaults `avesSearchType` to `SERVICE`. */
	searchTopServices(
		params: AvesSearchRQ,
	): Promise<Result<SearchServicesRS, AvesError>> {
		return this.transport.invokeOp({
			op: "searchTopServices",
			params: this.#prepareSearch(params, AvesSearchType.SERVICE),
			apiSchema: AvesSearchApiSchema,
			endpoint: AVES_ENDPOINTS.searchTopServices,
			requestRoot: XML_ROOT_ELEMENTS.AVES_SEARCH_REQUEST,
			responseRoot: XML_ROOT_ELEMENTS.SEARCH_SERVICES_RESPONSE,
			responseSchema: SearchServicesResponseSchema,
		});
	}

	/** Package / program detail + service list. */
	getPackageDetail(
		params: PackageDetailRQ,
	): Promise<Result<PackageDetailRS, AvesError>> {
		return this.transport.invokeOp({
			op: "getPackageDetail",
			params,
			apiSchema: PackageDetailRequestApiSchema,
			endpoint: AVES_ENDPOINTS.getPackageDetail,
			requestRoot: XML_ROOT_ELEMENTS.PACKAGE_DETAIL_REQUEST,
			responseRoot: XML_ROOT_ELEMENTS.PACKAGE_DETAIL_RESPONSE,
			responseSchema: PackageDetailResponseSchema,
		});
	}

	/** Publish an existing package. Does not create packages. */
	commitPackage(
		params: CommitPackageRQ,
	): Promise<Result<CommitPackageRS, AvesError>> {
		return this.transport.invokeOp({
			op: "commitPackage",
			params,
			apiSchema: CommitPackageApiSchema,
			endpoint: AVES_ENDPOINTS.commitPackage,
			requestRoot: XML_ROOT_ELEMENTS.COMMIT_PACKAGE_REQUEST,
			responseRoot: XML_ROOT_ELEMENTS.COMMIT_PACKAGE_RESPONSE,
			responseSchema: CommitPackageResponseSchema,
		});
	}
}
