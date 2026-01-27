import * as v from 'valibot';
import {
  createApiSchema,
  createResponseSchema,
} from '../utils/schema-transform.js';

const FinancialDetailInputSchema = v.object({
  currencyCode: v.optional(v.string()),
  creditLimit: v.optional(v.string()),
  c_PaymentType: v.optional(
    v.union([
      v.literal('CASH'),
      v.literal('BANK'),
      v.literal('RID'),
      v.literal('RIBA'),
      v.literal('SPECIFIC_CODE'),
    ]),
  ),
  c_SpecPaymentTypeCode: v.optional(v.string()),
  s_PaymentType: v.optional(
    v.union([
      v.literal('CASH'),
      v.literal('BANK'),
      v.literal('RID'),
      v.literal('RIBA'),
      v.literal('SPECIFIC_CODE'),
    ]),
  ),
  s_SpecPaymentTypeCode: v.optional(v.string()),
});

/**
 * Financial detail schema for API requests (transforms to PascalCase)
 */
export const FinancialDetailSchema = createApiSchema(
  FinancialDetailInputSchema,
);

const DynamicFieldsInputSchema = v.object({
  key: v.string(),
  value: v.string(),
});

/**
 * Dynamic fields schema for API requests (transforms to PascalCase)
 */
export const DynamicFieldsSchema = createApiSchema(DynamicFieldsInputSchema);

/**
 * Master record detail input schema (camelCase)
 */
export const MasterRecordDetailSchema = v.object({
  recordCode: v.optional(v.pipe(v.string(), v.minLength(6), v.maxLength(6))),
  insertCriteria: v.optional(
    v.union([v.literal('S'), v.literal('N'), v.literal('T'), v.literal('M')]),
  ),
  createdDate: v.optional(v.string()),
  recordType: v.optional(
    v.union([v.literal('CUSTOMER'), v.literal('SUPPLIER')], 'CUSTOMER'),
  ),
  recordStatus: v.optional(
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
  moniker: v.optional(v.string()),
  name: v.optional(v.string()),
  extraInfo: v.optional(v.string()),
  languageCode: v.pipe(v.string(), v.minLength(2), v.maxLength(2)),
  address: v.optional(v.string()),
  zipCode: v.optional(v.string()),
  cityName: v.optional(v.string()),
  countyCode: v.optional(v.string()),
  stateCode: v.optional(v.string()),
  categoryCode: v.optional(v.string()),
  firstPhoneNumber: v.optional(v.string()),
  mobilePhoneNumber: v.optional(v.string()),
  email: v.optional(v.string()),
  gender: v.optional(v.string()),
  birthDate: v.optional(v.string()),
  fiscalCode: v.optional(v.string()),
  vatCode: v.optional(v.string()),
  acceptProfilingPolicies: v.optional(v.boolean()),
  acceptPrivacyPolicies: v.optional(v.boolean()),
  acceptNewsletterPolicies: v.optional(v.boolean()),
  financialDetail: v.optional(FinancialDetailInputSchema),
  dynamicFields: v.optional(DynamicFieldsInputSchema),
});

/**
 * Master record detail schema for API requests (transforms to PascalCase)
 */
export const MasterRecordDetailApiSchema = createApiSchema(
  MasterRecordDetailSchema,
);

/**
 * Master record detail response schema (transforms to camelCase)
 */
export const MasterRecordDetailResponseSchema = createResponseSchema(
  MasterRecordDetailApiSchema,
);

export const AccountPoliciesSchema = v.object({
  '@AcceptProfilingPolicies': v.optional(v.boolean()),
  '@AcceptPrivacyPolicies': v.optional(v.boolean()),
  '@AcceptNewsletterPolicies': v.optional(v.boolean()),
});

/**
 * Master record detail API validation schema (PascalCase with @ attributes)
 * Used for both search responses and upsert requests
 * Accepts string or number for @RecordCode and transforms to string
 */
export const MasterRecordDetailApiValidationSchema = v.object({
  '@RecordCode': v.optional(
    v.pipe(
      v.union([v.string(), v.number()]),
      v.transform((val) => String(val)),
      v.minLength(5),
      v.maxLength(6),
    ),
  ),
  '@InsertCriteria': v.optional(
    v.union([v.literal('S'), v.literal('N'), v.literal('T'), v.literal('M')]),
  ),
  CreatedDate: v.optional(v.string()),
  RecordType: v.optional(
    v.union([
      v.literal('CUSTOMER'),
      v.literal('SUPPLIER'),
      v.literal('GENERAL'),
    ]),
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
  LanguageCode: v.optional(
    v.pipe(
      v.union([v.string(), v.number()]),
      v.transform((val) => String(val)),
      v.minLength(1),
      v.maxLength(2),
    ),
  ),
  Address: v.optional(v.string()),
  ZipCode: v.optional(
    v.pipe(
      v.union([v.string(), v.number()]),
      v.transform((val) => String(val)),
    ),
  ),
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
  VatCode: v.optional(v.string()),
  NewsletterDisabled: v.optional(
    v.union([v.literal('true'), v.literal('false'), v.boolean()]),
  ),
  AcceptProfilingPolicies: v.optional(AccountPoliciesSchema),
  FinancialDetail: v.optional(FinancialDetailSchema),
  DynamicFields: v.optional(v.array(DynamicFieldsSchema)),
});
