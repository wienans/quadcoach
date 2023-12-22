import "./translations";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Alert, Grid, Pagination, Skeleton } from "@mui/material";
import { useTranslation } from "react-i18next";
import {
  SoftTypography,
  SoftBox,
  FabricJsCanvas,
  SoftButton,
} from "../../components";
import { useGetTacticBoardQuery } from "../../pages/tacticboardApi";
import { useFabricJs } from "../../components/FabricJsContext/useFabricJs";
const TacticsBoard = (): JSX.Element => {
  const { t } = useTranslation("TacticBoard");
  const { id: tacticBoardId } = useParams();
  const { loadFromJson, setSelection } = useFabricJs();
  const navigate = useNavigate();
  const {
    data: tacticBoard,
    isError: isTacticBoardError,
    isLoading: isTacticBoardLoading,
  } = useGetTacticBoardQuery(tacticBoardId || "", {
    skip: tacticBoardId == null,
  });

  const refContainer = useRef<HTMLDivElement>(null);
  const [currentPage, setPage] = useState<number>(1);

  const onLoadPage = (page: number) => {
    if (!tacticBoard) return;
    // Show the new Page
    loadFromJson(tacticBoard.pages[page - 1]);
    setSelection(false);
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
      </SoftBox>
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
          <Grid container spacing={2}>
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
                  page={currentPage}
                  onChange={(_, value: number) => {
                    onLoadPage(value);
                    setPage(value);
                  }}
                />
              </Grid>
              <Grid
                item
                xs={6}
                style={{ display: "flex", justifyContent: "center" }}
              >
                <SoftButton
                  onClick={() => {
                    navigate(`/tacticboards/${tacticBoardId}/update`);
                  }}
                >
                  {t("TacticBoard:editBtn")}
                </SoftButton>
              </Grid>
            </Grid>
            <Grid
              item
              xs={12}
              ref={refContainer}
              style={{ display: "flex", justifyContent: "center" }}
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
    </div>
  );
};

export default TacticsBoard;
