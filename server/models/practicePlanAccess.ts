// T031 PracticePlanAccess schema (skeleton)
import { model, Schema, Types } from "mongoose";

interface IPracticePlanAccess {
  user: Types.ObjectId;
  practicePlan: Types.ObjectId;
  access: "view" | "edit";
  createdAt: Date;
}

const PracticePlanAccessSchema = new Schema<IPracticePlanAccess>(
  {
    user: { type: Schema.Types.ObjectId, ref: "users", required: true },
    practicePlan: {
      type: Schema.Types.ObjectId,
      ref: "practiceplans",
      required: true,
    },
    access: { type: String, enum: ["view", "edit"], required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

PracticePlanAccessSchema.index({ user: 1, practicePlan: 1 }, { unique: true });
PracticePlanAccessSchema.index({ practicePlan: 1 });
PracticePlanAccessSchema.index({ user: 1 });

const PracticePlanAccess = model<IPracticePlanAccess>(
  "practiceplanAccesses",
  PracticePlanAccessSchema
);

export default PracticePlanAccess;
