type CamelFromDelimiter<S extends string> = S extends `${infer H}_${infer T}`
	? `${H}${Capitalize<CamelFromDelimiter<T>>}`
	: S extends `${infer H}-${infer T}`
		? `${H}${Capitalize<CamelFromDelimiter<T>>}`
		: S;

type ToCamelCase<S extends string> =
	CamelFromDelimiter<S> extends `${infer F}${infer R}`
		? `${Lowercase<F>}${R}`
		: CamelFromDelimiter<S>;

type PascalFromDelimiter<S extends string> = S extends `${infer H}_${infer T}`
	? `${Capitalize<H>}${Capitalize<PascalFromDelimiter<T>>}`
	: S extends `${infer H}-${infer T}`
		? `${Capitalize<H>}${Capitalize<PascalFromDelimiter<T>>}`
		: S;

type ToPascalCase<S extends string> =
	PascalFromDelimiter<S> extends `${infer F}${infer R}`
		? `${Capitalize<F>}${R}`
		: Capitalize<PascalFromDelimiter<S>>;

/** Keys that are preserved as-is (no recursive transform) at runtime */
type Primitive = string | number | boolean | symbol | bigint | null | undefined;
type SpecialObject =
	| Date
	| RegExp
	| Map<unknown, unknown>
	| Set<unknown>
	| Error;

/** Maps key K: strips leading @ and converts to camelCase for mapped output key */
type CamelizeKey<K extends string> = K extends `@${infer Rest}`
	? ToCamelCase<Rest>
	: ToCamelCase<K>;

/** Maps key K: strips leading @ and converts to PascalCase for mapped output key */
type PascalizeKey<K extends string> = K extends `@${infer Rest}`
	? ToPascalCase<Rest>
	: ToPascalCase<K>;

/**
 * Recursively maps PascalCase/@-prefixed object keys to camelCase.
 * Reflects pascalToCamelKeys runtime: primitives and special objects preserved; arrays and plain objects recursively transformed.
 */
export type Camelize<T> = T extends Primitive
	? T
	: T extends SpecialObject
		? T
		: T extends readonly (infer U)[]
			? Camelize<U>[]
			: T extends object
				? { [K in keyof T as CamelizeKey<K & string>]: Camelize<T[K]> }
				: T;

/**
 * Recursively maps camelCase keys to PascalCase (with @ for attributes at runtime).
 * Reflects camelToPascalKeys output shape for type-level use.
 */
export type Pascalize<T> = T extends Primitive
	? T
	: T extends SpecialObject
		? T
		: T extends readonly (infer U)[]
			? Pascalize<U>[]
			: T extends object
				? { [K in keyof T as PascalizeKey<K & string>]: Pascalize<T[K]> }
				: T;

function camelToPascal(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

function pascalToCamel(str: string): string {
	return str.charAt(0).toLowerCase() + str.slice(1);
}

/**
 * Checks if an object is a special built-in type that should not be transformed
 */
function isSpecialObject(obj: unknown): boolean {
	return (
		obj instanceof Date ||
		obj instanceof RegExp ||
		obj instanceof Map ||
		obj instanceof Set ||
		obj instanceof Error
	);
}

/**
 * Registry of attribute fields per schema context
 * Each schema defines its own attributes, keeping them co-located
 */
const attributeRegistry: Record<string, readonly string[]> = {
	// Request/Response headers
	header: ["hostID", "xtoken", "interface", "userName", "status"],

	// Master record root attributes
	masterRecord: ["recordCode", "insertCriteria"],

	// Financial detail - all fields are attributes
	financialDetail: [
		"currencyCode",
		"creditLimit",
		"c_PaymentType",
		"c_SpecPaymentTypeCode",
		"s_PaymentType",
		"s_SpecPaymentTypeCode",
		"enableElectronicInvoicing",
		"electronicInvoicingType",
	],

	// ID document detail - all fields are attributes
	idDocumentDetail: [
		"idType",
		"idCode",
		"idIssueLocation",
		"idIssueCounty",
		"idIssueDate",
		"idExpireDate",
	],

	// Account policies - all fields are attributes
	accountPolicies: [
		"acceptProfilingPolicies",
		"acceptPrivacyPolicies",
		"acceptNewsletterPolicies",
	],

	// Dynamic fields - key/value are attributes
	dynamicFields: ["key", "value"],

	// Search parameters
	search: ["minDate", "maxDate"],

	// Booking file (CreateBookingFile / BookFileRQ)
	bookingFileStatus: ["value", "expiredDate"],
	statisticCodes: ["sCode1", "sCode2", "sCode3", "sCode4", "sCode5", "sCode6"],
	destination: ["code", "iataCode", "nationCode"],
	customerDetail: ["recordCode"],
	bookingFileDocument: ["printDoc", "sendDocViaEmail"],
	financialDeadlineDetail: ["reschedulingCode", "expireDate", "totalAmount"],
	deadlineDetail: ["deadlineCode", "description", "expireDate"],
	paymentDetail: [
		"paymentDate",
		"paumentNote",
		"amount",
		"paymentUser",
		"paymentType",
	],
	selectedPackageDetail: [
		"pCode",
		"startDate",
		"endDate",
		"getServicesFromPackage",
	],
	selectedServiceDetail: [
		"sCode",
		"ssCode",
		"supplierMasterCode",
		"supplierName",
		"supplierMasterSearchField",
		"supplierFiscalCode",
	],
	extraQuoteServiceDetail: [
		"sCode",
		"ssCode",
		"supplierMasterCode",
		"supplierName",
		"supplierMasterSearchField",
		"supplierFiscalCode",
	],
	noteDetail: ["nType", "title"],
	passengerDetail: ["rph", "roomRph", "billingHolder"],
	bookingFinancialInfo: [
		"customer_PaymentType",
		"customer_SpecPaymentTypeCode",
	],
	reservationFormCustomizablePrintParameters: ["makeDocumentTo"],
};

/**
 * Flattened Set of all attribute fields for quick lookup
 * Computed once from the registry
 */
export const ATTRIBUTE_FIELDS = new Set(
	Object.values(attributeRegistry).flat(),
);

/**
 * Add attribute fields for a new schema context
 * Allows extending the registry from schema files
 */
export function registerAttributeFields(
	context: string,
	fields: readonly string[],
) {
	attributeRegistry[context] = fields;
	fields.forEach((field) => {
		if (!ATTRIBUTE_FIELDS.has(field)) {
			ATTRIBUTE_FIELDS.add(field);
		}
	});
}

export type CamelToPascalOptions = {
	/** At root level only: do not add @ prefix for these keys (used when same key is element at root but attribute in nested objects) */
	excludeFromAttributePrefix?: string[];
};

/**
 * Transforms object keys from camelCase to PascalCase
 * Adds @ prefix to fields in ATTRIBUTE_FIELDS for XML attributes
 * @param options.excludeFromAttributePrefix - keys that must not get @ at this level (not passed to recursion)
 */
export function camelToPascalKeys<T>(
	input: T,
	options?: CamelToPascalOptions,
): Pascalize<T> {
	if (input === null || typeof input !== "object") {
		return input as Pascalize<T>;
	}

	if (isSpecialObject(input)) {
		return input as Pascalize<T>;
	}

	if (Array.isArray(input)) {
		return input.map((item) => camelToPascalKeys(item)) as Pascalize<T>;
	}

	const exclude = options?.excludeFromAttributePrefix;
	const result: Record<string, unknown> = {};

	for (const [key, value] of Object.entries(input)) {
		const pascalKey = camelToPascal(key);
		const treatAsAttr = ATTRIBUTE_FIELDS.has(key) && !exclude?.includes(key);
		const finalKey = treatAsAttr ? `@${pascalKey}` : pascalKey;

		result[finalKey] = transformValue(value, (val) =>
			camelToPascalKeys(val, undefined),
		);
	}

	return result as Pascalize<T>;
}

/**
 * Transforms object keys from PascalCase to camelCase
 * Strips @ prefix from XML attributes
 */
export function pascalToCamelKeys<T>(input: T): Camelize<T> {
	if (input === null || typeof input !== "object") {
		return input as Camelize<T>;
	}

	if (isSpecialObject(input)) {
		return input as Camelize<T>;
	}

	if (Array.isArray(input)) {
		return input.map((item) => pascalToCamelKeys(item)) as Camelize<T>;
	}

	const result: Record<string, unknown> = {};

	for (const [rawKey, value] of Object.entries(input)) {
		const key = rawKey.startsWith("@") ? rawKey.slice(1) : rawKey;
		const camelKey = pascalToCamel(key);

		result[camelKey] = transformValue(value, pascalToCamelKeys);
	}

	return result as Camelize<T>;
}

function transformValue(
	value: unknown,
	transformObject: (obj: Record<string, unknown>) => unknown,
): unknown {
	if (value === null || typeof value !== "object") {
		return value;
	}

	if (isSpecialObject(value)) {
		return value;
	}

	if (Array.isArray(value)) {
		return value.map((item) => transformValue(item, transformObject));
	}

	return transformObject(value as Record<string, unknown>);
}
