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

/**
 * Converts a camelCase string to PascalCase
 */
function camelToPascal(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Converts a PascalCase string to camelCase
 */
function pascalToCamel(str: string): string {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

/**
 * Recursively transforms object keys from camelCase to PascalCase
 */
export function camelToPascalKeys<T>(obj: T): Pascalize<T> {
  // Handle primitives and null explicitly
  if (!obj || typeof obj !== 'object') {
    return obj as Pascalize<T>;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map((item) => camelToPascalKeys(item)) as Pascalize<T>;
  }

  // Handle special objects (Date, RegExp, etc.) - return as-is
  if (
    obj instanceof Date ||
    obj instanceof RegExp ||
    obj instanceof Map ||
    obj instanceof Set ||
    obj instanceof Error
  ) {
    return obj as Pascalize<T>;
  }

  // Handle plain objects
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith('@')) {
      const strippedKey = key.slice(1);
      const pascalKey = camelToPascal(strippedKey);
      result[pascalKey] = value;
    } else {
      const pascalKey = camelToPascal(key);
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        // Check for special objects in nested values
        if (
          value instanceof Date ||
          value instanceof RegExp ||
          value instanceof Map ||
          value instanceof Set ||
          value instanceof Error
        ) {
          result[pascalKey] = value;
        } else {
          result[pascalKey] = camelToPascalKeys(
            value as Record<string, unknown>
          );
        }
      } else if (Array.isArray(value)) {
        result[pascalKey] = value.map((item) =>
          typeof item === 'object' && item && !Array.isArray(item)
            ? camelToPascalKeys(item as Record<string, unknown>)
            : item
        );
      } else {
        result[pascalKey] = value;
      }
    }
  }
  return result as Pascalize<T>;
}

/**
 * Recursively transforms object keys from PascalCase to camelCase
 */
export function pascalToCamelKeys<T>(obj: T): Camelize<T> {
  // Handle primitives and null explicitly
  // Note: typeof null === 'object' in JavaScript, so we check it first
  if (!obj || typeof obj !== 'object') {
    return obj as Camelize<T>;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map((item) => pascalToCamelKeys(item)) as Camelize<T>;
  }

  // Handle special objects (Date, RegExp, etc.) - return as-is
  if (
    obj instanceof Date ||
    obj instanceof RegExp ||
    obj instanceof Map ||
    obj instanceof Set ||
    obj instanceof Error
  ) {
    return obj as Camelize<T>;
  }

  // Handle plain objects
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    // Strip @ prefix from keys and camelCase the rest (XML attributes become regular properties)
    if (key.startsWith('@')) {
      const strippedKey = key.slice(1);
      const camelKey = pascalToCamel(strippedKey);
      result[camelKey] = value;
    } else {
      const camelKey = pascalToCamel(key);
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        // Check for special objects in nested values
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
            value as Record<string, unknown>
          );
        }
      } else if (Array.isArray(value)) {
        result[camelKey] = value.map((item) =>
          typeof item === 'object' && item && !Array.isArray(item)
            ? pascalToCamelKeys(item as Record<string, unknown>)
            : item
        );
      } else {
        result[camelKey] = value;
      }
    }
  }
  return result as Camelize<T>;
}
