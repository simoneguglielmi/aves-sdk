import * as v from "valibot";
import {
	createApiSchema,
	createApiValidationSchema,
	createResponseSchema,
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

const paymentTypeSchema = MasterPaymentTypeSchema;

const FinancialDetailInputSchema = v.object({
	currencyCode: v.optional(v.string()),
	creditLimit: v.optional(v.string()),
	c_PaymentType: v.optional(paymentTypeSchema),
	c_SpecPaymentTypeCode: v.optional(v.string()),
	s_PaymentType: v.optional(paymentTypeSchema),
	s_SpecPaymentTypeCode: v.optional(v.string()),
	enableElectronicInvoicing: v.optional(BoolishSchema),
	electronicInvoicingType: v.optional(v.string()),
});

/**
 * Financial detail schema for API requests (transforms to PascalCase)
 */
export const FinancialDetailSchema = createApiSchema(
	FinancialDetailInputSchema,
	financialDetailWire,
);

/**
 * Financial detail validation schema (already transformed PascalCase with @ attributes)
 */
export const FinancialDetailApiValidationSchema = createApiValidationSchema(
	FinancialDetailInputSchema,
	financialDetailWire,
);

const IdDocumentDetailInputSchema = v.object({
	idType: v.optional(v.string()),
	idCode: v.optional(v.string()),
	idIssueLocation: v.optional(v.string()),
	idIssueCounty: v.optional(v.string()),
	idIssueDate: v.optional(v.string()),
	idExpireDate: v.optional(v.string()),
});

/**
 * ID document detail schema for API requests (transforms to PascalCase)
 */
export const IdDocumentDetailSchema = createApiSchema(
	IdDocumentDetailInputSchema,
	idDocumentDetailWire,
);

/**
 * ID document detail validation schema (already transformed PascalCase with @ attributes)
 */
export const IdDocumentDetailApiValidationSchema = createApiValidationSchema(
	IdDocumentDetailInputSchema,
	idDocumentDetailWire,
);

const DynamicFieldsInputSchema = v.object({
	key: v.string(),
	value: v.string(),
});

/**
 * Dynamic fields schema for API requests (transforms to PascalCase)
 */
export const DynamicFieldsSchema = createApiSchema(
	v.array(DynamicFieldsInputSchema),
	dynamicFieldsWire,
);

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

/**
 * SupplierRefMasterRecords schema for API requests (transforms to PascalCase)
 */
export const SupplierRefMasterRecordsSchema = createApiSchema(
	SupplierRefMasterRecordsInputSchema,
	supplierRefMasterRecordsWire,
);

/**
 * SupplierRefMasterRecords validation schema (already transformed PascalCase)
 */
export const SupplierRefMasterRecordsApiValidationSchema =
	createApiValidationSchema(
		SupplierRefMasterRecordsInputSchema,
		supplierRefMasterRecordsWire,
	);

const flagSchema = v.union([v.literal(0), v.literal(1)]);

const recordStatusSchema = RecordStatusSchema;
const recordTypeSchema = RecordTypeSchema;
const insertCriteriaSchema = InsertCriteriaSchema;

const AccountPoliciesInputSchema = v.object({
	acceptProfilingPolicies: v.optional(flagSchema),
	acceptPrivacyPolicies: v.optional(flagSchema),
	acceptNewsletterPolicies: v.optional(flagSchema),
});

/**
 * Account policies schema for API requests (transforms to PascalCase with @ attributes)
 */
export const AccountPoliciesSchema = createApiSchema(
	AccountPoliciesInputSchema,
	accountPoliciesWire,
);

/**
 * Account policies validation schema (already transformed PascalCase with @ attributes)
 */
export const AccountPoliciesApiValidationSchema = createApiValidationSchema(
	AccountPoliciesInputSchema,
	accountPoliciesWire,
);

/**
 * Master record detail input schema (camelCase)
 */
export const MasterRecordDetailSchema = v.object({
	recordCode: v.optional(v.pipe(v.string(), v.minLength(6), v.maxLength(6))),
	insertCriteria: v.optional(insertCriteriaSchema),
	createdDate: v.optional(v.string()),
	recordType: v.optional(v.union([recordTypeSchema], RecordType.CUSTOMER)),
	recordStatus: v.optional(v.union([recordStatusSchema], RecordStatus.ENABLED)),
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
	dynamicFields: v.optional(DynamicFieldsInputSchema),
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
 * Master record detail response schema (transforms to camelCase)
 */
export const MasterRecordDetailResponseSchema = createResponseSchema(
	MasterRecordDetailApiSchema,
);

/**
 * Master record detail API validation schema (PascalCase with @ attributes)
 * Used for both search responses and upsert requests
 * All fields are optional as responses may not contain all fields
 */
export const MasterRecordDetailApiValidationSchema = v.object({
	"@RecordCode": v.optional(v.pipe(v.string(), v.minLength(6), v.maxLength(6))),
	"@InsertCriteria": v.optional(insertCriteriaSchema),
	CreatedDate: v.optional(v.string()),
	ModifiedDate: v.optional(v.string()),
	RecordType: v.optional(recordTypeSchema),
	LoginType: v.optional(v.string()),
	RecordStatus: v.optional(recordStatusSchema),
	Moniker: v.optional(v.string()),
	Name: v.optional(v.string()),
	ExtraInfo: v.optional(v.string()),
	LanguageCode: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(2))),
	Address: v.optional(v.string()),
	ZipCode: v.optional(v.string()),
	CityName: v.optional(v.string()),
	CountyCode: v.optional(v.string()),
	StateCode: v.optional(v.string()),
	CategoryCode: v.optional(v.string()),
	PromoterCode: v.optional(v.string()),
	FirstPhoneNumber: v.optional(v.string()),
	MobilePhoneNumber: v.optional(v.string()),
	Email: v.optional(v.string()),
	Gender: v.optional(GenderSchema),
	BirthDate: v.optional(v.string()),
	BirthCity: v.optional(v.string()),
	BirthCounty: v.optional(v.string()),
	EncryptedPassword: v.optional(BoolishSchema),
	FiscalCode: v.optional(v.string()),
	VatCode: v.optional(v.string()),
	ThirdPartRecordCode: v.optional(v.string()),
	IdDocumentDetail: v.optional(IdDocumentDetailApiValidationSchema),
	NewsletterDisabled: v.optional(BoolishSchema),
	SupplierRefMasterRecords: v.optional(
		SupplierRefMasterRecordsApiValidationSchema,
	),
	AccountPolicies: v.optional(AccountPoliciesApiValidationSchema),
	FinancialDetail: v.optional(FinancialDetailApiValidationSchema),
	DynamicFields: v.optional(DynamicFieldsApiValidationSchema),
});
