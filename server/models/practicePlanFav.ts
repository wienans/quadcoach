import mongoose, { Types } from "mongoose";
const Schema = mongoose.Schema;

interface IPracticePlanFav {
  user: Types.ObjectId;
  practicePlan: Types.ObjectId;
  createdAt: Date;
}

const practicePlanFavSchema = new Schema<IPracticePlanFav>({
  user: {
    type: Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  practicePlan: {
    type: Schema.Types.ObjectId,
    ref: "practicePlans",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create compound index to prevent duplicate favorites
practicePlanFavSchema.index({ user: 1, practicePlan: 1 }, { unique: true });

const PracticePlanFav = mongoose.model<IPracticePlanFav>(
  "practicePlanFavs",
  practicePlanFavSchema
);

export default PracticePlanFav;
