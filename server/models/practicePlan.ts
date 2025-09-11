import { Schema, model, Types } from "mongoose";

interface IExerciseBlockRef {
  exerciseId: Types.ObjectId;
  blockId: string; // reference to specific block within exercise  
  order: number;
}

interface IPlayerGroup {
  name: string;
  order: number;
  exerciseBlocks: Types.Array<IExerciseBlockRef>;
}

interface IPracticeSection {
  name: string;
  order: number;
  playerGroups: Types.Array<IPlayerGroup>;
}

export interface IPracticePlan {
  name: string;
  description?: string;
  tags?: Types.Array<string>;
  sections: Types.Array<IPracticeSection>;
  creator?: string;
  user?: Types.ObjectId;
}

const exerciseBlockRefSchema = new Schema<IExerciseBlockRef>({
  exerciseId: {
    type: Schema.Types.ObjectId,
    ref: "exercises",
    required: true,
  },
  blockId: {
    type: String,
    required: true,
  },
  order: {
    type: Number,
    required: true,
    default: 0,
  },
});

const playerGroupSchema = new Schema<IPlayerGroup>({
  name: {
    type: String,
    required: true,
  },
  order: {
    type: Number,
    required: true,
    default: 0,
  },
  exerciseBlocks: {
    type: [exerciseBlockRefSchema],
    default: [],
  },
});

const practiceSectionSchema = new Schema<IPracticeSection>({
  name: {
    type: String,
    required: true,
  },
  order: {
    type: Number,
    required: true,
    default: 0,
  },
  playerGroups: {
    type: [playerGroupSchema],
    default: [],
  },
});

const practicePlanSchema = new Schema<IPracticePlan>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    tags: {
      type: [String],
      default: [],
    },
    sections: {
      type: [practiceSectionSchema],
      default: [],
    },
    creator: {
      type: String,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
  },
  { timestamps: true }
);

const PracticePlan = model<IPracticePlan>("practicePlans", practicePlanSchema);

export default PracticePlan;