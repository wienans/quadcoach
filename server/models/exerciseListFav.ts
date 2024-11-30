import mongoose, { Types } from "mongoose";
const Schema = mongoose.Schema;

interface IExerciseListFav {
  user: Types.ObjectId;
  exerciseList: Types.ObjectId;
  createdAt: Date;
}

const exerciseListFavSchema = new Schema<IExerciseListFav>({
  user: {
    type: Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  exerciseList: {
    type: Schema.Types.ObjectId,
    ref: "exerciseLists",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create compound index to prevent duplicate favorites
exerciseListFavSchema.index({ user: 1, exerciseList: 1 }, { unique: true });

const ExerciseListFav = mongoose.model<IExerciseListFav>(
  "exerciseListFavs",
  exerciseListFavSchema
);

export default ExerciseListFav;
