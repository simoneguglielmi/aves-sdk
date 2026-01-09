import { request as r } from 'undici';
import { parse, safeParse } from 'valibot';
import { jsonToXml, xmlToJson } from './xml-client';
import {
  SearchMasterRecordRQSchema,
  SearchMasterRecordRSSchema,
} from './schemas/search';
import {
  ManageMasterRecordRQSchema,
  ManageMasterRecordRSSchema,
} from './schemas/upsert';
import type {
  ManageMasterRecordRQ,
  ManageMasterRecordRS,
  SearchMasterRecordRS,
} from './types';
import { MasterRecordDetailInputSchema } from './schemas/master-record';

function createRootElement<T>(name: XMLRootElementValues, object: T) {
  return {
    [name]: object,
  };
}

/**
 * XML root element names for AVES API requests and responses
 */
const XML_ROOT_ELEMENTS = {
  SEARCH_REQUEST: 'SearchMasterRecordRQ',
  SEARCH_RESPONSE: 'SearchMasterRecordRS',
  UPSERT_REQUEST: 'ManageMasterRecordRQ',
  UPSERT_RESPONSE: 'ManageMasterRecordRS',
} as const;

type XMLRootElementValues =
  (typeof XML_ROOT_ELEMENTS)[keyof typeof XML_ROOT_ELEMENTS];

/**
 * Custom error class for AVES API errors
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
 * AVES XML REST API Client
 */
export class AvesClient {
  /**
   * Creates a new AvesClient instance
   * @param baseURL - Base URL of the AVES API (e.g., "https://api.example.com")
   * @param hostID - 6 digit identification code
   * @param xtoken - Unique validation string
   */
  constructor(
    private readonly baseURL: string,
    private readonly hostID: string,
    private readonly xtoken: string
  ) {
    this.baseURL = baseURL.replace(/\/$/, '');
  }

  /**
   * Creates a request header with credentials
   */
  private createRqHeader(languageCode?: string) {
    return {
      '@HostID': this.hostID,
      '@Xtoken': this.xtoken,
      '@Interface': 'WEB' as const,
      '@UserName': 'WEB' as const,
      ...(languageCode && { '@LanguageCode': languageCode }),
    };
  }

  /**
   * Creates a URL for the AVES API
   * @param endpoint - Endpoint of the AVES API
   * @returns URL for the AVES API
   */
  private createUrl(endpoint: string) {
    return `${this.baseURL}${endpoint}`;
  }

  private get endpoints() {
    return {
      search: '/interop/masterRecords/v2/rest/Search',
      upsert: '/interop/masterRecords/v2/rest/InsertOrUpdate',
    };
  }

  /**
   * Makes an HTTP request to the AVES API
   */
  private async request<T>(
    endpoint: string,
    requestBody: Record<string, unknown>,
    responseRootKey: string,
    responseSchema:
      | typeof ManageMasterRecordRSSchema
      | typeof SearchMasterRecordRSSchema
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
        undefined,
        'VALIDATION_ERROR'
      );
    }

    const rsStatus = result.output.rsStatus;
    const status = rsStatus?.['@Status'];
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
      const warnings = rsStatus?.warnings;
      console.warn('AVES API Warning:', warnings);
    }

    // Return the transformed result (already in camelCase from schema)
    return result.output as T;
  }

  /**
   * Search for master records
   * @param params - Search parameters (camelCase)
   * @returns List of matching master records (camelCase)
   */
  async search(params: {
    searchType:
      | 'CODE'
      | 'NAME'
      | 'VATCODE'
      | 'ZONE'
      | 'CATEGORY'
      | 'EMAIL'
      | 'LASTMODDATE'
      | 'SEARCH FIELD'
      | 'EXTERNAL_REF_CODE';
    recordCode?: string;
    name?: string;
    vatCode?: string;
    zipCode?: string;
    city?: string;
    countyCode?: string;
    phoneNumber?: string;
    categoryCode?: string;
    email?: string;
    lastModificationDate?: {
      '@MinDate': string;
      '@MaxDate': string;
    };
    searchFieldValue?: string;
    languageCode?: string;
  }): Promise<SearchMasterRecordRS> {
    // Validate camelCase input and transform to PascalCase
    const validatedParams = parse(SearchMasterRecordRQSchema, params);

    // Add RqHeader
    const requestData = {
      RqHeader: this.createRqHeader(validatedParams.LanguageCode),
      ...validatedParams,
    };

    // Build XML request body
    const requestBody = createRootElement(
      XML_ROOT_ELEMENTS.SEARCH_REQUEST,
      requestData
    );

    const response = await this.request<SearchMasterRecordRS>(
      this.endpoints.search,
      requestBody,
      XML_ROOT_ELEMENTS.SEARCH_RESPONSE,
      SearchMasterRecordRSSchema
    );

    return response;
  }

  /**
   * Insert or update a master record
   * @param record - Master record data (camelCase)
   * @param insertCriteria - Insert criteria (S, N, T, M). Defaults to 'S' if not provided
   * @param languageCode - Optional language code
   * @returns Response with customer record code (camelCase)
   */
  async upsertRecord(
    record: Record<string, unknown>,
    insertCriteria: 'S' | 'N' | 'T' | 'M' = 'S',
    languageCode?: string
  ): Promise<ManageMasterRecordRS> {
    const validatedRecord = parse(
      MasterRecordDetailInputSchema,
      record
    ) as Record<string, unknown>;

    const masterRecordDetail = {
      '@InsertCriteria': insertCriteria,
      ...validatedRecord,
    };

    const requestData: ManageMasterRecordRQ = {
      RqHeader: this.createRqHeader(languageCode),
      MasterRecordDetail: masterRecordDetail as any,
    };

    const validatedRequest = parse(ManageMasterRecordRQSchema, requestData);

    const requestBody = createRootElement(
      XML_ROOT_ELEMENTS.UPSERT_REQUEST,
      validatedRequest
    );

    return this.request<ManageMasterRecordRS>(
      this.endpoints.upsert,
      requestBody,
      XML_ROOT_ELEMENTS.UPSERT_RESPONSE,
      ManageMasterRecordRSSchema
    );
  }
}
