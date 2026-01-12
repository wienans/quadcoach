import {
  createContext,
  ReactNode,
  FC,
  useCallback,
  useEffect,
  useMemo,
  useContext,
  useRef,
} from "react";
import { fabric } from "fabric";
import { v4 as uuidv4 } from "uuid";

import { TacticBoardCanvasContext } from "../TacticBoardCanvasContext/TacticBoardCanvasContext";
import {
  ExtendedBaseBrush,
  setUuid,
} from "../TacticBoardFabricJsContext/fabricTypes";
export type LineStyle = "solid" | "dashed" | "dotted";

export interface TacticBoardDrawingContextProps {
  setDrawMode: (drawMode: boolean, dashArray?: number[]) => void;
  setDrawColor: (color: string) => void;
  setDrawThickness: (thickness: number) => void;
  getDrawColor: () => string;
  getDrawThickness: () => number;
  setLineStyle: (style: LineStyle) => void;
  getLineStyle: () => LineStyle;
  setArrowTipEnabled: (enabled: boolean) => void;
  getArrowTipEnabled: () => boolean;
}

export const TacticBoardDrawingContext = createContext<
  TacticBoardDrawingContextProps | undefined
>(undefined);

const TacticBoardDrawingContextProvider: FC<{
  children: ReactNode;
}> = ({ children }) => {
  const { canvasFabricRef, setControls } = useContext(
    TacticBoardCanvasContext,
  )!;

  const drawColorRef = useRef<string>("#000000");
  const drawThicknessRef = useRef<number>(2);
  const lineStyleRef = useRef<LineStyle>("solid");
  const arrowTipEnabledRef = useRef<boolean>(false);

  const drawModeRef = useRef<boolean>(false);
  const dashArrayRef = useRef<number[]>([]);

  const shiftPressedRef = useRef<boolean>(false);
  const isLineDrawingRef = useRef<boolean>(false);
  const lineStartRef = useRef<fabric.Point | null>(null);
  const previewLineRef = useRef<fabric.Line | null>(null);

  const detachLineToolHandlersRef = useRef<(() => void) | null>(null);

  const setDrawMode = useCallback(
    (drawMode: boolean, dashArray?: number[]) => {
      try {
        const canvasFabric = canvasFabricRef.current;
        if (!canvasFabric) return;

        drawModeRef.current = drawMode;
        dashArrayRef.current = dashArray ?? [];

        // If Shift-line mode is active, we don't use free drawing.
        if (drawMode && shiftPressedRef.current) {
          canvasFabric.isDrawingMode = false;
        } else {
          canvasFabric.isDrawingMode = drawMode;
        }

        if (drawMode && canvasFabric.freeDrawingBrush) {
          canvasFabric.freeDrawingBrush.color = drawColorRef.current;
          canvasFabric.freeDrawingBrush.width = drawThicknessRef.current;
          const brush = canvasFabric.freeDrawingBrush as ExtendedBaseBrush;
          brush.strokeDashArray = dashArray ?? [];
        }

        setControls(false);
      } catch (error) {
        console.error("Failed to set draw mode:", error);
      }
    },
    [canvasFabricRef, setControls],
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
    [setDrawMode, canvasFabricRef],
  );

  const getLineStyle = useCallback(() => {
    return lineStyleRef.current;
  }, []);

  const setArrowTipEnabled = useCallback((enabled: boolean) => {
    arrowTipEnabledRef.current = enabled;
  }, []);

  const getArrowTipEnabled = useCallback(() => {
    return arrowTipEnabledRef.current;
  }, []);

  const setDrawColor = useCallback(
    (color: string) => {
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
    },
    [canvasFabricRef],
  );

  const setDrawThickness = useCallback(
    (thickness: number) => {
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
    },
    [canvasFabricRef],
  );

  const getDrawColor = useCallback(() => {
    return drawColorRef.current;
  }, []);

  const getDrawThickness = useCallback(() => {
    return drawThicknessRef.current;
  }, []);

  useEffect(() => {
    const canvas = canvasFabricRef.current;
    if (!canvas) return;

    const handlePathCreated = (e: fabric.IEvent) => {
      const path = (e as unknown as { path?: fabric.Path }).path;
      if (path) {
        setUuid(path, uuidv4());
      }
    };

    canvas.on("path:created", handlePathCreated);

    return () => {
      canvas.off("path:created", handlePathCreated);
    };
  }, [canvasFabricRef]);

  useEffect(() => {
    const getCanvas = () => canvasFabricRef.current;

    const cleanupLineTool = () => {
      const canvas = getCanvas();
      if (!canvas) return;

      isLineDrawingRef.current = false;
      lineStartRef.current = null;

      if (previewLineRef.current) {
        canvas.remove(previewLineRef.current);
        previewLineRef.current = null;
        canvas.renderAll();
      }
    };

    const attachLineToolHandlers = () => {
      const canvas = getCanvas();
      if (!canvas) return;
      if (detachLineToolHandlersRef.current) return;

      const onMouseDown = (opt: fabric.IEvent) => {
        if (!drawModeRef.current || !shiftPressedRef.current) return;

        const pointer = canvas.getPointer(opt.e);
        lineStartRef.current = new fabric.Point(pointer.x, pointer.y);
        isLineDrawingRef.current = true;

        const line = new fabric.Line(
          [pointer.x, pointer.y, pointer.x, pointer.y],
          {
            stroke: drawColorRef.current,
            strokeWidth: drawThicknessRef.current,
            strokeDashArray:
              dashArrayRef.current.length > 0 ? dashArrayRef.current : undefined,
            strokeLineCap: "round",
            selectable: false,
            evented: false,
          },
        );

        previewLineRef.current = line;
        canvas.add(line);
      };

      const onMouseMove = (opt: fabric.IEvent) => {
        const line = previewLineRef.current;
        if (!drawModeRef.current || !shiftPressedRef.current) return;
        if (!isLineDrawingRef.current || !lineStartRef.current || !line) return;

        const pointer = canvas.getPointer(opt.e);
        line.set({ x2: pointer.x, y2: pointer.y });
        canvas.renderAll();
      };

      const onMouseUp = (opt: fabric.IEvent) => {
        const line = previewLineRef.current;
        if (!drawModeRef.current || !shiftPressedRef.current) return;
        if (!isLineDrawingRef.current || !lineStartRef.current || !line) return;

        const pointer = canvas.getPointer(opt.e);
        line.set({ x2: pointer.x, y2: pointer.y });

        const startX = line.x1 ?? lineStartRef.current.x;
        const startY = line.y1 ?? lineStartRef.current.y;
        const endX = line.x2 ?? pointer.x;
        const endY = line.y2 ?? pointer.y;

        const isZeroLength = Math.abs(endX - startX) < 1 && Math.abs(endY - startY) < 1;
        if (isZeroLength) {
          cleanupLineTool();
          return;
        }

        // Remove preview line (we'll re-add finalized objects below)
        canvas.remove(line);
        previewLineRef.current = null;

        if (arrowTipEnabledRef.current) {
          const strokeWidth = drawThicknessRef.current;
          const headHeight = Math.max(10, strokeWidth * 6);
          const headWidth = Math.max(8, strokeWidth * 5);

          const angleRad = Math.atan2(endY - startY, endX - startX);
          const angleDeg = (angleRad * 180) / Math.PI;

          const shaft = new fabric.Line([startX, startY, endX, endY], {
            stroke: drawColorRef.current,
            strokeWidth,
            strokeDashArray:
              dashArrayRef.current.length > 0 ? dashArrayRef.current : undefined,
            strokeLineCap: "round",
            selectable: false,
            evented: false,
          });

          // Triangle points "up" by default; rotate to match line.
          const head = new fabric.Triangle({
            width: headWidth,
            height: headHeight,
            fill: drawColorRef.current,
            left: endX,
            top: endY,
            originX: "center",
            originY: "center",
            angle: angleDeg + 90,
            selectable: false,
            evented: false,
          });

          const arrow = new fabric.Group([shaft, head], {
            selectable: true,
            evented: true,
          });

          setUuid(arrow, uuidv4());
          canvas.add(arrow);
        } else {
          const finalLine = new fabric.Line([startX, startY, endX, endY], {
            stroke: drawColorRef.current,
            strokeWidth: drawThicknessRef.current,
            strokeDashArray:
              dashArrayRef.current.length > 0 ? dashArrayRef.current : undefined,
            strokeLineCap: "round",
          });

          setUuid(finalLine, uuidv4());
          canvas.add(finalLine);
        }

        canvas.renderAll();

        isLineDrawingRef.current = false;
        lineStartRef.current = null;
      };

      canvas.on("mouse:down", onMouseDown);
      canvas.on("mouse:move", onMouseMove);
      canvas.on("mouse:up", onMouseUp);

      detachLineToolHandlersRef.current = () => {
        canvas.off("mouse:down", onMouseDown);
        canvas.off("mouse:move", onMouseMove);
        canvas.off("mouse:up", onMouseUp);
        detachLineToolHandlersRef.current = null;
      };
    };

    const detachLineToolHandlers = () => {
      detachLineToolHandlersRef.current?.();
      cleanupLineTool();
    };

    const updateMode = () => {
      const canvas = getCanvas();
      if (!canvas) return;

      const shouldLineToolBeActive = drawModeRef.current && shiftPressedRef.current;

      if (shouldLineToolBeActive) {
        canvas.isDrawingMode = false;
        attachLineToolHandlers();
      } else {
        detachLineToolHandlers();
        canvas.isDrawingMode = drawModeRef.current;
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement ||
        (event.target as HTMLElement | null)?.contentEditable === "true"
      ) {
        return;
      }

      if (event.key === "Shift") {
        if (shiftPressedRef.current) return;
        shiftPressedRef.current = true;
        updateMode();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === "Shift") {
        if (!shiftPressedRef.current) return;
        shiftPressedRef.current = false;
        updateMode();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      detachLineToolHandlers();
    };
  }, [canvasFabricRef]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      setDrawMode,
      setDrawColor,
      setDrawThickness,
      getDrawColor,
      getDrawThickness,
      setLineStyle,
      getLineStyle,
      setArrowTipEnabled,
      getArrowTipEnabled,
    }),
    [
      setDrawMode,
      setDrawColor,
      setDrawThickness,
      getDrawColor,
      getDrawThickness,
      setLineStyle,
      getLineStyle,
      setArrowTipEnabled,
      getArrowTipEnabled,
    ],
  );

  return (
    <TacticBoardDrawingContext.Provider value={contextValue}>
      {children}
    </TacticBoardDrawingContext.Provider>
  );
};

export default TacticBoardDrawingContextProvider;
