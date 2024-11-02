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
import { useCallback, useEffect, useRef, useState } from "react";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import EditIcon from "@mui/icons-material/Edit";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import MovieIcon from "@mui/icons-material/Movie";
import { useLoadTacticBoard, useTacticBoardFabricJs } from "../../hooks";
import { FabricJsCanvas, SoftBox } from "../../components";
import { TacticBoardFabricJsContextProvider } from "../../contexts";
import { useAuth } from "../../store/hooks";
export type TacticBoardInProfileProps = {
  tacticBoardId: string | undefined;
};
let mediaRecorder: MediaRecorder;
const TacticBoardInProfile = ({
  tacticBoardId,
}: TacticBoardInProfileProps): JSX.Element | undefined => {
  const { t } = useTranslation("TacticBoardProfile");
  const navigate = useNavigate();
  const { tacticBoard, isTacticBoardError, isTacticBoardLoading } =
    useLoadTacticBoard(tacticBoardId);

  const [currentPage, setPage] = useState<number>(1);
  const [maxPages, setMaxPages] = useState<number>(1);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [isPrivileged, setIsPrivileged] = useState<boolean>(false);
  const refFullScreenContainer = useRef<HTMLDivElement>(null);
  const {
    canvasFabricRef: canvasRef,
    loadFromTacticPage: loadFromJson,
    setSelection,
    setControls,
    getAllObjects,
  } = useTacticBoardFabricJs();

  const { id: userId, roles: userRoles } = useAuth();

  useEffect(() => {
    if (
      userId == tacticBoard?.user ||
      userRoles.includes("Admin") ||
      userRoles.includes("admin")
    ) {
      setIsPrivileged(true);
    }
  }, [userId, tacticBoard, userRoles]);

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

  const onRecordClick = () => {
    const canvas = canvasRef.current?.getElement() as HTMLCanvasElement;
    if (!canvas) return;

    const canvasStream = canvas.captureStream(60);
    mediaRecorder = new MediaRecorder(canvasStream, {
      mimeType: "video/webm",
    });
    let chunks: Blob[] = [];

    mediaRecorder.onstop = function () {
      downloadVideo(chunks);
      chunks = [];
    };

    mediaRecorder.ondataavailable = function (e) {
      chunks.push(e.data);
    };
    mediaRecorder.start();
    setIsRecording(!isRecording);
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

  const downloadVideo = (chunks: Blob[]) => {
    const blob = new Blob(chunks, { type: "video/mp4" });
    const videoURL = URL.createObjectURL(blob);
    const tag = document.createElement("a");
    tag.href = videoURL;
    tag.download = tacticBoard?.name ? tacticBoard?.name : "tacticboard.mp4";
    document.body.appendChild(tag);
    tag.click();
    document.body.removeChild(tag);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAnimating && tacticBoard) {
      // Start the animation only if isAnimating is true
      interval = setInterval(() => {
        setPage((prevPage) => {
          const newPage = (prevPage % tacticBoard.pages.length) + 1;
          getAllObjects().forEach((obj) => {
            const targetObject = tacticBoard.pages[newPage - 1].objects?.find(
              // @ts-ignore
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

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording && tacticBoard) {
      // Start the animation only if isAnimating is true
      interval = setInterval(() => {
        setPage((prevPage) => {
          const newPage = (prevPage % tacticBoard.pages.length) + 1;
          if (prevPage == tacticBoard.pages.length && newPage == 1) {
            if (mediaRecorder) {
              mediaRecorder.stop();
            }
            setIsRecording(false);
          }
          getAllObjects().forEach((obj) => {
            const targetObject = tacticBoard.pages[newPage - 1].objects?.find(
              // @ts-ignore
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
  }, [isRecording, onLoadPage, tacticBoard, getAllObjects, canvasRef]);

  const handleChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    onLoadPage(value);
  };
  if (!tacticBoardId) return;
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

        {isPrivileged && (
          <Tooltip
            title={t("TacticBoardProfile:topMenu.isEditModeButton.tooltip")}
          >
            <ToggleButton
              disabled={isTacticBoardLoading || isRecording || isAnimating}
              value={false}
              size="small"
              selected={false}
              onChange={() => {
                navigate(`/tacticboards/${tacticBoardId}/update`);
              }}
              sx={{
                mr: 1,
              }}
            >
              <EditIcon color="primary" />
            </ToggleButton>
          </Tooltip>
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
};

const TacticBoardInProfileWrapper = ({
  tacticBoardId,
}: TacticBoardInProfileWrapperProps): JSX.Element => {
  return (
    <div>
      <TacticBoardFabricJsContextProvider heightFirstResizing={false}>
        <TacticBoardInProfile tacticBoardId={tacticBoardId} />
      </TacticBoardFabricJsContextProvider>
    </div>
  );
};

export default TacticBoardInProfileWrapper;
