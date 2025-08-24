import { useContext } from "react";
import { TacticBoardCanvasContext } from "../../contexts/tacticBoard/TacticBoardCanvasContext/TacticBoardCanvasContext";

export const useTacticBoardCanvas = () => {
  const context = useContext(TacticBoardCanvasContext);

  if (!context) {
    throw new Error(
      "useTacticBoardCanvas must be used within a TacticBoardCanvasContextProvider",
    );
  }

  return context;
};
