import * as v from 'valibot';
import type { BaseSchema } from 'valibot';
import { camelToPascalKeys, pascalToCamelKeys } from './case-transform.js';

/**
 * Creates a schema that transforms camelCase input to PascalCase for API requests
 */
export function createApiSchema<TInput extends BaseSchema<any, any, any>>(
  inputSchema: TInput
) {
  return v.pipe(
    inputSchema,
    v.transform((input) => camelToPascalKeys(input))
  );
}

/**
 * Creates a schema that transforms PascalCase API responses to camelCase
 */
export function createResponseSchema<TApi extends BaseSchema<any, any, any>>(
  apiSchema: TApi
) {
  return v.pipe(
    apiSchema,
    v.transform((input) => pascalToCamelKeys(input))
  );
}
