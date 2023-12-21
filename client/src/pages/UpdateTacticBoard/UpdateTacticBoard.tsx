import "./translations";
import { useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Alert, Grid, Skeleton } from "@mui/material";
import { useTranslation } from "react-i18next";
import {
  useAddTacticBoardMutation,
  useUpdateTacticBoardMutation,
  useGetTacticBoardQuery,
} from "../../pages/tacticboardApi";
import { TacticBoard } from "../../api/quadcoachApi/domain";
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
  const { getAllObjectsJson, loadFromJson } = useFabricJs();

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
  const [tacticBoardState, setTacticBoardState] = useState<TacticBoard>();

  // Setting Tacticboard to State
  useEffect(() => {
    if (!tacticBoard) return;
    setTacticBoardState(tacticBoard);
    setMaxPages(tacticBoard.pages.length);
  }, [tacticBoard]);

  const onLoadPage = (
    page: number,
    newPage?: boolean,
    removePage?: boolean,
  ) => {
    if (newPage && removePage) return;
    let updatedTacticBoard: TacticBoard = cloneDeep(tacticBoardState);
    if (newPage) {
      // Save the last state of the old page
      updatedTacticBoard.pages[page - 2] = getAllObjectsJson();
      // Copy the state of the old page to the new page
      updatedTacticBoard.pages[page - 1] = getAllObjectsJson();
      updateTacticBoard(updatedTacticBoard);
    }
    if (removePage) {
      // Remove Last Page
      updatedTacticBoard.pages.pop();
      updateTacticBoard(updatedTacticBoard);
    }
    // Show the new Page
    loadFromJson(updatedTacticBoard.pages[page - 1]);
  };

  const onSave = () => {
    if (!tacticBoardState) return;
    console.log(getAllObjectsJson());
    let updatedTacticBoard: TacticBoard = cloneDeep(tacticBoardState);
    updatedTacticBoard.pages[currentPage - 1] = getAllObjectsJson();
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
                  <Skeleton variant="rectangular" width={1220} height={686} />
                ) : (
                  <>
                    <FabricJsCanvas
                      initialHight={686}
                      initialWidth={1220}
                      backgroundImage={
                        tacticBoard?.pages[currentPage - 1].backgroundImage.src
                      }
                      containerRef={refContainer}
                      initialCanvas={tacticBoard?.pages[currentPage - 1]}
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
