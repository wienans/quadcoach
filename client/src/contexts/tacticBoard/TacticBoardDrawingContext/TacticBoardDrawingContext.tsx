/* eslint-disable @typescript-eslint/no-explicit-any */
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
import * as fabric from "fabric";
import { v4 as uuidv4 } from "uuid";

import { TacticBoardCanvasContext } from "../TacticBoardCanvasContext/TacticBoardCanvasContext";
import {
  ExtendedBaseBrush,
  setUuid,
} from "../TacticBoardFabricJsContext/fabricTypes";
export type LineStyle = "solid" | "dashed" | "dotted";

export interface TacticBoardDrawingContextProps {
  setDrawMode: (drawMode: boolean, dashArray?: number[]) => void;
  setStraightLineMode: (enabled: boolean) => void;
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
  const { canvasFabricRef, setControls, setSelection } = useContext(
    TacticBoardCanvasContext,
  )!;

  const drawColorRef = useRef<string>("#000000");
  const drawThicknessRef = useRef<number>(2);
  const lineStyleRef = useRef<LineStyle>("solid");
  const arrowTipEnabledRef = useRef<boolean>(false);

  const drawModeRef = useRef<boolean>(false);
  const straightLineModeRef = useRef<boolean>(false);
  const dashArrayRef = useRef<number[]>([]);

  const shiftPressedRef = useRef<boolean>(false);
  const isLineDrawingRef = useRef<boolean>(false);
  const lineStartRef = useRef<fabric.Point | null>(null);
  const previewLineRef = useRef<fabric.Line | null>(null);

  const detachLineToolHandlersRef = useRef<(() => void) | null>(null);
  const updateLineToolModeRef = useRef<(() => void) | null>(null);

  const setDrawMode = useCallback(
    (drawMode: boolean, dashArray?: number[]) => {
      try {
        const canvasFabric = canvasFabricRef.current;
        if (!canvasFabric) return;

        drawModeRef.current = drawMode;
        dashArrayRef.current = dashArray ?? [];

        // If line-tool mode is active, we don't use free drawing.
        if (
          drawMode &&
          (shiftPressedRef.current || straightLineModeRef.current)
        ) {
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
        updateLineToolModeRef.current?.();
      } catch (error) {
        console.error("Failed to set draw mode:", error);
      }
    },
    [canvasFabricRef, setControls],
  );

  const setStraightLineMode = useCallback((enabled: boolean) => {
    straightLineModeRef.current = enabled;
    updateLineToolModeRef.current?.();
  }, []);

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
    const getCanvas = () => canvasFabricRef.current;

    // --- Arrow-tip handler for freehand paths ---
    // We define it here (not in a separate useEffect) because the canvas
    // ref may still be null when the component first mounts.  By attaching
    // the listener lazily inside updateMode we guarantee the canvas exists.
    const handlePathCreated = (e: any) => {
      const canvas = getCanvas();
      if (!canvas) return;

      const path = (e as unknown as { path?: fabric.Path }).path;
      if (!path) return;

      if (!arrowTipEnabledRef.current) {
        setUuid(path, uuidv4());
        return;
      }

      const pathData = path.path;
      if (!pathData || pathData.length === 0) {
        setUuid(path, uuidv4());
        return;
      }

      const rawData = pathData as any[];

      let lastX: number | null = null;
      let lastY: number | null = null;
      let previousX: number | null = null;
      let previousY: number | null = null;

      for (let i = rawData.length - 1; i >= 0; i -= 1) {
        const cmd = rawData[i];
        if (!cmd || typeof cmd.length !== "number" || cmd.length < 3) {
          continue;
        }

        const x = Number(cmd[cmd.length - 2]);
        const y = Number(cmd[cmd.length - 1]);

        if (!Number.isFinite(x) || !Number.isFinite(y)) {
          continue;
        }

        if (lastX === null || lastY === null) {
          lastX = x;
          lastY = y;
          continue;
        }

        if (Math.hypot(lastX - x, lastY - y) > 0.5) {
          previousX = x;
          previousY = y;
          break;
        }
      }

      if (lastX === null || lastY === null) {
        setUuid(path, uuidv4());
        return;
      }

      canvas.remove(path);

      const strokeWidth =
        typeof path.strokeWidth === "number"
          ? path.strokeWidth
          : drawThicknessRef.current;
      const strokeColor =
        typeof path.stroke === "string" ? path.stroke : drawColorRef.current;
      const headHeight = Math.max(10, strokeWidth * 6);
      const headWidth = Math.max(8, strokeWidth * 5);

      let angleDeg = 0;
      if (previousX !== null && previousY !== null) {
        const angleRad = Math.atan2(lastY - previousY, lastX - previousX);
        angleDeg = (angleRad * 180) / Math.PI;
      }

      const head = new fabric.Triangle({
        width: headWidth,
        height: headHeight,
        fill: strokeColor,
        left: lastX,
        top: lastY,
        originX: "center",
        originY: "center",
        angle: angleDeg + 90,
        selectable: false,
        evented: false,
      });

      const arrowGroup = new fabric.Group([path, head], {
        selectable: true,
        evented: true,
      });

      setUuid(arrowGroup, uuidv4());
      canvas.add(arrowGroup);
    };

    let pathCreatedAttached = false;

    const attachPathCreatedHandler = () => {
      const canvas = getCanvas();
      if (!canvas || pathCreatedAttached) return;
      canvas.on("path:created", handlePathCreated);
      pathCreatedAttached = true;
    };

    const detachPathCreatedHandler = () => {
      const canvas = getCanvas();
      if (!canvas || !pathCreatedAttached) return;
      canvas.off("path:created", handlePathCreated);
      pathCreatedAttached = false;
    };

    const cleanupLineTool = () => {
      const canvas = getCanvas();
      if (!canvas) return;

      isLineDrawingRef.current = false;
      lineStartRef.current = null;

      if (previewLineRef.current) {
        canvas.remove(previewLineRef.current);
        previewLineRef.current = null;
        canvas.requestRenderAll();
      }
    };

    const attachLineToolHandlers = () => {
      const canvas = getCanvas();
      if (!canvas) return;
      if (detachLineToolHandlersRef.current) return;

      const onMouseDown = (opt: any) => {
        if (
          !drawModeRef.current ||
          (!shiftPressedRef.current && !straightLineModeRef.current)
        ) {
          return;
        }

        const pointer = canvas.getPointer(opt.e);
        lineStartRef.current = new fabric.Point(pointer.x, pointer.y);
        isLineDrawingRef.current = true;

        const line = new fabric.Line(
          [pointer.x, pointer.y, pointer.x, pointer.y],
          {
            stroke: drawColorRef.current,
            strokeWidth: drawThicknessRef.current,
            strokeDashArray:
              dashArrayRef.current.length > 0
                ? dashArrayRef.current
                : undefined,
            strokeLineCap: "round",
            selectable: false,
            evented: false,
          },
        );

        previewLineRef.current = line;
        canvas.add(line);
      };

      const onMouseMove = (opt: any) => {
        const line = previewLineRef.current;
        if (
          !drawModeRef.current ||
          (!shiftPressedRef.current && !straightLineModeRef.current)
        ) {
          return;
        }
        if (!isLineDrawingRef.current || !lineStartRef.current || !line) return;

        const pointer = canvas.getPointer(opt.e);
        line.set({ x2: pointer.x, y2: pointer.y });
        canvas.requestRenderAll();
      };

      const onMouseUp = (opt: any) => {
        const line = previewLineRef.current;
        if (
          !drawModeRef.current ||
          (!shiftPressedRef.current && !straightLineModeRef.current)
        ) {
          return;
        }
        if (!isLineDrawingRef.current || !lineStartRef.current || !line) return;

        const pointer = canvas.getPointer(opt.e);
        line.set({ x2: pointer.x, y2: pointer.y });

        const startX = line.x1 ?? lineStartRef.current.x;
        const startY = line.y1 ?? lineStartRef.current.y;
        const endX = line.x2 ?? pointer.x;
        const endY = line.y2 ?? pointer.y;

        const isZeroLength =
          Math.abs(endX - startX) < 1 && Math.abs(endY - startY) < 1;
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
              dashArrayRef.current.length > 0
                ? dashArrayRef.current
                : undefined,
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
              dashArrayRef.current.length > 0
                ? dashArrayRef.current
                : undefined,
            strokeLineCap: "round",
          });

          setUuid(finalLine, uuidv4());
          canvas.add(finalLine);
        }

        if (straightLineModeRef.current || shiftPressedRef.current) {
          setSelection(false);
        }

        canvas.requestRenderAll();

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

      // Ensure path:created handler is attached whenever canvas is available
      attachPathCreatedHandler();

      const shouldLineToolBeActive =
        drawModeRef.current &&
        (shiftPressedRef.current || straightLineModeRef.current);

      if (shouldLineToolBeActive) {
        setSelection(false);
        canvas.isDrawingMode = false;
        attachLineToolHandlers();
      } else {
        detachLineToolHandlers();
        canvas.isDrawingMode = drawModeRef.current;

        if (!drawModeRef.current) {
          setSelection(true);
        }
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

    updateLineToolModeRef.current = updateMode;
    updateMode();

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      updateLineToolModeRef.current = null;
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      detachLineToolHandlers();
      detachPathCreatedHandler();
    };
  }, [canvasFabricRef, setSelection]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      setDrawMode,
      setStraightLineMode,
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
      setStraightLineMode,
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
