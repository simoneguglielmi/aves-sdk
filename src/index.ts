// Main client
export { AvesClient } from './client.js';
export { AvesError } from './error.js';

// Types
export type {
  AvesClientOptions,
  RqHeader,
  RsStatus,
  // Master record types
  FinancialDetail,
  IdDocumentDetail,
  AccountPolicies,
  DynamicFields,
  MasterRecordDetail,
  MasterRecordDetailResponse,
  // Search types
  SearchMasterRecord,
  SearchMasterRecordRS,
  // Upsert types
  ManageMasterRecordRequest,
  ManageMasterRecordRS,
} from './types.js';
