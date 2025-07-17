import {
  createContext,
  ReactNode,
  FC,
  useCallback,
  useRef,
  MutableRefObject,
  useMemo,
} from "react";
import { fabric } from "fabric";
import {
  CommandHistory,
  AddObjectCommand,
  RemoveMultipleObjectsCommand,
  SetBackgroundCommand,
} from "../TacticBoardFabricJsContext/commands";
import { CanvasOperationError } from "../TacticBoardFabricJsContext/types";

const canvasDefaultOptions: fabric.ICanvasOptions = {
  preserveObjectStacking: true,
  width: 1220,
  height: 686,
  selection: false,
  allowTouchScrolling: true,
};

export interface TacticBoardCanvasContextProps {
  canvasRef: MutableRefObject<HTMLCanvasElement | null>;
  setCanvasRef: (instance: HTMLCanvasElement | null) => void;
  canvasFabricRef: MutableRefObject<fabric.Canvas | null>;
  addObject: (object: fabric.Object) => void;
  removeActiveObjects: () => void;
  removeObject: (object: fabric.Object) => void;
  getAllObjects: () => fabric.Object[];
  getActiveObjects: () => fabric.Object[];
  setSelection: (selection: boolean) => void;
  setControls: (controls: boolean) => void;
  setBackgroundImage: (url: string) => void;
  getBackgroundImage: () => string | undefined;
  clearCanvas: () => void;
  // Command pattern methods
  undo: () => boolean;
  redo: () => boolean;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clearHistory: () => void;
}

export const TacticBoardCanvasContext = createContext<
  TacticBoardCanvasContextProps | undefined
>(undefined);

const TacticBoardCanvasContextProvider: FC<{
  children: ReactNode;
}> = ({ children }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasFabricRef = useRef<fabric.Canvas | null>(null);
  const commandHistory = useRef<CommandHistory>(new CommandHistory());

  const setCanvasRef = useCallback((instance: HTMLCanvasElement | null) => {
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

      // Set up event listeners for command tracking
      const canvas = canvasFabricRef.current;

      // Track object modifications
      canvas.on("object:modified", () => {
        // This would need more sophisticated tracking of before/after states
        // For now, we'll implement this in specific operations
      });
    } catch (error) {
      throw new CanvasOperationError("Canvas initialization", error as Error);
    }
  }, []);

  const addObject = useCallback((object: fabric.Object) => {
    try {
      const canvas = canvasFabricRef.current;
      if (!canvas) return;

      const command = new AddObjectCommand(canvas, object);
      commandHistory.current.execute(command);
    } catch (error) {
      throw new CanvasOperationError("Adding object", error as Error);
    }
  }, []);

  const removeObject = useCallback((object: fabric.Object) => {
    try {
      const canvas = canvasFabricRef.current;
      if (!canvas) return;

      canvas.remove(object);
      canvas.renderAll();
    } catch (error) {
      throw new CanvasOperationError("Removing object", error as Error);
    }
  }, []);

  const removeActiveObjects = useCallback(() => {
    try {
      const canvas = canvasFabricRef.current;
      if (!canvas) return;

      const selectedObjects = canvas.getActiveObjects();
      if (selectedObjects.length === 0) return;

      const command = new RemoveMultipleObjectsCommand(canvas, [
        ...selectedObjects,
      ]);
      commandHistory.current.execute(command);
      canvas.discardActiveObject();
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

  const setBackgroundImage = useCallback((src: string) => {
    try {
      const canvas = canvasFabricRef.current;
      if (!canvas) return;

      // Get current background directly to avoid circular dependency
      let oldBackground: string | undefined;
      try {
        const bgImage = canvas.backgroundImage as fabric.Image;
        if (bgImage?.getSrc()) {
          oldBackground = new URL(bgImage.getSrc()).pathname;
        }
      } catch (urlError) {
        console.warn("Failed to parse background image URL:", urlError);
      }

      const command = new SetBackgroundCommand(canvas, oldBackground, src);
      commandHistory.current.execute(command);
    } catch (error) {
      throw new CanvasOperationError("Setting background image", error as Error);
    }
  }, []);

  const getBackgroundImage = useCallback(() => {
    try {
      const canvas = canvasFabricRef.current;
      if (!canvas) return;
      const bgImage = canvas.backgroundImage as fabric.Image;
      if (!bgImage?.getSrc()) return;
      return new URL(bgImage.getSrc()).pathname;
    } catch (urlError) {
      console.warn("Failed to parse background image URL:", urlError);
      return undefined;
    }
  }, []);

  const setControls = useCallback((controls: boolean) => {
    canvasFabricRef.current?.getObjects().forEach((obj) => {
      obj.hasControls = controls;
    });
  }, []);

  const setSelection = useCallback((selection: boolean) => {
    canvasFabricRef.current?.getObjects().forEach((obj) => {
      obj.evented = selection;
    });
  }, []);

  const clearCanvas = useCallback(() => {
    try {
      const canvas = canvasFabricRef.current;
      if (!canvas) return;

      canvas.clear();
      commandHistory.current.clear();
    } catch (error) {
      throw new CanvasOperationError("Clearing canvas", error as Error);
    }
  }, []);

  // Command pattern methods
  const undo = useCallback(() => {
    return commandHistory.current.undo();
  }, []);

  const redo = useCallback(() => {
    return commandHistory.current.redo();
  }, []);

  const canUndo = useCallback(() => {
    return commandHistory.current.canUndo();
  }, []);

  const canRedo = useCallback(() => {
    return commandHistory.current.canRedo();
  }, []);

  const clearHistory = useCallback(() => {
    commandHistory.current.clear();
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      canvasRef,
      setCanvasRef,
      canvasFabricRef,
      addObject,
      getAllObjects,
      getActiveObjects,
      removeObject,
      removeActiveObjects,
      setSelection,
      setControls,
      setBackgroundImage,
      getBackgroundImage,
      clearCanvas,
      undo,
      redo,
      canUndo,
      canRedo,
      clearHistory,
    }),
    [
      canvasRef,
      setCanvasRef,
      canvasFabricRef,
      addObject,
      getAllObjects,
      getActiveObjects,
      removeObject,
      removeActiveObjects,
      setSelection,
      setControls,
      setBackgroundImage,
      getBackgroundImage,
      clearCanvas,
      undo,
      redo,
      canUndo,
      canRedo,
      clearHistory,
    ],
  );

  return (
    <TacticBoardCanvasContext.Provider value={contextValue}>
      {children}
    </TacticBoardCanvasContext.Provider>
  );
};

export default TacticBoardCanvasContextProvider;
