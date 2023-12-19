import "./translations";
import { useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Alert, Grid, Skeleton } from "@mui/material";
import { useUpdateBreadcrumbs } from "../../components/Layout/hooks";
import { useTranslation } from "react-i18next";
import { useGetTacticBoardQuery } from "../../pages/tacticboardApi";
import {
  SoftTypography,
  SoftBox,
  FabricJsCanvas,
  TacticsBoardToolBar,
  TacticsBoardSpeedDial,
  TacticsBoardSpeedDialBalls,
} from "../../components";
import { useFabricJs } from "../../components/FabricJsContext/useFabricJs";

const UpdateTacticBoard = (): JSX.Element => {
  const { t } = useTranslation("UpdateTacticBoard");
  const { id: tacticBoardId } = useParams();
  const { addObject } = useFabricJs();
  useUpdateBreadcrumbs(t("UpdateTacticBoard:titel"));

  const {
    data: tacticBoard,
    isError: isTacticBoardError,
    isLoading: isTacticBoardLoading,
  } = useGetTacticBoardQuery(tacticBoardId || "", {
    skip: tacticBoardId == null,
  });

  const refContainer = useRef<HTMLDivElement>(null);
  const [editMode, setEditMode] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [maxPages, setMaxPages] = useState<number>(1);

  return (
    <div>
      {isTacticBoardError && (
        <Grid item xs={12} justifyContent="center" display="flex">
          <Alert color="error">{"Error"}</Alert>
        </Grid>
      )}
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
              setEditMode={setEditMode}
              setPage={setPage}
              currentPage={page}
              setMaxPages={setMaxPages}
              maxPages={maxPages}
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
              <FabricJsCanvas
                initialHight={686}
                initialWidth={1220}
                backgroundImage="/full-court_inkscape.svg"
                containerRef={refContainer}
              />
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
    </div>
  );
};

export default UpdateTacticBoard;
