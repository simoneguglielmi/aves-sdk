import { registerAs } from '@nestjs/config';

export const AVES_CONFIG_NAMESPACE = 'aves';

export interface AvesEnvConfig {
  AVES_BASE_URL: string;
  AVES_HOST_ID: string;
  AVES_XTOKEN: string;
  AVES_LANGUAGE_CODE?: string;
  AVES_TIMEOUT?: string;
}

export const avesConfig = registerAs(AVES_CONFIG_NAMESPACE, () => ({
  baseUrl: process.env.AVES_BASE_URL ?? '',
  hostId: process.env.AVES_HOST_ID ?? '',
  xtoken: process.env.AVES_XTOKEN ?? '',
  languageCode: process.env.AVES_LANGUAGE_CODE,
  timeout: process.env.AVES_TIMEOUT
    ? Number(process.env.AVES_TIMEOUT)
    : undefined,
}));

export type AvesRegisteredConfig = ReturnType<typeof avesConfig>;
