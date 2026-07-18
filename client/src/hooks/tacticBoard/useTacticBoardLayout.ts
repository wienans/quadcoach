import { useContext } from "react";
import { TacticBoardLayoutContext } from "../../contexts/tacticBoard/TacticBoardLayoutContext/TacticBoardLayoutContext";

export const useTacticBoardLayout = () => {
  const context = useContext(TacticBoardLayoutContext);

  if (!context) {
    throw new Error(
      "useTacticBoardLayout must be used within a TacticBoardLayoutContextProvider",
    );
  }

  return context;
};
