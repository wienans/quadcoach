import { useState, useCallback, createContext } from "react";
import { fabric } from "fabric";

export type FabricJsContextProps = {
  canvas: fabric.Canvas | null;
  initCanvas: (el) => void;
  loadFromJSON: () => void;
  activeObject: string;
  setActiveObject: () => void;
};

export const FabricJsContext = createContext<FabricJsContextProps>({
  canvas: null,
  initCanvas = initCanvas,
  loadFromJSON = loadFromJSON,
  activeObject = activeObject,
  setActiveObject = setActiveObject,
});

export const FabricJsContextProvider = ({ children }) => {
  const [canvas, setCanvas] = useState(null);
  const [activeObject, setActiveObject] = useState(null);

  const initCanvas = useCallback((el) => {
    const canvasOptions = {
      preserveObjectStacking: true,
      selection: true,
      defaultCursor: "default",
      backgroundColor: "#f3f3f3",
    };
    let c = new fabric.Canvas(el, canvasOptions);
    c.renderAll();
    setCanvas(c);
  }, []);

  const loadFromJSON = useCallback((el, json) => {
    let c = new fabric.Canvas(el);
    c.loadFromJSON(
      json,
      () => {
        c.renderAll.bind(c);
        c.setWidth(json.width);
        c.setHeight(json.height);
      },
      function (o, object) {
        fabric.log(o, object);
      },
    );
    c.renderAll();
    setCanvas(c);
  }, []);

  return (
    <FabricContext.Provider
      value={{
        canvas,
        initCanvas,
        loadFromJSON,
        activeObject,
        setActiveObject,
      }}
    >
      {children}
    </FabricContext.Provider>
  );
};
