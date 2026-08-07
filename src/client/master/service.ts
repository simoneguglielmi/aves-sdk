import { Effect } from "effect";
import { toPromiseFacade } from "../../effect/run-result.js";
import type { SearchMasterRecordRS } from "../../types.js";
import { toFacadeEffect } from "../../utils/facade-transform.js";
import type { AvesTransportService } from "../transport/types.js";
import type { MasterRecordsClient, MasterRecordsService } from "./types.js";

/** Effect-native master-records domain. */
export function makeMasterRecordsService(
	transport: AvesTransportService,
): MasterRecordsService {
	const { ops } = transport;
	return {
		search: (params) =>
			toFacadeEffect(
				ops.search(params).pipe(
					Effect.map(
						(data) =>
							(data.masterRecordList ?? []) as SearchMasterRecordRS,
					),
				),
			),
		upsert: (record) => toFacadeEffect(ops.upsert(record)),
	};
}

/** Promise<Result> facade over {@link makeMasterRecordsService}. */
export function makeMasterRecordsClient(
	transport: AvesTransportService,
): MasterRecordsClient {
	return toPromiseFacade(makeMasterRecordsService(transport));
}
