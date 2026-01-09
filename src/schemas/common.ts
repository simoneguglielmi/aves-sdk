import * as v from 'valibot';

/**
 * Request header schema with customer credentials
 */
export const RqHeaderSchema = v.object({
  '@HostID': v.pipe(v.string(), v.minLength(6), v.maxLength(6)), // 6 digit identification code
  '@Xtoken': v.string(),
  '@Interface': v.literal('WEB'),
  '@UserName': v.literal('WEB'),
  '@LanguageCode': v.optional(
    v.pipe(v.string(), v.minLength(2), v.maxLength(2))
  ), // 2 digit language code
});

const warningsSchema = v.optional(
  v.pipe(
    v.string(),
    v.transform((input) => input.split(','))
  )
);

/**
 * Response status schema
 */
export const RsStatusSchema = v.object({
  '@Status': v.union([
    v.literal('OK'),
    v.literal('ERROR'),
    v.literal('WARNING'),
    v.literal('TIMEOUT'),
  ]),
  ErrorCode: v.optional(v.string()),
  ErrorDescription: v.optional(v.string()),
  Warnings: warningsSchema,
});
