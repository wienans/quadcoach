import { useEffect } from "react";
import { useTacticBoardCanvas, useTacticBoardData } from ".";
import {
  useGetSharedTacticBoardQuery,
  useGetTacticBoardQuery,
} from "../../api/quadcoachApi/tacticboardApi";

export const useLoadTacticBoard = (
  tacticBoardId?: string,
  sharedToken?: string,
) => {
  const { setSelection } = useTacticBoardCanvas();
  const { loadFromTacticPage: loadFromJson } = useTacticBoardData();

  const {
    data: tacticBoard,
    isError: isTacticBoardError,
    isLoading: isTacticBoardLoading,
  } = useGetTacticBoardQuery(tacticBoardId || "", {
    skip: tacticBoardId == null || (sharedToken != null && sharedToken !== ""),
  });

  const {
    data: sharedTacticBoard,
    isError: isSharedTacticBoardError,
    isLoading: isSharedTacticBoardLoading,
  } = useGetSharedTacticBoardQuery(sharedToken || "", {
    skip: sharedToken == null || sharedToken === "",
  });

  const boardToUse = sharedToken ? sharedTacticBoard : tacticBoard;
  const isError = sharedToken ? isSharedTacticBoardError : isTacticBoardError;
  const isLoading = sharedToken
    ? isSharedTacticBoardLoading
    : isTacticBoardLoading;

  useEffect(() => {
    if (isLoading || isError || !boardToUse?.pages?.length) return;
  }, [isError, isLoading, boardToUse, loadFromJson, setSelection]);

  return {
    tacticBoard: boardToUse,
    isTacticBoardError: isError,
    isTacticBoardLoading: isLoading,
  };
};
