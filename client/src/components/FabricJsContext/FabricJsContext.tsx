import {
  createContext,
  useContext,
  ReactNode,
  FC,
  useState,
  useCallback,
} from "react";
import { fabric } from "fabric";

// Define a generic type for the object to be added
type FabricJsObject = fabric.Object;

export interface FabricJsContextProps {
  canvas: fabric.Canvas | null;
  setCanvas: (canvas: fabric.Canvas) => void;
  addObject: (object: FabricJsObject) => void;
}

export const FabricJsContext = createContext<FabricJsContextProps | undefined>(
  undefined,
);

export const FabricJsContextProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);

  const addObject = useCallback(
    (object: FabricJsObject) => {
      if (canvas) {
        canvas.add(object);
      }
    },
    [canvas],
  );

  return (
    <FabricJsContext.Provider value={{ canvas, setCanvas, addObject }}>
      {children}
    </FabricJsContext.Provider>
  );
};
