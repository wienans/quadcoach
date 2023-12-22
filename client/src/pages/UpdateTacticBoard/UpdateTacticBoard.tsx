import "./translations";
import { useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Alert, Grid, Skeleton } from "@mui/material";
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
} from "../../components";
import { useFabricJs } from "../../components/FabricJsContext/useFabricJs";
import cloneDeep from "lodash/cloneDeep";

const UpdateTacticBoard = (): JSX.Element => {
  const { t } = useTranslation("UpdateTacticBoard");
  const { id: tacticBoardId } = useParams();
  const { getAllObjectsJson, loadFromJson, setControls } = useFabricJs();
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
  const [editMode, setEditMode] = useState<boolean>(true);
  const [currentPage, setPage] = useState<number>(1);
  const [maxPages, setMaxPages] = useState<number>(1);
  const [firstAPICall, setFirstAPICall] = useState<number>(0);

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
      console.log("API finished");
      setFirstAPICall(firstAPICall + 1);
      setMaxPages(tacticBoard.pages.length);
      loadFromJson(tacticBoard.pages[0]);
      setControls(false);
    }
  }, [
    setControls,
    loadFromJson,
    firstAPICall,
    tacticBoard,
    isTacticBoardError,
    isTacticBoardLoading,
  ]);

  const onLoadPage = (
    page: number,
    newPage?: boolean,
    removePage?: boolean,
  ) => {
    console.log(page);
    console.log(currentPage);
    if (newPage && removePage) return;
    if (!tacticBoard) return;
    const updatedTacticBoard: TacticBoard = cloneDeep(tacticBoard);
    if (newPage) {
      // Save the last state of the old page
      updatedTacticBoard.pages[page - 2] = getAllObjectsJson() as TacticPage;
      // Copy the state of the old page to the new page
      updatedTacticBoard.pages[page - 1] = getAllObjectsJson() as TacticPage;
      updateTacticBoard(updatedTacticBoard);
    } else if (removePage) {
      // Remove Last Page
      updatedTacticBoard.pages.pop();
      updateTacticBoard(updatedTacticBoard);
    } else if (page > currentPage) {
      // Go to next page
      updatedTacticBoard.pages[page - 2] = getAllObjectsJson() as TacticPage;
      updateTacticBoard(updatedTacticBoard);
    } else if (page < currentPage) {
      // go to previous page
      updatedTacticBoard.pages[page] = getAllObjectsJson() as TacticPage;
      updateTacticBoard(updatedTacticBoard);
    }
    loadFromJson(updatedTacticBoard.pages[page - 1]);
    setControls(false);
  };

  const onSave = () => {
    if (!tacticBoard) return;
    console.log(getAllObjectsJson());
    const updatedTacticBoard: TacticBoard = cloneDeep(tacticBoard);
    updatedTacticBoard.pages[currentPage - 1] =
      getAllObjectsJson() as TacticPage;
    updateTacticBoard(updatedTacticBoard);
  };
  return (
    <div>
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
            <SoftTypography variant="h3">
              {t("UpdateTacticBoard:titel")}
            </SoftTypography>
          </SoftBox>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12}>
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
                />
              </Grid>

              <Grid
                item
                xs={12}
                ref={refContainer}
                style={{ display: "flex", justifyContent: "center" }}
              >
                <TacticsBoardSpeedDialBalls editMode={editMode} />
                <TacticsBoardSpeedDial teamB={false} editMode={editMode} />
                {isTacticBoardLoading ? (
                  <Skeleton variant="rectangular" width={"100%"} height={100} />
                ) : (
                  <>
                    <FabricJsCanvas
                      initialHight={686}
                      initialWidth={1220}
                      containerRef={refContainer}
                    />
                  </>
                )}
                <TacticsBoardSpeedDial teamB={true} editMode={editMode} />
              </Grid>
              <Grid
                item
                xs={12}
                style={{ display: "flex", justifyContent: "center" }}
              ></Grid>
            </Grid>
          </div>
        </>
      )}
    </div>
  );
};

export default UpdateTacticBoard;
