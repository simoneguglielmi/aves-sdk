import { describe, it, expect } from 'vitest';
import { parse } from 'valibot';
import {
  ManageMasterRecordRequestSchema,
  ManageMasterRecordResponseSchema,
} from './upsert.js';
import {
  MasterRecordDetailSchema,
  MasterRecordDetailApiSchema,
} from './master-record.js';

describe('ManageMasterRecordRequestSchema', () => {
  it('should validate valid upsert request', () => {
    const input = {
      RqHeader: {
        '@HostID': '025706',
        '@Xtoken': 'TOKEN002756',
        '@Interface': 'WEB',
        '@UserName': 'WEB',
      },
      MasterRecordDetail: {
        '@InsertCriteria': 'S',
        Name: 'John Doe',
        Email: 'john@example.com',
        ZipCode: '12345',
      },
    };

    const result = parse(ManageMasterRecordRequestSchema, input);
    expect(result).toBeDefined();
  });

  it('should reject invalid InsertCriteria', () => {
    const input = {
      RqHeader: {
        '@HostID': '025706',
        '@Xtoken': 'TOKEN002756',
        '@Interface': 'WEB',
        '@UserName': 'WEB',
      },
      MasterRecordDetail: {
        '@InsertCriteria': 'X', // Invalid - must be S, N, T, or M
        Name: 'John Doe',
      },
    };

    expect(() => parse(ManageMasterRecordRequestSchema, input)).toThrow();
  });

  it('should reject invalid HostID length', () => {
    const input = {
      RqHeader: {
        '@HostID': '12345', // Too short (must be 6)
        '@Xtoken': 'TOKEN002756',
        '@Interface': 'WEB',
        '@UserName': 'WEB',
      },
      MasterRecordDetail: {
        '@InsertCriteria': 'S',
        Name: 'John Doe',
      },
    };

    expect(() => parse(ManageMasterRecordRequestSchema, input)).toThrow();
  });
});

describe('MasterRecordDetailSchema', () => {
  it('should validate camelCase input', () => {
    const input = {
      name: 'John Doe',
      email: 'john@example.com',
      zipCode: '12345',
      languageCode: '02',
    };

    const result = parse(MasterRecordDetailSchema, input);
    expect(result).toBeDefined();
    expect(result.name).toBe('John Doe');
    expect(result.email).toBe('john@example.com');
    expect(result.zipCode).toBe('12345');
  });

  it('should reject invalid languageCode length', () => {
    const input = {
      name: 'John Doe',
      languageCode: '1', // Too short (must be 2)
    };

    expect(() => parse(MasterRecordDetailSchema, input)).toThrow();
  });
});

describe('MasterRecordDetailApiSchema', () => {
  it('should transform camelCase input to PascalCase with @ prefix for attributes', () => {
    const input = {
      recordCode: '508558', // attribute field
      name: 'John Doe',
      email: 'john@example.com',
      zipCode: '12345',
      languageCode: '02',
    };

    const validated = parse(MasterRecordDetailSchema, input);
    const result = parse(MasterRecordDetailApiSchema, validated);
    expect(result).toHaveProperty('@RecordCode', '508558'); // recordCode is an attribute field
    expect(result).toHaveProperty('Name', 'John Doe');
    expect(result).toHaveProperty('Email', 'john@example.com');
    expect(result).toHaveProperty('ZipCode', '12345');
  });
});

describe('ManageMasterRecordResponseSchema', () => {
  it('should transform PascalCase API response to camelCase', () => {
    const apiResponse = {
      RsStatus: {
        '@Status': 'OK',
      },
      CustomerRecordRS: {
        CustomerRecordCode: '508558',
      },
    };

    const result = parse(ManageMasterRecordResponseSchema, apiResponse);
    expect(result).toHaveProperty('rsStatus');
    expect(result.rsStatus).toHaveProperty('status', 'OK');
    expect(result).toHaveProperty('customerRecordRS');
    expect(result.customerRecordRS).toHaveProperty(
      'customerRecordCode',
      '508558',
    );
  });
});
