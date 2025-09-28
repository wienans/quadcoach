// T030 PracticePlan schema (skeleton)
import { Schema, model, Types } from 'mongoose';

// Embedded subdocuments (minimal now; will expand during implementation tasks T035+)
const BreakItemSchema = new Schema({
  id: { type: String, required: true },
  kind: { type: String, enum: ['break'], required: true },
  name: { type: String, required: true },
  duration: { type: Number, min: 0, required: true },
});

const ExerciseItemSchema = new Schema({
  id: { type: String, required: true },
  kind: { type: String, enum: ['exercise'], required: true },
  exerciseId: { type: Types.ObjectId, ref: 'Exercise', required: true },
  durationOverride: { type: Number, min: 0 },
});

const ItemUnion = new Schema(
  {},
  { discriminatorKey: 'kind', _id: false, strict: false }
);

const GroupSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  items: { type: [ItemUnion], default: [] },
});

const SectionSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  targetDuration: { type: Number, min: 0, default: 0 },
  groups: { type: [GroupSchema], default: [] },
});

const PracticePlanSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    tags: { type: [String], default: [] },
    sections: { type: [SectionSchema], default: [] },
    user: { type: Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const PracticePlan = model('PracticePlan', PracticePlanSchema);
