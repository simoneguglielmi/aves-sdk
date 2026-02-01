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

export type Camelize<T> = T extends readonly (infer U)[]
	? Camelize<U>[]
	: T extends object
		? {
				[K in keyof T as K extends `@${infer Rest}`
					? ToCamelCase<Rest> // Strip @ prefix and camelCase the rest
					: ToCamelCase<K & string>]: Camelize<T[K]>;
			}
		: T;

export type Pascalize<T> = T extends readonly (infer U)[]
	? Pascalize<U>[]
	: T extends object
		? {
				[K in keyof T as K extends `@${infer Rest}`
					? ToPascalCase<Rest> // Strip @ prefix and PascalCase the rest
					: ToPascalCase<K & string>]: Pascalize<T[K]>;
			}
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

/**
 * Transforms object keys from camelCase to PascalCase
 * Adds @ prefix to fields in ATTRIBUTE_FIELDS for XML attributes
 */
export function camelToPascalKeys<T>(input: T): Pascalize<T> {
	if (input === null || typeof input !== "object") {
		return input as Pascalize<T>;
	}

	if (isSpecialObject(input)) {
		return input as Pascalize<T>;
	}

	if (Array.isArray(input)) {
		return input.map((item) => camelToPascalKeys(item)) as Pascalize<T>;
	}

	const result: Record<string, unknown> = {};

	for (const [key, value] of Object.entries(input)) {
		const pascalKey = camelToPascal(key);
		const finalKey = ATTRIBUTE_FIELDS.has(key) ? `@${pascalKey}` : pascalKey;

		result[finalKey] = transformValue(value, camelToPascalKeys);
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
