import * as v from 'valibot';
import { pascalToCamelKeys } from '../utils/case-transform.js';

/**
 * Financial detail schema
 */
export const FinancialDetailSchema = v.object({
  '@CurrencyCode': v.string(),
  '@CreditLimit': v.optional(v.string()),
  '@C_PaymentType': v.optional(
    v.union([
      v.literal('CASH'),
      v.literal('BANK'),
      v.literal('RID'),
      v.literal('RIBA'),
      v.literal('SPECIFIC_CODE'),
    ])
  ),
  '@C_SpecPaymentTypeCode': v.optional(v.string()),
  '@S_PaymentType': v.optional(
    v.union([
      v.literal('CASH'),
      v.literal('BANK'),
      v.literal('RID'),
      v.literal('RIBA'),
      v.literal('SPECIFIC_CODE'),
    ])
  ),
  '@S_SpecPaymentTypeCode': v.optional(v.string()),
});

/**
 * Master record detail schema (PascalCase output from API)
 * Used for responses
 */
export const MasterRecordDetailSchema = v.object({
  '@RecordCode': v.optional(v.pipe(v.string(), v.minLength(6), v.maxLength(6))), // Customer Aves code registry (string fix to 6)
  '@InsertCriteria': v.optional(
    v.union([v.literal('S'), v.literal('N'), v.literal('T'), v.literal('M')])
  ),
  CreatedDate: v.optional(v.string()),
  ModifiedDate: v.optional(v.string()),
  RecordType: v.optional(v.string()),
  LoginType: v.optional(v.string()),
  Moniker: v.optional(v.string()),
  Name: v.optional(v.string()),
  LanguageCode: v.optional(v.pipe(v.string(), v.minLength(2), v.maxLength(2))), // 2 digit language code
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
});

/**
 * Master record detail schema (camelCase for API)
 */
export const MasterRecordDetailInputSchema = v.pipe(
  MasterRecordDetailSchema,
  v.transform((input) => pascalToCamelKeys(input))
);
