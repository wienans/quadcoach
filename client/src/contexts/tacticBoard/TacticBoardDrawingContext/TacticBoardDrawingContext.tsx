import {
  createContext,
  ReactNode,
  FC,
  useCallback,
  useRef,
  useMemo,
  useContext,
} from "react";
import { TacticBoardCanvasContext } from "../TacticBoardCanvasContext/TacticBoardCanvasContext";
import {
  ExtendedBaseBrush,
  setUuid,
} from "../TacticBoardFabricJsContext/fabricTypes";
import { v4 as uuidv4 } from "uuid";
export type LineStyle = "solid" | "dashed" | "dotted";

export interface TacticBoardDrawingContextProps {
  setDrawMode: (drawMode: boolean, dashArray?: number[]) => void;
  setDrawColor: (color: string) => void;
  setDrawThickness: (thickness: number) => void;
  getDrawColor: () => string;
  getDrawThickness: () => number;
  setLineStyle: (style: LineStyle) => void;
  getLineStyle: () => LineStyle;
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
        // Add event handler to assign UUIDs to drawn paths
        canvasFabric.on("path:created", (e: fabric.IEvent) => {
          console.log("Path created event:", e);
          const path = (e as any).path;
          if (path) {
            setUuid(path, uuidv4());
          }
        });

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
    }),
    [
      setDrawMode,
      setDrawColor,
      setDrawThickness,
      getDrawColor,
      getDrawThickness,
      setLineStyle,
      getLineStyle,
    ],
  );

  return (
    <TacticBoardDrawingContext.Provider value={contextValue}>
      {children}
    </TacticBoardDrawingContext.Provider>
  );
};

export default TacticBoardDrawingContextProvider;
