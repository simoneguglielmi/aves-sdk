import * as v from "valibot";
import { createResponseSchema } from "../utils/schema-transform.js";
import { RqHeaderSchema, RsStatusSchema } from "./common.js";
import { MasterRecordDetailApiValidationSchema } from "./master-record.js";

/**
 * Complete upsert request schema with header and required InsertCriteria
 */
export const ManageMasterRecordRequestSchema = v.object({
	RqHeader: RqHeaderSchema,
	MasterRecordDetail: MasterRecordDetailApiValidationSchema,
});
/**
 * Upsert master record response schema (transforms to camelCase).
 * Spreads `MasterRecordDetail` into the root so callers use `data.recordCode` etc.
 */
export const ManageMasterRecordResponseSchema = v.pipe(
	createResponseSchema(
		v.object({
			RsStatus: RsStatusSchema,
			MasterRecordDetail: v.optional(MasterRecordDetailApiValidationSchema),
		}),
	),
	v.transform(({ rsStatus, masterRecordDetail }) => ({
		rsStatus,
		...masterRecordDetail,
	})),
);
