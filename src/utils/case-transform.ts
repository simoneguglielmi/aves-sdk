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

const ATTRIBUTE_FIELDS = new Set([
  'recordCode',
  'insertCriteria',
  'currencyCode',
  'creditLimit',
  'c_PaymentType',
  'c_SpecPaymentTypeCode',
  's_PaymentType',
  's_SpecPaymentTypeCode',
  'key',
  'value',
  'minDate',
  'maxDate',
  'hostID',
  'xtoken',
  'interface',
  'userName',
  'status',
  'acceptProfilingPolicies',
  'acceptPrivacyPolicies',
  'acceptNewsletterPolicies',
]);

/**
 * Transforms object keys from camelCase to PascalCase
 * Adds @ prefix to fields in ATTRIBUTE_FIELDS for XML attributes
 */
export function camelToPascalKeys<T>(obj: T): Pascalize<T> {
  if (!obj || typeof obj !== 'object') {
    return obj as Pascalize<T>;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => camelToPascalKeys(item)) as Pascalize<T>;
  }

  if (
    obj instanceof Date ||
    obj instanceof RegExp ||
    obj instanceof Map ||
    obj instanceof Set ||
    obj instanceof Error
  ) {
    return obj as Pascalize<T>;
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const isAttribute = ATTRIBUTE_FIELDS.has(key);
    const pascalKey = camelToPascal(key);
    const finalKey = isAttribute ? `@${pascalKey}` : pascalKey;

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      if (
        value instanceof Date ||
        value instanceof RegExp ||
        value instanceof Map ||
        value instanceof Set ||
        value instanceof Error
      ) {
        result[finalKey] = value;
      } else {
        result[finalKey] = camelToPascalKeys(value as Record<string, unknown>);
      }
    } else if (Array.isArray(value)) {
      result[finalKey] = value.map((item) =>
        typeof item === 'object' && item && !Array.isArray(item)
          ? camelToPascalKeys(item as Record<string, unknown>)
          : item,
      );
    } else {
      result[finalKey] = value;
    }
  }
  return result as Pascalize<T>;
}

/**
 * Transforms object keys from PascalCase to camelCase
 * Strips @ prefix from XML attributes
 */
export function pascalToCamelKeys<T>(obj: T): Camelize<T> {
  if (!obj || typeof obj !== 'object') {
    return obj as Camelize<T>;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => pascalToCamelKeys(item)) as Camelize<T>;
  }

  if (
    obj instanceof Date ||
    obj instanceof RegExp ||
    obj instanceof Map ||
    obj instanceof Set ||
    obj instanceof Error
  ) {
    return obj as Camelize<T>;
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith('@')) {
      const strippedKey = key.slice(1);
      const camelKey = pascalToCamel(strippedKey);
      result[camelKey] = value;
    } else {
      const camelKey = pascalToCamel(key);
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        if (
          value instanceof Date ||
          value instanceof RegExp ||
          value instanceof Map ||
          value instanceof Set ||
          value instanceof Error
        ) {
          result[camelKey] = value;
        } else {
          result[camelKey] = pascalToCamelKeys(
            value as Record<string, unknown>,
          );
        }
      } else if (Array.isArray(value)) {
        result[camelKey] = value.map((item) =>
          typeof item === 'object' && item && !Array.isArray(item)
            ? pascalToCamelKeys(item as Record<string, unknown>)
            : item,
        );
      } else {
        result[camelKey] = value;
      }
    }
  }
  return result as Camelize<T>;
}
