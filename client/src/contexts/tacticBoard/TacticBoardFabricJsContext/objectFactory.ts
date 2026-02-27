import * as fabric from "fabric";
import { FabricObjectCreationError } from "./types";
import { PartialTacticBoardObject } from "./tacticBoardTypes";
import { setUuid } from "./fabricTypes";

export type ObjectCreator = (data: PartialTacticBoardObject) => fabric.Object | null;

type ObjectLike = Partial<Record<string, unknown>>;

export class FabricObjectFactory {
  private static creators: Map<string, ObjectCreator> = new Map();

  static {
    // Initialize creators in static block to avoid type issues
    this.creators.set("circle", (data) => {
      const options: ObjectLike = { ...data };
      delete options.type; // Remove type property to avoid fabric.js issues
      return new fabric.Circle(options as Partial<fabric.CircleProps>);
    });

    this.creators.set("rect", (data) => {
      const options: ObjectLike = { ...data };
      delete options.type;
      return new fabric.Rect(options as Partial<fabric.RectProps>);
    });

    this.creators.set("path", (data) => {
      if (!data.path) return null;
      let pathString: string;
      if (Array.isArray(data.path)) {
        // Handle the [[string | number]] format from TacticsObject
        pathString = data.path.flat().join(" ");
      } else {
        pathString = data.path.toString();
      }
      const options: ObjectLike = { ...data };
      delete options.type;
      delete options.path;
      return new fabric.Path(pathString, options as Partial<fabric.PathProps>);
    });

    this.creators.set("text", (data) => {
      if (!data.text) return null;
      const options: ObjectLike = { ...data };
      delete options.type;
      const text = options.text as string;
      delete options.text;
      return new fabric.Text(text, options as Partial<fabric.TextProps>);
    });

    this.creators.set("textbox", (data) => {
      const options: ObjectLike = { ...data };
      delete options.type;
      const text = options.text as string | undefined;
      delete options.text;
      return new fabric.Textbox(text ?? "", options as Partial<fabric.TextboxProps>);
    });

    this.creators.set("line", (data) => {
      const lineData = data as unknown as {
        x1: number;
        y1: number;
        x2: number;
        y2: number;
      };
      const options: ObjectLike = { ...data };
      delete options.type;
      return new fabric.Line(
        [lineData.x1, lineData.y1, lineData.x2, lineData.y2],
        options as Partial<fabric.FabricObjectProps>,
      );
    });

    this.creators.set("triangle", (data) => {
      const options: ObjectLike = { ...data };
      delete options.type;
      return new fabric.Triangle(options as Partial<fabric.FabricObjectProps>);
    });

    this.creators.set("group", (data) => this.createGroupObject(data));
  }

  static createObject(data: PartialTacticBoardObject): fabric.Object | null {
    try {
      if (!data.type || typeof data.type !== 'string') {
        console.warn('Invalid object type:', data.type);
        return null;
      }
      
      const creator = this.creators.get(data.type);
      if (!creator) {
        console.warn(`Unknown object type: ${data.type}`);
        return null;
      }

      const obj = creator(data);
      if (obj && data.uuid) {
        setUuid(obj, data.uuid);
      }

      return obj;
    } catch (error) {
      throw new FabricObjectCreationError(typeof data.type === 'string' ? data.type : 'unknown', error as Error);
    }
  }

  private static createGroupObject(
    data: PartialTacticBoardObject,
  ): fabric.Group | null {
    if (!data.objects || !Array.isArray(data.objects)) {
      return null;
    }

    const objects: fabric.Object[] = [];

    for (const objData of data.objects) {
      const obj = this.createObject(objData);
      if (obj) {
        objects.push(obj);
      }
    }

    if (objects.length === 0) {
      return null;
    }

    const { objects: originalObjects, ...groupData } = data;
    void originalObjects;
    return new fabric.Group(objects, groupData as Partial<fabric.GroupProps>);
  }

  static registerCreator(type: string, creator: ObjectCreator): void {
    this.creators.set(type, creator);
  }

  static getSupportedTypes(): string[] {
    return Array.from(this.creators.keys());
  }
}
