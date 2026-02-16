import {
  createContext,
  ReactNode,
  FC,
  useCallback,
  useMemo,
  useContext,
} from "react";
import { TacticPage } from "../../../api/quadcoachApi/domain";
import { TacticBoardCanvasContext } from "../TacticBoardCanvasContext/TacticBoardCanvasContext";
import { TacticPageValidator } from "../TacticBoardFabricJsContext/validation";
import { FabricObjectFactory } from "../TacticBoardFabricJsContext/objectFactory";
import { CanvasOperationError } from "../TacticBoardFabricJsContext/types";
import { fabric } from "fabric";

export interface TacticBoardDataContextProps {
  loadFromTacticPage: (page: TacticPage) => void;
  getAllObjectsJson: () => object;
}

export const TacticBoardDataContext = createContext<
  TacticBoardDataContextProps | undefined
>(undefined);

const TacticBoardDataContextProvider: FC<{
  children: ReactNode;
}> = ({ children }) => {
  const { canvasFabricRef } = useContext(TacticBoardCanvasContext)!;

  const loadFromTacticPage = useCallback(
    (page: TacticPage) => {
      const canvasFabric = canvasFabricRef.current;
      if (!canvasFabric) return;

      try {
        // Validate the page data before loading
        const validation = TacticPageValidator.validate(page);
        if (!validation.isValid) {
          console.warn("TacticPage validation failed:", validation.errors);
        }

        // Clear existing objects
        canvasFabric.remove(...canvasFabric.getObjects());

        // Set background image
        if (page.backgroundImage?.src) {
          canvasFabric.setBackgroundImage(page.backgroundImage.src, () =>
            canvasFabric.requestRenderAll(),
          );
        }

        // Load objects using factory pattern
        // console.log("Loading objects:", page.objects?.length || 0);
        page.objects?.forEach((objData, index) => {
          try {
            // console.log(`Creating object ${index}:`, objData.type, objData);
            const fabricObj = FabricObjectFactory.createObject(objData);
            if (fabricObj) {
              // console.log(`Successfully created object ${index}:`, fabricObj);
              canvasFabric.add(fabricObj);
            } else {
              console.warn(`Object ${index} creation returned null:`, objData);
            }
          } catch (error) {
            console.error("Failed to create object:", objData, error);
            // Fallback to original object creation for compatibility
            try {
              if (objData.type === "circle") {
                const addObj = new fabric.Circle(objData as object);
                canvasFabric.add(addObj);
              } else if (objData.type === "rect") {
                const addObj = new fabric.Rect(objData as object);
                canvasFabric.add(addObj);
              } else if (objData.type === "path") {
                const addObj = new fabric.Path(
                  objData.path?.toString(),
                  objData as object,
                );
                canvasFabric.add(addObj);
              } else if (objData.type === "text") {
                if (objData.text) {
                  const addObj = new fabric.Text(
                    objData.text,
                    objData as object,
                  );
                  canvasFabric.add(addObj);
                }
              } else if (objData.type === "textbox") {
                const addObj = new fabric.Textbox(
                  objData.text ?? "",
                  objData as object,
                );
                canvasFabric.add(addObj);
              }
            } catch (fallbackError) {
              console.error(
                "Fallback object creation also failed:",
                fallbackError,
              );
            }
          }
        });

        canvasFabric.requestRenderAll();
      } catch (error) {
        throw new CanvasOperationError("Loading tactic page", error as Error);
      }
    },
    [canvasFabricRef],
  );

  const getAllObjectsJson = useCallback(() => {
    try {
      const canvasFabric = canvasFabricRef.current;
      if (!canvasFabric) return {};

      const json = canvasFabric.toJSON([
        "uuid",
        "objectType",
      ]) as unknown as TacticPage;

      if (json.backgroundImage?.src) {
        try {
          json.backgroundImage.src = new URL(json.backgroundImage.src).pathname;
        } catch (urlError) {
          // If URL parsing fails, keep the original src
          console.warn("Failed to parse background image URL:", urlError);
        }
      }

      return json;
    } catch (error) {
      console.error("Failed to get objects JSON:", error);
      return {};
    }
  }, [canvasFabricRef]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      loadFromTacticPage,
      getAllObjectsJson,
    }),
    [loadFromTacticPage, getAllObjectsJson],
  );

  return (
    <TacticBoardDataContext.Provider value={contextValue}>
      {children}
    </TacticBoardDataContext.Provider>
  );
};

export default TacticBoardDataContextProvider;
