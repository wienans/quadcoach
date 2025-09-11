import { describe, it, expect } from 'vitest';
import { deserializeDatesInObject } from '../../helpers/dateHelpers';

describe('dateHelpers', () => {
  describe('deserializeDatesInObject', () => {
    it('should return null/undefined as is', () => {
      expect(deserializeDatesInObject(null)).toBe(null);
      expect(deserializeDatesInObject(undefined)).toBe(undefined);
    });

    it('should return non-object values as is', () => {
      expect(deserializeDatesInObject('string')).toBe('string');
      expect(deserializeDatesInObject(123)).toBe(123);
      expect(deserializeDatesInObject(true)).toBe(true);
    });

    it('should convert ISO date strings to Date objects', () => {
      const input = {
        name: 'test',
        createdAt: '2023-12-01T10:00:00.000Z',
        updatedAt: '2023-12-01T11:00:00Z',
        normalString: 'not a date',
      };

      const result = deserializeDatesInObject(input);

      expect(result.name).toBe('test');
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(result.normalString).toBe('not a date');
      
      expect((result.createdAt as Date).toISOString()).toBe('2023-12-01T10:00:00.000Z');
      expect((result.updatedAt as Date).toISOString()).toBe('2023-12-01T11:00:00.000Z');
    });

    it('should handle arrays and convert date strings within them', () => {
      const input = [
        {
          id: 1,
          timestamp: '2023-12-01T10:00:00.000Z',
        },
        {
          id: 2,
          timestamp: '2023-12-01T11:00:00Z',
        },
        'regular string',
      ];

      const result = deserializeDatesInObject(input);

      expect(Array.isArray(result)).toBe(true);
      expect(result[0].id).toBe(1);
      expect(result[0].timestamp).toBeInstanceOf(Date);
      expect(result[1].id).toBe(2);
      expect(result[1].timestamp).toBeInstanceOf(Date);
      expect(result[2]).toBe('regular string');
    });

    it('should handle nested objects', () => {
      const input = {
        user: {
          name: 'John',
          createdAt: '2023-12-01T10:00:00.000Z',
          profile: {
            updatedAt: '2023-12-01T11:00:00Z',
            bio: 'Hello world',
          },
        },
        items: [
          {
            id: 1,
            timestamp: '2023-12-01T12:00:00.000Z',
          },
        ],
      };

      const result = deserializeDatesInObject(input);

      expect(result.user.name).toBe('John');
      expect(result.user.createdAt).toBeInstanceOf(Date);
      expect(result.user.profile.updatedAt).toBeInstanceOf(Date);
      expect(result.user.profile.bio).toBe('Hello world');
      expect(result.items[0].id).toBe(1);
      expect(result.items[0].timestamp).toBeInstanceOf(Date);
    });

    it('should not convert invalid date strings', () => {
      const input = {
        validDate: '2023-12-01T10:00:00.000Z',
        invalidDate1: '2023-12-01',
        invalidDate2: 'not-a-date',
        invalidDate3: '12/01/2023',
      };

      const result = deserializeDatesInObject(input);

      expect(result.validDate).toBeInstanceOf(Date);
      expect(result.invalidDate1).toBe('2023-12-01');
      expect(result.invalidDate2).toBe('not-a-date');
      expect(result.invalidDate3).toBe('12/01/2023');
    });

    it('should handle mixed arrays with objects and primitives', () => {
      const input = [
        'string',
        123,
        {
          id: 1,
          timestamp: '2023-12-01T10:00:00.000Z',
        },
        null,
        [
          {
            nested: '2023-12-01T11:00:00Z',
          },
        ],
      ];

      const result = deserializeDatesInObject(input);

      expect(result[0]).toBe('string');
      expect(result[1]).toBe(123);
      expect(result[2].id).toBe(1);
      expect(result[2].timestamp).toBeInstanceOf(Date);
      expect(result[3]).toBe(null);
      expect(result[4][0].nested).toBeInstanceOf(Date);
    });

    it('should handle empty objects and arrays', () => {
      expect(deserializeDatesInObject({})).toEqual({});
      expect(deserializeDatesInObject([])).toEqual([]);
    });

    it('should preserve the original structure', () => {
      const input = {
        level1: {
          level2: {
            level3: {
              timestamp: '2023-12-01T10:00:00.000Z',
              data: 'test',
            },
          },
        },
      };

      const result = deserializeDatesInObject(input);

      expect(result).toHaveProperty('level1.level2.level3.timestamp');
      expect(result).toHaveProperty('level1.level2.level3.data');
      expect(result.level1.level2.level3.timestamp).toBeInstanceOf(Date);
      expect(result.level1.level2.level3.data).toBe('test');
    });
  });
});