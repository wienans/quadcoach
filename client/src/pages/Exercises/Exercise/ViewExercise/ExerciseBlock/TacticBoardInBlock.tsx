import { Alert, Box, Skeleton } from "@mui/material";
import { Block, TacticBoard } from "../../../../../api/quadcoachApi/domain";
import { useTranslation } from "react-i18next";
import { useLoadTacticBoard } from "../../../../../hooks";
import { TacticBoardFabricJsContextProvider } from "../../../../../contexts";
import { FabricJsCanvas } from "../../../../../components";
import { useRef } from "react";

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

  return (
    // <Box
    //   ref={refContainer}
    //   sx={{
    //     width: "100%",
    //     display: "flex",
    //     justifyContent: "center",
    //   }}
    // >
    <FabricJsCanvas initialHight={686} initialWidth={1220} />
    // </Box>
  );
};

export type TacticBoardInBlockWrapperProps = {
  block: Block;
};

const TacticBoardInBlockWrapper = ({
  block,
}: TacticBoardInBlockWrapperProps): JSX.Element => {
  return (
    <TacticBoardFabricJsContextProvider>
      <TacticBoardInBlock block={block} />
    </TacticBoardFabricJsContextProvider>
  );
};

export default TacticBoardInBlockWrapper;
