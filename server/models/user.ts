import mongoose from "mongoose";
const Schema = mongoose.Schema;

interface IUser {
  name: string;
  email: string;
  password: string;
  roles: string[];
  active: boolean;
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
});

const User = mongoose.model<IUser>("users", userSchema);

export default User;
