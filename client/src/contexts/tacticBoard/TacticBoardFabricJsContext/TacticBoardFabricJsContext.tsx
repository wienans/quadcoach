import "./fabricJsExtensions";
import {
  createContext,
  ReactNode,
  FC,
  useCallback,
  useRef,
  MutableRefObject,
  useEffect,
  useMemo,
} from "react";
import { fabric } from "fabric";
import { TacticPage } from "../../../api/quadcoachApi/domain";
import { useContainerResizeEvent } from "./useResizeEvent";

import { TacticPageValidator } from "./validation";
import { ExtendedBaseBrush } from "./fabricTypes";
import { CanvasOperationError } from "./types";

const canvasDefaultOptions: fabric.ICanvasOptions = {
  preserveObjectStacking: true,
  width: 1220,
  height: 686,
  selection: false,
  allowTouchScrolling: true,
};

export type LineStyle = "solid" | "dashed" | "dotted";

export interface TacticBoardFabricJsContextProps {
  containerRef: MutableRefObject<HTMLDivElement | null>;
  // setBoxRef: (boxRef: HTMLDivElement | null) => void;
  canvasRef: MutableRefObject<HTMLCanvasElement | null>;
  setCanvasRef: (instance: HTMLCanvasElement | null) => void;
  setContainerRef: (instance: HTMLDivElement | null) => void;
  // setCanvas: (canvas: HTMLCanvasElement | null) => void;
  canvasFabricRef: MutableRefObject<fabric.Canvas | null>;
  // setCanvasFabric: (canvas: fabric.Canvas) => void;
  addObject: (object: fabric.Object) => void;
  removeActiveObjects: () => void;
  removeObject: (object: fabric.Object) => void;
  getAllObjects: () => fabric.Object[];
  getAllObjectsJson: () => object;
  getActiveObjects: () => fabric.Object[];
  setSelection: (selection: boolean) => void;
  loadFromTacticPage: (page: TacticPage) => void;
  setDrawMode: (drawMode: boolean, dashArray?: number[]) => void;
  setControls: (controls: boolean) => void;
  setBackgroundImage: (url: string) => void;
  getBackgroundImage: () => string | undefined;
  setDrawColor: (color: string) => void;
  setDrawThickness: (thickness: number) => void;
  getDrawColor: () => string;
  getDrawThickness: () => number;
  setLineStyle: (style: LineStyle) => void;
  getLineStyle: () => LineStyle;
}

export const TacticBoardFabricJsContext = createContext<
  TacticBoardFabricJsContextProps | undefined
>(undefined);

const TacticBoardFabricJsContextProvider: FC<{
  children: ReactNode;
  heightFirstResizing: boolean;
}> = ({ children, heightFirstResizing }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasFabricRef = useRef<fabric.Canvas | null>(null);
  const drawColorRef = useRef<string>("#000000");
  const drawThicknessRef = useRef<number>(2);
  const lineStyleRef = useRef<LineStyle>("solid");

  const { initializeContainerResizeObserver, cleanup: cleanupResizeObserver } =
    useContainerResizeEvent(containerRef, canvasFabricRef, heightFirstResizing);

  const setCanvasRef = useCallback(
    (instance: HTMLCanvasElement | null) => {
      // Cleanup previous canvas
      if (canvasFabricRef.current) {
        canvasFabricRef.current.dispose();
        canvasFabricRef.current = null;
      }

      canvasRef.current = instance;

      if (!instance) return;

      try {
        canvasFabricRef.current = new fabric.Canvas(
          canvasRef.current,
          canvasDefaultOptions,
        );

        // Re-initialize resize observer now that canvas is ready
        initializeContainerResizeObserver();
      } catch (error) {
        throw new CanvasOperationError("Canvas initialization", error as Error);
      }
    },
    [initializeContainerResizeObserver],
  );

  const setContainerRef = useCallback(
    (instance: HTMLDivElement | null) => {
      containerRef.current = instance;

      initializeContainerResizeObserver();
    },
    [initializeContainerResizeObserver],
  );

  const addObject = useCallback((object: fabric.Object) => {
    try {
      canvasFabricRef.current?.add(object);
    } catch (error) {
      throw new CanvasOperationError("Adding object", error as Error);
    }
  }, []);

  const removeObject = useCallback((object: fabric.Object) => {
    try {
      canvasFabricRef.current?.remove(object);
    } catch (error) {
      throw new CanvasOperationError("Removing object", error as Error);
    }
  }, []);

  const removeActiveObjects = useCallback(() => {
    try {
      const canvasFabric = canvasFabricRef.current;
      if (!canvasFabric) return;
      const selectedObjects = canvasFabric.getActiveObjects();
      canvasFabric.remove(...selectedObjects);
      canvasFabric.discardActiveObject();
    } catch (error) {
      throw new CanvasOperationError("Removing active objects", error as Error);
    }
  }, []);

  const getActiveObjects = useCallback(() => {
    try {
      return canvasFabricRef.current?.getActiveObjects() ?? [];
    } catch (error) {
      console.error("Failed to get active objects:", error);
      return [];
    }
  }, []);

  const getAllObjects = useCallback(() => {
    try {
      return canvasFabricRef.current?.getObjects() ?? [];
    } catch (error) {
      console.error("Failed to get all objects:", error);
      return [];
    }
  }, []);

  const getAllObjectsJson = useCallback(() => {
    try {
      const canvasFabric = canvasFabricRef.current;
      if (!canvasFabric) return {};

      const json = canvasFabric.toJSON([
        "uuid",
        "objectType",
      ]) as unknown as TacticPage;

      if (json.backgroundImage?.src) {
        try {
          json.backgroundImage.src = new URL(json.backgroundImage.src).pathname;
        } catch (urlError) {
          // If URL parsing fails, keep the original src
          console.warn("Failed to parse background image URL:", urlError);
        }
      }

      return json;
    } catch (error) {
      console.error("Failed to get objects JSON:", error);
      return {};
    }
  }, []);

  const setBackgroundImage = useCallback((src: string) => {
    const canvasFabric = canvasFabricRef.current;
    if (!canvasFabric) return;
    canvasFabric.setBackgroundImage(
      src,
      canvasFabric.renderAll.bind(canvasFabric),
    );
  }, []);

  const getBackgroundImage = useCallback(() => {
    const canvasFabric = canvasFabricRef.current;
    if (!canvasFabric) return;
    const bgImage = canvasFabric.backgroundImage as fabric.Image;
    if (!bgImage?.getSrc()) return;
    return new URL(bgImage.getSrc()).pathname;
  }, []);

  const setControls = useCallback((controls: boolean) => {
    canvasFabricRef.current?.getObjects().forEach((obj) => {
      obj.hasControls = controls;
    });
  }, []);

  const loadFromTacticPage = useCallback((page: TacticPage) => {
    const canvasFabric = canvasFabricRef.current;
    if (!canvasFabric) return;

    try {
      // Validate the page data before loading
      const validation = TacticPageValidator.validate(page);
      if (!validation.isValid) {
        console.warn("TacticPage validation failed:", validation.errors);
        // For now, let's be less strict and just log warnings instead of sanitizing
        // page = TacticPageValidator.sanitize(page);
      }

      // Clear existing objects
      canvasFabric.remove(...canvasFabric.getObjects());

      // Set background image
      if (page.backgroundImage?.src) {
        canvasFabric.setBackgroundImage(
          page.backgroundImage.src,
          canvasFabric.renderAll.bind(canvasFabric),
        );
      }

      // Load objects - temporarily using original logic for debugging
      console.log("Loading objects:", page.objects?.length || 0);
      page.objects?.forEach((obj) => {
        try {
          if (obj.type === "circle") {
            const addObj = new fabric.Circle(obj as object);
            canvasFabric.add(addObj);
          } else if (obj.type === "rect") {
            const addObj = new fabric.Rect(obj as object);
            canvasFabric.add(addObj);
          } else if (obj.type === "path") {
            const addObj = new fabric.Path(obj.path?.toString(), obj as object);
            canvasFabric.add(addObj);
          } else if (obj.type === "text") {
            if (obj.text) {
              const addObj = new fabric.Text(obj.text, obj as object);
              canvasFabric.add(addObj);
            }
          } else if (obj.type === "line") {
            const lineObj = obj as unknown as {
              x1: number;
              y1: number;
              x2: number;
              y2: number;
            };
            const addObj = new fabric.Line(
              [lineObj.x1, lineObj.y1, lineObj.x2, lineObj.y2],
              obj as object,
            );
            canvasFabric.add(addObj);
          } else if (obj.type === "group") {
            const objects: fabric.Object[] = [];
            obj.objects?.forEach((groupObj) => {
              if (groupObj.type === "circle") {
                const addObj = new fabric.Circle(groupObj as object);
                objects.push(addObj);
              } else if (groupObj.type === "text") {
                if (groupObj.text) {
                  const addObj = new fabric.Text(
                    groupObj.text,
                    groupObj as object,
                  );
                  objects.push(addObj);
                }
              } else if (groupObj.type === "path") {
                const addObj = new fabric.Path(
                  groupObj.path?.toString(),
                  groupObj as object,
                );
                objects.push(addObj);
              } else if (groupObj.type === "rect") {
                const addObj = new fabric.Rect(groupObj as object);
                objects.push(addObj);
              } else if (groupObj.type === "line") {
                const lineObj = groupObj as unknown as {
                  x1: number;
                  y1: number;
                  x2: number;
                  y2: number;
                };
                const addObj = new fabric.Line(
                  [lineObj.x1, lineObj.y1, lineObj.x2, lineObj.y2],
                  groupObj as object,
                );
                objects.push(addObj);
              } else if (groupObj.type === "triangle") {
                const addObj = new fabric.Triangle(groupObj as object);
                objects.push(addObj);
              }
            });
            const addObj = new fabric.Group(objects, obj as object);
            canvasFabric.add(addObj);
          }
        } catch (error) {
          console.error("Failed to create object:", obj, error);
        }
      });

      canvasFabric.renderAll();
    } catch (error) {
      throw new CanvasOperationError("Loading tactic page", error as Error);
    }
  }, []);

  const setSelection = useCallback((selection: boolean) => {
    canvasFabricRef.current?.getObjects().forEach((obj) => {
      obj.evented = selection;
    });
  }, []);

  const setDrawMode = useCallback(
    (drawMode: boolean, dashArray?: number[]) => {
      try {
        const canvasFabric = canvasFabricRef.current;
        if (!canvasFabric) return;

        canvasFabric.isDrawingMode = drawMode;
        if (drawMode && canvasFabric.freeDrawingBrush) {
          canvasFabric.freeDrawingBrush.color = drawColorRef.current;
          canvasFabric.freeDrawingBrush.width = drawThicknessRef.current;
          const brush = canvasFabric.freeDrawingBrush as ExtendedBaseBrush;
          if (dashArray) {
            brush.strokeDashArray = dashArray;
          } else {
            brush.strokeDashArray = [];
          }
        }
        setControls(false);
      } catch (error) {
        throw new CanvasOperationError("Setting draw mode", error as Error);
      }
    },
    [setControls],
  );

  const setLineStyle = useCallback(
    (style: LineStyle) => {
      const canvasFabric = canvasFabricRef.current;
      if (!canvasFabric) return;

      lineStyleRef.current = style;

      switch (style) {
        case "solid":
          setDrawMode(true);
          break;
        case "dashed":
          setDrawMode(true, [20, 10]);
          break;
        case "dotted":
          setDrawMode(true, [3, 10]);
          break;
      }
    },
    [setDrawMode],
  );

  const getLineStyle = useCallback(() => {
    return lineStyleRef.current;
  }, []);

  const setDrawColor = useCallback((color: string) => {
    try {
      const canvasFabric = canvasFabricRef.current;
      if (!canvasFabric) return;

      drawColorRef.current = color;
      if (canvasFabric.isDrawingMode && canvasFabric.freeDrawingBrush) {
        canvasFabric.freeDrawingBrush.color = color;
      }
    } catch (error) {
      console.error("Failed to set draw color:", error);
    }
  }, []);

  const setDrawThickness = useCallback((thickness: number) => {
    try {
      const canvasFabric = canvasFabricRef.current;
      if (!canvasFabric) return;

      drawThicknessRef.current = thickness;
      if (canvasFabric.isDrawingMode && canvasFabric.freeDrawingBrush) {
        canvasFabric.freeDrawingBrush.width = thickness;
      }
    } catch (error) {
      console.error("Failed to set draw thickness:", error);
    }
  }, []);

  const getDrawColor = useCallback(() => {
    return drawColorRef.current;
  }, []);

  const getDrawThickness = useCallback(() => {
    return drawThicknessRef.current;
  }, []);

  // Effect to ensure resize observer is initialized when both refs are ready
  useEffect(() => {
    if (containerRef.current && canvasFabricRef.current) {
      initializeContainerResizeObserver();
    }
  }, [initializeContainerResizeObserver]);

  // Cleanup effect - only on actual unmount, not on re-renders
  useEffect(() => {
    return () => {
      // Only cleanup resize observer on unmount
      // Canvas cleanup is handled in setCanvasRef when needed
      cleanupResizeObserver();
    };
  }, [cleanupResizeObserver]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      containerRef,
      canvasRef,
      setCanvasRef,
      setContainerRef,
      canvasFabricRef,
      addObject,
      getAllObjects,
      getAllObjectsJson,
      getActiveObjects,
      removeObject,
      removeActiveObjects,
      setSelection,
      loadFromTacticPage,
      setDrawMode,
      setControls,
      setBackgroundImage,
      getBackgroundImage,
      setDrawColor,
      setDrawThickness,
      getDrawColor,
      getDrawThickness,
      setLineStyle,
      getLineStyle,
    }),
    [
      containerRef,
      canvasRef,
      setCanvasRef,
      setContainerRef,
      canvasFabricRef,
      addObject,
      getAllObjects,
      getAllObjectsJson,
      getActiveObjects,
      removeObject,
      removeActiveObjects,
      setSelection,
      loadFromTacticPage,
      setDrawMode,
      setControls,
      setBackgroundImage,
      getBackgroundImage,
      setDrawColor,
      setDrawThickness,
      getDrawColor,
      getDrawThickness,
      setLineStyle,
      getLineStyle,
    ],
  );

  return (
    <TacticBoardFabricJsContext.Provider value={contextValue}>
      {children}
    </TacticBoardFabricJsContext.Provider>
  );
};

export default TacticBoardFabricJsContextProvider;
