import { useEffect } from "react";
import { useTacticBoardFabricJs } from "..";
import { useGetTacticBoardQuery } from "../../api/quadcoachApi/tacticboardApi";

export const useLoadTacticBoard = (tacticBoardId?: string) => {
  const { loadFromTacticPage: loadFromJson, setSelection } =
    useTacticBoardFabricJs();

  const {
    data: tacticBoard,
    isError: isTacticBoardError,
    isLoading: isTacticBoardLoading,
  } = useGetTacticBoardQuery(tacticBoardId || "", {
    skip: tacticBoardId == null,
  });

  useEffect(() => {
    if (
      isTacticBoardLoading ||
      isTacticBoardError ||
      !tacticBoard?.pages?.length
    )
      return;
  }, [
    isTacticBoardError,
    isTacticBoardLoading,
    tacticBoard,
    loadFromJson,
    setSelection,
  ]);

  return { tacticBoard, isTacticBoardError, isTacticBoardLoading };
};
