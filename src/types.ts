import type { InferInput, InferOutput } from 'valibot';
import { RqHeaderSchema, RsStatusSchema } from './schemas/common.js';
import type { Camelize } from './utils/case-transform.js';
import {
  MasterRecordDetailSchema,
  MasterRecordDetailResponseSchema,
  FinancialDetailSchema,
} from './schemas/master-record.js';
import {
  SearchMasterRecordSchema,
  SearchMasterRecordResponseSchema,
} from './schemas/search.js';
import {
  ManageMasterRecordRequestSchema,
  ManageMasterRecordResponseSchema,
} from './schemas/upsert.js';

/**
 * Common types
 */
export type RqHeader = InferInput<typeof RqHeaderSchema>;
export type RsStatus = Camelize<InferOutput<typeof RsStatusSchema>>;

/**
 * Master record types
 */
export type FinancialDetail = InferInput<typeof FinancialDetailSchema>;
export type MasterRecordDetail = InferInput<typeof MasterRecordDetailSchema>;
export type MasterRecordDetailResponse = InferOutput<
  typeof MasterRecordDetailResponseSchema
>;

/**
 * Search types
 */
export type SearchMasterRecord = InferInput<typeof SearchMasterRecordSchema>;
export type SearchMasterRecordRS = InferOutput<
  typeof SearchMasterRecordResponseSchema
>;

/**
 * Upsert types
 */
export type ManageMasterRecordRequest = InferInput<
  typeof ManageMasterRecordRequestSchema
>;
export type ManageMasterRecordRS = InferOutput<
  typeof ManageMasterRecordResponseSchema
>;

export interface AvesClientOptions {
  baseURL: string;
  hostID: string;
  xtoken: string;
  languageCode?: string;
  timeoutMs?: number;
}
