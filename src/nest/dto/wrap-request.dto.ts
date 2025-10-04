import type { RqHeader } from '../../types/common';

export class RequestPayload<T> {
  RqHeader: RqHeader;
  Body: T;

  constructor(payload: { RqHeader: RqHeader; Body: T }) {
    Object.assign(this, payload);
  }
}

export class WrapRequestDto<T> {
  Request: RequestPayload<T>;

  constructor(payload: RequestPayload<T>) {
    this.Request = new RequestPayload(payload);
  }
}
