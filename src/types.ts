import type { InferInput, InferOutput } from 'valibot';
import { RqHeaderSchema, RsStatusSchema } from './schemas/common.js';
import {
  MasterRecordDetailSchema,
  FinancialDetailSchema,
} from './schemas/master-record.js';
import {
  SearchMasterRecordRQSchema,
  SearchMasterRecordRSSchema,
} from './schemas/search.js';
import {
  ManageMasterRecordRQSchema,
  ManageMasterRecordRSSchema,
} from './schemas/upsert.js';

/**
 * Common types
 */
export type RqHeader = InferInput<typeof RqHeaderSchema>;
export type RsStatus = InferOutput<typeof RsStatusSchema>;

/**
 * Master record types
 */
export type FinancialDetail = InferInput<typeof FinancialDetailSchema>;
export type MasterRecordDetail = InferInput<typeof MasterRecordDetailSchema>;
export type MasterRecordDetailOutput = InferOutput<
  typeof MasterRecordDetailSchema
>;

/**
 * Search types
 */
export type SearchMasterRecordRQ = InferInput<
  typeof SearchMasterRecordRQSchema
>;
export type SearchMasterRecordRS = InferOutput<
  typeof SearchMasterRecordRSSchema
>;

/**
 * Upsert types
 */
export type ManageMasterRecordRQ = InferInput<
  typeof ManageMasterRecordRQSchema
>;
export type ManageMasterRecordRS = InferOutput<
  typeof ManageMasterRecordRSSchema
>;
