import { fabric } from "fabric";
import { FabricObjectData, FabricObjectCreationError } from "./types";

export type ObjectCreator = (data: FabricObjectData) => fabric.Object | null;

export class FabricObjectFactory {
  private static creators: Map<string, ObjectCreator> = new Map();

  static {
    // Initialize creators in static block to avoid type issues
    this.creators.set('circle', (data) => new fabric.Circle(data as fabric.ICircleOptions));
    this.creators.set('rect', (data) => new fabric.Rect(data as fabric.IRectOptions));
    this.creators.set('path', (data) => {
      if (!data.path) return null;
      let pathString: string;
      if (Array.isArray(data.path)) {
        // Handle the [[string | number]] format from TacticsObject
        pathString = data.path.flat().join(' ');
      } else {
        pathString = data.path.toString();
      }
      return new fabric.Path(pathString, data as fabric.IPathOptions);
    });
    this.creators.set('text', (data) => {
      if (!data.text) return null;
      return new fabric.Text(data.text as string, data as fabric.ITextOptions);
    });
    this.creators.set('group', (data) => this.createGroupObject(data));
  }

  static createObject(data: FabricObjectData): fabric.Object | null {
    try {
      const creator = this.creators.get(data.type);
      if (!creator) {
        console.warn(`Unknown object type: ${data.type}`);
        return null;
      }
      
      const obj = creator(data);
      if (obj && data.uuid) {
        (obj as fabric.Object & { uuid?: string }).uuid = data.uuid;
      }
      
      return obj;
    } catch (error) {
      throw new FabricObjectCreationError(data.type, error as Error);
    }
  }

  private static createGroupObject(data: FabricObjectData): fabric.Group | null {
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