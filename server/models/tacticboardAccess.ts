import mongoose, { Types } from "mongoose";
const Schema = mongoose.Schema;

interface ITacticboardAccess {
  user: Types.ObjectId;
  tacticboard: Types.ObjectId;
  access: "view" | "edit";
  createdAt: Date;
}

const tacticboardAccessSchema = new Schema<ITacticboardAccess>({
  user: {
    type: Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  tacticboard: {
    type: Schema.Types.ObjectId,
    ref: "tacticboards",
    required: true,
  },
  access: {
    type: String,
    enum: ["view", "edit"],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create compound index to prevent duplicate favorites
tacticboardAccessSchema.index({ user: 1, tacticboard: 1 }, { unique: true });

const TacticboardAccess = mongoose.model<ITacticboardAccess>(
  "tacticboardAccesses",
  tacticboardAccessSchema
);

export default TacticboardAccess;
