type TacticsBackImg = {
  type: string;
  width: number;
  height: number;
  src: string;
};
type TacticsObject = {
  uuid: string; // Generated UUID v4
  type: string;
  left: number;
  top: number;
  width: number;
  height: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  strokeDashArray?: number[];
  strokeLineCap?: string;
  strokeDashOffset?: number;
  strokeLineJoin?: string;
  strokeUniform?: boolean;
  strokeMiterLimit?: number;
  scaleX?: number;
  scaleY?: number;
  angle?: number;
  opacity?: number;
  visible?: boolean;
  backgroundColor?: string;
  radius?: number;
  startAngle?: number;
  endAngle?: number;
  path?: [[string | number]];
};

type TacticPage = {
  version?: string;
  objects?: TacticsObject[];
  backgroundImage?: TacticsBackImg;
};

export default TacticPage;