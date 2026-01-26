export const ERROR_KINDS = {
  VALIDATION: 'validation',
  API: 'api',
  UNKNOWN: 'unknown',
} as const;

export type ErrorKind = (typeof ERROR_KINDS)[keyof typeof ERROR_KINDS];

/**
 * Error thrown by AVES API operations
 */
export class AvesError extends Error {
  constructor(
    public readonly kind: ErrorKind,
    public readonly message: string,
    public readonly status?: string,
    public readonly code?: number | string,
  ) {
    super(message);
    this.name = 'AvesError';
    this.status = status?.toLowerCase();
    this.code = this.parseCode(code);
  }

  private parseCode(code?: number | string): number {
    if (typeof code === 'string') {
      return Number.parseInt(code);
    }
    return code ?? 0;
  }
}

export function validationError(message: string): AvesError {
  return new AvesError(ERROR_KINDS.VALIDATION, message);
}

export function apiError(
  message: string,
  status?: string,
  code?: number | string,
): AvesError {
  return new AvesError(ERROR_KINDS.API, message, status, code);
}

export function unknownError(message: string): AvesError {
  return new AvesError(ERROR_KINDS.UNKNOWN, message);
}
