import "./fabricJsExtensions";
import {
  createContext,
  ReactNode,
  FC,
  useCallback,
  useRef,
  MutableRefObject,
} from "react";
import { fabric } from "fabric";
import { TacticPage } from "../../../api/quadcoachApi/domain";
import { useContainerResizeEvent } from "./useResizeEvent";

const canvasDefaultOptions: fabric.ICanvasOptions = {
  preserveObjectStacking: true,
  width: 1220,
  height: 686,
  selection: false,
  allowTouchScrolling: true,
};

export interface TacticBoardFabricJsContextProps {
  containerRef: MutableRefObject<HTMLDivElement | null>;
  // setBoxRef: (boxRef: HTMLDivElement | null) => void;
  canvasRef: MutableRefObject<HTMLCanvasElement | null>;
  setCanvasRef: (instance: HTMLCanvasElement | null) => void;
  setContainerRef: (instance: HTMLDivElement | null) => void;
  // setCanvas: (canvas: HTMLCanvasElement | null) => void;
  canvasFabricRef: MutableRefObject<fabric.Canvas | null>;
  // setCanvasFabric: (canvas: fabric.Canvas) => void;
  addObject: (object: fabric.Object) => void;
  removeActiveObjects: () => void;
  removeObject: (object: fabric.Object) => void;
  getAllObjects: () => fabric.Object[];
  getAllObjectsJson: () => object;
  getActiveObjects: () => fabric.Object[];
  setSelection: (selection: boolean) => void;
  loadFromTacticPage: (page: TacticPage) => void;
  setDrawMode: (drawMode: boolean) => void;
  setControls: (controls: boolean) => void;
  setBackgroundImage: (url: string) => void;
  getBackgroundImage: () => string | undefined;
}

export const TacticBoardFabricJsContext = createContext<
  TacticBoardFabricJsContextProps | undefined
>(undefined);

const TacticBoardFabricJsContextProvider: FC<{
  children: ReactNode;
  heightFirstResizing: boolean;
}> = ({ children, heightFirstResizing }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasFabricRef = useRef<fabric.Canvas | null>(null);

  const { initializeContainerResizeObserver } = useContainerResizeEvent(
    containerRef,
    canvasFabricRef,
    heightFirstResizing,
  );

  const setCanvasRef = useCallback((instance: HTMLCanvasElement | null) => {
    canvasRef.current = instance;

    if (canvasFabricRef.current) canvasFabricRef.current.dispose();

    if (!instance) return;

    canvasFabricRef.current = new fabric.Canvas(
      canvasRef.current,
      canvasDefaultOptions,
    );
  }, []);

  const setContainerRef = useCallback(
    (instance: HTMLDivElement | null) => {
      containerRef.current = instance;

      initializeContainerResizeObserver();
    },
    [initializeContainerResizeObserver],
  );

  const addObject = useCallback((object: fabric.Object) => {
    canvasFabricRef.current?.add(object);
  }, []);

  const removeObject = useCallback((object: fabric.Object) => {
    canvasFabricRef.current?.remove(object);
  }, []);

  const removeActiveObjects = useCallback(() => {
    const canvasFabric = canvasFabricRef.current;
    if (!canvasFabric) return;
    const selectedObjects = canvasFabric.getActiveObjects();
    canvasFabric.remove(...selectedObjects);
    canvasFabric.discardActiveObject();
  }, []);

  const getActiveObjects = useCallback(() => {
    return canvasFabricRef.current?.getActiveObjects() ?? [];
  }, []);

  const getAllObjects = useCallback(() => {
    return canvasFabricRef.current?.getObjects() ?? [];
  }, []);

  const getAllObjectsJson = useCallback(() => {
    const canvasFabric = canvasFabricRef.current;
    if (!canvasFabric) return {};

    const json = canvasFabric.toJSON([
      "uuid",
      "objectType",
    ]) as unknown as TacticPage;
    if (json.backgroundImage) {
      json.backgroundImage.src = new URL(json.backgroundImage.src).pathname;
    }
    return json;
  }, []);

  const setBackgroundImage = useCallback((src: string) => {
    const canvasFabric = canvasFabricRef.current;
    if (!canvasFabric) return;
    canvasFabric.setBackgroundImage(
      src,
      canvasFabric.renderAll.bind(canvasFabric),
    );
  }, []);

  const getBackgroundImage = useCallback(() => {
    const canvasFabric = canvasFabricRef.current;
    if (!canvasFabric) return;
    const bgImage = canvasFabric.backgroundImage as fabric.Image;
    if (!bgImage?.getSrc()) return;
    return new URL(bgImage.getSrc()).pathname;
  }, []);

  const setControls = useCallback((controls: boolean) => {
    canvasFabricRef.current?.getObjects().forEach((obj) => {
      obj.hasControls = controls;
    });
  }, []);

  const loadFromTacticPage = useCallback((page: TacticPage) => {
    const canvasFabric = canvasFabricRef.current;
    if (!canvasFabric) return;
    canvasFabric.remove(...canvasFabric.getObjects());
    // canvasFabric.getObjects().forEach((obj) => {
    //   canvasFabric.remove(obj);
    // });
    canvasFabric.setBackgroundImage(
      page.backgroundImage.src,
      canvasFabric.renderAll.bind(canvasFabric),
    );
    page.objects?.forEach((obj) => {
      if (obj.type == "circle") {
        const addObj = new fabric.Circle(obj as object);
        canvasFabric.add(addObj);
      } else if (obj.type == "rect") {
        const addObj = new fabric.Rect(obj as object);
        canvasFabric.add(addObj);
      } else if (obj.type == "path") {
        const addObj = new fabric.Path(obj.path?.toString(), obj as object);
        canvasFabric.add(addObj);
      } else if (obj.type == "group") {
        const objects: fabric.Object[] = [];
        obj.objects?.forEach((obj) => {
          if (obj.type == "circle") {
            const addObj = new fabric.Circle(obj as object);
            objects.push(addObj);
          } else if (obj.type == "text") {
            if (obj.text) {
              const addObj = new fabric.Text(obj.text, obj as object);
              objects.push(addObj);
            }
          } else if (obj.type == "path") {
            const addObj = new fabric.Path(obj.path?.toString(), obj as object);
            objects.push(addObj);
          } else if (obj.type == "rect") {
            const addObj = new fabric.Rect(obj as object);
            objects.push(addObj);
          }
        });
        const addObj = new fabric.Group(objects, obj as object);
        canvasFabric.add(addObj);
      }
    });
  }, []);

  const setSelection = useCallback((selection: boolean) => {
    canvasFabricRef.current?.getObjects().forEach((obj) => {
      obj.evented = selection;
    });
  }, []);

  const setDrawMode = useCallback((drawMode: boolean) => {
    const canvasFabric = canvasFabricRef.current;
    if (!canvasFabric) return;

    canvasFabric.isDrawingMode = drawMode;
  }, []);

  return (
    <TacticBoardFabricJsContext.Provider
      value={{
        containerRef,
        canvasRef,
        setCanvasRef,
        setContainerRef,
        canvasFabricRef,
        addObject,
        getAllObjects,
        getAllObjectsJson,
        getActiveObjects,
        removeObject,
        removeActiveObjects,
        setSelection,
        loadFromTacticPage,
        setDrawMode,
        setControls,
        setBackgroundImage,
        getBackgroundImage,
      }}
    >
      {children}
    </TacticBoardFabricJsContext.Provider>
  );
};

export default TacticBoardFabricJsContextProvider;
