import * as v from 'valibot';
import { RqHeaderSchema, RsStatusSchema } from './common.js';
import { FinancialDetailSchema, DynamicFieldsSchema } from './master-record.js';
import { createResponseSchema } from '../utils/schema-transform.js';

const CustomerRecordApiSchema = v.object({
  CustomerRecordCode: v.pipe(
    v.union([v.string(), v.number()]),
    v.transform((val) => String(val)),
    v.minLength(6),
    v.maxLength(6),
  ),
});

const MasterRecordDetailApiValidationSchema = v.object({
  '@RecordCode': v.optional(v.pipe(v.string(), v.minLength(6), v.maxLength(6))),
  '@InsertCriteria': v.optional(
    v.union([v.literal('S'), v.literal('N'), v.literal('T'), v.literal('M')]),
  ),
  CreatedDate: v.optional(v.string()),
  RecordType: v.optional(
    v.union([v.literal('CUSTOMER'), v.literal('SUPPLIER')]),
  ),
  RecordStatus: v.optional(
    v.union(
      [
        v.literal('ENABLED'),
        v.literal('DISABLED'),
        v.literal('WARNING'),
        v.literal('BLACKLISTED'),
      ],
      'ENABLED',
    ),
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
    v.union([v.literal('true'), v.literal('false'), v.boolean()]),
  ),
  '@AcceptProfilingPolicies': v.optional(v.boolean()),
  '@AcceptPrivacyPolicies': v.optional(v.boolean()),
  '@AcceptNewsletterPolicies': v.optional(v.boolean()),
  FinancialDetail: v.optional(FinancialDetailSchema),
  DynamicFields: v.optional(v.array(DynamicFieldsSchema)),
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
