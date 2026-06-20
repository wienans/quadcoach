import * as fabric from "fabric";
import { FabricObjectCreationError } from "./types";
import { PartialTacticBoardObject } from "./tacticBoardTypes";
import { setUuid } from "./fabricTypes";

type CircleOptions = ConstructorParameters<typeof fabric.Circle>[0];
type RectOptions = ConstructorParameters<typeof fabric.Rect>[0];
type PathOptions = ConstructorParameters<typeof fabric.Path>[1];
type TextOptions = ConstructorParameters<typeof fabric.Text>[1];
type TextboxOptions = ConstructorParameters<typeof fabric.Textbox>[1];
type LineOptions = ConstructorParameters<typeof fabric.Line>[1];
type TriangleOptions = ConstructorParameters<typeof fabric.Triangle>[0];
type GroupOptions = ConstructorParameters<typeof fabric.Group>[1];

export type ObjectCreator = (
  data: PartialTacticBoardObject,
) => fabric.Object | null;

const normalizeFabricType = (type: string): string => {
  switch (type) {
    case "Circle":
      return "circle";
    case "Rect":
      return "rect";
    case "Path":
      return "path";
    case "Text":
      return "text";
    case "Textbox":
      return "textbox";
    case "Line":
      return "line";
    case "Triangle":
      return "triangle";
    case "Group":
      return "group";
    default:
      return type;
  }
};

const toFabricOptions = <T>(
  data: PartialTacticBoardObject,
  keep: { objects?: boolean; path?: boolean } = {},
): T => {
  const options = { ...data } as T & {
    type?: string;
    objects?: unknown;
    path?: unknown;
    layoutManager?: unknown;
  };

  delete options.type;
  delete options.layoutManager;

  if (!keep.objects) {
    delete options.objects;
  }

  if (!keep.path) {
    delete options.path;
  }

  return options;
};

export class FabricObjectFactory {
  private static creators: Map<string, ObjectCreator> = new Map();

  static {
    // Initialize creators in static block to avoid type issues
    this.creators.set("circle", (data) => {
      const options = toFabricOptions<CircleOptions>(data);
      return new fabric.Circle(options);
    });

    this.creators.set("rect", (data) => {
      const options = toFabricOptions<RectOptions>(data);
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
      const options = toFabricOptions<PathOptions>(data);
      return new fabric.Path(pathString, options);
    });

    this.creators.set("text", (data) => {
      if (!data.text) return null;
      const options = toFabricOptions<TextOptions & { text?: string }>(data);
      const text = options.text as string;
      delete options.text;
      return new fabric.Text(text, options);
    });

    this.creators.set("textbox", (data) => {
      const options = toFabricOptions<TextboxOptions & { text?: string }>(data);
      const text = options.text;
      delete options.text;
      return new fabric.Textbox(text ?? "", options);
    });

    this.creators.set("line", (data) => {
      const lineData = data as unknown as {
        x1: number;
        y1: number;
        x2: number;
        y2: number;
      };
      const options = toFabricOptions<LineOptions>(data);
      return new fabric.Line(
        [lineData.x1, lineData.y1, lineData.x2, lineData.y2],
        options,
      );
    });

    this.creators.set("triangle", (data) => {
      const options = toFabricOptions<TriangleOptions>(data);
      return new fabric.Triangle(options);
    });

    this.creators.set("group", (data) => this.createGroupObject(data));
  }

  static createObject(data: PartialTacticBoardObject): fabric.Object | null {
    try {
      if (!data.type || typeof data.type !== "string") {
        console.warn("Invalid object type:", data.type);
        return null;
      }

      const normalizedType = normalizeFabricType(data.type);
      const creator = this.creators.get(normalizedType);
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
      throw new FabricObjectCreationError(
        typeof data.type === "string" ? data.type : "unknown",
        error as Error,
      );
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

    const options = toFabricOptions<GroupOptions>(data);

    return new fabric.Group(objects, options);
  }

  static registerCreator(type: string, creator: ObjectCreator): void {
    this.creators.set(normalizeFabricType(type), creator);
  }

  static getSupportedTypes(): string[] {
    return Array.from(this.creators.keys());
  }
}
