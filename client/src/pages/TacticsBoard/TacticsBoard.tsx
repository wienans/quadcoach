import "./translations";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Grid } from "@mui/material";
import { useUpdateBreadcrumbs } from "../../components/Layout/hooks";
import { useTranslation } from "react-i18next";
import {
  SoftTypography,
  SoftBox,
  FabricJsCanvas,
  FabricJsContextProvider,
  TacticsBoardToolBar,
  TacticsBoardSpeedDial,
  TacticsBoardSpeedDialBalls,
} from "../../components";

const TacticsBoard = (): JSX.Element => {
  const { t } = useTranslation("TacticsBoard");
  useUpdateBreadcrumbs(t("TacticsBoard:titel"));
  const refContainer = useRef<HTMLDivElement>(null);
  const [editMode, setEditMode] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [maxPages, setMaxPages] = useState<number>(1);

  return (
    <FabricJsContextProvider>
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
            {t("TacticsBoard:titel")}
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
              <FabricJsCanvas
                initialHight={686}
                initialWidth={1220}
                backgroundImage="./full-court.svg"
                containerRef={refContainer}
              />
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
    </FabricJsContextProvider>
  );
};

export default TacticsBoard;
