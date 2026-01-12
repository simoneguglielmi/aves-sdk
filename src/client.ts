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
import type { Result } from './utils/result.js';
import { err, ok } from './utils/result.js';

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

  private handleApiStatus<T>(
    output: T,
    rsStatus: {
      status?: string;
      errorCode?: string;
      errorDescription?: string;
      warnings?: string[];
    }
  ): Result<T, AvesError> {
    const status = rsStatus?.status;

    if (status === 'ERROR' || status === 'TIMEOUT') {
      return err(
        new AvesError(
          rsStatus.errorDescription || `API Error: ${status}`,
          status,
          rsStatus.errorCode,
          rsStatus.errorDescription
        )
      );
    }

    if (status === 'WARNING') {
      const warnings = rsStatus.warnings?.join(', ');
      console.warn('AVES API Warning:', warnings);
    }

    return ok(output);
  }

  private toAvesError(error: unknown, defaultMessage: string): AvesError {
    if (error instanceof AvesError) {
      return error;
    }
    if (error instanceof Error) {
      return new AvesError(error.message);
    }
    return new AvesError(defaultMessage);
  }

  private async request<T>(
    endpoint: string,
    requestBody: Record<string, unknown>,
    responseRootKey: string,
    responseSchema:
      | typeof ManageMasterRecordResponseSchema
      | typeof SearchMasterRecordResponseSchema
  ): Promise<Result<T, AvesError>> {
    try {
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
        return err(new AvesError(responseText, response.statusCode.toString()));
      }

      const jsonResponse = xmlToJson(responseText);
      const rootElement = jsonResponse[responseRootKey];

      if (!rootElement) {
        return err(
          new AvesError(
            `Invalid response structure: missing root element '${responseRootKey}'`,
            undefined,
            'VALIDATION_ERROR'
          )
        );
      }

      const parseResult = safeParse(responseSchema, rootElement);

      if (!parseResult.success) {
        return err(
          new AvesError(
            `Invalid response format: ${parseResult.issues
              .map((i) => i.message)
              .join(', ')}`,
            '400',
            'VALIDATION_ERROR'
          )
        );
      }

      return this.handleApiStatus(
        parseResult.output as T,
        parseResult.output.rsStatus
      );
    } catch (error) {
      return err(this.toAvesError(error, 'Unknown error occurred'));
    }
  }

  /**
   * Search for master records
   * @returns Result containing list of matching master records in camelCase or error
   */
  async search(
    params: SearchMasterRecord
  ): Promise<Result<SearchMasterRecordRS, AvesError>> {
    try {
      const requestData = parse(SearchMasterRecordRequestSchema, {
        RqHeader: this.createRqHeader(),
        SearchMasterRecord: params,
      });

      const requestBody = createRootElement(
        XML_ROOT_ELEMENTS.SEARCH_REQUEST,
        requestData
      );

      return await this.request<SearchMasterRecordRS>(
        this.endpoints.search,
        requestBody,
        XML_ROOT_ELEMENTS.SEARCH_RESPONSE,
        SearchMasterRecordResponseSchema
      );
    } catch (error) {
      return err(
        this.toAvesError(error, 'Validation error occurred during search')
      );
    }
  }

  /**
   * Insert or update a master record
   * @param record - Master record data in camelCase
   * @returns Result containing response with customer record code in camelCase or error
   */
  async upsertRecord(
    record: MasterRecordDetail
  ): Promise<Result<ManageMasterRecordRS, AvesError>> {
    try {
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

      return await this.request<ManageMasterRecordRS>(
        this.endpoints.upsert,
        requestBody,
        XML_ROOT_ELEMENTS.UPSERT_RESPONSE,
        ManageMasterRecordResponseSchema
      );
    } catch (error) {
      return err(
        this.toAvesError(error, 'Validation error occurred during upsert')
      );
    }
  }
}
