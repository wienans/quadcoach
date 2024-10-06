// export enum WorkareaLayout {
//   PORTRAIT = "PORTRAIT",
//   LANDSCAPE = "LANDSCAPE",
// }

// export const FILTER_TYPES = [
//   "grayscale",
//   "invert",
//   "remove-color",
//   "sepia",
//   "brownie",
//   "brightness",
//   "contrast",
//   "saturation",
//   "noise",
//   "vintage",
//   "pixelate",
//   "blur",
//   "sharpen",
//   "emboss",
//   "technicolor",
//   "polaroid",
//   "blend-color",
//   "gamma",
//   "kodachrome",
//   "blackwhite",
//   "blend-image",
//   "hue",
//   "resize",
//   "tint",
//   "mask",
//   "multiply",
//   "sepia2",
// ];

// export interface IFilter {
//   type: (typeof FILTER_TYPES)[number];
//   [key: string]: unknown;
// }

// export interface LinkProperty {
//   enabled?: boolean;
//   type?: string;
//   state?: string;
//   dashboard?: unknown;
//   url: string;
// }

// export type FabricObjectOption<T = fabric.IObjectOptions> = T & {
//   /**
//    * Object id
//    * @type {string}
//    */
//   id?: string;
//   /**
//    * Parent object id
//    * @type {string}
//    */
//   parentId?: string;
//   /**
//    * Original opacity
//    * @type {number}
//    */
//   originOpacity?: number;
//   /**
//    * Original top position
//    * @type {number}
//    */
//   originTop?: number;
//   /**
//    * Original left position
//    * @type {number}
//    */
//   originLeft?: number;
//   /**
//    * Original scale X
//    * @type {number}
//    */
//   originScaleX?: number;
//   /**
//    * Original scale Y
//    * @type {number}
//    */
//   originScaleY?: number;
//   /**
//    * Original angle
//    * @type {number}
//    */
//   originAngle?: number;
//   /**
//    * Original fill color
//    * @type {(string | fabric.Pattern)}
//    */
//   originFill?: string | fabric.Pattern;
//   /**
//    * Original stroke color
//    * @type {string}
//    */
//   originStroke?: string;
//   /**
//    * Original rotation
//    *
//    * @type {number}
//    */
//   originRotation?: number;
//   /**
//    * Object editable
//    * @type {boolean}
//    */
//   editable?: boolean;
//   /**
//    * Object Super type
//    * @type {string}
//    */
//   superType?: string;
//   /**
//    * @description
//    * @type {string}
//    */
//   description?: string;
//   /**
//    * Link property
//    * @type {LinkProperty}
//    */
//   link?: LinkProperty;
//   /**
//    * Object class
//    * @type {string}
//    */
//   class?: string;
//   /**
//    * Is possible delete
//    * @type {boolean}
//    */
//   deletable?: boolean;
//   /**
//    * Is enable double click
//    * @type {boolean}
//    */
//   dblclick?: boolean;
//   /**
//    * Is possible clone
//    * @type {boolean}
//    */
//   cloneable?: boolean;
//   /**
//    * Is locked object
//    * @type {boolean}
//    */
//   locked?: boolean;
//   /**
//    * This property replaces "angle"
//    *
//    * @type {number}
//    */
//   rotation?: number;
//   [key: string]: unknown;
// };

// export type FabricObject<T = fabric.Object> = T & FabricObjectOption;

// export type FabricImage = FabricObject &
//   fabric.Image & {
//     /**
//      * Image URL
//      * @type {string}
//      */
//     src?: string;
//     /**
//      * Image File or Blob
//      * @type {File}
//      */
//     file?: File;
//     /**
//      * Image Filter
//      * @type {IFilter[]}
//      */
//     filters?: IFilter[];
//     _element?: unknown;
//   };

// export type WorkareaOption = {
//   /**
//    * Image Url
//    */
//   src?: string;
//   /**
//    * Image file or Blbo
//    */
//   file?: File;
//   /**
//    * Workarea width
//    */
//   width?: number;
//   /**
//    * Workarea height
//    */
//   height?: number;
//   /**
//    * Workarea background color
//    */
//   backgroundColor?: string;
//   /**
//    * Workarea layout type
//    */
//   layout?: WorkareaLayout;
// };

// export type WorkareaObject = FabricImage & {
//   /**
//    * Workarea Layout Type
//    * @type {WorkareaLayout}
//    */
//   layout?: WorkareaLayout;
//   /**
//    * Workarea Image Element
//    * @type {HTMLImageElement}
//    */
//   _element?: HTMLImageElement;
//   /**
//    * Whether exist the element
//    * @type {boolean}
//    */
//   isElement?: boolean;
//   /**
//    * Stored width in workarea
//    * @type {number}
//    */
//   workareaWidth?: number;
//   /**
//    * Stored height in workarea
//    * @type {number}
//    */
//   workareaHeight?: number;
// };
