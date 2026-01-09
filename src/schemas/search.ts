import * as v from 'valibot';
import { RsStatusSchema } from './common.js';
import { MasterRecordDetailSchema } from './master-record.js';
import {
  camelToPascalKeys,
  pascalToCamelKeys,
} from '../utils/case-transform.js';

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
 * Search master record request schema (camelCase input, transformed to PascalCase)
 */
const SearchMasterRecordRQCamelSchema = v.object({
  searchType: SearchTypeSchema,
  recordCode: v.optional(v.pipe(v.string(), v.minLength(6), v.maxLength(6))), // Customer Aves code registry (string fix to 6)
  name: v.optional(v.string()),
  vatCode: v.optional(v.string()),
  zipCode: v.optional(v.string()),
  city: v.optional(v.string()),
  countyCode: v.optional(v.string()),
  phoneNumber: v.optional(v.string()),
  categoryCode: v.optional(v.string()),
  email: v.optional(v.string()),
  lastModificationDate: v.optional(LastModificationDateSchema),
  searchFieldValue: v.optional(v.string()),
  languageCode: v.optional(v.pipe(v.string(), v.minLength(2), v.maxLength(2))),
});

/**
 * Search master record request schema (PascalCase for API)
 * Transforms camelCase input to PascalCase after validation
 */
export const SearchMasterRecordRQSchema = v.pipe(
  SearchMasterRecordRQCamelSchema,
  v.transform((input) => camelToPascalKeys(input))
);

/**
 * Master record list schema (PascalCase from API)
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
