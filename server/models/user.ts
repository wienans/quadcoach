import mongoose, { Types } from "mongoose";
const Schema = mongoose.Schema;

interface IUser {
  name: string;
  email: string;
  password: string;
  roles?: string[];
  active?: boolean;
  isVerified?: boolean;
  emailToken?: string;
  passwordResetToken?: string;
  exerciseLists?: Types.ObjectId[];
  favoriteExercises?: Types.ObjectId[];
  favoriteTacticboards?: Types.ObjectId[];
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  roles: {
    type: [String],
    default: ["user"],
  },
  active: {
    type: Boolean,
    default: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  emailToken: {
    type: String,
  },
  passwordResetToken: {
    type: String,
  },
  exerciseLists: {
    type: [Types.ObjectId],
    ref: "exerciseLists",
  },
  favoriteExercises: {
    type: [Types.ObjectId],
    ref: "exercises",
  },
  favoriteTacticboards: {
    type: [Types.ObjectId],
    ref: "tacticboards",
  },
});

const User = mongoose.model<IUser>("users", userSchema);

export default User;
