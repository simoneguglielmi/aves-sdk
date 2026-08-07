import { Schema } from "effect";
import { createFlattenedResponseSchema } from "../utils/schema-transform.js";
import { RqHeaderSchema, RsStatusSchema } from "./common.js";
import { MasterRecordDetailApiValidationSchema } from "./master-record.js";

/**
 * Complete upsert request schema with header and required InsertCriteria
 */
export const ManageMasterRecordRequestSchema = Schema.Struct({
	RqHeader: RqHeaderSchema,
	MasterRecordDetail: MasterRecordDetailApiValidationSchema,
});

/**
 * Upsert response: camelCase, then spread `MasterRecordDetail` onto the root.
 * Callers use `data.recordCode` instead of `data.masterRecordDetail.recordCode`.
 */
export const ManageMasterRecordResponseSchema = createFlattenedResponseSchema(
	Schema.Struct({
		RsStatus: RsStatusSchema,
		MasterRecordDetail: Schema.optional(MasterRecordDetailApiValidationSchema),
	}),
	"masterRecordDetail",
);
