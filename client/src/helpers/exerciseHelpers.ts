import { Exercise } from "../api/quadcoachApi/domain";

export enum ExerciseType {
  all = "all",
  beater = "beater",
  chaser = "chaser",
}

export const getExerciseType = (exercise: Exercise): ExerciseType =>
  exercise.beaters > 0 && exercise.chasers > 0
    ? ExerciseType.all
    : exercise.beaters > 0 && exercise.chasers === 0
    ? ExerciseType.beater
    : exercise.beaters === 0 && exercise.chasers > 0
    ? ExerciseType.chaser
    : ExerciseType.all;
