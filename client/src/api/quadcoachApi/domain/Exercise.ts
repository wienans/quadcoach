import { PartialBy } from "../../../helpers/typeHelpers";
import Block from "./Block";

export type ExerciseHeader = {
  _id: string;
  name?: string;
  tags?: string[];
  creator?: string;
  user?: string;
};

type Exercise = {
  _id: string;
  name: string;
  materials?: string[];
  time_min: number;
  beaters: number;
  chasers: number;
  persons: number;
  tags?: string[];
  coaching_points?: string; // unused for block model only backwards compatible
  creator?: string;
  user?: string;
  description_blocks: Block[];
  related_to?: string[];
};

export default Exercise;
export type ExerciseWithOutId = Omit<Exercise, "_id">;
export type ExercisePartialId = PartialBy<Exercise, "_id">;
