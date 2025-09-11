import { describe, it, expect } from 'vitest';

// Simple utility function to test
function simpleAdd(a: number, b: number): number {
  return a + b;
}

function simpleMultiply(a: number, b: number): number {
  return a * b;
}

describe('Simple Utility Functions', () => {
  describe('simpleAdd', () => {
    it('should add two positive numbers', () => {
      expect(simpleAdd(2, 3)).toBe(5);
    });

    it('should add negative numbers', () => {
      expect(simpleAdd(-2, -3)).toBe(-5);
    });

    it('should add zero', () => {
      expect(simpleAdd(5, 0)).toBe(5);
      expect(simpleAdd(0, 5)).toBe(5);
    });
  });

  describe('simpleMultiply', () => {
    it('should multiply two positive numbers', () => {
      expect(simpleMultiply(3, 4)).toBe(12);
    });

    it('should multiply by zero', () => {
      expect(simpleMultiply(5, 0)).toBe(0);
    });

    it('should multiply negative numbers', () => {
      expect(simpleMultiply(-2, 3)).toBe(-6);
    });
  });
});