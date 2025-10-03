import {
  AvesErrorCodes,
  AvesError as AvesErrorInterface,
  AvesSeverity,
} from '../types/common';

/**
 * Simple AVES Exception class that extends the standard Error
 * Provides unified error handling with AVES-specific error codes and context
 */
export class AvesException extends Error {
  public readonly code: string;
  public readonly severity: AvesSeverity;
  public readonly timestamp: string;
  public readonly requestId: string;
  public readonly context?: Record<string, any>;

  constructor(
    code: string | AvesErrorCodes,
    message: string,
    options: {
      severity?: AvesSeverity;
      context?: Record<string, any>;
      requestId?: string;
    } = {}
  ) {
    super(message);

    this.name = 'AvesException';
    this.code = code;
    this.severity = options.severity || AvesSeverity.ERROR;
    this.timestamp = new Date().toISOString();
    this.context = options.context;
    this.requestId = options.requestId || this.generateRequestId();

    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, AvesException.prototype);

    // Capture stack trace if available
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AvesException);
    }
  }

  /**
   * Create an AVES error from a structured AvesError object
   */
  static fromAvesError(avesError: AvesErrorInterface): AvesException {
    return new AvesException(avesError.code, avesError.message, {
      severity: avesError.severity,
      context: avesError.context,
      requestId: avesError.requestId,
    });
  }

  /**
   * Check if this error is retryable
   */
  isRetryable(): boolean {
    const retryableCodes = [
      AvesErrorCodes.TIMEOUT,
      AvesErrorCodes.SERVICE_UNAVAILABLE,
      AvesErrorCodes.INTERNAL_SERVER_ERROR,
      AvesErrorCodes.RATE_LIMIT_EXCEEDED,
    ];

    return retryableCodes.includes(this.code as AvesErrorCodes);
  }

  /**
   * Get user-friendly error message
   */
  getUserFriendlyMessage(): string {
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

    return friendlyMessages[this.code] || this.message;
  }

  /**
   * Convert to plain object for serialization
   */
  toJSON(): Record<string, any> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      severity: this.severity,
      timestamp: this.timestamp,
      requestId: this.requestId,
      context: this.context,
      stack: this.stack,
      isRetryable: this.isRetryable(),
      userFriendlyMessage: this.getUserFriendlyMessage(),
    };
  }

  /**
   * Convert to AvesError interface
   */
  toAvesError(): AvesErrorInterface {
    return {
      code: this.code,
      message: this.message,
      severity: this.severity,
      timestamp: this.timestamp,
      requestId: this.requestId,
      context: this.context,
    };
  }

  /**
   * Get HTTP status code for this error
   */
  getHttpStatusCode(): number {
    switch (this.code) {
      case AvesErrorCodes.INVALID_TOKEN:
      case AvesErrorCodes.TOKEN_EXPIRED:
        return 401;
      case AvesErrorCodes.INSUFFICIENT_PERMISSIONS:
        return 403;
      case AvesErrorCodes.BOOKING_NOT_FOUND:
        return 404;
      case AvesErrorCodes.INVALID_REQUEST_FORMAT:
      case AvesErrorCodes.MISSING_REQUIRED_FIELD:
      case AvesErrorCodes.INVALID_FIELD_VALUE:
        return 400;
      case AvesErrorCodes.RATE_LIMIT_EXCEEDED:
        return 429;
      case AvesErrorCodes.SERVICE_UNAVAILABLE:
        return 503;
      case AvesErrorCodes.TIMEOUT:
        return 408;
      default:
        return 500;
    }
  }

  /**
   * Get error category
   */
  getCategory(): string {
    if (this.code.startsWith('AVES_1')) return 'Authentication';
    if (this.code.startsWith('AVES_2')) return 'Business Logic';
    if (this.code.startsWith('AVES_5')) return 'System';
    return 'Unknown';
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `aves_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
