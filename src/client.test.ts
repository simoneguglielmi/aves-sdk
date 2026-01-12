import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AvesClient, AvesError } from './client.js';

// Mock undici
vi.mock('undici', () => ({
  request: vi.fn(),
}));

import { request as mockRequest } from 'undici';

describe('AvesClient', () => {
  let client: AvesClient;
  const baseURL = 'https://api.example.com';
  const hostID = '025706';
  const xtoken = 'TOKEN002756';

  beforeEach(() => {
    client = new AvesClient(baseURL, hostID, xtoken);
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create client with correct configuration', () => {
      expect(client).toBeInstanceOf(AvesClient);
    });
  });

  describe('search', () => {
    it('should make search request and return camelCase response', async () => {
      const mockResponse = {
        statusCode: 200,
        body: {
          text: async () =>
            `<SearchMasterRecordRS>
              <RsStatus Status="OK"/>
              <MasterRecordList>
                <MasterRecordDetail RecordCode="508558">
                  <Name>ROSSI MARIO</Name>
                  <Email>mario.rossi@example.com</Email>
                </MasterRecordDetail>
              </MasterRecordList>
            </SearchMasterRecordRS>`,
        },
      };

      (mockRequest as any).mockResolvedValue(mockResponse);

      const result = await client.search({
        searchType: 'CODE',
        recordCode: '508558',
      });

      expect(mockRequest).toHaveBeenCalledWith(
        `${baseURL}/interop/masterRecords/v2/rest/Search`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/xml',
          }),
        })
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveProperty('rsStatus');
        expect(result.data.rsStatus).toHaveProperty('status', 'OK');
        expect(result.data).toHaveProperty('masterRecordList');
      }
    });

    it('should validate input parameters', async () => {
      // Should return error result for invalid recordCode length
      const result = await client.search({
        searchType: 'CODE',
        recordCode: '12345', // Too short
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(AvesError);
      }
    });

    it('should handle API errors', async () => {
      const mockResponse = {
        statusCode: 200,
        body: {
          text: async () =>
            `<SearchMasterRecordRS>
              <RsStatus Status="ERROR">
                <ErrorCode>E001</ErrorCode>
                <ErrorDescription>Invalid request</ErrorDescription>
              </RsStatus>
            </SearchMasterRecordRS>`,
        },
      };

      (mockRequest as any).mockResolvedValue(mockResponse);

      const result = await client.search({
        searchType: 'CODE',
        recordCode: '508558',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(AvesError);
        expect(result.error.errorCode).toBe('E001');
      }
    });

    it('should handle HTTP errors', async () => {
      const mockResponse = {
        statusCode: 500,
        body: {
          text: async () => 'Internal Server Error',
        },
      };

      (mockRequest as any).mockResolvedValue(mockResponse);

      const result = await client.search({
        searchType: 'CODE',
        recordCode: '508558',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(AvesError);
        expect(result.error.status).toBe('500');
      }
    });

    it('should transform request to PascalCase for API', async () => {
      const mockResponse = {
        statusCode: 200,
        body: {
          text: async () =>
            `<SearchMasterRecordRS>
              <RsStatus Status="OK"/>
            </SearchMasterRecordRS>`,
        },
      };

      (mockRequest as any).mockResolvedValue(mockResponse);

      await client.search({
        searchType: 'CODE',
        recordCode: '508558',
        languageCode: '02',
      });

      const callArgs = (mockRequest as any).mock.calls[0];
      const requestBody = callArgs[1].body;

      // Check that XML contains PascalCase (after transformation)
      // recordCode is an attribute field, so it becomes @RecordCode in XML
      expect(requestBody).toContain('<SearchType>CODE</SearchType>');
      expect(requestBody).toContain('RecordCode="508558"'); // XML attribute format
      expect(requestBody).toContain('<LanguageCode>02</LanguageCode>'); // languageCode is an element, not an attribute
    });
  });

  describe('upsertRecord', () => {
    it('should make upsert request and return camelCase response', async () => {
      const mockResponse = {
        statusCode: 200,
        body: {
          text: async () =>
            `<ManageMasterRecordRS>
              <RsStatus Status="OK"/>
              <CustomerRecordRS>
                <CustomerRecordCode>508558</CustomerRecordCode>
              </CustomerRecordRS>
            </ManageMasterRecordRS>`,
        },
      };

      (mockRequest as any).mockResolvedValue(mockResponse);

      const result = await client.upsertRecord({
        name: 'John Doe',
        email: 'john@example.com',
        zipCode: '12345',
        languageCode: '02',
      });

      expect(mockRequest).toHaveBeenCalledWith(
        `${baseURL}/interop/masterRecords/v2/rest/InsertOrUpdate`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/xml',
          }),
        })
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveProperty('rsStatus');
        expect(result.data.rsStatus).toHaveProperty('status', 'OK');
        expect(result.data).toHaveProperty('customerRecordRS');
        expect(result.data.customerRecordRS).toHaveProperty(
          'customerRecordCode',
          '508558'
        );
      }
    });

    it('should use default insertCriteria', async () => {
      const mockResponse = {
        statusCode: 200,
        body: {
          text: async () =>
            `<ManageMasterRecordRS>
              <RsStatus Status="OK"/>
            </ManageMasterRecordRS>`,
        },
      };

      (mockRequest as any).mockResolvedValue(mockResponse);

      await client.upsertRecord({
        name: 'John Doe',
        languageCode: '02',
      });

      const callArgs = (mockRequest as any).mock.calls[0];
      const requestBody = callArgs[1].body;

      // Should default to 'T' (based on implementation)
      expect(requestBody).toContain('InsertCriteria="T"');
    });

    it('should transform request to PascalCase for API', async () => {
      const mockResponse = {
        statusCode: 200,
        body: {
          text: async () =>
            `<ManageMasterRecordRS>
              <RsStatus Status="OK"/>
            </ManageMasterRecordRS>`,
        },
      };

      (mockRequest as any).mockResolvedValue(mockResponse);

      await client.upsertRecord({
        name: 'John Doe',
        email: 'john@example.com',
        zipCode: '12345',
        languageCode: '02',
      });

      const callArgs = (mockRequest as any).mock.calls[0];
      const requestBody = callArgs[1].body;

      // Check that XML contains PascalCase
      expect(requestBody).toContain('<Name>John Doe</Name>');
      expect(requestBody).toContain('<Email>john@example.com</Email>');
      expect(requestBody).toContain('<ZipCode>12345</ZipCode>');
    });

    it('should handle API errors', async () => {
      const mockResponse = {
        statusCode: 200,
        body: {
          text: async () =>
            `<ManageMasterRecordRS>
              <RsStatus Status="ERROR">
                <ErrorCode>E002</ErrorCode>
                <ErrorDescription>Invalid record data</ErrorDescription>
              </RsStatus>
            </ManageMasterRecordRS>`,
        },
      };

      (mockRequest as any).mockResolvedValue(mockResponse);

      const result = await client.upsertRecord({
        name: 'John Doe',
        languageCode: '02',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(AvesError);
        expect(result.error.errorCode).toBe('E002');
      }
    });
  });

  describe('AvesError', () => {
    it('should create error with correct properties', () => {
      const error = new AvesError(
        'Test error',
        'ERROR',
        'E001',
        'Error description'
      );

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AvesError);
      expect(error.message).toBe('Test error');
      expect(error.status).toBe('ERROR');
      expect(error.errorCode).toBe('E001');
      expect(error.errorDescription).toBe('Error description');
    });
  });
});
