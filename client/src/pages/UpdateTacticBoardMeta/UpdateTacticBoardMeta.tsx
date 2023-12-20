import "./translations";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Alert, Grid, Skeleton } from "@mui/material";
import { useTranslation } from "react-i18next";
import {
  useUpdateTacticBoardMutation,
  useGetTacticBoardQuery,
  useDeleteTacticBoardMutation,
} from "../tacticboardApi";
import { TacticBoard } from "../../api/quadcoachApi/domain";
import {
  SoftTypography,
  SoftBox,
  SoftButton,
  TacticsBoardToolBar,
  TacticsBoardSpeedDial,
  TacticsBoardSpeedDialBalls,
} from "../../components";
import { useFabricJs } from "../../components/FabricJsContext/useFabricJs";
import cloneDeep from "lodash/cloneDeep";

const UpdateTacticBoardMeta = (): JSX.Element => {
  const { t } = useTranslation("UpdateTacticBoardMeta");
  const navigate = useNavigate();
  const { id: tacticBoardId } = useParams();

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

  const [
    deleteTacticBoard,
    {
      isError: isDeleteTacticBoardError,
      isLoading: isDeleteTacticBoardLoading,
      isSuccess: isDeleteTacticBoardSuccess,
    },
  ] = useDeleteTacticBoardMutation();

  const onDeleteExerciseClick = () => {
    if (!tacticBoard) return;
    deleteTacticBoard(tacticBoard._id);
    navigate("/tacticboards");
  };

  return (
    <div>
      {isTacticBoardError && (
        <Grid item xs={12} justifyContent="center" display="flex">
          <Alert color="error">{"Error Loading"}</Alert>
        </Grid>
      )}
      {isTacticBoardLoading && (
        <Grid item xs={12} justifyContent="center" display="flex">
          <Alert color="error">{"Error Loading"}</Alert>
        </Grid>
      )}
      {!isTacticBoardError && !isTacticBoardLoading && (
        <>
          <SoftTypography variant="h3">
            {"Update Tactic Board Meta Data"}
          </SoftTypography>
          <SoftTypography>Name: {tacticBoard.name}</SoftTypography>
          <SoftTypography>Tags: {tacticBoard.tags}</SoftTypography>
          <Grid item xs={12} justifyContent="center" display="flex">
            <SoftButton
              onClick={() =>
                navigate(`/tacticboards/${tacticBoardId}/updateBoard`)
              }
              sx={{ marginRight: 1 }}
              type="button"
            >
              {"Edit Tactic Board"}
            </SoftButton>
            <SoftButton
              color="primary"
              sx={{ marginRight: 1 }}
              type="button"
              disabled={isUpdateTacticBoardLoading || isTacticBoardLoading}
            >
              {"Update Tactic Board"}
            </SoftButton>
            <SoftButton
              onClick={onDeleteExerciseClick}
              color="error"
              type="button"
              disabled={isDeleteTacticBoardLoading}
            >
              {"Delete Tactic Board"}
            </SoftButton>
          </Grid>
        </>
      )}
    </div>
  );
};

export default UpdateTacticBoardMeta;
