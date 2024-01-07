import "./translations";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { Alert, Grid, Pagination, Skeleton } from "@mui/material";
import { useTranslation } from "react-i18next";
import {
  SoftTypography,
  SoftBox,
  FabricJsCanvas,
  SoftButton,
} from "../../components";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import EditIcon from "@mui/icons-material/Edit";
import { useGetTacticBoardQuery } from "../../pages/tacticboardApi";
import { useFabricJs } from "../../components/FabricJsContext/useFabricJs";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import MovieIcon from "@mui/icons-material/Movie";
import "../fullscreen.css";
let mediaRecorder: MediaRecorder;
const TacticsBoard = (): JSX.Element => {
  const { t } = useTranslation("TacticBoard");
  const { id: tacticBoardId } = useParams();
  const { canvas, loadFromJson, setSelection, getAllObjects } = useFabricJs();
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

  const onLoadPage = useCallback(
    (page: number) => {
      if (!tacticBoard) return;
      // Show the new Page
      loadFromJson(tacticBoard.pages[page - 1]);
      setSelection(false);
    },
    [loadFromJson, setSelection, tacticBoard],
  );

  const handleFullScreen = () => {
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

  return (
    <div>
      <SoftBox
        variant="contained"
        shadow="lg"
        opacity={1}
        p={1}
        my={2}
        borderRadius="lg"
      >
        <SoftTypography variant="h3">
          {t("TacticBoard:titel") +
            ": " +
            (tacticBoard ? tacticBoard.name : "")}
        </SoftTypography>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isTacticBoardError && (
            <Grid item xs={12} justifyContent="center" display="flex">
              <Alert color="error">{"Error"}</Alert>
            </Grid>
          )}
          {isTacticBoardLoading && (
            <Skeleton variant="rectangular" width={"100%"} height={100} />
          )}
          {!isTacticBoardError && !isTacticBoardLoading && (
            <Grid container spacing={2} ref={refFullScreenContainer}>
              <Grid
                item
                xs={12}
                style={{ display: "flex", justifyContent: "center" }}
              >
                <Grid
                  item
                  xs={6}
                  style={{ display: "flex", justifyContent: "center" }}
                >
                  <Pagination
                    count={tacticBoard?.pages.length}
                    siblingCount={0}
                    disabled={isAnimating || isRecording}
                    page={currentPage}
                    onChange={(_, value: number) => {
                      onLoadPage(value);
                      setPage(value);
                    }}
                  />
                </Grid>
                <Grid
                  item
                  xs={4}
                  style={{ display: "flex", justifyContent: "center" }}
                >
                  <SoftButton
                    iconOnly={true}
                    disabled={isAnimating || isRecording}
                    onClick={() => {
                      navigate(`/tacticboards/${tacticBoardId}/update`);
                    }}
                  >
                    <EditIcon />
                  </SoftButton>
                </Grid>
                <Grid item xs={2}>
                  <SoftButton
                    iconOnly={true}
                    disabled={isRecording}
                    onClick={() => {
                      setIsAnimating(!isAnimating);
                    }}
                  >
                    {isAnimating ? <PauseCircleIcon /> : <PlayCircleIcon />}
                  </SoftButton>
                </Grid>
                <Grid item xs={2}>
                  <SoftButton
                    iconOnly={true}
                    disabled={isAnimating || isRecording}
                    onClick={() => {
                      const canvasStream =
                        canvas?.lowerCanvasEl.captureStream(60);
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
                    }}
                  >
                    <MovieIcon />
                  </SoftButton>
                </Grid>
                <Grid item xs={2}>
                  <SoftButton
                    iconOnly={true}
                    disabled={isAnimating || isRecording}
                    onClick={handleFullScreen}
                  >
                    <FullscreenIcon />
                  </SoftButton>
                </Grid>
              </Grid>
              <Grid
                item
                xs={12}
                ref={refContainer}
                style={{
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <FabricJsCanvas
                  initialHight={686}
                  initialWidth={1220}
                  containerRef={refContainer}
                />
              </Grid>
            </Grid>
          )}
        </div>
      </SoftBox>
    </div>
  );
};

export default TacticsBoard;
