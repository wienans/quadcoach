import mongoose, { Types } from "mongoose";
const Schema = mongoose.Schema;

interface IExerciseFav {
  user: Types.ObjectId;
  exercise: Types.ObjectId;
  createdAt: Date;
}

const exerciseFavSchema = new Schema<IExerciseFav>({
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
exerciseFavSchema.index({ user: 1, exercise: 1 }, { unique: true });

const ExerciseFav = mongoose.model<IExerciseFav>(
  "exerciseFavs",
  exerciseFavSchema
);

export default ExerciseFav;
