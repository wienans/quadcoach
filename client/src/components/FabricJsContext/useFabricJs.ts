import { useContext } from "react";
import { FabricJsContextProps } from "./FabricJsContext";
import { FabricJsContext } from "./FabricJsContext";

export const useFabricJs = () => {
  const context = useContext<FabricJsContextProps | undefined>(FabricJsContext);

  if (!context) {
    throw new Error(
      "useFabricJs must be used within a FabricJsContextProvider",
    );
  }

  return context;
};
