import { toPromiseFacade } from "../../effect/run-result.js";
import { AvesSearchType } from "../../schemas/enums.js";
import type { AvesSearchRQ } from "../../types.js";
import { facadeMethod, toFacadeEffect } from "../../utils/facade-transform.js";
import type { AvesTransportService } from "../transport/types.js";
import type { PackageCatalogClient, PackageCatalogService } from "./types.js";

function prepareSearch(
	languageCode: string | undefined,
	params: AvesSearchRQ,
	defaultType: (typeof AvesSearchType)[keyof typeof AvesSearchType],
): AvesSearchRQ {
	const avesSearchType =
		params.avesSearchType ??
		("searchType" in params
			? (
					params as AvesSearchRQ & {
						searchType?: AvesSearchRQ["avesSearchType"];
					}
				).searchType
			: undefined) ??
		defaultType;
	return {
		...(languageCode && { languageCode }),
		...params,
		avesSearchType,
	};
}

/** Effect-native package-catalog domain. */
export function makePackageCatalogService(
	transport: AvesTransportService,
): PackageCatalogService {
	const { ops, languageCode } = transport;
	return {
		search: (params) =>
			toFacadeEffect(
				ops.searchPackages(
					prepareSearch(languageCode, params, AvesSearchType.PACKAGE),
				),
			),
		searchServices: (params) =>
			toFacadeEffect(
				ops.searchServices(
					prepareSearch(languageCode, params, AvesSearchType.SERVICE),
				),
			),
		get: facadeMethod(ops.get),
		commit: facadeMethod(ops.commit),
	};
}

/** Promise<Result> facade over {@link makePackageCatalogService}. */
export function makePackageCatalogClient(
	transport: AvesTransportService,
): PackageCatalogClient {
	return toPromiseFacade(makePackageCatalogService(transport));
}
