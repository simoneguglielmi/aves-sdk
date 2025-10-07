export interface RqHeader {
  '@HostID': string;
  '@Xtoken': string;
  '@Interface': 'WEB';
  '@UserName': 'WEB';
  '@LanguageCode'?: string;
}

export enum AvesStatus {
  OK = 'OK',
  ERROR = 'ERROR',
  WARNING = 'WARNING',
  TIMEOUT = 'TIMEOUT',
}

export interface RsStatus {
  '@Status': AvesStatus;
  ErrorCode?: string;
  ErrorDescription?: string;
  Warnings?: { Warning: string | string[] };
}

export enum AvesSeverity {
  ERROR = 'ERROR',
  WARNING = 'WARNING',
  INFO = 'INFO',
}

// Simplified error handling - single unified error interface
export interface AvesError {
  code: string;
  message: string;
  severity: AvesSeverity;
  timestamp: string;
  requestId: string;
  context?: Record<string, any>;
}

// Common AVES error codes
export enum AvesErrorCodes {
  // Authentication & Authorization
  INVALID_TOKEN = 'AVES_001',
  TOKEN_EXPIRED = 'AVES_002',
  INSUFFICIENT_PERMISSIONS = 'AVES_003',

  // Validation Errors
  INVALID_REQUEST_FORMAT = 'AVES_100',
  MISSING_REQUIRED_FIELD = 'AVES_101',
  INVALID_FIELD_VALUE = 'AVES_102',
  INVALID_DATE_FORMAT = 'AVES_103',

  // Business Logic Errors
  BOOKING_NOT_FOUND = 'AVES_200',
  BOOKING_ALREADY_CANCELLED = 'AVES_201',
  INVALID_BOOKING_STATUS = 'AVES_202',
  PAYMENT_FAILED = 'AVES_203',
  INSUFFICIENT_INVENTORY = 'AVES_204',

  // System Errors
  INTERNAL_SERVER_ERROR = 'AVES_500',
  SERVICE_UNAVAILABLE = 'AVES_501',
  TIMEOUT = 'AVES_502',
  RATE_LIMIT_EXCEEDED = 'AVES_503',
}

export enum InsertCriteria {
  INSERT = 'INSERT',
  UPDATE = 'UPDATE',
  UPSERT = 'UPSERT',
}

export interface AvesRequestRoot<TBody> {
  Request: {
    RqHeader: RqHeader;
    Body: TBody;
  };
}

export interface AvesResponseRoot<TBody> {
  Response: {
    RsStatus: RsStatus;
    Body?: TBody;
  };
}

// Type for AVES XML response structure used in error handling
export interface AvesXmlResponse {
  Response?: {
    RsStatus?: {
      '@Status'?: AvesStatus;
      ErrorCode?: string;
      ErrorDescription?: string;
      Warnings?: {
        Warning: string | string[];
      };
    };
  };
}

// Type for HTTP error structure from axios
export interface HttpError extends Error {
  response?: {
    status: number;
    statusText: string;
    data?: any;
    headers?: Record<string, string>;
    config?: {
      url?: string;
      method?: string;
      timeout?: number;
      headers?: Record<string, string>;
    };
  };
  request?: {
    path?: string;
    method?: string;
    headers?: Record<string, string>;
    timeout?: number;
    data?: any;
  };
  config?: {
    url?: string;
    method?: string;
    timeout?: number;
    headers?: Record<string, string>;
    baseURL?: string;
    params?: Record<string, any>;
  };
  code?: string;
  isAxiosError?: boolean;
}

export type LanguageCode = '01' | '02';

export interface AvesSdkConfig {
  baseUrl: string;
  hostId: string;
  xtoken: string;
  languageCode?: LanguageCode;
  timeout?: number;
}
