import { fabric } from "fabric";
import { FabricObjectCreationError } from "./types";
import { PartialTacticBoardObject } from "./tacticBoardTypes";
import { setUuid } from "./fabricTypes";

export type ObjectCreator = (data: PartialTacticBoardObject) => fabric.Object | null;

export class FabricObjectFactory {
  private static creators: Map<string, ObjectCreator> = new Map();

  static {
    // Initialize creators in static block to avoid type issues
    this.creators.set("circle", (data) => {
      const options = { ...data } as fabric.ICircleOptions;
      delete (options as fabric.ICircleOptions & { type?: string }).type; // Remove type property to avoid fabric.js issues
      return new fabric.Circle(options);
    });

    this.creators.set("rect", (data) => {
      const options = { ...data } as fabric.IRectOptions;
      delete (options as fabric.IRectOptions & { type?: string }).type;
      return new fabric.Rect(options);
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
      const options = { ...data } as fabric.IPathOptions;
      delete (options as fabric.IPathOptions & { type?: string }).type;
      delete (
        options as fabric.IPathOptions & { path?: string | [[string | number]] }
      ).path;
      return new fabric.Path(pathString, options);
    });

    this.creators.set("text", (data) => {
      if (!data.text) return null;
      const options = { ...data } as fabric.ITextOptions;
      delete (options as fabric.ITextOptions & { type?: string }).type;
      const text = (options as fabric.ITextOptions & { text?: string })
        .text as string;
      delete (options as fabric.ITextOptions & { text?: string }).text;
      return new fabric.Text(text, options);
    });

    this.creators.set("textbox", (data) => {
      const options = { ...data } as fabric.ITextboxOptions;
      delete (options as fabric.ITextboxOptions & { type?: string }).type;
      const text = (options as fabric.ITextboxOptions & { text?: string }).text;
      delete (options as fabric.ITextboxOptions & { text?: string }).text;
      return new fabric.Textbox(text ?? "", options);
    });

    this.creators.set("line", (data) => {
      const lineData = data as unknown as {
        x1: number;
        y1: number;
        x2: number;
        y2: number;
      };
      const options = { ...data } as fabric.ILineOptions;
      delete (options as fabric.ILineOptions & { type?: string }).type;
      return new fabric.Line([lineData.x1, lineData.y1, lineData.x2, lineData.y2], options);
    });

    this.creators.set("triangle", (data) => {
      const options = { ...data } as fabric.ITriangleOptions;
      delete (options as fabric.ITriangleOptions & { type?: string }).type;
      return new fabric.Triangle(options);
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

    return new fabric.Group(objects, data as fabric.IGroupOptions);
  }

  static registerCreator(type: string, creator: ObjectCreator): void {
    this.creators.set(type, creator);
  }

  static getSupportedTypes(): string[] {
    return Array.from(this.creators.keys());
  }
}
