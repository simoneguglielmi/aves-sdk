// Main client
export { AvesClient, AvesError } from './client.js';

// Types
export type {
  RqHeader,
  RsStatus,
  FinancialDetail,
  MasterRecordDetail,
  MasterRecordDetailResponse,
  SearchMasterRecord,
  SearchMasterRecordRS,
  ManageMasterRecordRequest,
  ManageMasterRecordRS,
} from './types.js';

// Schemas (for advanced usage)
export { RqHeaderSchema, RsStatusSchema } from './schemas/common.js';

export {
  MasterRecordDetailSchema,
  MasterRecordDetailApiSchema,
  MasterRecordDetailResponseSchema,
  FinancialDetailSchema,
} from './schemas/master-record.js';

export {
  SearchMasterRecordSchema,
  SearchMasterRecordApiSchema,
  SearchMasterRecordRequestSchema,
  SearchMasterRecordResponseSchema,
} from './schemas/search.js';

export {
  ManageMasterRecordRequestSchema,
  ManageMasterRecordResponseSchema,
} from './schemas/upsert.js';
