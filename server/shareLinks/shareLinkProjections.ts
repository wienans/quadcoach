import mongoose from "mongoose";

export interface SharedTacticBoardObject {
  uuid?: string;
  type: string;
  left: number;
  top: number;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  width?: number;
  height?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  strokeDashArray?: readonly number[];
  strokeLineCap?: string;
  strokeDashOffset?: number;
  strokeLineJoin?: string;
  strokeUniform?: boolean;
  strokeMiterLimit?: number;
  scaleX?: number;
  scaleY?: number;
  angle?: number;
  opacity?: number;
  objects?: readonly SharedTacticBoardObject[];
  visible?: boolean;
  backgroundColor?: string;
  radius?: number;
  startAngle?: number;
  endAngle?: number;
  path?: readonly (readonly (string | number)[])[];
  text?: string;
  originX?: string;
  originY?: string;
  fontFamily?: string;
  fontSize?: number;
  textAlign?: string;
  objectType?: string;
}

export interface SharedTacticBoardBackgroundImage {
  type?: string;
  width?: number;
  height?: number;
  src?: string;
}

export interface SharedTacticBoardPage {
  version?: string;
  objects?: readonly SharedTacticBoardObject[];
  backgroundImage?:
    | SharedTacticBoardBackgroundImage
    | readonly SharedTacticBoardBackgroundImage[];
}

export interface SharedTacticBoard {
  kind: "tacticBoard";
  name?: string;
  tags?: readonly string[];
  pages?: readonly SharedTacticBoardPage[];
  creator?: string;
  description?: string;
  coaching_points?: string;
}

export interface SharedPracticePlanItem {
  kind: "exercise" | "break";
  description?: string;
  exerciseId?: string;
  blockId?: string;
  duration?: number;
}

export interface SharedPracticePlanGroup {
  name: string;
  items: readonly SharedPracticePlanItem[];
}

export interface SharedPracticePlanSection {
  name: string;
  targetDuration: number;
  groups: readonly SharedPracticePlanGroup[];
}

export interface SharedPracticePlan {
  kind: "practicePlan";
  name: string;
  description?: string;
  tags: readonly string[];
  sections: readonly SharedPracticePlanSection[];
}

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const stringValue = (value: unknown): string | undefined =>
  typeof value === "string" ? value : undefined;

const numberValue = (value: unknown): number | undefined =>
  typeof value === "number" ? value : undefined;

const booleanValue = (value: unknown): boolean | undefined =>
  typeof value === "boolean" ? value : undefined;

const stringArray = (value: unknown): readonly string[] | undefined => {
  if (
    !Array.isArray(value) ||
    !value.every((item: unknown): item is string => typeof item === "string")
  ) {
    return undefined;
  }
  return value;
};

const numberArray = (value: unknown): readonly number[] | undefined => {
  if (
    !Array.isArray(value) ||
    !value.every((item: unknown): item is number => typeof item === "number")
  ) {
    return undefined;
  }
  return value;
};

const pathValue = (
  value: unknown,
): readonly (readonly (string | number)[])[] | undefined => {
  if (
    !Array.isArray(value) ||
    !value.every(
      (segment: unknown) =>
        Array.isArray(segment) &&
        segment.every(
          (item: unknown) =>
            typeof item === "string" || typeof item === "number",
        ),
    )
  ) {
    return undefined;
  }
  return value;
};

const objectIdValue = (value: unknown): string | undefined => {
  if (typeof value === "string") return value;
  return value instanceof mongoose.Types.ObjectId ? value.toString() : undefined;
};

const projectTacticBoardObject = (
  value: unknown,
): SharedTacticBoardObject | null => {
  if (!isRecord(value)) return null;
  const type = stringValue(value.type);
  const left = numberValue(value.left);
  const top = numberValue(value.top);
  if (type === undefined || left === undefined || top === undefined) return null;

  const projected: SharedTacticBoardObject = { type, left, top };
  const uuid = stringValue(value.uuid);
  const x1 = numberValue(value.x1);
  const y1 = numberValue(value.y1);
  const x2 = numberValue(value.x2);
  const y2 = numberValue(value.y2);
  const width = numberValue(value.width);
  const height = numberValue(value.height);
  const fill = stringValue(value.fill);
  const stroke = stringValue(value.stroke);
  const strokeWidth = numberValue(value.strokeWidth);
  const strokeDashArray = numberArray(value.strokeDashArray);
  const strokeLineCap = stringValue(value.strokeLineCap);
  const strokeDashOffset = numberValue(value.strokeDashOffset);
  const strokeLineJoin = stringValue(value.strokeLineJoin);
  const strokeUniform = booleanValue(value.strokeUniform);
  const strokeMiterLimit = numberValue(value.strokeMiterLimit);
  const scaleX = numberValue(value.scaleX);
  const scaleY = numberValue(value.scaleY);
  const angle = numberValue(value.angle);
  const opacity = numberValue(value.opacity);
  const visible = booleanValue(value.visible);
  const backgroundColor = stringValue(value.backgroundColor);
  const radius = numberValue(value.radius);
  const startAngle = numberValue(value.startAngle);
  const endAngle = numberValue(value.endAngle);
  const path = pathValue(value.path);
  const text = stringValue(value.text);
  const originX = stringValue(value.originX);
  const originY = stringValue(value.originY);
  const fontFamily = stringValue(value.fontFamily);
  const fontSize = numberValue(value.fontSize);
  const textAlign = stringValue(value.textAlign);
  const objectType = stringValue(value.objectType);

  if (uuid !== undefined) projected.uuid = uuid;
  if (x1 !== undefined) projected.x1 = x1;
  if (y1 !== undefined) projected.y1 = y1;
  if (x2 !== undefined) projected.x2 = x2;
  if (y2 !== undefined) projected.y2 = y2;
  if (width !== undefined) projected.width = width;
  if (height !== undefined) projected.height = height;
  if (fill !== undefined) projected.fill = fill;
  if (stroke !== undefined) projected.stroke = stroke;
  if (strokeWidth !== undefined) projected.strokeWidth = strokeWidth;
  if (strokeDashArray !== undefined) projected.strokeDashArray = strokeDashArray;
  if (strokeLineCap !== undefined) projected.strokeLineCap = strokeLineCap;
  if (strokeDashOffset !== undefined) projected.strokeDashOffset = strokeDashOffset;
  if (strokeLineJoin !== undefined) projected.strokeLineJoin = strokeLineJoin;
  if (strokeUniform !== undefined) projected.strokeUniform = strokeUniform;
  if (strokeMiterLimit !== undefined) projected.strokeMiterLimit = strokeMiterLimit;
  if (scaleX !== undefined) projected.scaleX = scaleX;
  if (scaleY !== undefined) projected.scaleY = scaleY;
  if (angle !== undefined) projected.angle = angle;
  if (opacity !== undefined) projected.opacity = opacity;
  if (visible !== undefined) projected.visible = visible;
  if (backgroundColor !== undefined) projected.backgroundColor = backgroundColor;
  if (radius !== undefined) projected.radius = radius;
  if (startAngle !== undefined) projected.startAngle = startAngle;
  if (endAngle !== undefined) projected.endAngle = endAngle;
  if (path !== undefined) projected.path = path;
  if (text !== undefined) projected.text = text;
  if (originX !== undefined) projected.originX = originX;
  if (originY !== undefined) projected.originY = originY;
  if (fontFamily !== undefined) projected.fontFamily = fontFamily;
  if (fontSize !== undefined) projected.fontSize = fontSize;
  if (textAlign !== undefined) projected.textAlign = textAlign;
  if (objectType !== undefined) projected.objectType = objectType;
  if (Array.isArray(value.objects)) {
    projected.objects = value.objects
      .map(projectTacticBoardObject)
      .filter((item): item is SharedTacticBoardObject => item !== null);
  }
  return projected;
};

const projectBackgroundImage = (
  value: unknown,
): SharedTacticBoardBackgroundImage | null => {
  if (!isRecord(value)) return null;
  const projected: SharedTacticBoardBackgroundImage = {};
  const type = stringValue(value.type);
  const width = numberValue(value.width);
  const height = numberValue(value.height);
  const src = stringValue(value.src);
  if (type !== undefined) projected.type = type;
  if (width !== undefined) projected.width = width;
  if (height !== undefined) projected.height = height;
  if (src !== undefined) projected.src = src;
  return projected;
};

const projectTacticBoardPage = (
  value: unknown,
): SharedTacticBoardPage | null => {
  if (!isRecord(value)) return null;
  const projected: SharedTacticBoardPage = {};
  const version = stringValue(value.version);
  if (version !== undefined) projected.version = version;
  if (Array.isArray(value.objects)) {
    projected.objects = value.objects
      .map(projectTacticBoardObject)
      .filter((item): item is SharedTacticBoardObject => item !== null);
  }
  if (Array.isArray(value.backgroundImage)) {
    projected.backgroundImage = value.backgroundImage
      .map(projectBackgroundImage)
      .filter(
        (item): item is SharedTacticBoardBackgroundImage => item !== null,
      );
  } else {
    const backgroundImage = projectBackgroundImage(value.backgroundImage);
    if (backgroundImage) projected.backgroundImage = backgroundImage;
  }
  return projected;
};

export const projectTacticBoard = (value: unknown): SharedTacticBoard | null => {
  if (!isRecord(value)) return null;
  const projected: SharedTacticBoard = { kind: "tacticBoard" };
  const name = stringValue(value.name);
  const tags = stringArray(value.tags);
  const creator = stringValue(value.creator);
  const description = stringValue(value.description);
  const coachingPoints = stringValue(value.coaching_points);
  if (name !== undefined) projected.name = name;
  if (tags !== undefined) projected.tags = tags;
  if (creator !== undefined) projected.creator = creator;
  if (description !== undefined) projected.description = description;
  if (coachingPoints !== undefined) projected.coaching_points = coachingPoints;
  if (Array.isArray(value.pages)) {
    projected.pages = value.pages
      .map(projectTacticBoardPage)
      .filter((page): page is SharedTacticBoardPage => page !== null);
  }
  return projected;
};

const projectPracticePlanItem = (
  value: unknown,
): SharedPracticePlanItem | null => {
  if (!isRecord(value) || (value.kind !== "exercise" && value.kind !== "break")) {
    return null;
  }
  const projected: SharedPracticePlanItem = { kind: value.kind };
  const description = stringValue(value.description);
  const exerciseId = objectIdValue(value.exerciseId);
  const blockId = objectIdValue(value.blockId);
  const duration = numberValue(value.duration);
  if (description !== undefined) projected.description = description;
  if (exerciseId !== undefined) projected.exerciseId = exerciseId;
  if (blockId !== undefined) projected.blockId = blockId;
  if (duration !== undefined) projected.duration = duration;
  return projected;
};

const projectPracticePlanGroup = (
  value: unknown,
): SharedPracticePlanGroup | null => {
  if (!isRecord(value)) return null;
  const name = stringValue(value.name);
  if (name === undefined) return null;
  return {
    name,
    items: Array.isArray(value.items)
      ? value.items
          .map(projectPracticePlanItem)
          .filter((item): item is SharedPracticePlanItem => item !== null)
      : [],
  };
};

const projectPracticePlanSection = (
  value: unknown,
): SharedPracticePlanSection | null => {
  if (!isRecord(value)) return null;
  const name = stringValue(value.name);
  const targetDuration = numberValue(value.targetDuration);
  if (name === undefined || targetDuration === undefined) return null;
  return {
    name,
    targetDuration,
    groups: Array.isArray(value.groups)
      ? value.groups
          .map(projectPracticePlanGroup)
          .filter((group): group is SharedPracticePlanGroup => group !== null)
      : [],
  };
};

export const projectPracticePlan = (
  value: unknown,
): SharedPracticePlan | null => {
  if (!isRecord(value)) return null;
  const name = stringValue(value.name);
  if (name === undefined) return null;
  const projected: SharedPracticePlan = {
    kind: "practicePlan",
    name,
    tags: stringArray(value.tags) ?? [],
    sections: Array.isArray(value.sections)
      ? value.sections
          .map(projectPracticePlanSection)
          .filter(
            (section): section is SharedPracticePlanSection => section !== null,
          )
      : [],
  };
  const description = stringValue(value.description);
  if (description !== undefined) projected.description = description;
  return projected;
};
