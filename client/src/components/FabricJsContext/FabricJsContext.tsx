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
  getAllObjectsJson: () => object;
  getActiveObjects: () => fabric.Object[];
  setSelection: (selection: boolean) => void;
  loadFromJson: (page: object) => void;
  setDrawMode: (drawMode: boolean) => void;
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
      let json = canvas.toJSON(["uuid"]);
      if (json.backgroundImage) {
        json.backgroundImage.src = new URL(json.backgroundImage.src).pathname;
      }
      return json;
    }
    return {};
  }, [canvas]);

  const loadFromJson = useCallback(
    (page: object) => {
      if (canvas) {
        return canvas.loadFromJSON(page, () => {
          canvas.renderAll();
        });
      }
      return {};
    },
    [canvas],
  );

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
  const setDrawMode = useCallback(
    (drawMode: boolean) => {
      if (canvas) {
        canvas.isDrawingMode = drawMode;
      }
    },
    [canvas],
  );
  // Autosave Functionality not implemented
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
        loadFromJson,
        setDrawMode,
      }}
    >
      {children}
    </FabricJsContext.Provider>
  );
};

export default FabricJsContextProvider;
