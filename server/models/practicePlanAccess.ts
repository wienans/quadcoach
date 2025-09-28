// T031 PracticePlanAccess schema (skeleton)
import { Schema, model, Types } from 'mongoose';

const PracticePlanAccessSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: 'User', required: true },
    practicePlan: { type: Types.ObjectId, ref: 'PracticePlan', required: true },
    access: { type: String, enum: ['view', 'edit'], required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

PracticePlanAccessSchema.index({ user: 1, practicePlan: 1 }, { unique: true });
PracticePlanAccessSchema.index({ practicePlan: 1 });
PracticePlanAccessSchema.index({ user: 1 });

export const PracticePlanAccess = model('PracticePlanAccess', PracticePlanAccessSchema);
