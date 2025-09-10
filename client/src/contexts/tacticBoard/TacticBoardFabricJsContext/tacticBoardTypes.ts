/**
 * Unified type definitions for tactic board objects
 * This file consolidates TacticBoardObjectJson, FabricObjectData, and TacticsObject
 * into a single, comprehensive type system.
 */

// Base tactic board object - represents the serialized form of fabric.js objects
export interface TacticBoardObject {
  uuid: string; // Required for all tactic board objects
  type: string;
  left?: number;
  top?: number;
  width?: number;
  height?: number;
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
  objects?: TacticBoardObject[]; // Recursive for groups
  visible?: boolean;
  backgroundColor?: string;
  radius?: number;
  startAngle?: number;
  endAngle?: number;
  path?: string | [[string | number]]; // Support both formats
  text?: string;
  originX?: string;
  originY?: string;
  fontFamily?: string;
  fontSize?: number;
  textAlign?: string;
  objectType?: string;
  [key: string]: unknown; // Allow additional properties
}

// For objects that might not have a UUID yet (during creation/validation)
export interface PartialTacticBoardObject extends Omit<TacticBoardObject, 'uuid'> {
  uuid?: string;
}

// Background image type for tactic pages
export interface TacticBoardBackgroundImage {
  type: string;
  width: number;
  height: number;
  src: string;
}

// Complete tactic page structure
export interface TacticBoardPage {
  _id: string;
  version?: string;
  objects?: TacticBoardObject[];
  backgroundImage: TacticBoardBackgroundImage;
}

export type TacticBoardPageWithoutId = Omit<TacticBoardPage, "_id">;

// Type guards
export const hasTacticBoardUuid = (obj: unknown): obj is { uuid: string } => {
  return !!(
    obj &&
    typeof obj === "object" &&
    obj !== null &&
    "uuid" in obj &&
    typeof (obj as { uuid: unknown }).uuid === "string"
  );
};

export const isValidTacticBoardObject = (obj: unknown): obj is TacticBoardObject => {
  return !!(
    obj &&
    typeof obj === "object" &&
    obj !== null &&
    "type" in obj &&
    "uuid" in obj &&
    typeof (obj as { type: unknown }).type === "string" &&
    typeof (obj as { uuid: unknown }).uuid === "string"
  );
};

export const isPartialTacticBoardObject = (obj: unknown): obj is PartialTacticBoardObject => {
  return !!(
    obj &&
    typeof obj === "object" &&
    obj !== null &&
    "type" in obj &&
    typeof (obj as { type: unknown }).type === "string"
  );
};