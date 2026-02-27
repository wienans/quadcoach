import * as fabric from "fabric";
import { ObjectType } from "./types";

// Type aliases for fabric objects with our custom properties
export type FabricObjectWithUuid = fabric.Object & {
  uuid?: string;
  objectType?: ObjectType | string;
};
export type FabricGroupWithUuid = fabric.Group & {
  uuid?: string;
  objectType?: ObjectType | string;
};
export type FabricCircleWithUuid = fabric.Circle & {
  uuid?: string;
  objectType?: ObjectType | string;
};
export type FabricTextWithUuid = fabric.Text & {
  uuid?: string;
  objectType?: ObjectType | string;
};

// Extended brush type for drawing
export type ExtendedBaseBrush = fabric.BaseBrush & {
  strokeDashArray?: number[] | null;
};

// Type guards
export const hasUuid = (obj: unknown): obj is { uuid: string } => {
  return !!(
    obj &&
    typeof obj === "object" &&
    obj !== null &&
    "uuid" in obj &&
    typeof (obj as { uuid: unknown }).uuid === "string"
  );
};

// Re-export unified types
export type { 
  TacticBoardObject,
  PartialTacticBoardObject,
  TacticBoardObject as TacticBoardObjectJson
} from './tacticBoardTypes';

// Helper functions for type-safe object creation
export const createExtendedCircle = (
  options: Partial<fabric.CircleProps>,
): FabricCircleWithUuid => {
  return new fabric.Circle(options) as FabricCircleWithUuid;
};

export const createExtendedText = (
  text: string,
  options: Partial<fabric.TextProps>,
): FabricTextWithUuid => {
  return new fabric.Text(text, options) as FabricTextWithUuid;
};

export const createExtendedGroup = (
  objects: fabric.Object[],
  options: Partial<fabric.GroupProps>,
): FabricGroupWithUuid => {
  return new fabric.Group(objects, options) as FabricGroupWithUuid;
};

// Type-safe property setters
export const setUuid = (obj: fabric.Object, uuid: string): void => {
  (obj as FabricObjectWithUuid).uuid = uuid;
};

export const setObjectType = (
  obj: fabric.Object,
  objectType: ObjectType | string,
): void => {
  (obj as FabricObjectWithUuid).objectType = objectType;
};

export const getUuid = (obj: fabric.Object): string | undefined => {
  return (obj as FabricObjectWithUuid).uuid;
};

export const getObjectType = (
  obj: fabric.Object,
): ObjectType | string | undefined => {
  return (obj as FabricObjectWithUuid).objectType;
};
