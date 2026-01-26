// Main client
export { AvesClient, type AvesClientOptions } from './client.js';
export { AvesError } from './error.js';

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
