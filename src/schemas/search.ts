import * as v from 'valibot';
import { RqHeaderSchema, RsStatusSchema } from './common.js';
import {
  createApiSchema,
  createResponseSchema,
} from '../utils/schema-transform.js';

const LastModificationDateInputSchema = v.object({
  minDate: v.string(),
  maxDate: v.string(),
});

const SearchTypeSchema = v.union([
  v.literal('CODE'),
  v.literal('NAME'),
  v.literal('VATCODE'),
  v.literal('ZONE'),
  v.literal('CATEGORY'),
  v.literal('EMAIL'),
  v.literal('LASTMODDATE'),
  v.literal('SEARCH FIELD'),
  v.literal('EXTERNAL_REF_CODE'),
]);

/**
 * Search master record input schema (camelCase)
 */
export const SearchMasterRecordSchema = v.object({
  searchType: SearchTypeSchema,
  recordCode: v.optional(v.pipe(v.string(), v.minLength(6), v.maxLength(6))),
  name: v.optional(v.string()),
  vatCode: v.optional(v.string()),
  zipCode: v.optional(v.string()),
  city: v.optional(v.string()),
  countyCode: v.optional(v.string()),
  phoneNumber: v.optional(v.string()),
  categoryCode: v.optional(v.string()),
  email: v.optional(v.string()),
  lastModificationDate: v.optional(LastModificationDateInputSchema),
  searchFieldValue: v.optional(v.string()),
  languageCode: v.optional(v.pipe(v.string(), v.minLength(2), v.maxLength(2))),
});

/**
 * Search master record schema for API requests (transforms to PascalCase)
 */
export const SearchMasterRecordApiSchema = createApiSchema(
  SearchMasterRecordSchema
);

/**
 * Complete search request schema with header
 */
export const SearchMasterRecordRequestSchema = v.object({
  RqHeader: RqHeaderSchema,
  SearchMasterRecord: SearchMasterRecordApiSchema,
});

const MasterRecordDetailApiValidationSchema = v.object({
  '@RecordCode': v.optional(
    v.pipe(
      v.union([v.string(), v.number()]),
      v.transform((val) => String(val)),
      v.minLength(6),
      v.maxLength(6)
    )
  ),
  '@InsertCriteria': v.optional(
    v.union([v.literal('S'), v.literal('N'), v.literal('T'), v.literal('M')])
  ),
  CreatedDate: v.optional(v.string()),
  RecordType: v.optional(
    v.union([v.literal('CUSTOMER'), v.literal('SUPPLIER')])
  ),
  RecordStatus: v.optional(
    v.union(
      [
        v.literal('ENABLED'),
        v.literal('DISABLED'),
        v.literal('WARNING'),
        v.literal('BLACKLISTED'),
      ],
      'ENABLED'
    )
  ),
  Moniker: v.optional(v.string()),
  Name: v.optional(v.string()),
  LanguageCode: v.optional(v.pipe(v.string(), v.minLength(2), v.maxLength(2))),
  Address: v.optional(v.string()),
  ZipCode: v.optional(v.string()),
  CityName: v.optional(v.string()),
  CountyCode: v.optional(v.string()),
  StateCode: v.optional(v.string()),
  CategoryCode: v.optional(v.string()),
  FirstPhoneNumber: v.optional(v.string()),
  MobilePhoneNumber: v.optional(v.string()),
  Email: v.optional(v.string()),
  Gender: v.optional(v.string()),
  BirthDate: v.optional(v.string()),
  FiscalCode: v.optional(v.string()),
  NewsletterDisabled: v.optional(
    v.union([v.literal('true'), v.literal('false'), v.boolean()])
  ),
  FinancialDetail: v.optional(v.any()),
  DynamicFields: v.optional(v.array(v.any())),
});

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
      })
    )
  ),
});

/**
 * Search master record response schema (transforms to camelCase)
 */
export const SearchMasterRecordResponseSchema = createResponseSchema(
  v.object({
    RsStatus: RsStatusSchema,
    MasterRecordList: v.optional(MasterRecordListApiSchema),
  })
);
