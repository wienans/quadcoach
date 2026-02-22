import { Schema, model, Types, Document } from "mongoose";

// Interfaces for each schema

export interface IExerciseItem {
  kind: "exercise" | "break";
  description?: string;
  exerciseId?: Types.ObjectId;
  blockId?: Types.ObjectId;
  duration?: number;
}

export interface IGroup {
  name: string;
  items: Types.DocumentArray<IExerciseItem>;
}

export interface ISection {
  name: string;
  targetDuration: number;
  groups: Types.DocumentArray<IGroup>;
}

export interface IPracticePlan {
  name: string;
  description?: string;
  tags: Types.Array<string>;
  sections: Types.DocumentArray<ISection>;
  user: Types.ObjectId;
  isPrivate: boolean;
  shareToken?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const ExerciseItemSchema = new Schema<IExerciseItem>(
  {
    kind: { type: String, enum: ["exercise", "break"], required: true },
    description: { type: String },
    exerciseId: { type: Schema.Types.ObjectId, ref: "exercises" },
    blockId: { type: Schema.Types.ObjectId, ref: "blocks" },
    duration: { type: Number, min: 0 },
  },
  { _id: true },
);

const GroupSchema = new Schema<IGroup>(
  {
    name: { type: String, required: true },
    items: { type: [ExerciseItemSchema], default: [], required: true },
  },
  { _id: true },
);

export const SectionSchema = new Schema<ISection>(
  {
    name: { type: String, required: true },
    targetDuration: { type: Number, min: 0, default: 0, required: true },
    groups: { type: [GroupSchema], default: [], required: true },
  },
  { _id: true },
);

const PracticePlanSchema = new Schema<IPracticePlan>(
  {
    name: { type: String, required: true },
    description: { type: String },
    tags: { type: [String], default: [] },
    sections: { type: [SectionSchema], default: [] },
    user: { type: Schema.Types.ObjectId, ref: "users", required: true },
    isPrivate: { type: Boolean, default: false, required: true },
    shareToken: { type: String, default: null },
  },
  { timestamps: true },
);

PracticePlanSchema.index({ shareToken: 1 }, { unique: true, sparse: true });

export const PracticePlan = model<IPracticePlan>(
  "practiceplans",
  PracticePlanSchema,
);
