import { createContext, ReactNode, FC, useState, useCallback } from "react";
import { fabric } from "fabric";
import { TacticPage } from "../../api/quadcoachApi/domain";

export interface FabricJsContextProps {
  canvas: fabric.Canvas | null;
  setCanvas: (canvas: fabric.Canvas) => void;
  addObject: (object: fabric.Object) => void;
  removeActiveObjects: () => void;
  removeObject: (object: fabric.Object) => void;
  getAllObjects: () => fabric.Object[];
  getAllObjectsJson: () => object;
  getActiveObjects: () => fabric.Object[];
  setSelection: (selection: boolean) => void;
  loadFromJson: (page: TacticPage) => void;
  setDrawMode: (drawMode: boolean) => void;
  setControls: (controls: boolean) => void;
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

  const getAllObjects = useCallback(() => {
    if (canvas) {
      return canvas.getObjects();
    }
    return [];
  }, [canvas]);

  const getAllObjectsJson = useCallback(() => {
    if (canvas) {
      const json = canvas.toJSON(["uuid"]) as unknown as TacticPage;
      if (json.backgroundImage) {
        json.backgroundImage.src = new URL(json.backgroundImage.src).pathname;
      }
      return json;
    }
    return {};
  }, [canvas]);

  const setControls = useCallback(
    (controls: boolean) => {
      if (canvas) {
        canvas.getObjects().forEach((obj) => {
          obj.hasControls = controls;
        });
      }
    },
    [canvas],
  );
  const loadFromJson = useCallback(
    (page: TacticPage) => {
      if (canvas) {
        canvas.getObjects().forEach((obj) => {
          canvas.remove(obj);
        });
        canvas.setBackgroundImage(
          page.backgroundImage.src,
          canvas.renderAll.bind(canvas),
        );
        page.objects?.forEach((obj) => {
          if (obj.type == "circle") {
            const addObj = new fabric.Circle(obj);
            canvas.add(addObj);
          } else if (obj.type == "rect") {
            const addObj = new fabric.Rect(obj);
            canvas.add(addObj);
          } else if (obj.type == "path") {
            const addObj = new fabric.Path(obj.path?.toString(), obj as object);
            canvas.add(addObj);
          } else if (obj.type == "group") {
            const objects: fabric.Object[] = [];
            obj.objects?.forEach((obj) => {
              if (obj.type == "circle") {
                const addObj = new fabric.Circle(obj);
                objects.push(addObj);
              } else if (obj.type == "text") {
                if (obj.text) {
                  const addObj = new fabric.Text(obj.text, obj);
                  objects.push(addObj);
                }
              }
            });
            const addObj = new fabric.Group(objects, obj);
            canvas.add(addObj);
          }
        });
      }
    },
    [canvas],
  );

  const setSelection = useCallback(
    (selection: boolean) => {
      if (canvas) {
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
  return (
    <FabricJsContext.Provider
      value={{
        canvas,
        setCanvas,
        addObject,
        getAllObjects,
        getAllObjectsJson,
        getActiveObjects,
        removeObject,
        removeActiveObjects,
        setSelection,
        loadFromJson,
        setDrawMode,
        setControls,
      }}
    >
      {children}
    </FabricJsContext.Provider>
  );
};

export default FabricJsContextProvider;
