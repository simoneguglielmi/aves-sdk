import * as v from "valibot";
import {
	createApiSchema,
	createApiValidationSchema,
	createResponseSchema,
	createWireSchemaPair,
} from "../utils/schema-transform.js";
import {
	accountPoliciesWire,
	dynamicFieldsWire,
	financialDetailWire,
	idDocumentDetailWire,
	masterRecordWire,
	supplierRefMasterRecordsWire,
} from "../utils/wire-shapes.js";
import { BoolishSchema } from "./booking-shared.js";
import { LanguageCodeSchema } from "./common.js";
import {
	CarrierTypeSchema,
	GenderSchema,
	InsertCriteriaSchema,
	MasterPaymentTypeSchema,
	RecordStatus,
	RecordStatusSchema,
	RecordType,
	RecordTypeSchema,
} from "./enums.js";

const FinancialDetailInputSchema = v.object({
	currencyCode: v.optional(v.string()),
	creditLimit: v.optional(v.string()),
	c_PaymentType: v.optional(MasterPaymentTypeSchema),
	c_SpecPaymentTypeCode: v.optional(v.string()),
	s_PaymentType: v.optional(MasterPaymentTypeSchema),
	s_SpecPaymentTypeCode: v.optional(v.string()),
	enableElectronicInvoicing: v.optional(BoolishSchema),
	electronicInvoicingType: v.optional(v.string()),
});

const financialPair = createWireSchemaPair(
	FinancialDetailInputSchema,
	financialDetailWire,
);
export const FinancialDetailSchema = financialPair.api;
export const FinancialDetailApiValidationSchema = financialPair.validation;

export const IdDocumentDetailInputSchema = v.object({
	idType: v.optional(v.string()),
	idCode: v.optional(v.string()),
	idIssueLocation: v.optional(v.string()),
	idIssueCounty: v.optional(v.string()),
	idIssueDate: v.optional(v.string()),
	idExpireDate: v.optional(v.string()),
});

const idDocumentPair = createWireSchemaPair(
	IdDocumentDetailInputSchema,
	idDocumentDetailWire,
);
export const IdDocumentDetailSchema = idDocumentPair.api;
export const IdDocumentDetailApiValidationSchema = idDocumentPair.validation;

export const DynamicFieldsInputSchema = v.object({
	key: v.string(),
	value: v.string(),
});

/**
 * Dynamic fields validation schema (already transformed PascalCase with @ attributes)
 */
export const DynamicFieldsApiValidationSchema = createApiValidationSchema(
	DynamicFieldsInputSchema,
	dynamicFieldsWire,
);

/*
 * Supplier reference master records schema for API requests (transforms to PascalCase)
 * @property supplierRefCode - Supplier reference code
 * @property companyMainBusinessType - Company main business type
 * @property carrierType - Carrier type
 */
const SupplierRefMasterRecordsInputSchema = v.object({
	supplierRefCode: v.optional(v.string()),
	companyMainBusinessType: v.optional(v.string()),
	carrierType: v.optional(CarrierTypeSchema),
});

const supplierRefPair = createWireSchemaPair(
	SupplierRefMasterRecordsInputSchema,
	supplierRefMasterRecordsWire,
);
export const SupplierRefMasterRecordsSchema = supplierRefPair.api;
export const SupplierRefMasterRecordsApiValidationSchema =
	supplierRefPair.validation;

const flagSchema = v.union([v.literal(0), v.literal(1)]);

const AccountPoliciesInputSchema = v.object({
	acceptProfilingPolicies: v.optional(flagSchema),
	acceptPrivacyPolicies: v.optional(flagSchema),
	acceptNewsletterPolicies: v.optional(flagSchema),
});

const accountPoliciesPair = createWireSchemaPair(
	AccountPoliciesInputSchema,
	accountPoliciesWire,
);
export const AccountPoliciesSchema = accountPoliciesPair.api;
export const AccountPoliciesApiValidationSchema =
	accountPoliciesPair.validation;

/**
 * Master record detail input schema (camelCase)
 */
export const MasterRecordDetailSchema = v.object({
	recordCode: v.optional(v.pipe(v.string(), v.minLength(6), v.maxLength(6))),
	insertCriteria: v.optional(InsertCriteriaSchema),
	createdDate: v.optional(v.string()),
	recordType: v.optional(RecordTypeSchema, RecordType.CUSTOMER),
	recordStatus: v.optional(RecordStatusSchema, RecordStatus.ENABLED),
	moniker: v.optional(v.string()),
	name: v.optional(v.string()),
	extraInfo: v.optional(v.string()),
	languageCode: LanguageCodeSchema,
	address: v.optional(v.string()),
	zipCode: v.optional(v.string()),
	cityName: v.optional(v.string()),
	countyCode: v.optional(v.string()),
	stateCode: v.optional(v.string()),
	categoryCode: v.optional(v.string()),
	firstPhoneNumber: v.optional(v.string()),
	mobilePhoneNumber: v.optional(v.string()),
	email: v.optional(v.string()),
	gender: v.optional(GenderSchema),
	birthDate: v.optional(v.string()),
	birthCity: v.optional(v.string()),
	birthCounty: v.optional(v.string()),
	fiscalCode: v.optional(v.string()),
	vatCode: v.optional(v.string()),
	thirdPartRecordCode: v.optional(v.string()),
	idDocumentDetail: v.optional(IdDocumentDetailInputSchema),
	accountPolicies: v.optional(AccountPoliciesInputSchema),
	financialDetail: v.optional(FinancialDetailInputSchema),
	dynamicFields: v.optional(v.array(DynamicFieldsInputSchema)),
	supplierRefMasterRecords: v.optional(SupplierRefMasterRecordsInputSchema),
});

/**
 * Master record detail schema for API requests (transforms to PascalCase)
 */
export const MasterRecordDetailApiSchema = createApiSchema(
	MasterRecordDetailSchema,
	masterRecordWire,
);

/**
 * Master record detail API validation schema (PascalCase with @ attributes).
 * Nested structure is generated from `masterRecordWire`; overrides are server-only fields.
 */
export const MasterRecordDetailApiValidationSchema = v.partial(
	createApiValidationSchema(MasterRecordDetailSchema, masterRecordWire, {
		ModifiedDate: v.optional(v.string()),
		LoginType: v.optional(v.string()),
		PromoterCode: v.optional(v.string()),
		EncryptedPassword: v.optional(BoolishSchema),
		NewsletterDisabled: v.optional(BoolishSchema),
	}),
);

/**
 * Master record detail response schema (transforms to camelCase)
 */
export const MasterRecordDetailResponseSchema = createResponseSchema(
	MasterRecordDetailApiValidationSchema,
);
