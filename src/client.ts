import { request as r } from 'undici';
import { parse, safeParse } from 'valibot';
import { jsonToXml, xmlToJson } from './xml-client.js';
import {
  SearchMasterRecordRequestSchema,
  SearchMasterRecordResponseSchema,
} from './schemas/search.js';
import {
  ManageMasterRecordRequestSchema,
  ManageMasterRecordResponseSchema,
} from './schemas/upsert.js';
import type {
  ManageMasterRecordRS,
  MasterRecordDetail,
  SearchMasterRecord,
  SearchMasterRecordRS,
} from './types.js';
import { MasterRecordDetailApiSchema } from './schemas/master-record.js';

function createRootElement<T>(name: XMLRootElementValues, object: T) {
  return {
    [name]: object,
  };
}

const XML_ROOT_ELEMENTS = {
  SEARCH_REQUEST: 'SearchMasterRecordRQ',
  SEARCH_RESPONSE: 'SearchMasterRecordRS',
  UPSERT_REQUEST: 'ManageMasterRecordRQ',
  UPSERT_RESPONSE: 'ManageMasterRecordRS',
} as const;

type XMLRootElementValues =
  (typeof XML_ROOT_ELEMENTS)[keyof typeof XML_ROOT_ELEMENTS];

/**
 * Error thrown by AVES API operations
 */
export class AvesError extends Error {
  constructor(
    message: string,
    public readonly status?: string,
    public readonly errorCode?: string,
    public readonly errorDescription?: string
  ) {
    super(message);
    this.name = 'AvesError';
  }
}

/**
 * AVES XML REST API client
 */
export class AvesClient {
  /**
   * @param baseURL - Base URL of the AVES API
   * @param hostID - 6-digit identification code
   * @param xtoken - Authentication token
   * @param languageCode - Optional 2-digit language code
   */
  constructor(
    private readonly baseURL: string,
    private readonly hostID: string,
    private readonly xtoken: string,
    private readonly languageCode?: string
  ) {
    this.baseURL = baseURL.replace(/\/$/, '');
  }

  private createRqHeader() {
    return {
      '@HostID': this.hostID,
      '@Xtoken': this.xtoken,
      '@Interface': 'WEB' as const,
      '@UserName': 'WEB' as const,
      ...(this.languageCode && { '@LanguageCode': this.languageCode }),
    };
  }

  private createUrl(endpoint: string) {
    return `${this.baseURL}${endpoint}`;
  }

  private get endpoints() {
    return {
      search: '/interop/masterRecords/v2/rest/Search',
      upsert: '/interop/masterRecords/v2/rest/InsertOrUpdate',
    } as const;
  }

  private async request<T>(
    endpoint: string,
    requestBody: Record<string, unknown>,
    responseRootKey: string,
    responseSchema:
      | typeof ManageMasterRecordResponseSchema
      | typeof SearchMasterRecordResponseSchema
  ): Promise<T> {
    const url = this.createUrl(endpoint);
    const xmlBody = jsonToXml(requestBody);

    const response = await r(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/xml',
      },
      body: xmlBody,
    });

    const responseText = await response.body.text();

    if (response.statusCode !== 200) {
      throw new AvesError(responseText, response.statusCode.toString());
    }

    const jsonResponse = xmlToJson(responseText);

    const rootElement = jsonResponse[responseRootKey];
    if (!rootElement) {
      throw new AvesError(
        `Invalid response structure: missing root element '${responseRootKey}'`,
        undefined,
        'VALIDATION_ERROR'
      );
    }

    const result = safeParse(responseSchema, rootElement);

    if (!result.success) {
      throw new AvesError(
        `Invalid response format: ${result.issues
          .map((i) => i.message)
          .join(', ')}`,
        '400',
        'VALIDATION_ERROR'
      );
    }

    const rsStatus = result.output.rsStatus;
    const status = rsStatus?.status;
    if (status === 'ERROR' || status === 'TIMEOUT') {
      const errorCode = rsStatus?.errorCode;
      const errorDescription = rsStatus?.errorDescription;
      throw new AvesError(
        errorDescription || `API Error: ${status}`,
        status,
        errorCode,
        errorDescription
      );
    }

    if (status === 'WARNING') {
      const warnings = rsStatus?.warnings?.join(', ');
      console.warn('AVES API Warning:', warnings);
    }

    return result.output as T;
  }

  /**
   * Search for master records
   * @returns List of matching master records in camelCase
   */
  async search(params: SearchMasterRecord): Promise<SearchMasterRecordRS> {
    const requestData = parse(SearchMasterRecordRequestSchema, {
      RqHeader: this.createRqHeader(),
      SearchMasterRecord: params,
    });

    const requestBody = createRootElement(
      XML_ROOT_ELEMENTS.SEARCH_REQUEST,
      requestData
    );

    const response = await this.request<SearchMasterRecordRS>(
      this.endpoints.search,
      requestBody,
      XML_ROOT_ELEMENTS.SEARCH_RESPONSE,
      SearchMasterRecordResponseSchema
    );

    return response;
  }

  /**
   * Insert or update a master record
   * @param record - Master record data in camelCase
   * @returns Response with customer record code in camelCase
   */
  async upsertRecord(
    record: MasterRecordDetail
  ): Promise<ManageMasterRecordRS> {
    const apiRecord = parse(MasterRecordDetailApiSchema, record);

    const masterRecordDetail = {
      '@InsertCriteria': 'T' as const,
      ...apiRecord,
    };

    const requestData = parse(ManageMasterRecordRequestSchema, {
      RqHeader: this.createRqHeader(),
      MasterRecordDetail: masterRecordDetail,
    });

    const requestBody = createRootElement(
      XML_ROOT_ELEMENTS.UPSERT_REQUEST,
      requestData
    );

    return this.request<ManageMasterRecordRS>(
      this.endpoints.upsert,
      requestBody,
      XML_ROOT_ELEMENTS.UPSERT_RESPONSE,
      ManageMasterRecordResponseSchema
    );
  }
}
