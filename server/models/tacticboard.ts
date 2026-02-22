import { Schema, model, Types } from "mongoose";

interface IObject {
  uuid?: string; // Generated UUID v4
  type: string;
  left: number;
  top: number;
  width: number;
  height: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  strokeDashArray?: Types.Array<number>;
  strokeLineCap?: string;
  strokeDashOffset?: number;
  strokeLineJoin?: string;
  strokeUniform?: boolean;
  strokeMiterLimit?: number;
  scaleX?: number;
  scaleY?: number;
  angle?: number;
  opacity?: number;
  objects?: Types.Array<IObject>;
  visible?: boolean;
  backgroundColor?: string;
  radius?: number;
  startAngle?: number;
  endAngle?: number;
  path?: Types.Array<Types.Array<string | number>>;
  text?: string;
  originX?: string;
  originY?: string;
  fontFamily?: string;
  fontSize?: number;
  textAlign?: string;
  objectType?: string;
}
interface IBackgroundImage {
  type: string;
  width: number;
  height: number;
  src: string;
}
interface ITacticPage {
  version?: string;
  objects?: Types.Array<IObject>;
  backgroundImage?: Types.Array<IBackgroundImage>;
}
export interface ITacticBoard {
  name?: string;
  isPrivate?: boolean;
  tags?: Types.Array<string>;
  creator?: string;
  user?: Types.ObjectId;
  pages?: Types.Array<ITacticPage>;
  description?: string;
  coaching_points?: string;
  shareToken?: string | null;
}

const objectSchema = new Schema<IObject>({
  uuid: {
    type: String,
  },
  type: {
    type: String,
    required: true,
  },
  left: {
    type: Number,
    required: true,
  },
  top: {
    type: Number,
    required: true,
  },
  width: {
    type: Number,
  },
  height: {
    type: Number,
  },
  fill: {
    type: String,
  },
  stroke: {
    type: String,
  },
  strokeWidth: {
    type: Number,
  },
  strokeDashArray: {
    type: [Number],
  },
  strokeLineCap: {
    type: String,
  },
  strokeDashOffset: {
    type: Number,
  },
  strokeLineJoin: {
    type: String,
  },
  strokeUniform: {
    type: Boolean,
  },
  strokeMiterLimit: {
    type: Number,
  },
  scaleX: {
    type: Number,
  },
  scaleY: {
    type: Number,
  },
  angle: {
    type: Number,
  },
  opacity: {
    type: Number,
  },
  objects: {
    type: [],
  },
  visible: {
    type: Boolean,
  },
  backgroundColor: {
    type: String,
  },
  radius: {
    type: Number,
  },
  startAngle: {
    type: Number,
  },
  endAngle: {
    type: Number,
  },
  path: {
    type: [[]],
  },
  text: {
    type: String,
  },
  originX: {
    type: String,
  },
  originY: {
    type: String,
  },
  fontFamily: {
    type: String,
  },
  fontSize: {
    type: Number,
  },
  textAlign: {
    type: String,
  },
  objectType: {
    type: String,
  },
});
const backImgSchema = new Schema<IBackgroundImage>({
  type: {
    type: String,
  },
  width: {
    type: Number,
  },
  height: {
    type: Number,
  },
  src: {
    type: String,
  },
});
const pagesSchema = new Schema<ITacticPage>({
  version: {
    type: String,
  },
  objects: {
    type: [objectSchema],
  },
  backgroundImage: {
    type: backImgSchema,
  },
});
const tacticBoardSchema = new Schema<ITacticBoard>(
  {
    name: {
      type: String,
      // required: true,
    },
    isPrivate: {
      type: Boolean,
    },
    tags: {
      type: [String],
    },
    pages: {
      type: [pagesSchema],
    },
    creator: {
      type: String,
    },
    user: {
      type: Types.ObjectId,
      ref: "users",
    },
    description: {
      type: String,
    },
    coaching_points: {
      type: String,
    },
    shareToken: {
      type: String,
      default: undefined,
    },
  },
  { timestamps: true },
);

tacticBoardSchema.index(
  { shareToken: 1 },
  {
    unique: true,
    partialFilterExpression: { shareToken: { $type: "string" } },
  },
);

const TacticBoard = model<ITacticBoard>("tacticboards", tacticBoardSchema);

export default TacticBoard;
