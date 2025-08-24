import { useContext } from "react";
import { TacticBoardDataContext } from "../../contexts/tacticBoard/TacticBoardDataContext/TacticBoardDataContext";

export const useTacticBoardData = () => {
  const context = useContext(TacticBoardDataContext);

  if (!context) {
    throw new Error(
      "useTacticBoardData must be used within a TacticBoardDataContextProvider",
    );
  }

  return context;
};
