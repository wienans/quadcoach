import { PartialBy } from "../../../helpers/typeHelpers";

// Domain Types (mirroring server model but adapted for client usage)
export type PracticePlanItemBreak = {
  _id: string;
  kind: "break";
  description: string;
  duration: number;
};

export type PracticePlanItemExercise = {
  _id: string;
  kind: "exercise";
  exerciseId: string;
  blockId: string;
  duration: number;
};

export type PracticePlanItem = PracticePlanItemBreak | PracticePlanItemExercise;

export type PracticePlanGroup = {
  _id: string;
  name: string;
  items: PracticePlanItem[];
};

export type PracticePlanSection = {
  _id: string;
  name: string;
  targetDuration: number;
  groups: PracticePlanGroup[];
};

export type PracticePlanEntity = {
  _id: string;
  name: string;
  description?: string;
  tags: string[];
  sections: PracticePlanSection[];
  user: string; // owner id
  isPrivate: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export default PracticePlanEntity;
export type PracticePlanEntityWithOutId = Omit<PracticePlanEntity, "_id">;

export type PracticePlanItemPartialId =
  | PartialBy<PracticePlanItemBreak, "_id">
  | PartialBy<PracticePlanItemExercise, "_id">;

export type PracticePlanGroupPartialId = {
  _id?: string;
  name: string;
  items: PracticePlanItemPartialId[];
};

export type PracticePlanSectionPartialId = {
  _id?: string;
  name: string;
  targetDuration: number;
  groups: PracticePlanGroupPartialId[];
};
export type PracticePlanEntityPartialId = {
  _id?: string;
  name: string;
  description?: string;
  tags: string[];
  sections: PracticePlanSectionPartialId[];
  user: string; // owner id
  isPrivate: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type PracticePlanHeader = {
  _id: string;
  name: string;
  description?: string;
  tags: string[];
  sections?: PracticePlanSection[];
  user: string;
  createdAt?: string;
  updatedAt?: string;
};
