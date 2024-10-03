import { Alert, Box, Skeleton } from "@mui/material";
import { Block, TacticBoard } from "../../../../../api/quadcoachApi/domain";
import { useTranslation } from "react-i18next";
import {
  useLoadTacticBoard,
  useTacticBoardFabricJs,
} from "../../../../../hooks";
import { TacticBoardFabricJsContextProvider } from "../../../../../contexts";
import { FabricJsCanvas } from "../../../../../components";
import { useCallback, useEffect, useRef } from "react";

export type TacticBoardInBlockProps = {
  block: Block;
};

const TacticBoardInBlock = ({
  block,
}: TacticBoardInBlockProps): JSX.Element | undefined => {
  const { t } = useTranslation("Exercise");

  const { tactics_board: tacticBoardId } = block;
  const { tacticBoard, isTacticBoardError, isTacticBoardLoading } =
    useLoadTacticBoard(tacticBoardId);
  // const refContainer = useRef<HTMLDivElement>(null);
  const {
    canvasFabricRef: canvas,
    loadFromTacticPage: loadFromJson,
    setSelection,
    getAllObjects,
    getAllObjectsJson,
  } = useTacticBoardFabricJs();

  useEffect(() => {
    if (!isTacticBoardLoading && !isTacticBoardError && tacticBoard) {
      loadFromJson(tacticBoard.pages[0]);
      setSelection(false);
    }
  }, [
    setSelection,
    loadFromJson,
    tacticBoard,
    isTacticBoardError,
    isTacticBoardLoading,
  ]);

  if (!tacticBoardId) return;
  if (isTacticBoardError)
    return (
      <Alert severity="error">{t("Exercise:block.tacticboard.isError")}</Alert>
    );
  if (isTacticBoardLoading)
    return <Skeleton variant="rectangular" width="100%" height={60} />;

  if (!tacticBoard)
    return (
      <Alert severity="warning">
        {t("Exercise:block.tacticboard.notFound")}
      </Alert>
    );

  return <FabricJsCanvas initialHight={686} initialWidth={1220} />;
};

export type TacticBoardInBlockWrapperProps = {
  block: Block;
};

const TacticBoardInBlockWrapper = ({
  block,
}: TacticBoardInBlockWrapperProps): JSX.Element => {
  return (
    <TacticBoardFabricJsContextProvider heightFirstResizing={false}>
      <TacticBoardInBlock block={block} />
    </TacticBoardFabricJsContextProvider>
  );
};

export default TacticBoardInBlockWrapper;
