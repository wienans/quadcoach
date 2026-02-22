/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Alert,
  Pagination,
  Skeleton,
  ToggleButton,
  Toolbar,
  Tooltip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import EditIcon from "@mui/icons-material/Edit";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import MovieIcon from "@mui/icons-material/Movie";
import { useLoadTacticBoard } from "../../hooks";
import {
  useTacticBoardCanvas,
  useTacticBoardData,
} from "../../hooks/taticBoard";
import { FabricJsCanvas, SoftBox } from "../../components";
import { TacticBoardProvider } from "../../contexts/tacticBoard";
import { useAuth } from "../../store/hooks";
import useVideoRecording from "../../hooks/taticBoard/useVideoRecording";
import { useGetAllTacticboardAccessUsersQuery } from "../../api/quadcoachApi/tacticboardApi";
import { getUuid } from "../../contexts/tacticBoard/TacticBoardFabricJsContext/fabricTypes";
export type TacticBoardInProfileProps = {
  tacticBoardId: string | undefined;
  sharedToken?: string;
  isEditMode?: boolean;
  onEditClick?: () => void;
};

const TacticBoardInProfile = ({
  tacticBoardId,
  sharedToken,
  isEditMode,
  onEditClick,
}: TacticBoardInProfileProps): JSX.Element | undefined => {
  const { t } = useTranslation("TacticBoardProfile");
  const navigate = useNavigate();
  const { tacticBoard, isTacticBoardError, isTacticBoardLoading } =
    useLoadTacticBoard(tacticBoardId, sharedToken);

  const { isRecording, startRecording, stopRecording, downloadVideo } =
    useVideoRecording();

  const [currentPage, setPage] = useState<number>(1);
  const [maxPages, setMaxPages] = useState<number>(1);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [isPrivileged, setIsPrivileged] = useState<boolean>(false);
  const refFullScreenContainer = useRef<HTMLDivElement>(null);
  const {
    canvasFabricRef: canvasRef,
    setSelection,
    setControls,
    getAllObjects,
  } = useTacticBoardCanvas();

  const { loadFromTacticPage: loadFromJson } = useTacticBoardData();

  const { id: userId, roles: userRoles } = useAuth();

  const { data: accessUsers } = useGetAllTacticboardAccessUsersQuery(
    tacticBoardId || "",
    { skip: !tacticBoardId || !userId || userId === "" },
  );

  useEffect(() => {
    if (sharedToken) {
      setIsPrivileged(false);
      return;
    }

    if (
      userId == tacticBoard?.user ||
      userRoles.includes("Admin") ||
      userRoles.includes("admin")
    ) {
      setIsPrivileged(true);
    } else {
      if (accessUsers) {
        setIsPrivileged(
          accessUsers.some((user) => {
            return (
              user.user._id.toString() === userId && user.access === "edit"
            );
          }),
        );
      }
    }
  }, [userId, tacticBoard, userRoles, accessUsers, sharedToken]);

  useEffect(() => {
    if (
      !isTacticBoardLoading &&
      !isTacticBoardError &&
      tacticBoard &&
      tacticBoard.pages &&
      tacticBoard.pages.length > 0
    ) {
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

  const onRecordClick = () => {
    const canvas = canvasRef.current?.getElement();
    if (!canvas) return;

    if (!isRecording) {
      startRecording(canvas, tacticBoard ? tacticBoard.pages.length : 0, 2000);
    } else {
      stopRecording();
      downloadVideo(
        tacticBoard?.name ? `${tacticBoard.name}.mp4` : "tacticboard.mp4",
      );
    }
  };

  const onFullScreenClick = () => {
    const container = refFullScreenContainer.current;
    const isFullscreen = document.fullscreenElement;
    const doc = document as Document & {
      mozCancelFullScreen?: () => Promise<void>;
      webkitExitFullscreen?: () => Promise<void>;
      msExitFullscreen?: () => Promise<void>;
    };

    if (isFullscreen) {
      if (doc.exitFullscreen) {
        doc.exitFullscreen();
      } else if (doc.mozCancelFullScreen) {
        doc.mozCancelFullScreen();
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen();
      }
    } else if (container) {
      const element = container as HTMLElement & {
        mozRequestFullScreen?: () => Promise<void>;
        webkitRequestFullscreen?: () => Promise<void>;
        msRequestFullscreen?: () => Promise<void>;
      };

      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(document.fullscreenElement != null);
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
    };
  }, []);

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
  }, [
    isAnimating,
    onLoadPage,
    tacticBoard,
    getAllObjects,
    canvasRef,
    targetByUuidMaps,
  ]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording && tacticBoard) {
      interval = setInterval(() => {
        setPage((prevPage) => {
          const newPage = (prevPage % tacticBoard.pages.length) + 1;
          if (prevPage === tacticBoard.pages.length && newPage === 1) {
            stopRecording();
            downloadVideo(
              tacticBoard.name ? `${tacticBoard.name}.mp4` : "tacticboard.mp4",
            );
          }

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

    return () => {
      clearInterval(interval);
    };
  }, [
    isRecording,
    tacticBoard,
    stopRecording,
    downloadVideo,
    getAllObjects,
    canvasRef,
    onLoadPage,
    targetByUuidMaps,
  ]);

  const handleChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    onLoadPage(value);
  };
  if (!tacticBoardId && !sharedToken) return;
  if (isTacticBoardError)
    return (
      <Alert severity="error">
        {t("TacticBoardProfile:errorLoadingTacticBoard")}
      </Alert>
    );
  if (isTacticBoardLoading)
    return <Skeleton variant="rectangular" width="100%" height={60} />;

  if (!tacticBoard)
    return (
      <Alert severity="warning">
        {t("TacticBoardProfile:errorTacticBoardNotFound")}
      </Alert>
    );

  return (
    <div ref={refFullScreenContainer}>
      <Toolbar
        sx={{
          display: "flex",
          alignContent: "center",
        }}
      >
        {/* PAGINATION START */}
        <SoftBox
          display="flex"
          alignItems="center"
          justifyContent="center"
          sx={{ flexGrow: 1, mt: 1, mb: 1 }}
        >
          {/* ANIMATION BUTTON START */}

          <Tooltip
            title={t("TacticBoardProfile:topMenu.isAnimatingButton.tooltip", {
              context: isAnimating ? "animationMode" : "pauseMode",
            })}
          >
            <ToggleButton
              disabled={isTacticBoardLoading || isRecording}
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
            disabled={isTacticBoardLoading || isRecording || isAnimating}
            onChange={handleChange}
          />

          <Tooltip
            title={t("TacticBoardProfile:topMenu.isRecordingButton.tooltip")}
          >
            <ToggleButton
              disabled={isAnimating}
              value={false}
              size="small"
              selected={false}
              onChange={onRecordClick}
              sx={{
                mr: 1,
              }}
            >
              <MovieIcon sx={{ color: "#000000" }} />
            </ToggleButton>
          </Tooltip>
        </SoftBox>

        {isPrivileged && isEditMode && (
          <>
            <Tooltip
              title={t("TacticBoardProfile:topMenu.isEditModeButton.tooltip")}
            >
              <ToggleButton
                disabled={isTacticBoardLoading || isRecording || isAnimating}
                value={false}
                size="small"
                selected={false}
                onClick={() => {
                  if (onEditClick) {
                    onEditClick();
                  } else {
                    navigate(`/tacticboards/${tacticBoardId}/update`);
                  }
                }}
                sx={{
                  mr: 1,
                }}
              >
                <EditIcon color="primary" />
              </ToggleButton>
            </Tooltip>
          </>
        )}
        <Tooltip
          title={t("TacticBoardProfile:topMenu.isFullscreenButton.tooltip")}
        >
          <ToggleButton
            disabled={isTacticBoardLoading || isRecording || isAnimating}
            value={isFullScreen}
            size="small"
            selected={isFullScreen}
            onChange={onFullScreenClick}
            sx={{
              mr: 1,
            }}
          >
            {isFullScreen ? (
              <FullscreenExitIcon color="primary" />
            ) : (
              <FullscreenIcon color="primary" />
            )}
          </ToggleButton>
        </Tooltip>
      </Toolbar>
      <FabricJsCanvas />
    </div>
  );
};

export type TacticBoardInProfileWrapperProps = {
  tacticBoardId: string | undefined;
  sharedToken?: string;
  isEditMode?: boolean;
  onEditClick?: () => void;
};

const TacticBoardInProfileWrapper = ({
  tacticBoardId,
  sharedToken,
  isEditMode,
  onEditClick,
}: TacticBoardInProfileWrapperProps): JSX.Element => {
  return (
    <div>
      <TacticBoardProvider heightFirstResizing={false}>
        <TacticBoardInProfile
          tacticBoardId={tacticBoardId}
          sharedToken={sharedToken}
          isEditMode={isEditMode}
          onEditClick={onEditClick}
        />
      </TacticBoardProvider>
    </div>
  );
};

export default TacticBoardInProfileWrapper;
