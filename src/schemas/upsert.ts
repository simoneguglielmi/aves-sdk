import * as v from "valibot";
import { createFlattenedResponseSchema } from "../utils/schema-transform.js";
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
 * Upsert response: camelCase, then spread `MasterRecordDetail` onto the root.
 * Callers use `data.recordCode` instead of `data.masterRecordDetail.recordCode`.
 */
export const ManageMasterRecordResponseSchema = createFlattenedResponseSchema(
	v.object({
		RsStatus: RsStatusSchema,
		MasterRecordDetail: v.optional(MasterRecordDetailApiValidationSchema),
	}),
	"masterRecordDetail",
);
