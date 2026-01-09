import { describe, it, expect } from 'vitest';
import { camelToPascalKeys, pascalToCamelKeys } from './case-transform.js';

describe('case-transform', () => {
  describe('pascalToCamelKeys', () => {
    it('should convert PascalCase keys to camelCase', () => {
      const input = {
        SearchType: 'CODE',
        RecordCode: '508558',
        Name: 'John Doe',
      };

      const result = pascalToCamelKeys(input);
      expect(result).toEqual({
        searchType: 'CODE',
        recordCode: '508558',
        name: 'John Doe',
      });
    });

    it('should strip @ prefix and camelCase the rest', () => {
      const input = {
        '@HostID': '025706',
        '@Xtoken': 'TOKEN002756',
        '@Status': 'OK',
      };

      const result = pascalToCamelKeys(input);
      expect(result).toEqual({
        hostID: '025706',
        xtoken: 'TOKEN002756',
        status: 'OK',
      });
    });

    it('should handle nested objects', () => {
      const input = {
        RsStatus: {
          '@Status': 'OK',
          ErrorCode: '123',
        },
        MasterRecordList: {
          MasterRecordDetail: [],
        },
      };

      const result = pascalToCamelKeys(input);
      expect(result).toEqual({
        rsStatus: {
          status: 'OK',
          errorCode: '123',
        },
        masterRecordList: {
          masterRecordDetail: [],
        },
      });
    });

    it('should handle arrays', () => {
      const input = {
        items: [
          { Name: 'Item 1', Value: 10 },
          { Name: 'Item 2', Value: 20 },
        ],
      };

      const result = pascalToCamelKeys(input);
      expect(result.items).toHaveLength(2);
      expect(result.items[0]).toEqual({ name: 'Item 1', value: 10 });
      expect(result.items[1]).toEqual({ name: 'Item 2', value: 20 });
    });

    it('should preserve special objects', () => {
      const date = new Date('2024-01-01');
      const input = {
        CreatedDate: date,
        Name: 'Test',
      };

      const result = pascalToCamelKeys(input);
      expect(result.createdDate).toBe(date);
      expect(result.name).toBe('Test');
    });

    it('should handle null and primitives', () => {
      expect(pascalToCamelKeys(null)).toBe(null);
      expect(pascalToCamelKeys(42)).toBe(42);
      expect(pascalToCamelKeys('string')).toBe('string');
      expect(pascalToCamelKeys(true)).toBe(true);
    });
  });

  describe('camelToPascalKeys', () => {
    it('should convert camelCase keys to PascalCase and add @ prefix to attribute fields', () => {
      const input = {
        searchType: 'CODE',
        recordCode: '508558', // attribute field
        name: 'John Doe',
      };

      const result = camelToPascalKeys(input);
      expect(result).toEqual({
        SearchType: 'CODE',
        '@RecordCode': '508558', // recordCode is an attribute field
        Name: 'John Doe',
      });
    });

    it('should add @ prefix to attribute fields', () => {
      const input = {
        hostID: '025706', // attribute field
        xtoken: 'TOKEN002756', // attribute field
        status: 'OK', // attribute field
        name: 'Test',
      };

      const result = camelToPascalKeys(input);
      expect(result).toEqual({
        '@HostID': '025706',
        '@Xtoken': 'TOKEN002756',
        '@Status': 'OK',
        Name: 'Test',
      });
    });

    it('should handle nested objects and add @ prefix to nested attribute fields', () => {
      const input = {
        rsStatus: {
          status: 'OK', // attribute field
          errorCode: '123',
        },
        masterRecordList: {
          masterRecordDetail: [],
        },
      };

      const result = camelToPascalKeys(input);
      expect(result).toEqual({
        RsStatus: {
          '@Status': 'OK', // status is an attribute field
          ErrorCode: '123',
        },
        MasterRecordList: {
          MasterRecordDetail: [],
        },
      });
    });

    it('should handle arrays', () => {
      const input = {
        items: [
          { name: 'Item 1', value: 10 }, // value is an attribute field
          { name: 'Item 2', value: 20 },
        ],
      };

      const result = camelToPascalKeys(input);
      expect(result.Items).toHaveLength(2);
      expect(result.Items[0]).toEqual({ Name: 'Item 1', '@Value': 10 }); // value is an attribute field
      expect(result.Items[1]).toEqual({ Name: 'Item 2', '@Value': 20 });
    });

    it('should preserve special objects', () => {
      const date = new Date('2024-01-01');
      const input = {
        createdDate: date,
        name: 'Test',
      };

      const result = camelToPascalKeys(input);
      expect(result.CreatedDate).toBe(date);
      expect(result.Name).toBe('Test');
    });
  });

  describe('round-trip conversion', () => {
    it('should convert PascalCase to camelCase and back', () => {
      const original = {
        SearchType: 'CODE',
        '@RecordCode': '508558', // API format has @ prefix for attributes
        '@HostID': '025706',
      };

      const camel = pascalToCamelKeys(original);
      expect(camel).toEqual({
        searchType: 'CODE',
        recordCode: '508558', // @ prefix stripped
        hostID: '025706', // @ prefix stripped
      });

      const pascal = camelToPascalKeys(camel);
      expect(pascal).toEqual({
        SearchType: 'CODE',
        '@RecordCode': '508558', // @ prefix added back for attribute fields
        '@HostID': '025706', // @ prefix added back for attribute fields
      });
    });
  });
});
