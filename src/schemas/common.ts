import * as v from 'valibot';

/**
 * AvesAutoLogin schema for automatic login
 */
export const AvesAutoLoginSchema = v.object({
  '@VatCode': v.string(),
  '@ZipCode': v.string(),
  '@HashCode': v.string(),
});

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
  '@SessionId': v.optional(v.string()),
  AvesAutoLogin: v.optional(AvesAutoLoginSchema),
});

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
  Warnings: v.optional(v.string()),
});
