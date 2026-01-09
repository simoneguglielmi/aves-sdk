import { describe, it, expect } from 'vitest';
import { parse } from 'valibot';
import {
  SearchMasterRecordSchema,
  SearchMasterRecordApiSchema,
  SearchMasterRecordResponseSchema,
} from './search.js';

describe('SearchMasterRecordSchema', () => {
  it('should validate valid search request with CODE type', () => {
    const input = {
      searchType: 'CODE',
      recordCode: '508558',
      languageCode: '02',
    };

    const result = parse(SearchMasterRecordSchema, input);
    expect(result).toBeDefined();
    expect(result.searchType).toBe('CODE');
    expect(result.recordCode).toBe('508558');
  });

  it('should validate valid search request with EMAIL type', () => {
    const input = {
      searchType: 'EMAIL',
      email: 'user@example.com',
    };

    const result = parse(SearchMasterRecordSchema, input);
    expect(result).toBeDefined();
    expect(result.searchType).toBe('EMAIL');
  });

  it('should validate search request with NAME type', () => {
    const input = {
      searchType: 'NAME',
      name: 'John Doe',
      city: 'New York',
    };

    const result = parse(SearchMasterRecordSchema, input);
    expect(result).toBeDefined();
  });

  it('should validate search request with LASTMODDATE type', () => {
    const input = {
      searchType: 'LASTMODDATE',
      lastModificationDate: {
        minDate: '2024-01-01',
        maxDate: '2024-12-31',
      },
    };

    const result = parse(SearchMasterRecordSchema, input);
    expect(result).toBeDefined();
  });

  it('should reject invalid SearchType', () => {
    const input = {
      searchType: 'INVALID',
      recordCode: '508558',
    };

    expect(() => parse(SearchMasterRecordSchema, input)).toThrow();
  });

  it('should reject RecordCode with invalid length', () => {
    const input = {
      searchType: 'CODE',
      recordCode: '12345', // Too short (must be 6)
    };

    expect(() => parse(SearchMasterRecordSchema, input)).toThrow();
  });

  it('should reject LanguageCode with invalid length', () => {
    const input = {
      searchType: 'CODE',
      recordCode: '508558',
      languageCode: '1', // Too short (must be 2)
    };

    expect(() => parse(SearchMasterRecordSchema, input)).toThrow();
  });
});

describe('SearchMasterRecordApiSchema', () => {
  it('should transform camelCase input to PascalCase', () => {
    const input = {
      searchType: 'CODE',
      recordCode: '508558',
      languageCode: '02',
    };

    const validated = parse(SearchMasterRecordSchema, input);
    const result = parse(SearchMasterRecordApiSchema, validated);
    expect(result).toHaveProperty('SearchType', 'CODE');
    expect(result).toHaveProperty('@RecordCode', '508558'); // recordCode is an attribute field
    expect(result).toHaveProperty('LanguageCode', '02');
  });
});

describe('SearchMasterRecordResponseSchema', () => {
  it('should transform PascalCase API response to camelCase', () => {
    const apiResponse = {
      RsStatus: {
        '@Status': 'OK',
      },
      MasterRecordList: {
        MasterRecordDetail: [],
      },
    };

    const result = parse(SearchMasterRecordResponseSchema, apiResponse);
    expect(result).toHaveProperty('rsStatus');
    expect(result.rsStatus).toHaveProperty('status', 'OK');
    expect(result).toHaveProperty('masterRecordList');
  });
});
