import { Schema } from "effect";
import { masterRecordFacades } from "../utils/facade-aliases.js";
import {
	createApiSchema,
	createApiValidationSchema,
	createResponseSchema,
	createWireSchemaPair,
	facadeObject,
	mapSchema,
} from "../utils/schema-transform.js";
import {
	accountPoliciesWire,
	dynamicFieldsWire,
	financialDetailWire,
	idDocumentDetailWire,
	masterRecordWire,
	supplierRefMasterRecordsWire,
} from "../utils/wire-shapes.js";
import { BoolishSchema, LanguageCodeSchema } from "./common.js";
import {
	CarrierTypeSchema,
	GenderSchema,
	InsertCriteriaSchema,
	MasterPaymentTypeSchema,
	RecordStatus,
	RecordStatusSchema,
	RecordType,
	RecordTypeSchema,
	RecordTypeWireSchema,
} from "./enums.js";

const FinancialDetailInputSchema = Schema.Struct({
	currencyCode: Schema.optional(Schema.String),
	creditLimit: Schema.optional(Schema.String),
	c_PaymentType: Schema.optional(MasterPaymentTypeSchema),
	c_SpecPaymentTypeCode: Schema.optional(Schema.String),
	s_PaymentType: Schema.optional(MasterPaymentTypeSchema),
	s_SpecPaymentTypeCode: Schema.optional(Schema.String),
	enableElectronicInvoicing: Schema.optional(BoolishSchema),
	electronicInvoicingType: Schema.optional(Schema.String),
});

const financialPair = createWireSchemaPair(
	FinancialDetailInputSchema,
	financialDetailWire,
);
export const FinancialDetailSchema = financialPair.api;
export const FinancialDetailApiValidationSchema = financialPair.validation;

export const IdDocumentDetailInputSchema = Schema.Struct({
	idType: Schema.optional(Schema.String),
	idCode: Schema.optional(Schema.String),
	idIssueLocation: Schema.optional(Schema.String),
	idIssueCounty: Schema.optional(Schema.String),
	idIssueDate: Schema.optional(Schema.String),
	idExpireDate: Schema.optional(Schema.String),
});

const idDocumentPair = createWireSchemaPair(
	IdDocumentDetailInputSchema,
	idDocumentDetailWire,
);
export const IdDocumentDetailSchema = idDocumentPair.api;
export const IdDocumentDetailApiValidationSchema = idDocumentPair.validation;

export const DynamicFieldsInputSchema = Schema.Struct({
	key: Schema.String,
	value: Schema.String,
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
const SupplierRefMasterRecordsInputSchema = Schema.Struct({
	supplierRefCode: Schema.optional(Schema.String),
	companyMainBusinessType: Schema.optional(Schema.String),
	carrierType: Schema.optional(CarrierTypeSchema),
});

const supplierRefPair = createWireSchemaPair(
	SupplierRefMasterRecordsInputSchema,
	supplierRefMasterRecordsWire,
);
export const SupplierRefMasterRecordsSchema = supplierRefPair.api;
export const SupplierRefMasterRecordsApiValidationSchema =
	supplierRefPair.validation;

const flagSchema = Schema.Union(Schema.Literal(0), Schema.Literal(1));

const AccountPoliciesInputSchema = Schema.Struct({
	acceptProfilingPolicies: Schema.optional(flagSchema),
	acceptPrivacyPolicies: Schema.optional(flagSchema),
	acceptNewsletterPolicies: Schema.optional(flagSchema),
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
const masterRecordDetailEntries = {
	recordCode: Schema.optional(
		Schema.String.pipe(Schema.minLength(6), Schema.maxLength(6)),
	),
	insertCriteria: Schema.optional(InsertCriteriaSchema),
	createdDate: Schema.optional(Schema.String),
	recordType: Schema.optionalWith(RecordTypeSchema, {
		default: () => RecordType.CUSTOMER,
	}),
	recordStatus: Schema.optionalWith(RecordStatusSchema, {
		default: () => RecordStatus.ENABLED,
	}),
	moniker: Schema.optional(Schema.String),
	name: Schema.optional(Schema.String),
	extraInfo: Schema.optional(Schema.String),
	languageCode: LanguageCodeSchema,
	address: Schema.optional(Schema.String),
	zipCode: Schema.optional(Schema.String),
	cityName: Schema.optional(Schema.String),
	countyCode: Schema.optional(Schema.String),
	stateCode: Schema.optional(Schema.String),
	categoryCode: Schema.optional(Schema.String),
	firstPhoneNumber: Schema.optional(Schema.String),
	mobilePhoneNumber: Schema.optional(Schema.String),
	email: Schema.optional(Schema.String),
	gender: Schema.optional(GenderSchema),
	birthDate: Schema.optional(Schema.String),
	birthCity: Schema.optional(Schema.String),
	birthCounty: Schema.optional(Schema.String),
	fiscalCode: Schema.optional(Schema.String),
	vatCode: Schema.optional(Schema.String),
	thirdPartRecordCode: Schema.optional(Schema.String),
	idDocumentDetail: Schema.optional(IdDocumentDetailInputSchema),
	accountPolicies: Schema.optional(AccountPoliciesInputSchema),
	financialDetail: Schema.optional(FinancialDetailInputSchema),
	dynamicFields: Schema.optional(Schema.Array(DynamicFieldsInputSchema)),
	supplierRefMasterRecords: Schema.optional(
		SupplierRefMasterRecordsInputSchema,
	),
};

export const MasterRecordDetailSchema = facadeObject(
	masterRecordDetailEntries,
	masterRecordFacades,
);

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
export const MasterRecordDetailApiValidationSchema = Schema.asSchema(
	Schema.partial(
		createApiValidationSchema(
			Schema.Struct(masterRecordDetailEntries),
			masterRecordWire,
			{
				// Responses widen RecordType with NOT_SET; requests keep the strict set.
				RecordType: Schema.optional(RecordTypeWireSchema),
				ModifiedDate: Schema.optional(Schema.String),
				// AVES misspells ModifiedDate on ExportBookingData MasterData rows.
				ModifitedDate: Schema.optional(Schema.String),
				LoginType: Schema.optional(Schema.String),
				PromoterCode: Schema.optional(Schema.String),
				EncryptedPassword: Schema.optional(BoolishSchema),
				NewsletterDisabled: Schema.optional(BoolishSchema),
				AreaCode: Schema.optional(Schema.String),
				LastDateContact: Schema.optional(Schema.String),
				UseSupplierDataOnTravelDoc: Schema.optional(BoolishSchema),
				BookingEnabled: Schema.optional(BoolishSchema),
				PrivacyPolicyAccepted: Schema.optional(BoolishSchema),
			},
		),
	),
);

/**
 * Master record detail response schema (transforms to camelCase)
 */
export const MasterRecordDetailResponseSchema = createResponseSchema(
	MasterRecordDetailApiValidationSchema,
);
