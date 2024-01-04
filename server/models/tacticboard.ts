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
  playerANumbers?: number[];
  playerBNumbers?: number[];
}
interface ITacticBoard {
  name?: string;
  isPrivate?: boolean;
  tags?: Types.Array<string>;
  creator?: string;
  pages?: Types.Array<ITacticPage>;
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
    required: true,
  },
  height: {
    type: Number,
    required: true,
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
  playerANumbers: {
    type: [Number],
  },
  playerBNumbers: {
    type: [Number],
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
  },
  { timestamps: true }
);

const TacticBoard = model<ITacticBoard>("tacticBoards", tacticBoardSchema);

export default TacticBoard;
