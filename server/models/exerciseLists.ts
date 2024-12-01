import { Schema, model, Types } from "mongoose";

interface IExerciseList {
  name: string;
  time_min?: number;
  personsMin?: number;
  personsMax?: number;
  tags?: Types.Array<string>;
  users?: Types.Array<Types.ObjectId>;
  description?: string;
}

const exerciseListSchema = new Schema<IExerciseList>(
  {
    name: {
      type: String,
      required: true,
    },
    time_min: {
      type: Number,
    },
    personsMin: {
      type: Number,
    },
    personsMax: {
      type: Number,
    },
    tags: {
      type: [String],
    },
    users: {
      type: [Types.ObjectId],
      ref: "users",
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

const ExerciseList = model<IExerciseList>("exerciseLists", exerciseListSchema);

export default ExerciseList;
