import { describe, it, expect } from 'vitest';
import {
  calculatePagination,
  getPaginatedData,
  sortData,
  toggleSortOrder,
  isValidPage,
  clampPage,
} from './Table.service';

describe('Table.service', () => {
  describe('calculatePagination', () => {
    it('should calculate correct number of pages', () => {
      expect(calculatePagination(10, 10)).toBe(1);
      expect(calculatePagination(25, 10)).toBe(3);
      expect(calculatePagination(100, 10)).toBe(10);
    });

    it('should round up when data is not evenly divisible', () => {
      expect(calculatePagination(11, 10)).toBe(2);
      expect(calculatePagination(21, 10)).toBe(3);
    });

    it('should return 0 when data length is 0', () => {
      expect(calculatePagination(0, 10)).toBe(0);
    });

    it('should handle large datasets', () => {
      expect(calculatePagination(10000, 50)).toBe(200);
    });
  });

  describe('getPaginatedData', () => {
    const testData = [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
      { id: 3, name: 'Item 3' },
      { id: 4, name: 'Item 4' },
      { id: 5, name: 'Item 5' },
    ];

    it('should return first page of data', () => {
      const result = getPaginatedData(testData, 2, 1);
      expect(result).toEqual([
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
      ]);
    });

    it('should return second page of data', () => {
      const result = getPaginatedData(testData, 2, 2);
      expect(result).toEqual([
        { id: 3, name: 'Item 3' },
        { id: 4, name: 'Item 4' },
      ]);
    });

    it('should return partial page when not enough items', () => {
      const result = getPaginatedData(testData, 2, 3);
      expect(result).toEqual([{ id: 5, name: 'Item 5' }]);
    });

    it('should return empty array for page beyond data', () => {
      const result = getPaginatedData(testData, 2, 10);
      expect(result).toEqual([]);
    });

    it('should return all data on first page if pageSize is larger than data', () => {
      const result = getPaginatedData(testData, 10, 1);
      expect(result).toEqual(testData);
    });
  });

  describe('sortData', () => {
    const testData = [
      { id: 3, name: 'Charlie', price: 50 },
      { id: 1, name: 'Alice', price: 30 },
      { id: 2, name: 'Bob', price: 40 },
    ];

    it('should return unsorted data when sortKey is null', () => {
      const result = sortData(testData, null, 'asc');
      expect(result).toEqual(testData);
    });

    it('should sort strings in ascending order', () => {
      const result = sortData(testData, 'name', 'asc');
      expect(result).toEqual([
        { id: 1, name: 'Alice', price: 30 },
        { id: 2, name: 'Bob', price: 40 },
        { id: 3, name: 'Charlie', price: 50 },
      ]);
    });

    it('should sort strings in descending order', () => {
      const result = sortData(testData, 'name', 'desc');
      expect(result).toEqual([
        { id: 3, name: 'Charlie', price: 50 },
        { id: 2, name: 'Bob', price: 40 },
        { id: 1, name: 'Alice', price: 30 },
      ]);
    });

    it('should sort numbers in ascending order', () => {
      const result = sortData(testData, 'price', 'asc');
      expect(result).toEqual([
        { id: 1, name: 'Alice', price: 30 },
        { id: 2, name: 'Bob', price: 40 },
        { id: 3, name: 'Charlie', price: 50 },
      ]);
    });

    it('should sort numbers in descending order', () => {
      const result = sortData(testData, 'price', 'desc');
      expect(result).toEqual([
        { id: 3, name: 'Charlie', price: 50 },
        { id: 2, name: 'Bob', price: 40 },
        { id: 1, name: 'Alice', price: 30 },
      ]);
    });

    it('should handle case-insensitive string sorting', () => {
      const dataWithMixedCase = [
        { id: 1, name: 'charlie' },
        { id: 2, name: 'ALICE' },
        { id: 3, name: 'Bob' },
      ];

      const result = sortData(dataWithMixedCase, 'name', 'asc');
      expect(result[0].name).toBe('ALICE');
      expect(result[1].name).toBe('Bob');
      expect(result[2].name).toBe('charlie');
    });

    it('should handle null and undefined values', () => {
      const dataWithNulls = [
        { id: 1, name: 'Alice', value: 10 },
        { id: 2, name: null, value: 20 },
        { id: 3, name: 'Charlie', value: 30 },
      ];

      const result = sortData(dataWithNulls, 'name', 'asc');
      expect(result[result.length - 1]).toEqual({ id: 2, name: null, value: 20 });
    });

    it('should not mutate original array', () => {
      const original = [...testData];
      sortData(testData, 'name', 'asc');
      expect(testData).toEqual(original);
    });
  });

  describe('toggleSortOrder', () => {
    it('should toggle from asc to desc', () => {
      expect(toggleSortOrder('asc')).toBe('desc');
    });

    it('should toggle from desc to asc', () => {
      expect(toggleSortOrder('desc')).toBe('asc');
    });
  });

  describe('isValidPage', () => {
    it('should return true for valid page', () => {
      expect(isValidPage(1, 5)).toBe(true);
      expect(isValidPage(5, 5)).toBe(true);
      expect(isValidPage(3, 10)).toBe(true);
    });

    it('should return false for page less than 1', () => {
      expect(isValidPage(0, 5)).toBe(false);
      expect(isValidPage(-1, 5)).toBe(false);
    });

    it('should return false for page greater than total pages', () => {
      expect(isValidPage(6, 5)).toBe(false);
      expect(isValidPage(100, 10)).toBe(false);
    });

    it('should return true for page 1 with 1 total page', () => {
      expect(isValidPage(1, 1)).toBe(true);
    });
  });

  describe('clampPage', () => {
    it('should return page when valid', () => {
      expect(clampPage(1, 5)).toBe(1);
      expect(clampPage(3, 5)).toBe(3);
      expect(clampPage(5, 5)).toBe(5);
    });

    it('should return 1 when page is less than 1', () => {
      expect(clampPage(0, 5)).toBe(1);
      expect(clampPage(-5, 5)).toBe(1);
    });

    it('should return total pages when page exceeds total', () => {
      expect(clampPage(10, 5)).toBe(5);
      expect(clampPage(100, 10)).toBe(10);
    });

    it('should return 1 when total pages is 0', () => {
      expect(clampPage(5, 0)).toBe(1);
    });

    it('should handle edge cases correctly', () => {
      expect(clampPage(1, 1)).toBe(1);
      expect(clampPage(0, 1)).toBe(1);
      expect(clampPage(2, 1)).toBe(1);
    });
  });
});
