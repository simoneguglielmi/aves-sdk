import { z, ZodSchema, ZodError } from 'zod';

/**
 * AvesValidator - A comprehensive validation class for AVES SDK
 *
 * Provides multiple validation approaches using Zod schemas:
 * - Synchronous validation with error throwing
 * - Asynchronous validation support
 * - Safe validation with parsed results
 *
 * @example
 * ```typescript
 * import { AvesValidator, configValidationSchema } from 'aves-sdk';
 *
 * // Constructor approach
 * const validator = new AvesValidator(configValidationSchema);
 * const result = validator.validate(configData);
 *
 * // Method approach
 * const validator = new AvesValidator();
 * const result = validator.validate(configData, configValidationSchema);
 * ```
 */
export class AvesValidator<T = unknown> {
  private schema: ZodSchema<T>;

  /**
   * Creates a new AvesValidator instance
   * @param schema - Optional Zod schema to use as default for validation methods
   */
  constructor(schema: ZodSchema<T>) {
    this.schema = schema;
  }

  /**
   * Validates data synchronously and throws an error if validation fails
   * @param data - Data to validate
   * @param schema - Optional schema to use (overrides constructor schema)
   * @returns Validated and parsed data
   * @throws ZodError if validation fails
   *
   * @example
   * ```typescript
   * try {
   *   const validData = validator.validate(userInput);
   *   console.log('Valid data:', validData);
   * } catch (error) {
   *   if (error instanceof ZodError) {
   *     console.error('Validation errors:', error.issues);
   *   }
   * }
   * ```
   */
  validate(data: unknown) {
    if (!this.schema) {
      throw new Error(
        'No schema provided. Either pass schema to constructor or as method parameter.'
      );
    }

    return this.schema.parse(data);
  }

  /**
   * Validates data asynchronously and throws an error if validation fails
   * Useful for schemas with async refinements or transforms
   * @param data - Data to validate
   * @param schema - Optional schema to use (overrides constructor schema)
   * @returns Promise that resolves to validated and parsed data
   * @throws ZodError if validation fails
   *
   * @example
   * ```typescript
   * try {
   *   const validData = await validator.asyncValidate(userInput);
   *   console.log('Valid data:', validData);
   * } catch (error) {
   *   if (error instanceof ZodError) {
   *     console.error('Validation errors:', error.issues);
   *   }
   * }
   * ```
   */
  async asyncValidate(data: unknown): Promise<T> {
    if (!this.schema) {
      throw new Error(
        'No schema provided. Either pass schema to constructor or as method parameter.'
      );
    }

    return this.schema.parseAsync(data);
  }

  /**
   * Safely validates data without throwing errors
   * @param data - Data to validate
   * @param schema - Optional schema to use (overrides constructor schema)
   * @returns SafeParseResult with success/error information
   *
   * @example
   * ```typescript
   * const result = validator.safeValidateAndParse(userInput);
   *
   * if (result.success) {
   *   console.log('Valid data:', result.data);
   * } else {
   *   console.error('Validation errors:', result.error.issues);
   * }
   * ```
   */
  safeValidateAndParse(data: unknown) {
    if (!this.schema) {
      return this.createError({
        message:
          'No schema provided. Either pass schema to constructor or as method parameter.',
        path: [],
      });
    }

    return this.schema.safeParse(data);
  }

  /**
   * Safely validates data asynchronously without throwing errors
   * @param data - Data to validate
   * @param schema - Optional schema to use (overrides constructor schema)
   * @returns Promise that resolves to SafeParseResult with success/error information
   *
   * @example
   * ```typescript
   * const result = await validator.safeAsyncValidateAndParse(userInput);
   *
   * if (result.success) {
   *   console.log('Valid data:', result.data);
   * } else {
   *   console.error('Validation errors:', result.error.issues);
   * }
   * ```
   */
  async safeAsyncValidateAndParse(
    data: unknown
  ): Promise<{ success: true; data: T } | { success: false; error: ZodError }> {
    if (!this.schema) {
      return this.createError({
        message:
          'No schema provided. Either pass schema to constructor or as method parameter.',
        path: [],
      });
    }

    return this.schema.safeParseAsync(data);
  }

  /**
   * Gets formatted error messages from a ZodError
   * @param error - ZodError instance
   * @param separator - String to separate multiple error messages
   * @returns Formatted error message string
   *
   * @example
   * ```typescript
   * try {
   *   validator.validate(invalidData);
   * } catch (error) {
   *   if (error instanceof ZodError) {
   *     const message = validator.getErrorMessage(error);
   *     console.error('Validation failed:', message);
   *   }
   * }
   * ```
   */
  getErrorMessage(error: ZodError, separator: string = '; '): string {
    return error.issues
      .map((issue) => {
        const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : '';
        return `${path}${issue.message}`;
      })
      .join(separator);
  }

  private createError({ message, path }: { message: string; path: string[] }): {
    success: false;
    error: ZodError;
  } {
    return {
      success: false,
      error: new ZodError([{ code: 'custom', message, path }]),
    };
  }

  /**
   * Creates a new validator instance with a specific schema
   * @param schema - Schema to use for the new validator
   * @returns New AvesValidator instance
   *
   * @example
   * ```typescript
   * const configValidator = AvesValidator.withSchema(configValidationSchema);
   * const result = configValidator.validate(configData);
   * ```
   */
  static withSchema<U>(schema: ZodSchema<U>): AvesValidator<U> {
    return new AvesValidator(schema);
  }
}

/**
 * Utility function to create a validator with a specific schema
 * @param schema - Zod schema to use
 * @returns New AvesValidator instance
 *
 * @example
 * ```typescript
 * import { createValidator, configValidationSchema } from 'aves-sdk';
 *
 * const validator = createValidator(configValidationSchema);
 * const result = validator.validate(configData);
 * ```
 */
export function createAvesValidator<T>(schema: ZodSchema<T>): AvesValidator<T> {
  return new AvesValidator(schema);
}
