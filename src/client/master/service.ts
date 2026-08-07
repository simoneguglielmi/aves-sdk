import { Effect } from "effect";
import type { PromiseFacade } from "../../effect/run-result.js";
import { toPromiseFacade } from "../../effect/run-result.js";
import type { SearchMasterRecordRS } from "../../types.js";
import { toFacadeEffect } from "../../utils/facade-transform.js";
import type { AvesTransportService } from "../transport/types.js";

/** Effect-native master-records domain. */
export function makeMasterRecordsService(transport: AvesTransportService) {
	const { ops } = transport;
	return {
		search: (params: Parameters<typeof ops.search>[0]) =>
			toFacadeEffect(
				ops
					.search(params)
					.pipe(
						Effect.map(
							(data) => (data.masterRecordList ?? []) as SearchMasterRecordRS,
						),
					),
			),
		upsert: (record: Parameters<typeof ops.upsert>[0]) =>
			toFacadeEffect(ops.upsert(record)),
	};
}

export type MasterRecordsService = ReturnType<typeof makeMasterRecordsService>;
export type MasterRecordsClient = PromiseFacade<MasterRecordsService>;

/** Promise<Result> facade over {@link makeMasterRecordsService}. */
export function makeMasterRecordsClient(
	transport: AvesTransportService,
): MasterRecordsClient {
	return toPromiseFacade(makeMasterRecordsService(transport));
}
