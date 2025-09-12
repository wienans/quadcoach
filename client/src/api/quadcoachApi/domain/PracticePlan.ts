import { PartialBy } from "../../../helpers/typeHelpers";
import Block from "./Block";

export type SelectedBlock = {
  blockId: string;
  block: Block;
  selected: boolean;
};

export type SelectedExercise = {
  exerciseId: string;
  exerciseName: string;
  selectedBlocks: SelectedBlock[];
  totalTime: number;
};

export type PracticeGroup = {
  id: string;
  name: string;
  exercises: SelectedExercise[];
  order: number;
};

export type PracticePlan = {
  _id: string;
  name: string;
  description?: string;
  groups: PracticeGroup[];
  totalTime: number;
  creator?: string;
  user?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export default PracticePlan;
export type PracticePlanWithoutId = Omit<PracticePlan, "_id">;
export type PracticePlanPartialId = PartialBy<PracticePlan, "_id">;