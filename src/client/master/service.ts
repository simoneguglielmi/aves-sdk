import { Effect } from "effect";
import type { PromiseFacade } from "../../effect/run-result.js";
import { toPromiseFacade } from "../../effect/run-result.js";
import type { AvesError } from "../../error.js";
import type {
	MasterSearchInput,
	MasterSearchResult,
	SearchMasterRecordRS,
} from "../../types.js";
import { toFacadeEffect } from "../../utils/facade-transform.js";
import type { AvesTransportService, FacadeOp } from "../transport/types.js";

/** Effect-native master-records domain. */
export type MasterRecordsService = {
	/**
	 * Unlike the other domains this does not reuse `FacadeOp`: the transport
	 * returns a `{ masterRecordList, rsStatus }` envelope and `search` flattens
	 * it to the public array contract before the facade runs.
	 */
	search: (
		params: MasterSearchInput,
	) => Effect.Effect<MasterSearchResult, AvesError>;
	upsert: FacadeOp<"upsert">;
};

export function makeMasterRecordsService(
	transport: AvesTransportService,
): MasterRecordsService {
	const { ops } = transport;
	return {
		search: (params: MasterSearchInput) =>
			toFacadeEffect(
				ops
					.search(params)
					.pipe(
						Effect.map(
							(data) => (data.masterRecordList ?? []) as SearchMasterRecordRS,
						),
					),
			),
		upsert: (record) => toFacadeEffect(ops.upsert(record)),
	};
}

export type MasterRecordsClient = PromiseFacade<MasterRecordsService>;

/** Promise<Result> facade over {@link makeMasterRecordsService}. */
export function makeMasterRecordsClient(
	transport: AvesTransportService,
): MasterRecordsClient {
	return toPromiseFacade(makeMasterRecordsService(transport));
}
