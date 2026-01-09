import * as v from 'valibot';
import { RqHeaderSchema, RsStatusSchema } from './common.js';
import { FinancialDetailSchema } from './master-record.js';
import { pascalToCamelKeys } from '../utils/case-transform.js';

/**
 * Customer record response schema (PascalCase from API)
 */
const CustomerRecordRSSchema = v.object({
  CustomerRecordCode: v.pipe(v.string(), v.minLength(6), v.maxLength(6)), // Customer Aves code registry (string fix to 6)
});

/**
 * Manage master record request schema (for InsertOrUpdate)
 * Uses PascalCase MasterRecordDetail for API
 */
export const ManageMasterRecordRQSchema = v.object({
  RqHeader: RqHeaderSchema,
  MasterRecordDetail: v.object({
    '@InsertCriteria': v.union([
      v.literal('S'),
      v.literal('N'),
      v.literal('T'),
      v.literal('M'),
    ]),
    CreatedDate: v.optional(v.string()),
    ModifiedDate: v.optional(v.string()),
    RecordType: v.optional(v.string()),
    LoginType: v.optional(v.string()),
    Moniker: v.optional(v.string()),
    Name: v.optional(v.string()),
    LanguageCode: v.optional(
      v.pipe(v.string(), v.minLength(2), v.maxLength(2))
    ),
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
    RecordStatus: v.optional(v.string()),
    FinancialDetail: v.optional(FinancialDetailSchema),
  }),
});

/**
 * Manage master record response schema (PascalCase from API, transformed to camelCase)
 * Parses PascalCase from API, validates, then transforms to camelCase
 */
export const ManageMasterRecordRSSchema = v.pipe(
  v.object({
    RsStatus: RsStatusSchema,
    CustomerRecordRS: v.optional(CustomerRecordRSSchema),
  }),
  v.transform((input) => pascalToCamelKeys(input))
);
