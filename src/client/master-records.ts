import type { AvesError } from "../error.js";
import type {
	ManageMasterRecordRS,
	MasterRecordDetail,
	SearchMasterRecord,
	SearchMasterRecordRS,
} from "../types.js";
import {
	type FacadeOutput,
	toFacadeResult,
	withPublicAliases,
} from "../utils/facade-transform.js";
import { ok, type Result } from "../utils/result.js";
import type { AvesTransport } from "./transport.js";

export class MasterRecordsClient {
	constructor(private readonly transport: AvesTransport) {}

	/** Search master records. Success returns a flat array (empty when no matches). */
	async search(
		params: SearchMasterRecord,
	): Promise<Result<FacadeOutput<SearchMasterRecordRS>, AvesError>> {
		const result = await this.transport.invokeOp("search", params);
		if (!result.success) return result;
		const list: SearchMasterRecordRS = result.data.masterRecordList ?? [];
		return ok(withPublicAliases(list));
	}

	/** Insert or update a master record. */
	async upsertRecord(
		record: MasterRecordDetail,
	): Promise<Result<FacadeOutput<ManageMasterRecordRS>, AvesError>> {
		const result = await this.transport.invokeOp("upsertRecord", record);
		return toFacadeResult(result);
	}
}
