import "./translations";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
  Alert,
  Box,
  Card,
  CardActions,
  CardHeader,
  Grid,
  Skeleton,
  Stack,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import {
  useUpdateTacticBoardMutation,
  useGetTacticBoardQuery,
} from "../../pages/tacticboardApi";
import { TacticBoard, TacticPage } from "../../api/quadcoachApi/domain";
import {
  SoftTypography,
  SoftBox,
  FabricJsCanvas,
  TacticsBoardToolBar,
  TacticsBoardSpeedDial,
  TacticsBoardSpeedDialBalls,
  SoftButton,
} from "../../components";
import { useFabricJs } from "../../components/FabricJsContext/useFabricJs";
import cloneDeep from "lodash/cloneDeep";
import "../fullscreen.css";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { DashboardLayout } from "../../components/LayoutContainers";

const UpdateTacticBoard = (): JSX.Element => {
  const { t } = useTranslation("UpdateTacticBoard");
  const navigate = useNavigate();
  const { id: tacticBoardId } = useParams();
  const {
    getAllObjectsJson,
    loadFromJson,
    setControls,
    getActiveObjects,
    removeActiveObjects,
  } = useFabricJs();
  const {
    data: tacticBoard,
    isError: isTacticBoardError,
    isLoading: isTacticBoardLoading,
  } = useGetTacticBoardQuery(tacticBoardId || "", {
    skip: tacticBoardId == null,
  });

  const [
    updateTacticBoard,
    {
      isError: isUpdateTacticBoardError,
      isLoading: isUpdateTacticBoardLoading,
      isSuccess: isUpdateTacticBoardSuccess,
    },
  ] = useUpdateTacticBoardMutation();

  const refContainer = useRef<HTMLDivElement>(null);
  const refFullScreenContainer = useRef<HTMLDivElement>(null);
  const [editMode, setEditMode] = useState<boolean>(true);
  const [currentPage, setPage] = useState<number>(1);
  const [maxPages, setMaxPages] = useState<number>(1);
  const [playerANumbers, setPlayerANumbers] = useState<number[]>([0]);
  const [playerBNumbers, setPlayerBNumbers] = useState<number[]>([0]);
  const [firstAPICall, setFirstAPICall] = useState<number>(0);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);

  useEffect(() => {
    if (
      !isTacticBoardLoading &&
      !isTacticBoardError &&
      tacticBoard &&
      firstAPICall < 2
    ) {
      // API is finished loading, due to sending data to Server every time the Page is switched
      // we need to stop the this method by counting firstAPICall up and checking the amount on
      // load of the page API is called twice.
      setFirstAPICall(firstAPICall + 1);
      setMaxPages(tacticBoard.pages.length);
      loadFromJson(tacticBoard.pages[0]);
      setControls(false);
      if (tacticBoard.pages[0].playerANumbers?.length != 0) {
        setPlayerANumbers(tacticBoard.pages[0].playerANumbers);
      }
      if (tacticBoard.pages[0].playerBNumbers?.length != 0) {
        setPlayerBNumbers(tacticBoard.pages[0].playerBNumbers);
      }
    }
  }, [
    setControls,
    loadFromJson,
    firstAPICall,
    tacticBoard,
    isTacticBoardError,
    isTacticBoardLoading,
  ]);

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(document.fullscreenElement != null);
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
    };
  }, []);

  const onLoadPage = (
    page: number,
    newPage?: boolean,
    removePage?: boolean,
  ) => {
    if (newPage && removePage) return;
    if (!tacticBoard) return;
    const updatedTacticBoard: TacticBoard = cloneDeep(tacticBoard);
    if (newPage) {
      // Save the last state of the old page
      updatedTacticBoard.pages[page - 2] = {
        ...getAllObjectsJson(),
        playerANumbers: playerANumbers,
        playerBNumbers: playerBNumbers,
      } as TacticPage;
      // Copy the state of the old page to the new page
      updatedTacticBoard.pages[page - 1] = {
        ...getAllObjectsJson(),
        playerANumbers: playerANumbers,
        playerBNumbers: playerBNumbers,
      } as TacticPage;
      updateTacticBoard(updatedTacticBoard);
    } else if (removePage) {
      // Remove Last Page
      updatedTacticBoard.pages.pop();
      updateTacticBoard(updatedTacticBoard);
    } else if (page > currentPage) {
      // Go to next page
      updatedTacticBoard.pages[page - 2] = {
        ...getAllObjectsJson(),
        playerANumbers: playerANumbers,
        playerBNumbers: playerBNumbers,
      } as TacticPage;
      updateTacticBoard(updatedTacticBoard);
    } else if (page < currentPage) {
      // go to previous page
      updatedTacticBoard.pages[page] = {
        ...getAllObjectsJson(),
        playerANumbers: playerANumbers,
        playerBNumbers: playerBNumbers,
      } as TacticPage;
      updateTacticBoard(updatedTacticBoard);
    }
    loadFromJson(updatedTacticBoard.pages[page - 1]);
    if (updatedTacticBoard.pages[page - 1].playerANumbers?.length != 0) {
      setPlayerANumbers(updatedTacticBoard.pages[page - 1].playerANumbers);
    }
    if (updatedTacticBoard.pages[page - 1].playerBNumbers?.length != 0) {
      setPlayerBNumbers(updatedTacticBoard.pages[page - 1].playerBNumbers);
    }
    setControls(false);
  };

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
  const onDelete = () => {
    getActiveObjects().forEach((obj) => {
      if (obj._objects) {
        let teamA = false;
        let number = -1;
        obj._objects.forEach((obj) => {
          if (obj.type == "text") {
            number = parseInt(obj.text);
          }
          if (obj.type == "circle") {
            if (obj.fill == "purple") {
              teamA = true;
            }
          }
        });
        if (teamA) {
          setPlayerANumbers(playerANumbers.filter((item) => item !== number));
        } else {
          setPlayerBNumbers(playerBNumbers.filter((item) => item !== number));
        }
      }
    });
    removeActiveObjects();
  };
  const handleKeyDown = (event: React.KeyboardEvent) => {
    console.log(event.key);
    if (event.key === "Delete" || event.key === "Backspace") {
      onDelete();
    }
  };

  const onSave = () => {
    if (!tacticBoard) return;
    const updatedTacticBoard: TacticBoard = cloneDeep(tacticBoard);
    updatedTacticBoard.pages[currentPage - 1] = {
      ...getAllObjectsJson(),
      playerANumbers: playerANumbers,
      playerBNumbers: playerBNumbers,
    } as TacticPage;
    updateTacticBoard(updatedTacticBoard);
  };

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
                {t("UpdateTacticBoard:titel")}
              </SoftTypography>
            }
          />
          <CardActions
            disableSpacing
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
            }}
          >
            <SoftButton
              iconOnly
              onClick={() => {
                onSave();
                navigate(`/tacticboards/${tacticBoardId}/update`);
              }}
              size="large"
              sx={{ mr: 1 }}
            >
              <ArrowBackIcon />
            </SoftButton>
            <TacticsBoardToolBar
              editMode={editMode}
              setEditMode={setEditMode}
              setPage={setPage}
              currentPage={currentPage}
              setMaxPages={setMaxPages}
              maxPages={maxPages}
              onSave={onSave}
              onLoadPage={onLoadPage}
              disabled={isTacticBoardLoading}
              onDelete={onDelete}
              handleFullScreen={handleFullScreen}
            />
          </CardActions>
        </Card>
      )}
    >
      {() => (
        <>
          {isTacticBoardError ? (
            <SoftBox justifyContent="center" display="flex">
              <Alert color="error">{"Error"}</Alert>
            </SoftBox>
          ) : (
            <Box ref={refFullScreenContainer}>
              {isFullScreen && (
                <Card>
                  <CardActions>
                    <TacticsBoardToolBar
                      editMode={editMode}
                      setEditMode={setEditMode}
                      setPage={setPage}
                      currentPage={currentPage}
                      setMaxPages={setMaxPages}
                      maxPages={maxPages}
                      onSave={onSave}
                      onLoadPage={onLoadPage}
                      disabled={isTacticBoardLoading}
                      onDelete={onDelete}
                      handleFullScreen={handleFullScreen}
                    />
                  </CardActions>
                </Card>
              )}
              {isTacticBoardLoading ? (
                <Skeleton variant="rectangular" width={"100%"} height={100} />
              ) : (
                <Box
                  ref={refContainer}
                  sx={{ display: "flex", justifyContent: "center" }}
                >
                  <TacticsBoardSpeedDialBalls editMode={editMode} />
                  <TacticsBoardSpeedDial
                    teamB={false}
                    editMode={editMode}
                    playerNumbers={playerANumbers}
                    setPlayerNumbers={setPlayerANumbers}
                  />
                  <>
                    <FabricJsCanvas
                      initialHight={686}
                      initialWidth={1220}
                      containerRef={refContainer}
                    />
                  </>
                  <TacticsBoardSpeedDial
                    teamB={true}
                    editMode={editMode}
                    playerNumbers={playerBNumbers}
                    setPlayerNumbers={setPlayerBNumbers}
                  />
                </Box>
              )}
            </Box>
          )}
        </>
      )}
    </DashboardLayout>
  );

  return (
    <div onKeyDown={handleKeyDown} tabIndex={0}>
      {isTacticBoardError ? (
        <Grid item xs={12} justifyContent="center" display="flex">
          <Alert color="error">{"Error"}</Alert>
        </Grid>
      ) : (
        <>
          <SoftBox
            variant="contained"
            shadow="lg"
            opacity={1}
            p={1}
            my={2}
            borderRadius="lg"
          >
            <Stack spacing={2} direction="row" sx={{ marginBottom: 2 }}>
              <SoftButton
                iconOnly
                onClick={() => {
                  onSave();
                  navigate(`/tacticboards/${tacticBoardId}/update`);
                }}
              >
                <ArrowBackIcon />
              </SoftButton>
              <SoftTypography variant="h3">
                {t("UpdateTacticBoard:titel")}
              </SoftTypography>
            </Stack>

            <div
              style={{
                display: "flex",
              }}
            >
              <Grid container spacing={2} ref={refFullScreenContainer}>
                <Grid item xs={10}>
                  <TacticsBoardToolBar
                    editMode={editMode}
                    setEditMode={setEditMode}
                    setPage={setPage}
                    currentPage={currentPage}
                    setMaxPages={setMaxPages}
                    maxPages={maxPages}
                    onSave={onSave}
                    onLoadPage={onLoadPage}
                    disabled={isTacticBoardLoading}
                    onDelete={onDelete}
                  />
                </Grid>
                <Grid item xs={2}>
                  <SoftButton iconOnly onClick={handleFullScreen}>
                    <FullscreenIcon />
                  </SoftButton>
                </Grid>
                <Grid
                  item
                  xs={12}
                  ref={refContainer}
                  style={{ display: "flex", justifyContent: "center" }}
                >
                  <TacticsBoardSpeedDialBalls editMode={editMode} />
                  <TacticsBoardSpeedDial
                    teamB={false}
                    editMode={editMode}
                    playerNumbers={playerANumbers}
                    setPlayerNumbers={setPlayerANumbers}
                  />
                  {isTacticBoardLoading ? (
                    <Skeleton
                      variant="rectangular"
                      width={"100%"}
                      height={100}
                    />
                  ) : (
                    <>
                      <FabricJsCanvas
                        initialHight={686}
                        initialWidth={1220}
                        containerRef={refContainer}
                      />
                    </>
                  )}
                  <TacticsBoardSpeedDial
                    teamB={true}
                    editMode={editMode}
                    playerNumbers={playerBNumbers}
                    setPlayerNumbers={setPlayerBNumbers}
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  style={{ display: "flex", justifyContent: "center" }}
                ></Grid>
              </Grid>
            </div>
          </SoftBox>
        </>
      )}
    </div>
  );
};

export default UpdateTacticBoard;
