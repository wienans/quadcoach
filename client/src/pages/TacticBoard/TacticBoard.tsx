import "./translations";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Alert,
  Box,
  ButtonGroup,
  Card,
  CardActions,
  CardHeader,
  Grid,
  Pagination,
  Skeleton,
  Theme,
  useMediaQuery,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import {
  SoftTypography,
  FabricJsCanvas,
  SoftButton,
  SoftBox,
} from "../../components";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import EditIcon from "@mui/icons-material/Edit";
import { useGetTacticBoardQuery } from "../../api/quadcoachApi/tacticboardApi";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import MovieIcon from "@mui/icons-material/Movie";
import "../fullscreen.css";
import { DashboardLayout } from "../../components/LayoutContainers";
import { TacticBoard } from "../../api/quadcoachApi/domain";
import { useTacticBoardFabricJs } from "../../hooks";
import { TacticBoardFabricJsContextProvider } from "../../contexts";
import Navbar from "../../components/Navbar";
import TacticBoardItemsDrawerNav from "./TacticBoardItemsDrawerNav";
import { tacticBoardItemsDrawerWidth } from "./TacticBoardItemsDrawerNav/TacticBoardItemsDrawerNav";
import { useAppSelector } from "../../store/hooks";
import TacticBoardTopMenu from "./TacticBoardTopMenu/TacticBoardTopMenu";
import TacticBoardTopItemsMenu from "./TacticBoardTopItemsMenu";
import { useAuth } from "../../store/hooks";

let mediaRecorder: MediaRecorder;

type TacticBoardActionsProps = {
  tacticBoard: TacticBoard | undefined;
  isAnimating: boolean;
  isRecording: boolean;
  isPriviliged: boolean;
  currentPage: number;
  onPageChange: (page: number) => void;
  onEditTacticBoardClick: () => void;
  onAnimateClick: () => void;
  onRecordClick: () => void;
  onFullScreenClick: () => void;
};

const TacticBoardActions = ({
  tacticBoard,
  isAnimating,
  isRecording,
  isPriviliged,
  currentPage,
  onPageChange,
  onEditTacticBoardClick,
  onAnimateClick,
  onRecordClick,
  onFullScreenClick,
}: TacticBoardActionsProps): JSX.Element => (
  <CardActions
    disableSpacing
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-start",
    }}
  >
    <Pagination
      count={tacticBoard?.pages.length}
      siblingCount={0}
      disabled={isAnimating || isRecording}
      page={currentPage}
      onChange={(_, value: number) => onPageChange(value)}
      sx={{ mr: 1 }}
    />
    <ButtonGroup size="small" aria-label="Small button group">
      {isPriviliged && (
        <SoftButton
          iconOnly={true}
          disabled={isAnimating || isRecording}
          onClick={onEditTacticBoardClick}
        >
          <EditIcon />
        </SoftButton>
      )}
      <SoftButton
        iconOnly={true}
        disabled={isRecording}
        onClick={onAnimateClick}
      >
        {isAnimating ? <PauseCircleIcon /> : <PlayCircleIcon />}
      </SoftButton>
      <SoftButton
        iconOnly={true}
        disabled={isAnimating || isRecording}
        onClick={onRecordClick}
      >
        <MovieIcon />
      </SoftButton>
      <SoftButton
        iconOnly={true}
        disabled={isAnimating || isRecording}
        onClick={onFullScreenClick}
      >
        <FullscreenIcon />
      </SoftButton>
    </ButtonGroup>
  </CardActions>
);

const TacticsBoard = (): JSX.Element => {
  const { t } = useTranslation("TacticBoard");
  const isUpSm = useMediaQuery((theme: Theme) => theme.breakpoints.up("xxxl"));
  const { id: tacticBoardId } = useParams();
  const {
    canvasFabricRef: canvas,
    loadFromTacticPage: loadFromJson,
    setSelection,
    getAllObjects,
    getAllObjectsJson,
  } = useTacticBoardFabricJs();
  const navigate = useNavigate();
  const refFullScreenContainer = useRef<HTMLDivElement>(null);
  const {
    data: tacticBoard,
    isError: isTacticBoardError,
    isLoading: isTacticBoardLoading,
  } = useGetTacticBoardQuery(tacticBoardId || "", {
    skip: tacticBoardId == null,
  });

  const refContainer = useRef<HTMLDivElement>(null);
  const [currentPage, setPage] = useState<number>(1);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [isPriviliged, setIsPrivileged] = useState<boolean>(false);

  const tacticBoardItemsDrawerOpen = useAppSelector(
    (state) => state.tacticBoard.tacticBoardItemsDrawerOpen,
  );
  const isEditMode = useAppSelector((state) => state.tacticBoard.isEditMode);

  const {
    name: userName,
    id: userId,
    status: userStatus,
    roles: userRoles,
  } = useAuth();

  const onLoadPage = useCallback(
    (page: number) => {
      if (!tacticBoard) return;
      // Show the new Page
      loadFromJson(tacticBoard.pages[page - 1]);
      setSelection(false);
    },
    [loadFromJson, setSelection, tacticBoard],
  );

  const onFullScreenClick = () => {
    const container = refFullScreenContainer.current;
    const isFullscreen = document.fullscreenElement;
    if (isFullscreen) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    } else {
      if (container && container.requestFullscreen) {
        container.requestFullscreen();
      } else if (container && container.mozRequestFullScreen) {
        container.mozRequestFullScreen();
      } else if (container && container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
      } else if (container && container.msRequestFullscreen) {
        container.msRequestFullscreen();
      }
    }
  };
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

  const onEditTacticBoardClick = () => {
    navigate(`/tacticboards/${tacticBoardId}/update`);
  };

  const onAnimateClick = () => {
    setIsAnimating(!isAnimating);
  };

  const onRecordClick = () => {
    const canvasStream = canvas?.lowerCanvasEl.captureStream(60);
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

  const onPageChange = (page: number) => {
    onLoadPage(page);
    setPage(page);
  };

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
            if (targetObject && canvas) {
              obj.animate("left", targetObject.left, {
                onChange: canvas.renderAll.bind(canvas),
                duration: 1000,
                onComplete: () => {
                  onLoadPage(newPage);
                },
              });
              obj.animate("top", targetObject.top, {
                onChange: canvas.renderAll.bind(canvas),
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
  }, [isAnimating, onLoadPage, tacticBoard, getAllObjects, canvas]);

  useEffect(() => {
    let interval: number;
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
              (nextObject) => nextObject.uuid == obj.uuid,
            );
            if (targetObject && canvas) {
              obj.animate("left", targetObject.left, {
                onChange: canvas.renderAll.bind(canvas),
                duration: 1000,
                onComplete: () => {
                  onLoadPage(newPage);
                },
              });
              obj.animate("top", targetObject.top, {
                onChange: canvas.renderAll.bind(canvas),
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
  }, [isRecording, onLoadPage, tacticBoard, getAllObjects, canvas]);

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(document.fullscreenElement != null);
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
    };
  }, []);

  useEffect(() => {
    if (
      userId == tacticBoard?.user ||
      userRoles.includes("Admin") ||
      userRoles.includes("admin")
    ) {
      setIsPrivileged(true);
    }
  }, [userId, tacticBoard, userRoles]);

  return (
    <SoftBox
      sx={{
        p: 3,
        position: "relative",
        height: "100%",//"100vh",
        maxHeight: "100%",//"100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Navbar light={false} />
      {(isTacticBoardError || (!isTacticBoardLoading && !tacticBoard)) && (
        <SoftBox sx={{ px: 3 }}>
          <Alert color="error">
            {t("TacticBoard:loadingTacticBoardError")}
          </Alert>
        </SoftBox>
      )}
      {isTacticBoardLoading && (
        <>
          <SoftBox sx={{ px: 3, mb: 1 }}>
            <Skeleton variant="rectangular" width="100%" height={64} />
          </SoftBox>
          <SoftBox
            sx={{
              display: "flex",
              flexGrow: 1,
              px: 3,
            }}
          >
            <Skeleton variant="rectangular" width="100%" height="100%" />
          </SoftBox>
        </>
      )}
      {!isTacticBoardError && !isTacticBoardLoading && tacticBoard && (
        <SoftBox
          sx={{
            display: "flex",
            flexGrow: 1,
            maxHeight: "100%",
            flexDirection: "column",
          }}
        >
          <TacticBoardTopMenu
            isTacticBoardLoading={isTacticBoardLoading}
            tacticBoard={tacticBoard}
          />
          <SoftBox
            sx={{
              display: "flex",
              flexGrow: 1,
              px: 3,
            }}
          >
            <TacticBoardItemsDrawerNav />
            <SoftBox
              sx={{
                display: "flex",
                flexGrow: 1,
                flexDirection: "column",
                minHeight: 0,
              }}
            >
              {isEditMode && <TacticBoardTopItemsMenu />}
              <SoftBox
                component="main"
                sx={{
                  display: "flex",
                  minHeight: 0,
                  flexGrow: 1,
                  width: isUpSm
                    ? `calc(100% - ${
                        tacticBoardItemsDrawerOpen
                          ? `${tacticBoardItemsDrawerWidth}px`
                          : "0"
                      })`
                    : "100%",
                }}
              >
                <div
                  style={{
                    maxWidth: "fit-content",
                    marginLeft: "auto",
                    marginRight: "auto",
                  }}
                >
                  <FabricJsCanvas initialHight={686} initialWidth={1220} />
                </div>
              </SoftBox>
            </SoftBox>
          </SoftBox>
        </SoftBox>
      )}
    </SoftBox>
  );

  return (
    <DashboardLayout
      header={(scrollTrigger) => (
        <Card
          sx={(theme) => ({
            position: "sticky",
            top: theme.spacing(1),
            zIndex: 1,
            ...(scrollTrigger
              ? {
                  backgroundColor: theme.palette.transparent.main,
                  boxShadow: theme.boxShadows.navbarBoxShadow,
                  backdropFilter: `saturate(200%) blur(${theme.functions.pxToRem(
                    30,
                  )})`,
                }
              : {
                  backgroundColor: theme.functions.rgba(
                    theme.palette.white.main,
                    0.8,
                  ),
                  boxShadow: "none",
                  backdropFilter: "none",
                }),
            transition: theme.transitions.create("all", {
              easing: theme.transitions.easing.easeInOut,
              duration: theme.transitions.duration.standard,
            }),
          })}
        >
          <CardHeader
            title={
              <SoftTypography variant="h3">
                {`${t("TacticBoard:title")}${
                  tacticBoard ? `: ${tacticBoard.name}` : ""
                }`}
              </SoftTypography>
            }
          />
          {!isTacticBoardError && !isTacticBoardLoading && (
            <TacticBoardActions
              currentPage={currentPage}
              isAnimating={isAnimating}
              isRecording={isRecording}
              isPriviliged={isPriviliged}
              onAnimateClick={onAnimateClick}
              onEditTacticBoardClick={onEditTacticBoardClick}
              onFullScreenClick={onFullScreenClick}
              onPageChange={onPageChange}
              onRecordClick={onRecordClick}
              tacticBoard={tacticBoard}
            />
          )}
        </Card>
      )}
    >
      {() => (
        <Box
          ref={refFullScreenContainer}
          sx={{
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
          }}
        >
          {isFullScreen && !isTacticBoardLoading && (
            <Card>
              <TacticBoardActions
                currentPage={currentPage}
                isAnimating={isAnimating}
                isRecording={isRecording}
                onAnimateClick={onAnimateClick}
                onEditTacticBoardClick={onEditTacticBoardClick}
                onFullScreenClick={onFullScreenClick}
                onPageChange={onPageChange}
                onRecordClick={onRecordClick}
                tacticBoard={tacticBoard}
              />
            </Card>
          )}
          {isTacticBoardError && (
            <Grid item xs={12} justifyContent="center" display="flex">
              <Alert color="error">{"Error"}</Alert>
            </Grid>
          )}
          {isTacticBoardLoading && (
            <Skeleton variant="rectangular" width={"100%"} height={100} />
          )}
          {!isTacticBoardError && !isTacticBoardLoading && (
            // <Box
            //   ref={refContainer}
            //   sx={{
            //     width: "100%",
            //     display: "flex",
            //     justifyContent: "center",
            //   }}
            // >
            <Box sx={{ flexGrow: 1, display: "flex" }}>
              <FabricJsCanvas initialHight={686} initialWidth={1220} />
            </Box>
          )}
        </Box>
      )}
    </DashboardLayout>
  );
};

const TacticsBoardWrapper = (): JSX.Element => {
  return (
    <TacticBoardFabricJsContextProvider>
      <TacticsBoard />
    </TacticBoardFabricJsContextProvider>
  );
};

export default TacticsBoardWrapper;
