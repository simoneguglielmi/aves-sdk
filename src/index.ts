// Main client
export { AvesClient, AvesError } from './client.js';

// Types
export type {
  RqHeader,
  RsStatus,
  FinancialDetail,
  MasterRecordDetail,
  MasterRecordDetailOutput,
  SearchMasterRecordRQ,
  SearchMasterRecordRS,
  ManageMasterRecordRQ,
  ManageMasterRecordRS,
} from './types.js';

// Schemas (for advanced usage)
export { RqHeaderSchema, RsStatusSchema } from './schemas/common.js';

export {
  MasterRecordDetailSchema,
  FinancialDetailSchema,
} from './schemas/master-record.js';

export {
  SearchMasterRecordRQSchema,
  SearchMasterRecordRSSchema,
} from './schemas/search.js';

export {
  ManageMasterRecordRQSchema,
  ManageMasterRecordRSSchema,
} from './schemas/upsert.js';
