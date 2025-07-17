import { useContext } from "react";
import { TacticBoardDrawingContext } from "../../contexts/tacticBoard/TacticBoardDrawingContext/TacticBoardDrawingContext";

export const useTacticBoardDrawing = () => {
  const context = useContext(TacticBoardDrawingContext);

  if (!context) {
    throw new Error(
      "useTacticBoardDrawing must be used within a TacticBoardDrawingContextProvider",
    );
  }

  return context;
};