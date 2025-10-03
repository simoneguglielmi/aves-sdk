import { Injectable } from '@nestjs/common';
import {
  AvesError,
  AvesErrorCodes,
  AvesSeverity,
  AvesXmlResponse,
  HttpError,
} from '../types/common';
import { AvesException } from './aves-error';

@Injectable()
export class AvesErrorHandler {
  /**
   * Parse any error into a standardized AvesException
   */
  parseError(error: any): AvesException {
    // If it's already an AvesException, return as-is
    if (error instanceof AvesException) {
      return error;
    }

    // Handle HTTP errors
    if (this.isHttpError(error)) {
      return this.parseHttpError(error);
    }

    // Handle AVES XML response errors
    if (this.isAvesXmlResponse(error)) {
      return this.parseAvesXmlError(error);
    }

    // Handle standard JavaScript errors
    if (error instanceof Error) {
      return new AvesException(
        AvesErrorCodes.INTERNAL_SERVER_ERROR,
        error.message,
        {
          severity: AvesSeverity.ERROR,
          context: this.buildContext({
            type: 'javascript_error',
            errorName: error.name,
            stack: error.stack || 'No stack trace available',
          }),
        }
      );
    }

    // Handle unknown error types
    return new AvesException(
      AvesErrorCodes.INTERNAL_SERVER_ERROR,
      'Unknown error occurred',
      {
        severity: AvesSeverity.ERROR,
        context: this.buildContext({
          type: 'unknown_error',
          errorName: typeof error,
          errorValue: String(error),
        }),
      }
    );
  }

  /**
   * Parse HTTP errors from axios
   */
  private parseHttpError(error: HttpError): AvesException {
    if (error.response) {
      const status = error.response.status;
      const statusText = error.response.statusText;

      switch (status) {
        case 400:
          return new AvesException(
            AvesErrorCodes.INVALID_REQUEST_FORMAT,
            `Bad Request: ${statusText}`,
            {
              severity: AvesSeverity.ERROR,
              context: this.buildContext({
                type: 'http_error',
                errorName: status,
                statusText,
                url: error.config?.url,
                method: error.config?.method,
                timeout: error.config?.timeout,
              }),
            }
          );
        case 401:
          return new AvesException(
            AvesErrorCodes.INVALID_TOKEN,
            'Authentication failed',
            {
              severity: AvesSeverity.ERROR,
              context: this.buildContext({
                type: 'http_error',
                status,
                url: error.config?.url,
                method: error.config?.method,
                timeout: error.config?.timeout,
              }),
            }
          );
        case 403:
          return new AvesException(
            AvesErrorCodes.INSUFFICIENT_PERMISSIONS,
            'Access forbidden',
            {
              severity: AvesSeverity.ERROR,
              context: this.buildContext({
                type: 'http_error',
                status,
                url: error.config?.url,
                method: error.config?.method,
                timeout: error.config?.timeout,
              }),
            }
          );
        case 404:
          return new AvesException(
            AvesErrorCodes.BOOKING_NOT_FOUND,
            'Resource not found',
            {
              severity: AvesSeverity.ERROR,
              context: this.buildContext({
                type: 'http_error',
                status,
                url: error.config?.url,
                method: error.config?.method,
                timeout: error.config?.timeout,
              }),
            }
          );
        case 429:
          return new AvesException(
            AvesErrorCodes.RATE_LIMIT_EXCEEDED,
            'Rate limit exceeded',
            {
              severity: AvesSeverity.ERROR,
              context: this.buildContext({
                type: 'http_error',
                status,
                retryAfter: error.response.headers?.['retry-after'],
              }),
            }
          );
        case 500:
          return new AvesException(
            AvesErrorCodes.INTERNAL_SERVER_ERROR,
            'Internal server error',
            {
              severity: AvesSeverity.ERROR,
              context: this.buildContext({
                type: 'http_error',
                status,
                url: error.config?.url,
                method: error.config?.method,
                timeout: error.config?.timeout,
              }),
            }
          );
        case 503:
          return new AvesException(
            AvesErrorCodes.SERVICE_UNAVAILABLE,
            'Service unavailable',
            {
              severity: AvesSeverity.ERROR,
              context: this.buildContext({
                type: 'http_error',
                status,
                url: error.config?.url,
                method: error.config?.method,
                timeout: error.config?.timeout,
              }),
            }
          );
        default:
          return new AvesException(
            AvesErrorCodes.INTERNAL_SERVER_ERROR,
            `HTTP ${status}: ${statusText}`,
            {
              severity: AvesSeverity.ERROR,
              context: this.buildContext({
                type: 'http_error',
                status,
                statusText,
                url: error.config?.url,
                method: error.config?.method,
                timeout: error.config?.timeout,
              }),
            }
          );
      }
    } else if (error.request) {
      // Request was made but no response received
      return new AvesException(
        AvesErrorCodes.TIMEOUT,
        'Request timeout - no response from AVES API',
        {
          severity: AvesSeverity.ERROR,
          context: this.buildContext({
            type: 'http_error',
            timeout: true,
            url: error.config?.url,
            method: error.config?.method,
            configuredTimeout: error.config?.timeout,
          }),
        }
      );
    } else {
      // Something else happened
      return new AvesException(
        AvesErrorCodes.INTERNAL_SERVER_ERROR,
        `Request setup error: ${error.message}`,
        {
          severity: AvesSeverity.ERROR,
          context: this.buildContext({
            type: 'http_error',
            setupError: true,
          }),
        }
      );
    }
  }

  /**
   * Parse AVES XML response errors
   */
  private parseAvesXmlError(xmlResponse: AvesXmlResponse): AvesException {
    if (!xmlResponse?.Response?.RsStatus) {
      return new AvesException(
        AvesErrorCodes.INVALID_REQUEST_FORMAT,
        'Invalid response format from AVES API',
        {
          severity: AvesSeverity.ERROR,
          context: this.buildContext({
            type: 'aves_xml_error',
            missingRsStatus: true,
          }),
        }
      );
    }

    const rsStatus = xmlResponse.Response.RsStatus;

    // Handle main status
    if (rsStatus['@Status'] === 'ERROR') {
      return new AvesException(
        rsStatus.ErrorCode || AvesErrorCodes.INTERNAL_SERVER_ERROR,
        rsStatus.ErrorDescription || 'Unknown error from AVES API',
        {
          severity: AvesSeverity.ERROR,
          context: this.buildContext({
            type: 'aves_xml_error',
            originalResponse: rsStatus,
          }),
        }
      );
    }

    // Handle warnings
    if (rsStatus.Warnings?.Warning) {
      const warnings = Array.isArray(rsStatus.Warnings.Warning)
        ? rsStatus.Warnings.Warning
        : [rsStatus.Warnings.Warning];

      return new AvesException(
        AvesErrorCodes.INVALID_FIELD_VALUE,
        warnings.join('; '),
        {
          severity: AvesSeverity.WARNING,
          context: this.buildContext({
            type: 'aves_xml_warning',
            warnings,
          }),
        }
      );
    }

    // If we get here, it's an unexpected response
    return new AvesException(
      AvesErrorCodes.INTERNAL_SERVER_ERROR,
      'Unexpected response from AVES API',
      {
        severity: AvesSeverity.ERROR,
        context: this.buildContext({
          type: 'aves_xml_error',
          unexpectedResponse: true,
          status: rsStatus['@Status'],
        }),
      }
    );
  }

  /**
   * Check if error is retryable
   */
  isRetryable(error: AvesException): boolean {
    const retryableCodes = [
      AvesErrorCodes.TIMEOUT,
      AvesErrorCodes.SERVICE_UNAVAILABLE,
      AvesErrorCodes.INTERNAL_SERVER_ERROR,
      AvesErrorCodes.RATE_LIMIT_EXCEEDED,
    ];

    return retryableCodes.includes(error.code as AvesErrorCodes);
  }

  /**
   * Get user-friendly error message
   */
  getUserFriendlyMessage(error: AvesException): string {
    const friendlyMessages: Record<string, string> = {
      [AvesErrorCodes.INVALID_TOKEN]:
        'Your session has expired. Please log in again.',
      [AvesErrorCodes.TOKEN_EXPIRED]:
        'Your session has expired. Please log in again.',
      [AvesErrorCodes.INSUFFICIENT_PERMISSIONS]:
        'You do not have permission to perform this action.',
      [AvesErrorCodes.BOOKING_NOT_FOUND]:
        'The requested booking could not be found.',
      [AvesErrorCodes.BOOKING_ALREADY_CANCELLED]:
        'This booking has already been cancelled.',
      [AvesErrorCodes.PAYMENT_FAILED]:
        'Payment processing failed. Please try again.',
      [AvesErrorCodes.INSUFFICIENT_INVENTORY]:
        'The requested service is no longer available.',
      [AvesErrorCodes.SERVICE_UNAVAILABLE]:
        'The service is temporarily unavailable. Please try again later.',
      [AvesErrorCodes.TIMEOUT]: 'The request timed out. Please try again.',
      [AvesErrorCodes.RATE_LIMIT_EXCEEDED]:
        'Too many requests. Please wait a moment and try again.',
    };

    return friendlyMessages[error.code] || error.message;
  }

  /**
   * Build standardized context object from various input types
   */
  private buildContext(input: any): Record<string, any> {
    const context: Record<string, any> = {};

    // Handle different input types
    if (typeof input === 'object' && input !== null) {
      // Copy relevant properties, filtering out sensitive data
      Object.keys(input).forEach((key) => {
        const value = input[key];

        // Redact sensitive data
        if (this.isSensitiveKey(key)) {
          context[key] = '********';
          return;
        }

        // Handle different value types
        if (this.isSerializableValue(value)) {
          context[key] = value;
        } else if (typeof value === 'function') {
          context[key] = '[Function]';
        } else if (value instanceof Error) {
          context[key] = {
            name: value.name,
            message: value.message,
            stack: value.stack?.split('\n').slice(0, 3).join('\n'),
          };
        } else {
          context[key] = String(value);
        }
      });
    } else if (typeof input === 'string') {
      context.message = input;
    } else if (typeof input === 'number' || typeof input === 'boolean') {
      context.value = input;
    } else {
      context.input = String(input);
    }

    // Add metadata
    context.timestamp = new Date().toISOString();
    context.contextType = typeof input;

    return context;
  }

  /**
   * Check if a key contains sensitive information
   */
  private isSensitiveKey(key: string): boolean {
    const sensitiveKeys = [
      'password',
      'token',
      'secret',
      'key',
      'auth',
      'credential',
      'xtoken',
      'authorization',
      'cookie',
      'session',
      'private',
    ];

    const lowerKey = key.toLowerCase();
    return sensitiveKeys.some((sensitive) => lowerKey.includes(sensitive));
  }

  /**
   * Check if a value is serializable and safe to include in context
   */
  private isSerializableValue(value: any): boolean {
    if (value === null || value === undefined) {
      return true;
    }

    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      return true;
    }

    if (Array.isArray(value)) {
      return value.length <= 10; // Limit array size
    }

    if (typeof value === 'object') {
      // Check if it's a plain object (not a class instance)
      if (value.constructor === Object) {
        const keys = Object.keys(value);
        return keys.length <= 20; // Limit object size
      }
      return false;
    }

    return false;
  }

  /**
   * Type guards
   */
  private isHttpError(error: any): error is HttpError {
    return error && (error.response || error.request || error.config);
  }

  private isAvesXmlResponse(error: any): error is AvesXmlResponse {
    return error && error.Response && error.Response.RsStatus;
  }
}
