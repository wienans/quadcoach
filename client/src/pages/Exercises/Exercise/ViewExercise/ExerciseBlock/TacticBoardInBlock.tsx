import {
  Alert,
  IconButton,
  Pagination,
  Skeleton,
  ToggleButton,
  Tooltip,
} from "@mui/material";
import { Block } from "../../../../../api/quadcoachApi/domain";
import { useTranslation } from "react-i18next";
import { useLoadTacticBoard } from "../../../../../hooks";
import {
  useTacticBoardCanvas,
  useTacticBoardData,
} from "../../../../../hooks/taticBoard";
import { TacticBoardProvider } from "../../../../../contexts/tacticBoard";
import { FabricJsCanvas, SoftBox } from "../../../../../components";
import { useCallback, useEffect, useState } from "react";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import { getUuid } from "../../../../../contexts/tacticBoard/TacticBoardFabricJsContext/fabricTypes";
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
  const [currentPage, setPage] = useState<number>(1);
  const [maxPages, setMaxPages] = useState<number>(1);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const {
    canvasFabricRef: canvasRef,
    setSelection,
    setControls,
    getAllObjects,
  } = useTacticBoardCanvas();

  const { loadFromTacticPage: loadFromJson } = useTacticBoardData();

  useEffect(() => {
    if (!isTacticBoardLoading && !isTacticBoardError && tacticBoard) {
      loadFromJson(tacticBoard.pages[0]);
      setMaxPages(tacticBoard.pages.length);
      setSelection(false);
    }
  }, [
    setSelection,
    loadFromJson,
    tacticBoard,
    isTacticBoardError,
    isTacticBoardLoading,
  ]);

  const onLoadPage = useCallback(
    (page: number) => {
      if (!tacticBoard) return;
      loadFromJson(tacticBoard.pages[page - 1]);
      setSelection(false);
      setControls(false);
    },
    [tacticBoard, loadFromJson, setControls, setSelection],
  );
  const onAnimateClick = useCallback(() => {
    setIsAnimating(!isAnimating);
  }, [isAnimating]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAnimating && tacticBoard) {
      // Start the animation only if isAnimating is true
      interval = setInterval(() => {
        setPage((prevPage) => {
          const newPage = (prevPage % tacticBoard.pages.length) + 1;
          getAllObjects().forEach((obj) => {
            const targetObject = tacticBoard.pages[newPage - 1].objects?.find(
              (nextObject) => nextObject.uuid == getUuid(obj),
            );
            if (targetObject && canvasRef.current && targetObject.left !== undefined && targetObject.top !== undefined) {
              obj.animate("left", targetObject.left || 0, {
                onChange: canvasRef.current.renderAll.bind(canvasRef.current),
                duration: 1000,
                onComplete: () => {
                  onLoadPage(newPage);
                },
              });
              obj.animate("top", targetObject.top || 0, {
                onChange: canvasRef.current.renderAll.bind(canvasRef.current),
                duration: 1000,
                onComplete: () => {
                  onLoadPage(newPage);
                },
              });
            }
          });
          return newPage;
        });
      }, 2000);
    }

    // Clean up the interval on component unmount or when the last page is reached
    return () => clearInterval(interval);
  }, [isAnimating, onLoadPage, tacticBoard, getAllObjects, canvasRef]);

  const handleChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    onLoadPage(value);
  };
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
    <div>
      {/* PAGINATION START */}
      <SoftBox
        display="flex"
        alignItems="center"
        justifyContent="center"
        sx={{ flexGrow: 1 }}
      >
        {/* ANIMATION BUTTON START */}

        <Tooltip
          title={t("TacticBoard:topMenu.isAnimatingButton.tooltip", {
            context: isAnimating ? "animationMode" : "pauseMode",
          })}
        >
          <ToggleButton
            value={isAnimating}
            size="small"
            selected={isAnimating}
            onChange={onAnimateClick}
            sx={{
              mr: 1,
            }}
          >
            {isAnimating ? (
              <PauseCircleIcon sx={{ color: "#000000" }} />
            ) : (
              <PlayCircleIcon sx={{ color: "#000000" }} />
            )}
          </ToggleButton>
        </Tooltip>

        {/* ANIMATION BUTTON END */}

        <Pagination
          count={maxPages}
          siblingCount={0}
          boundaryCount={0}
          page={currentPage}
          disabled={isTacticBoardLoading || isAnimating}
          onChange={handleChange}
        />
        <IconButton size="small" href={`/tacticboards/${block.tactics_board}`}>
          <ContentPasteIcon />
        </IconButton>
      </SoftBox>
      <FabricJsCanvas />
    </div>
  );
};

export type TacticBoardInBlockWrapperProps = {
  block: Block;
};

const TacticBoardInBlockWrapper = ({
  block,
}: TacticBoardInBlockWrapperProps): JSX.Element => {
  return (
    <div>
      <TacticBoardProvider heightFirstResizing={false}>
        <TacticBoardInBlock block={block} />
      </TacticBoardProvider>
    </div>
  );
};

export default TacticBoardInBlockWrapper;
