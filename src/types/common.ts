export interface RqHeader {
  '@HostID': string;
  '@Xtoken': string;
  '@Interface': 'WEB';
  '@UserName': 'WEB';
  '@LanguageCode'?: string;
}

export interface RsStatus {
  '@Status': 'OK' | 'ERROR' | 'WARNING' | 'TIMEOUT';
  ErrorCode?: string;
  ErrorDescription?: string;
  Warnings?: { Warning: string | string[] };
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

export interface AvesSdkConfig {
  baseUrl: string;
  hostId: string;
  xtoken: string;
  languageCode?: string;
  timeout?: number;
}
