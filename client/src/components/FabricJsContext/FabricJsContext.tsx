import {
  createContext,
  useContext,
  ReactNode,
  FC,
  useState,
  useCallback,
  useEffect,
} from "react";
import { fabric } from "fabric";

// Define a generic type for the object to be added
type FabricJsObject = fabric.Object;

export interface FabricJsContextProps {
  canvas: fabric.Canvas | null;
  setCanvas: (canvas: fabric.Canvas) => void;
  addObject: (object: FabricJsObject) => void;
  getAllObjectsJson: () => string;
}

export const FabricJsContext = createContext<FabricJsContextProps | undefined>(
  undefined,
);

const FabricJsContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);

  const addObject = useCallback(
    (object: FabricJsObject) => {
      if (canvas) {
        canvas.add(object);
      }
    },
    [canvas],
  );

  const getAllObjectsJson = useCallback(() => {
    if (canvas) {
      return JSON.stringify(canvas.toJSON());
    }
    return "";
  }, [canvas]);

  // Autosave Functionality
  useEffect(() => {
    const handleCanvasChange = () => {
      const json = getAllObjectsJson();
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
      value={{ canvas, setCanvas, addObject, getAllObjectsJson }}
    >
      {children}
    </FabricJsContext.Provider>
  );
};

export default FabricJsContextProvider;
