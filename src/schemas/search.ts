import * as v from 'valibot';
import { RsStatusSchema } from './common.js';
import { MasterRecordDetailSchema } from './master-record.js';
import { pascalToCamelKeys } from '../utils/case-transform.js';

/**
 * Last modification date schema
 */
const LastModificationDateSchema = v.object({
  '@MinDate': v.string(),
  '@MaxDate': v.string(),
});

/**
 * Search type enum
 */
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
 * Search master record request schema
 */
const SearchMasterRecordSchema = v.object({
  SearchType: SearchTypeSchema,
  RecordCode: v.optional(v.pipe(v.string(), v.minLength(6), v.maxLength(6))), // Customer Aves code registry (string fix to 6)
  Name: v.optional(v.string()),
  VatCode: v.optional(v.string()),
  ZipCode: v.optional(v.string()),
  City: v.optional(v.string()),
  CountyCode: v.optional(v.string()),
  PhoneNumber: v.optional(v.string()),
  CategoryCode: v.optional(v.string()),
  Email: v.optional(v.string()),
  LastModificationDate: v.optional(LastModificationDateSchema),
  SearchFieldValue: v.optional(v.string()),
  LanguageCode: v.optional(v.pipe(v.string(), v.minLength(2), v.maxLength(2))),
});

/**
 * Search master record request schema (camelCase for API)
 */
export const SearchMasterRecordRQSchema = v.pipe(
  SearchMasterRecordSchema,
  v.transform((input) => pascalToCamelKeys(input))
);

/**
 * Master record list schema (camelCase from API)
 */
const MasterRecordListSchema = v.object({
  MasterRecordDetail: v.optional(v.array(MasterRecordDetailSchema)),
});

/**
 * Search master record response schema (PascalCase from API, transformed to camelCase)
 * Parses PascalCase from API, validates, then transforms to camelCase
 */
export const SearchMasterRecordRSSchema = v.pipe(
  v.object({
    RsStatus: RsStatusSchema,
    MasterRecordList: v.optional(MasterRecordListSchema),
  }),
  v.transform((input) => pascalToCamelKeys(input))
);
