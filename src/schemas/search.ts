import * as v from 'valibot';
import { RqHeaderSchema, RsStatusSchema } from './common.js';
import { MasterRecordDetailApiValidationSchema } from './master-record.js';
import {
  createApiSchema,
  createResponseSchema,
} from '../utils/schema-transform.js';

const LastModificationDateInputSchema = v.object({
  minDate: v.string(),
  maxDate: v.string(),
});

const languageCodeField = v.optional(
  v.pipe(v.string(), v.minLength(2), v.maxLength(2)),
);

/**
 * Search by CODE - requires recordCode
 */
const CodeSearchSchema = v.object({
  searchType: v.literal('CODE'),
  recordCode: v.pipe(v.string(), v.minLength(5), v.maxLength(6)),
  languageCode: languageCodeField,
});

/**
 * Search by NAME - requires name, optionally city
 */
const NameSearchSchema = v.object({
  searchType: v.literal('NAME'),
  name: v.string(),
  city: v.optional(v.string()),
  languageCode: languageCodeField,
});

/**
 * Search by VATCODE - requires vatCode, optionally phoneNumber
 */
const VatCodeSearchSchema = v.object({
  searchType: v.literal('VATCODE'),
  vatCode: v.string(),
  phoneNumber: v.optional(v.string()),
  languageCode: languageCodeField,
});

/**
 * Search by ZONE - requires zipCode and countyCode, optionally city
 */
const ZoneSearchSchema = v.object({
  searchType: v.literal('ZONE'),
  zipCode: v.string(),
  countyCode: v.string(),
  city: v.optional(v.string()),
  languageCode: languageCodeField,
});

/**
 * Search by CATEGORY - requires categoryCode
 */
const CategorySearchSchema = v.object({
  searchType: v.literal('CATEGORY'),
  categoryCode: v.string(),
  languageCode: languageCodeField,
});

/**
 * Search by EMAIL - requires email
 */
const EmailSearchSchema = v.object({
  searchType: v.literal('EMAIL'),
  email: v.string(),
  languageCode: languageCodeField,
});

/**
 * Search by LASTMODDATE - requires lastModificationDate
 */
const LastModDateSearchSchema = v.object({
  searchType: v.literal('LASTMODDATE'),
  lastModificationDate: LastModificationDateInputSchema,
  languageCode: languageCodeField,
});

/**
 * Search by SEARCH FIELD - requires searchFieldValue
 */
const SearchFieldSearchSchema = v.object({
  searchType: v.literal('SEARCH_FIELD'),
  searchFieldValue: v.string(),
  languageCode: languageCodeField,
});

/**
 * Search by EXTERNAL_REF_CODE - requires searchFieldValue
 */
const ExternalRefCodeSearchSchema = v.object({
  searchType: v.literal('EXTERNAL_REF_CODE'),
  searchFieldValue: v.string(),
  languageCode: languageCodeField,
});

/**
 * Search master record input schema (camelCase)
 * Conditional fields based on searchType
 */
export const SearchMasterRecordSchema = v.union([
  CodeSearchSchema,
  NameSearchSchema,
  VatCodeSearchSchema,
  ZoneSearchSchema,
  CategorySearchSchema,
  EmailSearchSchema,
  LastModDateSearchSchema,
  SearchFieldSearchSchema,
  ExternalRefCodeSearchSchema,
]);

const transformRecordCode = (input: Record<string, unknown>) => {
  if (!('@RecordCode' in input)) return input;
  const recordCode = input['@RecordCode'];
  if (!recordCode) return input;
  const { ['@RecordCode']: _discard, ...rest } = input;
  return {
    ...rest,
    RecordCode: recordCode,
  };
};

/**
 * Search master record schema for API requests (transforms to PascalCase)
 */
export const SearchMasterRecordApiSchema = v.pipe(
  createApiSchema(SearchMasterRecordSchema),
  v.transform((input) => transformRecordCode(input)),
);

/**
 * Complete search request schema with header
 * Flattens SearchMasterRecord fields to root level
 */
export const SearchMasterRecordRequestSchema = v.pipe(
  v.object({
    RqHeader: RqHeaderSchema,
    SearchMasterRecord: SearchMasterRecordApiSchema,
  }),
  v.transform((input) => {
    const { SearchMasterRecord: searchFields, RqHeader, ...rest } = input;
    return {
      RqHeader,
      ...searchFields,
      ...rest,
    };
  }),
);

const MasterRecordListApiSchema = v.object({
  MasterRecordDetail: v.optional(
    v.pipe(
      v.union([
        v.array(MasterRecordDetailApiValidationSchema),
        MasterRecordDetailApiValidationSchema,
      ]),
      v.transform((input) => {
        if (!input) return undefined;
        return Array.isArray(input) ? input : [input];
      }),
    ),
  ),
});

/**
 * Search master record response schema (transforms to camelCase)
 */
export const SearchMasterRecordResponseSchema = createResponseSchema(
  v.object({
    RsStatus: RsStatusSchema,
    MasterRecordList: v.optional(MasterRecordListApiSchema),
  }),
);
