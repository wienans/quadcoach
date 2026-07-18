import mongoose, { Types } from "mongoose";
const Schema = mongoose.Schema;

interface ITacticBoardAccess {
  user: Types.ObjectId;
  tacticboard: Types.ObjectId;
  access: "view" | "edit";
  createdAt: Date;
}

const tacticBoardAccessSchema = new Schema<ITacticBoardAccess>({
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
tacticBoardAccessSchema.index({ user: 1, tacticboard: 1 }, { unique: true });

const TacticBoardAccess = mongoose.model<ITacticBoardAccess>(
  "tacticboardAccesses",
  tacticBoardAccessSchema
);

export default TacticBoardAccess;
