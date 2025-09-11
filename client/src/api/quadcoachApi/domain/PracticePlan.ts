export type PracticeSection = {
  id: string;
  name: string;
  order: number;
  playerGroups: PlayerGroup[];
};

export type PlayerGroup = {
  id: string;
  name: string;
  order: number;
  exerciseAssignments: ExerciseAssignment[];
};

export type ExerciseAssignment = {
  id: string;
  exerciseId: string;
  exerciseName: string;
  blockIds: string[]; // Which specific blocks from the exercise to use
  order: number;
};

type PracticePlan = {
  _id: string;
  name: string;
  description?: string;
  tags?: string[];
  sections: PracticeSection[];
  creator?: string;
  user?: string;
  createdAt?: string;
  updatedAt?: string;
};

export default PracticePlan;
export type PracticePlanWithOutId = Omit<PracticePlan, "_id">;
export type PracticePlanPartialId = Partial<PracticePlan> & { _id?: string };