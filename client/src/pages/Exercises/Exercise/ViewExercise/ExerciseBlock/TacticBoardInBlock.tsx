/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { useCallback, useEffect, useMemo, useState } from "react";
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

  const targetByUuidMaps = useMemo(() => {
    if (!tacticBoard) return null;
    return tacticBoard.pages.map((page) => {
      const objects = page.objects ?? [];
      const map = new Map<string, (typeof objects)[number]>();
      objects.forEach((o) => {
        if (typeof (o as { uuid?: unknown }).uuid === "string") {
          map.set((o as { uuid: string }).uuid, o);
        }
      });
      return map;
    });
  }, [tacticBoard]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isAnimating && tacticBoard) {
      interval = setInterval(() => {
        setPage((prevPage) => {
          const newPage = (prevPage % tacticBoard.pages.length) + 1;

          const targetByUuid = targetByUuidMaps?.[newPage - 1];
          if (!targetByUuid) {
            onLoadPage(newPage);
            return newPage;
          }

          const canvas = canvasRef.current;
          const requestRenderAll = () => {
            canvas?.requestRenderAll();
          };

          let pendingAnimations = 0;
          let didTriggerLoad = false;

          const triggerLoadOnce = () => {
            if (didTriggerLoad) return;
            didTriggerLoad = true;
            onLoadPage(newPage);
          };

          const onOneAnimationComplete = () => {
            pendingAnimations -= 1;
            if (pendingAnimations <= 0) {
              triggerLoadOnce();
            }
          };

          getAllObjects().forEach((obj) => {
            const objUuid = getUuid(obj);
            if (typeof objUuid !== "string") return;

            const targetObject = targetByUuid.get(objUuid);
            if (!targetObject || !canvas) return;

            const targetLeft = targetObject.left;
            const targetTop = targetObject.top;

            if (
              typeof targetLeft !== "number" ||
              typeof targetTop !== "number"
            ) {
              return;
            }

            const currentLeft = obj.left ?? 0;
            const currentTop = obj.top ?? 0;

            const shouldAnimateLeft = targetLeft !== currentLeft;
            const shouldAnimateTop = targetTop !== currentTop;

            if (!shouldAnimateLeft && !shouldAnimateTop) return;

            if (shouldAnimateLeft) {
              pendingAnimations += 1;
              (obj as any).animate("left", targetLeft, {
                onChange: requestRenderAll,
                duration: 1000,
                onComplete: onOneAnimationComplete,
              });
            }

            if (shouldAnimateTop) {
              pendingAnimations += 1;
              (obj as any).animate("top", targetTop, {
                onChange: requestRenderAll,
                duration: 1000,
                onComplete: onOneAnimationComplete,
              });
            }
          });

          if (pendingAnimations === 0) {
            triggerLoadOnce();
          }

          return newPage;
        });
      }, 2000);
    }

    return () => clearInterval(interval);
  }, [isAnimating, onLoadPage, tacticBoard, getAllObjects, canvasRef, targetByUuidMaps]);

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
