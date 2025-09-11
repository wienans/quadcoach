import { describe, it, expect } from 'vitest';
import { getExerciseType, ExerciseType } from '../../helpers/exerciseHelpers';

// Mock Exercise type based on the structure used in the helper
interface MockExercise {
  beaters: number;
  chasers: number;
}

describe('exerciseHelpers', () => {
  describe('getExerciseType', () => {
    it('should return "all" when both beaters and chasers are greater than 0', () => {
      const exercise: MockExercise = { beaters: 2, chasers: 3 };
      expect(getExerciseType(exercise as any)).toBe(ExerciseType.all);
    });

    it('should return "all" with minimum values greater than 0', () => {
      const exercise: MockExercise = { beaters: 1, chasers: 1 };
      expect(getExerciseType(exercise as any)).toBe(ExerciseType.all);
    });

    it('should return "beater" when beaters > 0 and chasers = 0', () => {
      const exercise: MockExercise = { beaters: 2, chasers: 0 };
      expect(getExerciseType(exercise as any)).toBe(ExerciseType.beater);
    });

    it('should return "beater" with single beater', () => {
      const exercise: MockExercise = { beaters: 1, chasers: 0 };
      expect(getExerciseType(exercise as any)).toBe(ExerciseType.beater);
    });

    it('should return "chaser" when beaters = 0 and chasers > 0', () => {
      const exercise: MockExercise = { beaters: 0, chasers: 3 };
      expect(getExerciseType(exercise as any)).toBe(ExerciseType.chaser);
    });

    it('should return "chaser" with single chaser', () => {
      const exercise: MockExercise = { beaters: 0, chasers: 1 };
      expect(getExerciseType(exercise as any)).toBe(ExerciseType.chaser);
    });

    it('should return "general" when both beaters and chasers are 0', () => {
      const exercise: MockExercise = { beaters: 0, chasers: 0 };
      expect(getExerciseType(exercise as any)).toBe(ExerciseType.general);
    });

    it('should handle large numbers correctly', () => {
      const exerciseAll: MockExercise = { beaters: 10, chasers: 15 };
      expect(getExerciseType(exerciseAll as any)).toBe(ExerciseType.all);

      const exerciseBeater: MockExercise = { beaters: 100, chasers: 0 };
      expect(getExerciseType(exerciseBeater as any)).toBe(ExerciseType.beater);

      const exerciseChaser: MockExercise = { beaters: 0, chasers: 50 };
      expect(getExerciseType(exerciseChaser as any)).toBe(ExerciseType.chaser);
    });

    it('should handle negative numbers as if they were 0', () => {
      // Note: In real scenarios, negative numbers shouldn't occur,
      // but testing the logical flow
      const exercise1: MockExercise = { beaters: -1, chasers: 2 };
      expect(getExerciseType(exercise1 as any)).toBe(ExerciseType.general); // -1 is not > 0

      const exercise2: MockExercise = { beaters: 2, chasers: -1 };
      expect(getExerciseType(exercise2 as any)).toBe(ExerciseType.general); // -1 is not > 0

      const exercise3: MockExercise = { beaters: -1, chasers: -1 };
      expect(getExerciseType(exercise3 as any)).toBe(ExerciseType.general);
    });
  });

  describe('ExerciseType enum', () => {
    it('should have correct enum values', () => {
      expect(ExerciseType.general).toBe('general');
      expect(ExerciseType.all).toBe('all');
      expect(ExerciseType.beater).toBe('beater');
      expect(ExerciseType.chaser).toBe('chaser');
    });

    it('should have all expected enum members', () => {
      const enumValues = Object.values(ExerciseType);
      expect(enumValues).toContain('general');
      expect(enumValues).toContain('all');
      expect(enumValues).toContain('beater');
      expect(enumValues).toContain('chaser');
      expect(enumValues).toHaveLength(4);
    });
  });
});