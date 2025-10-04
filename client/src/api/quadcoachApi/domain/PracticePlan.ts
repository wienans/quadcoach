import { PartialBy } from "../../../helpers/typeHelpers";

export type ExerciseBlockRef = {
  _id: string;
  exerciseId: string;
  blockId: string;
  order: number;
};

export type PlayerGroup = {
  _id: string;
  name: string;
  order: number;
  exerciseBlocks: ExerciseBlockRef[];
};

export type PracticeSection = {
  _id: string;
  name: string;
  order: number;
  playerGroups: PlayerGroup[];
};

export type PracticePlan = {
  _id: string;
  name: string;
  description?: string;
  tags?: string[];
  sections: PracticeSection[];
  creator?: string;
  user?: string;
  createdAt: string;
  updatedAt: string;
};

export type PracticePlanWithOutId = Omit<PracticePlan, "_id">;
export type PracticePlanPartialId = PartialBy<PracticePlan, "_id">;
export type PracticePlanCreateRequest = {
  name: string;
  description?: string;
  tags?: string[];
  sections?: PracticeSection[];
};

export default PracticePlan;