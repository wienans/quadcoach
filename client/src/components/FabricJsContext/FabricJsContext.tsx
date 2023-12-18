import {
  createContext,
  ReactNode,
  FC,
  useState,
  useCallback,
  useEffect,
} from "react";
import { fabric } from "fabric";

export interface FabricJsContextProps {
  canvas: fabric.Canvas | null;
  setCanvas: (canvas: fabric.Canvas) => void;
  addObject: (object: fabric.Object) => void;
  removeActiveObjects: () => void;
  removeObject: (object: fabric.Object) => void;
  getAllObjectsJson: () => string;
  getActiveObjects: () => fabric.Object[];
  setSelection: (selection: boolean) => void;
}

export const FabricJsContext = createContext<FabricJsContextProps | undefined>(
  undefined,
);

const FabricJsContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);

  const addObject = useCallback(
    (object: fabric.Object) => {
      if (canvas) {
        canvas.add(object);
      }
    },
    [canvas],
  );

  const removeObject = useCallback(
    (object: fabric.Object) => {
      if (canvas) {
        canvas.remove(object);
      }
    },
    [canvas],
  );

  const removeActiveObjects = useCallback(() => {
    if (canvas) {
      const selectedObjects = canvas.getActiveObjects();
      selectedObjects.forEach((obj) => {
        canvas.remove(obj);
      });
      canvas.discardActiveObject();
    }
  }, [canvas]);

  const getActiveObjects = useCallback(() => {
    if (canvas) {
      return canvas.getActiveObjects();
    }
    return [];
  }, [canvas]);

  const getAllObjectsJson = useCallback(() => {
    if (canvas) {
      return JSON.stringify(canvas.toJSON(["uuid"]));
    }
    return "";
  }, [canvas]);

  const setSelection = useCallback(
    (selection: boolean) => {
      if (canvas) {
        canvas.selection = selection;
        canvas.getObjects().forEach((obj) => {
          obj.evented = selection;
        });
      }
    },
    [canvas],
  );
  // Autosave Functionality
  useEffect(() => {
    const handleCanvasChange = () => {
      //const json = getAllObjectsJson();
      //console.log(json);
    };

    if (canvas) {
      // Attach event listeners for object modifications, additions, and removals
      canvas.on("object:modified", handleCanvasChange);
      canvas.on("object:added", handleCanvasChange);
      canvas.on("object:removed", handleCanvasChange);
    }

    return () => {
      // Remove event listeners when the component unmounts or canvas changes
      if (canvas) {
        canvas.off("object:modified", handleCanvasChange);
        canvas.off("object:added", handleCanvasChange);
        canvas.off("object:removed", handleCanvasChange);
      }
    };
  }, [canvas, getAllObjectsJson]);

  return (
    <FabricJsContext.Provider
      value={{
        canvas,
        setCanvas,
        addObject,
        getAllObjectsJson,
        getActiveObjects,
        removeObject,
        removeActiveObjects,
        setSelection,
      }}
    >
      {children}
    </FabricJsContext.Provider>
  );
};

export default FabricJsContextProvider;
