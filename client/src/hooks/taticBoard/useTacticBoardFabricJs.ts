import { useContext } from "react";
import {
  TacticBoardFabricJsContext,
  TacticBoardFabricJsContextProps,
} from "../../contexts/tacticBoard";

export const useTacticBoardFabricJs = () => {
  const context = useContext<TacticBoardFabricJsContextProps | undefined>(
    TacticBoardFabricJsContext,
  );

  if (!context) {
    throw new Error(
      "useTacticBoardFabricJs must be used within a TacticBoardFabricJsContextProps",
    );
  }

  return context;
};
