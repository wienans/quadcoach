import mongoose, { Types } from "mongoose";
const Schema = mongoose.Schema;

interface ITacticboardFav {
  user: Types.ObjectId;
  tacticboard: Types.ObjectId;
  createdAt: Date;
}

const tacticboardFavSchema = new Schema<ITacticboardFav>({
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create compound index to prevent duplicate favorites
tacticboardFavSchema.index({ user: 1, tacticboard: 1 }, { unique: true });

const TacticboardFav = mongoose.model<ITacticboardFav>(
  "tacticboardFavs",
  tacticboardFavSchema
);

export default TacticboardFav;
