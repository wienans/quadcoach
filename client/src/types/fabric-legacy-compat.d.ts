/* eslint-disable @typescript-eslint/no-explicit-any */
// TODO: remove this compatibility layer once Fabric 7 native typings are fully adopted.
import "fabric";

declare module "fabric" {
  export type ICanvasOptions = any;
  export type IEvent = any;
  export type ICircleOptions = any;
  export type IRectOptions = any;
  export type IPathOptions = any;
  export type ITextOptions = any;
  export type ITextboxOptions = any;
  export type ILineOptions = any;
  export type ITriangleOptions = any;
  export type IGroupOptions = any;

  interface IObjectOptions {
    id?: string;
    objectType?: string;
    uuid?: string;
  }

  interface Object {
    id?: string;
    objectType?: string;
    uuid?: string;
  }

  interface Group {
    id?: string;
    objectType?: string;
    uuid?: string;
  }

  interface FabricObject {
    animate(...args: any[]): any;
    uuid?: string;
  }

  interface Canvas {
    setBackgroundImage(image: any, callback?: () => void): void;
    getPointer(event: any): { x: number; y: number };
    toJSON(propertiesToInclude?: string[]): any;
  }
}
