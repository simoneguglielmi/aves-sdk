import type { Effect } from "effect";
import type { PromiseFacade } from "../../effect/run-result.js";
import type { AvesError } from "../../error.js";
import type {
	ManageMasterRecordRS,
	MasterRecordDetail,
	SearchMasterRecord,
	SearchMasterRecordRS,
} from "../../types.js";
import type { FacadeOutput } from "../../utils/facade-transform.js";

/** Effect-native master-records domain. */
export type MasterRecordsService = {
	readonly search: (
		params: SearchMasterRecord,
	) => Effect.Effect<FacadeOutput<SearchMasterRecordRS>, AvesError>;
	readonly upsert: (
		record: MasterRecordDetail,
	) => Effect.Effect<FacadeOutput<ManageMasterRecordRS>, AvesError>;
};

/** Public Promise<Result> master-records API. */
export type MasterRecordsClient = PromiseFacade<MasterRecordsService>;
