import mongoose, { Types } from "mongoose";
const Schema = mongoose.Schema;

interface IExerciseAccess {
  user: Types.ObjectId;
  exercise: Types.ObjectId;
  createdAt: Date;
}

const exerciseAccessSchema = new Schema<IExerciseAccess>({
  user: {
    type: Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  exercise: {
    type: Schema.Types.ObjectId,
    ref: "exercises",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create compound index to prevent duplicate favorites
exerciseAccessSchema.index({ user: 1, exercise: 1 }, { unique: true });

const ExerciseAccess = mongoose.model<IExerciseAccess>(
  "exerciseAccesses",
  exerciseAccessSchema
);

export default ExerciseAccess;
