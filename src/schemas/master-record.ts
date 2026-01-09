import * as v from 'valibot';
import {
  createApiSchema,
  createResponseSchema,
} from '../utils/schema-transform.js';

const FinancialDetailInputSchema = v.object({
  currencyCode: v.string(),
  creditLimit: v.optional(v.string()),
  c_PaymentType: v.optional(
    v.union([
      v.literal('CASH'),
      v.literal('BANK'),
      v.literal('RID'),
      v.literal('RIBA'),
      v.literal('SPECIFIC_CODE'),
    ])
  ),
  c_SpecPaymentTypeCode: v.optional(v.string()),
  s_PaymentType: v.optional(
    v.union([
      v.literal('CASH'),
      v.literal('BANK'),
      v.literal('RID'),
      v.literal('RIBA'),
      v.literal('SPECIFIC_CODE'),
    ])
  ),
  s_SpecPaymentTypeCode: v.optional(v.string()),
});

/**
 * Financial detail schema for API requests (transforms to PascalCase)
 */
export const FinancialDetailSchema = createApiSchema(
  FinancialDetailInputSchema
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
    v.union([v.literal('S'), v.literal('N'), v.literal('T'), v.literal('M')])
  ),
  createdDate: v.optional(v.string()),
  recordType: v.optional(
    v.union([v.literal('CUSTOMER'), v.literal('SUPPLIER')])
  ),
  recordStatus: v.optional(
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
  moniker: v.optional(v.string()),
  name: v.optional(v.string()),
  languageCode: v.optional(v.pipe(v.string(), v.minLength(2), v.maxLength(2))),
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
  newsletterDisabled: v.optional(
    v.union([v.literal('true'), v.literal('false'), v.boolean()])
  ),
  financialDetail: v.optional(FinancialDetailInputSchema),
  dynamicFields: v.optional(v.array(DynamicFieldsInputSchema)),
});

/**
 * Master record detail schema for API requests (transforms to PascalCase)
 */
export const MasterRecordDetailApiSchema = createApiSchema(
  MasterRecordDetailSchema
);

/**
 * Master record detail response schema (transforms to camelCase)
 */
export const MasterRecordDetailResponseSchema = createResponseSchema(
  MasterRecordDetailApiSchema
);
