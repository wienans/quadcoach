import mongoose from "mongoose";
import {
  PracticePlanPublishMetadata,
  PracticePlanSectionInput,
  TacticBoardObjectInput,
  TacticBoardPageInput,
  TacticBoardPublishMetadata,
} from "../../shareLinks/mongoShareLinkAdapters";

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isOptional = <Value>(
  value: unknown,
  predicate: (candidate: unknown) => candidate is Value,
): value is Value | undefined => value === undefined || predicate(value);

const isString = (value: unknown): value is string => typeof value === "string";
const isNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);
const isBoolean = (value: unknown): value is boolean =>
  typeof value === "boolean";
const isObjectId = (
  value: unknown,
): value is string | mongoose.Types.ObjectId =>
  (typeof value === "string" && mongoose.isValidObjectId(value)) ||
  value instanceof mongoose.Types.ObjectId;
const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(isString);
const isNumberArray = (value: unknown): value is number[] =>
  Array.isArray(value) && value.every(isNumber);

const stringFields = [
  "uuid",
  "type",
  "fill",
  "stroke",
  "strokeLineCap",
  "strokeLineJoin",
  "backgroundColor",
  "text",
  "originX",
  "originY",
  "fontFamily",
  "textAlign",
  "objectType",
] as const;
const numberFields = [
  "left",
  "top",
  "x1",
  "y1",
  "x2",
  "y2",
  "width",
  "height",
  "strokeWidth",
  "strokeDashOffset",
  "strokeMiterLimit",
  "scaleX",
  "scaleY",
  "angle",
  "opacity",
  "radius",
  "startAngle",
  "endAngle",
  "fontSize",
] as const;

const isTacticBoardObjectInput = (
  value: unknown,
): value is TacticBoardObjectInput => {
  if (!isRecord(value)) return false;
  if (typeof value.type !== "string") return false;
  if (typeof value.left !== "number" || typeof value.top !== "number") {
    return false;
  }
  if (!stringFields.every((field) => isOptional(value[field], isString))) {
    return false;
  }
  if (!numberFields.every((field) => isOptional(value[field], isNumber))) {
    return false;
  }
  if (
    !isOptional(value.strokeDashArray, isNumberArray) ||
    !isOptional(value.strokeUniform, isBoolean) ||
    !isOptional(value.visible, isBoolean)
  ) {
    return false;
  }
  if (
    value.path !== undefined &&
    (!Array.isArray(value.path) ||
      !value.path.every(
        (part) =>
          Array.isArray(part) &&
          part.every((entry) => isString(entry) || isNumber(entry)),
      ))
  ) {
    return false;
  }
  return (
    value.objects === undefined ||
    (Array.isArray(value.objects) &&
      value.objects.every(isTacticBoardObjectInput))
  );
};

const isTacticBoardPageInput = (
  value: unknown,
): value is TacticBoardPageInput => {
  if (!isRecord(value) || !isOptional(value.version, isString)) return false;
  if (
    value.objects !== undefined &&
    (!Array.isArray(value.objects) ||
      !value.objects.every(isTacticBoardObjectInput))
  ) {
    return false;
  }
  if (value.backgroundImage === undefined) return true;
  if (!isRecord(value.backgroundImage)) return false;
  return (
    isOptional(value.backgroundImage.type, isString) &&
    isOptional(value.backgroundImage.width, isNumber) &&
    isOptional(value.backgroundImage.height, isNumber) &&
    isOptional(value.backgroundImage.src, isString)
  );
};

const isPracticePlanSectionInput = (
  value: unknown,
): value is PracticePlanSectionInput => {
  if (
    !isRecord(value) ||
    !isString(value.name) ||
    !isNumber(value.targetDuration) ||
    !Array.isArray(value.groups)
  ) {
    return false;
  }
  return value.groups.every(
    (group) =>
      isRecord(group) &&
      isString(group.name) &&
      Array.isArray(group.items) &&
      group.items.every(
        (item) =>
          isRecord(item) &&
          (item.kind === "exercise" || item.kind === "break") &&
          isOptional(item.description, isString) &&
          isOptional(item.duration, isNumber) &&
          isOptional(item.exerciseId, isObjectId) &&
          isOptional(item.blockId, isObjectId),
      ),
  );
};

export const parseTacticBoardPublishMetadata = (
  source: UnknownRecord,
): TacticBoardPublishMetadata | null => {
  if (
    !isOptional(source.name, isString) ||
    !isOptional(source.tags, isStringArray) ||
    !isOptional(source.creator, isString) ||
    !isOptional(source.description, isString) ||
    !isOptional(source.coaching_points, isString) ||
    (source.pages !== undefined &&
      (!Array.isArray(source.pages) ||
        !source.pages.every(isTacticBoardPageInput)))
  ) {
    return null;
  }
  return {
    name: source.name,
    tags: source.tags,
    pages: source.pages,
    creator: source.creator,
    description: source.description,
    coaching_points: source.coaching_points,
  };
};

export const parsePracticePlanPublishMetadata = (
  source: UnknownRecord,
): PracticePlanPublishMetadata | null => {
  if (
    !isOptional(source.name, isString) ||
    !isOptional(source.description, isString) ||
    !isOptional(source.tags, isStringArray) ||
    (source.sections !== undefined &&
      (!Array.isArray(source.sections) ||
        !source.sections.every(isPracticePlanSectionInput)))
  ) {
    return null;
  }
  return {
    name: source.name,
    description: source.description,
    tags: source.tags,
    sections: source.sections,
  };
};
