import type { PromiseFacade } from "../../effect/run-result.js";
import { toPromiseFacade } from "../../effect/run-result.js";
import { AvesSearchType } from "../../schemas/enums.js";
import type { AvesSearchRQ } from "../../types.js";
import { facadeMethod, toFacadeEffect } from "../../utils/facade-transform.js";
import type { AvesTransportService } from "../transport/types.js";

function prepareSearch(
	languageCode: string | undefined,
	params: AvesSearchRQ,
	defaultType: (typeof AvesSearchType)[keyof typeof AvesSearchType],
): AvesSearchRQ {
	return {
		...(languageCode && { languageCode }),
		...params,
		avesSearchType: params.avesSearchType ?? params.searchType ?? defaultType,
	};
}

/** Effect-native package-catalog domain. */
export function makePackageCatalogService(transport: AvesTransportService) {
	const { ops, languageCode } = transport;
	return {
		search: (params: AvesSearchRQ) =>
			toFacadeEffect(
				ops.searchPackages(
					prepareSearch(languageCode, params, AvesSearchType.PACKAGE),
				),
			),
		searchServices: (params: AvesSearchRQ) =>
			toFacadeEffect(
				ops.searchServices(
					prepareSearch(languageCode, params, AvesSearchType.SERVICE),
				),
			),
		get: facadeMethod(ops.get),
		commit: facadeMethod(ops.commit),
	};
}

export type PackageCatalogService = ReturnType<
	typeof makePackageCatalogService
>;
export type PackageCatalogClient = PromiseFacade<PackageCatalogService>;

/** Promise<Result> facade over {@link makePackageCatalogService}. */
export function makePackageCatalogClient(
	transport: AvesTransportService,
): PackageCatalogClient {
	return toPromiseFacade(makePackageCatalogService(transport));
}
