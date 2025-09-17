import { fabric } from "fabric";
import { v4 } from "uuid";

export enum ObjectType {
  Person = "Person",
}

export enum PersonType {
  Seeker = "Seeker",
  Beater = "Beater",
  Chaser = "Chaser",
  Keeper = "Keeper",
}

export enum BallType {
  Volleyball = "Volleyball",
  Dodgeball = "Dodgeball",
  FlagRunner = "FlagRunner",
  Bludger = "Bludger",
  Quaffle = "Quaffle",
}

export enum AccessoryType {
  RedCone = "RedCone",
  YellowCone = "YellowCone",
  BlueCone = "BlueCone",
  Hoop = "Hoop",
  Ladder = "Ladder",
  Hurdle = "Hurdle",
}

// Enhanced TypeScript definitions for fabric.js extensions
declare module "fabric/fabric-impl" {
  export interface IObjectOptions {
    id?: string;
    objectType?: ObjectType | string;
    uuid?: string;
  }

  export interface Object {
    id?: string;
    objectType?: ObjectType | string;
    uuid?: string;
  }

  export interface Canvas {
    freeDrawingBrush: {
      color: string;
      width: number;
      strokeDashArray?: number[] | null;
    } & fabric.BaseBrush;
  }
}

// Re-export unified types for backward compatibility
export type { 
  TacticBoardObject as FabricObjectData,
  PartialTacticBoardObject,
  TacticBoardPage,
  TacticBoardPageWithoutId,
  TacticBoardBackgroundImage
} from './tacticBoardTypes';

export type { TacticBoardObject as TacticPageObject } from './tacticBoardTypes';

// Error types for better error handling
export class FabricObjectCreationError extends Error {
  public cause?: Error;

  constructor(objectType: string, originalError?: Error) {
    super(`Failed to create fabric object of type: ${objectType}`);
    this.name = "FabricObjectCreationError";
    if (originalError) {
      this.cause = originalError;
    }
  }
}

export class CanvasOperationError extends Error {
  public cause?: Error;

  constructor(operation: string, originalError?: Error) {
    super(`Canvas operation failed: ${operation}`);
    this.name = "CanvasOperationError";
    if (originalError) {
      this.cause = originalError;
    }
  }
}

// export const isExtendedFabricObject = <T>(
//   object: ExtendedFabricObject | T,
// ): object is ExtendedFabricObject => {
//   return (object as ExtendedFabricObject).id !== undefined;
// };

export interface Team {
  name: string;
  color: string;
}

export interface PersonObjectOptions {
  personType: PersonType;
  name: string;
  left: number;
  top: number;
  headbandColor: string;
  team: Team;
}

export interface PersonObjecctElements {
  circleId: string;
  textId: string;
  personId: string;
}

const PersonCircleRadius = 15;
const PersonCircleStrokeWidth = 3;
const PersonCircleTextDistance = 16;

export class PersonObject extends fabric.Group {
  public personOptions: Omit<PersonObjectOptions, "left" | "top">;
  public personElements: PersonObjecctElements;

  constructor(options: PersonObjectOptions) {
    const { left, top, ...personOptions } = options;
    const { headbandColor, team, name } = personOptions;

    const personCircleId = v4();
    const personCircle = new fabric.Circle({
      radius: PersonCircleRadius,
      left,
      top,
      stroke: headbandColor,
      strokeWidth: PersonCircleStrokeWidth,
      fill: team.color,
      id: personCircleId,
    });

    const personTextId = v4();
    const personText = new fabric.Text(name, {
      left,
      top: top + PersonCircleTextDistance,
      fontFamily: "Arial",
      fontSize: 20,
      textAlign: "center",
      originX: "center",
      originY: "center",
      id: personTextId,
    });

    const personId = v4();
    super([personCircle, personText], { id: personId });

    this.personOptions = personOptions;
    this.personElements = {
      circleId: personCircleId,
      textId: personTextId,
      personId,
    };
  }
}
