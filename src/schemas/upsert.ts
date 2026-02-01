import * as v from 'valibot';
import { RqHeaderSchema, RsStatusSchema } from './common.js';
import { MasterRecordDetailApiValidationSchema } from './master-record.js';
import { createResponseSchema } from '../utils/schema-transform.js';

/**
 * Complete upsert request schema with header and required InsertCriteria
 */
export const ManageMasterRecordRequestSchema = v.object({
  RqHeader: RqHeaderSchema,
  MasterRecordDetail: MasterRecordDetailApiValidationSchema,
});
/**
 * Upsert master record response schema (transforms to camelCase)
 */
export const ManageMasterRecordResponseSchema = createResponseSchema(
  v.object({
    RsStatus: RsStatusSchema,
    MasterRecordDetail: v.optional(MasterRecordDetailApiValidationSchema),
  })
);
