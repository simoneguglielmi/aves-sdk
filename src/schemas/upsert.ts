import * as v from 'valibot';
import { RqHeaderSchema, RsStatusSchema } from './common.js';
import { MasterRecordDetailApiValidationSchema } from './master-record.js';
import { createResponseSchema } from '../utils/schema-transform.js';

const CustomerRecordApiSchema = v.object({
  CustomerRecordCode: v.pipe(
    v.union([v.string(), v.number()]),
    v.transform((val) => String(val)),
    v.minLength(6),
    v.maxLength(6),
  ),
});

/**
 * Complete upsert request schema with header and required InsertCriteria
 */
export const ManageMasterRecordRequestSchema = v.object({
  RqHeader: RqHeaderSchema,
  MasterRecordDetail: v.intersect([
    MasterRecordDetailApiValidationSchema,
    v.object({
      '@InsertCriteria': v.union([
        v.literal('S'),
        v.literal('N'),
        v.literal('T'),
        v.literal('M'),
      ]),
    }),
  ]),
});

/**
 * Upsert master record response schema (transforms to camelCase)
 */
export const ManageMasterRecordResponseSchema = createResponseSchema(
  v.object({
    RsStatus: RsStatusSchema,
    CustomerRecordRS: v.optional(CustomerRecordApiSchema),
  }),
);
