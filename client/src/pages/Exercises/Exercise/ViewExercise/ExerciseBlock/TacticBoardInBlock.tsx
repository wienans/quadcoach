import {
  Alert,
  Box,
  Pagination,
  Skeleton,
  ToggleButton,
  Tooltip,
} from "@mui/material";
import { Block, TacticBoard } from "../../../../../api/quadcoachApi/domain";
import { useTranslation } from "react-i18next";
import {
  useLoadTacticBoard,
  useTacticBoardFabricJs,
} from "../../../../../hooks";
import { TacticBoardFabricJsContextProvider } from "../../../../../contexts";
import { FabricJsCanvas, SoftBox } from "../../../../../components";
import { useCallback, useEffect, useRef, useState } from "react";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
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
    loadFromTacticPage: loadFromJson,
    setSelection,
    setControls,
    getAllObjects,
    getAllObjectsJson,
  } = useTacticBoardFabricJs();

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
    let interval: number;
    if (isAnimating && tacticBoard) {
      // Start the animation only if isAnimating is true
      interval = setInterval(() => {
        setPage((prevPage) => {
          const newPage = (prevPage % tacticBoard.pages.length) + 1;
          getAllObjects().forEach((obj) => {
            const targetObject = tacticBoard.pages[newPage - 1].objects?.find(
              (nextObject) => nextObject.uuid == obj.uuid,
            );
            if (targetObject && canvasRef.current) {
              obj.animate("left", targetObject.left, {
                onChange: canvasRef.current.renderAll.bind(canvasRef.current),
                duration: 1000,
                onComplete: () => {
                  onLoadPage(newPage);
                },
              });
              obj.animate("top", targetObject.top, {
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
              <PauseCircleIcon color="black" />
            ) : (
              <PlayCircleIcon color="black" />
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
      </SoftBox>
      <FabricJsCanvas initialHight={686} initialWidth={1220} />
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
      {/* PAGINATION END */}
      <TacticBoardFabricJsContextProvider heightFirstResizing={false}>
        <TacticBoardInBlock block={block} />
      </TacticBoardFabricJsContextProvider>
    </div>
  );
};

export default TacticBoardInBlockWrapper;
