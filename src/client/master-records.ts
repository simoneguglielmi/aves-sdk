import type { AvesError } from "../error.js";
import { MasterRecordDetailApiSchema } from "../schemas/master-record.js";
import {
	SearchMasterRecordApiSchema,
	SearchMasterRecordResponseSchema,
} from "../schemas/search.js";
import { ManageMasterRecordResponseSchema } from "../schemas/upsert.js";
import type {
	ManageMasterRecordRS,
	MasterRecordDetail,
	SearchMasterRecord,
	SearchMasterRecordRS,
} from "../types.js";
import { ok, type Result } from "../utils/result.js";
import { XML_ROOT_ELEMENTS } from "../xml/root.js";
import { AVES_ENDPOINTS } from "./endpoints.js";
import type { AvesTransport } from "./transport.js";

export class MasterRecordsClient {
	constructor(private readonly transport: AvesTransport) {}

	/** Search master records. Success returns a flat array (empty when no matches). */
	async search(
		params: SearchMasterRecord,
	): Promise<Result<SearchMasterRecordRS, AvesError>> {
		const result = await this.transport.invokeOp({
			op: "search",
			params,
			apiSchema: SearchMasterRecordApiSchema,
			endpoint: AVES_ENDPOINTS.search,
			requestRoot: XML_ROOT_ELEMENTS.SEARCH_REQUEST,
			responseRoot: XML_ROOT_ELEMENTS.SEARCH_RESPONSE,
			responseSchema: SearchMasterRecordResponseSchema,
		});
		if (!result.success) return result;
		return ok(result.data.masterRecordList ?? []);
	}

	/** Insert or update a master record. */
	upsertRecord(
		record: MasterRecordDetail,
	): Promise<Result<ManageMasterRecordRS, AvesError>> {
		return this.transport.invokeOp({
			op: "upsertRecord",
			params: record,
			apiSchema: MasterRecordDetailApiSchema,
			bodyKey: "MasterRecordDetail",
			endpoint: AVES_ENDPOINTS.upsert,
			requestRoot: XML_ROOT_ELEMENTS.UPSERT_REQUEST,
			responseRoot: XML_ROOT_ELEMENTS.UPSERT_RESPONSE,
			responseSchema: ManageMasterRecordResponseSchema,
		});
	}
}
