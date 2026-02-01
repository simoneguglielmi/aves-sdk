import { request as r } from 'undici';
import { BaseIssue, BaseSchema, parse, safeParse, ValiError } from 'valibot';
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
  AvesClientOptions,
  ManageMasterRecordRS,
  MasterRecordDetail,
  RsStatus,
  SearchMasterRecord,
  SearchMasterRecordRS,
} from './types.js';
import { MasterRecordDetailApiSchema } from './schemas/master-record.js';
import type { Result } from './utils/result.js';
import { err, ok } from './utils/result.js';
import {
  apiError,
  AvesError,
  buildDetails,
  isAbortError,
  unknownError,
  validationError,
} from './error.js';
import { parseUrl } from './utils/url.js';
import { createTimeoutSignal } from './utils/timeout.js';
import { XML_ROOT_ELEMENTS, createRootElement } from './xml-root.js';

/**
 * AVES XML REST API client
 */
export class AvesClient {
  /**
   * @param options - Client configuration options
   * @param options.baseURL - Base URL of the AVES API
   * @param options.hostID - 6-digit identification code
   * @param options.xtoken - Authentication token
   * @param options.languageCode - Optional 2-digit language code
   * @param options.timeoutMs - Optional request timeout in milliseconds
   */
  constructor(private readonly options: AvesClientOptions) {}

  private createRqHeader() {
    return {
      '@HostID': this.options.hostID,
      '@Xtoken': this.options.xtoken,
      '@Interface': 'WEB' as const,
      '@UserName': 'WEB' as const,
      ...(this.options.languageCode && {
        '@LanguageCode': this.options.languageCode,
      }),
    };
  }

  private createUrl(endpoint: string) {
    return parseUrl(this.options.baseURL, endpoint);
  }

  private get endpoints() {
    return {
      search: '/interop/masterRecords/v2/rest/Search',
      upsert: '/interop/masterRecords/v2/rest/InsertOrUpdate',
    } as const;
  }

  private handleApiStatus<T extends { rsStatus: RsStatus }>(
    output: T
  ): Result<T, AvesError> {
    const rsStatus = output.rsStatus;
    const status = rsStatus?.status;

    if (status !== 'OK') {
      return err(
        apiError(
          rsStatus.errorDescription as string,
          status,
          rsStatus.errorCode
        )
      );
    }

    return ok(output);
  }

  private toAvesError(error: unknown, defaultMessage: string): AvesError {
    if (error instanceof AvesError) {
      return error;
    }
    if (error instanceof ValiError) {
      const details = buildDetails(error.issues);
      return validationError(`Validation error: ${details}`);
    }
    if (error instanceof Error) {
      return unknownError(error.message);
    }
    return unknownError(defaultMessage);
  }

  private async request<T extends { rsStatus: RsStatus }>(
    endpoint: string,
    requestBody: Record<string, unknown>,
    responseRootKey: string,
    responseSchema: BaseSchema<unknown, T, BaseIssue<unknown>>
  ): Promise<Result<T, AvesError>> {
    const { signal, clear } = createTimeoutSignal(
      this.options.timeoutMs ?? 30_000
    );

    try {
      const url = this.createUrl(endpoint);
      const xmlBody = jsonToXml(requestBody);

      const response = await r(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml',
        },
        body: xmlBody,
        signal,
      });

      const responseText = await response.body.text();

      if (response.statusCode !== 200) {
        return err(apiError(responseText, 'ERROR', response.statusCode));
      }

      const jsonResponse = xmlToJson(responseText);
      const rootElement = jsonResponse[responseRootKey];

      if (!rootElement) {
        return err(
          validationError(
            `Invalid response structure: missing root element '${responseRootKey}'`
          )
        );
      }

      const parseResult = safeParse(responseSchema, rootElement);
      if (!parseResult.success) {
        const details = buildDetails(parseResult.issues);
        return err(validationError(`Invalid response format: ${details}`));
      }
      return this.handleApiStatus(parseResult.output);
    } catch (error) {
      if (isAbortError(error)) {
        return err(apiError('Request timed out', 'TIMEOUT'));
      }
      return err(this.toAvesError(error, 'Unknown error occurred'));
    } finally {
      clear?.();
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

      return this.request<SearchMasterRecordRS>(
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

      const requestData = parse(ManageMasterRecordRequestSchema, {
        RqHeader: this.createRqHeader(),
        MasterRecordDetail: apiRecord,
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
    } catch (error) {
      return err(
        this.toAvesError(error, 'Validation error occurred during upsert')
      );
    }
  }
}
