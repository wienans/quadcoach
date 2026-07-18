import mongoose, { Types } from "mongoose";
const Schema = mongoose.Schema;

interface ITacticBoardFavorite {
  user: Types.ObjectId;
  tacticboard: Types.ObjectId;
  createdAt: Date;
}

const tacticBoardFavoriteSchema = new Schema<ITacticBoardFavorite>({
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
tacticBoardFavoriteSchema.index(
  { user: 1, tacticboard: 1 },
  { unique: true }
);

const TacticBoardFavorite = mongoose.model<ITacticBoardFavorite>(
  "tacticboardFavs",
  tacticBoardFavoriteSchema
);

export default TacticBoardFavorite;
