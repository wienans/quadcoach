import "./translations";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Alert, Grid } from "@mui/material";
import { SoftButton, SoftTypography } from "../../components";
import ExerciseEditForm from "../../components/ExerciseEditForm";
import { ExerciseWithOutId } from "../../api/quadcoachApi/domain";
import {
  useDeleteExerciseMutation,
  useGetExerciseQuery,
  useGetRelatedExercisesQuery,
  useUpdateExerciseMutation,
} from "../exerciseApi";
import { ExerciseExtendWithRelatedExercises } from "../../components/ExerciseEditForm/ExerciseEditForm";
import { useTranslation } from "react-i18next";

const UpdateExercise = () => {
  const { t } = useTranslation("UpdateExercise");
  const { id: exerciseId } = useParams();
  const navigate = useNavigate();

  const {
    data: exercise,
    isError: isExerciseError,
    isLoading: isExerciseLoading,
  } = useGetExerciseQuery(exerciseId || "", {
    skip: exerciseId == null,
  });
  const {
    data: relatedToExercises,
    isError: isRelatedToExercisesError,
    isLoading: isRelatedToExercisesLoading,
  } = useGetRelatedExercisesQuery(exerciseId || "", {
    skip: exerciseId == null,
  });

  const [
    updateExercise,
    {
      isError: isUpdateExerciseError,
      isLoading: isUpdateExerciseLoading,
      isSuccess: isUpdateExerciseSuccess,
    },
  ] = useUpdateExerciseMutation();
  useEffect(() => {
    if (!isUpdateExerciseSuccess || !exercise) return;
    navigate(`/exercises/${exercise._id}`);
  }, [isUpdateExerciseSuccess, exercise, navigate]);

  const [
    deleteExercise,
    {
      isError: isDeleteExerciseError,
      isLoading: isDeleteExerciseLoading,
      isSuccess: isDeleteExerciseSuccess,
    },
  ] = useDeleteExerciseMutation();
  const onDeleteExerciseClick = () => {
    if (!exercise) return;
    deleteExercise(exercise._id);
  };
  useEffect(() => {
    if (!isDeleteExerciseSuccess) return;
    navigate("/");
  }, [isDeleteExerciseSuccess, navigate]);

  const onSubmit = (updatedExercise: ExerciseWithOutId) => {
    if (!exercise) return;

    updateExercise({
      _id: exercise._id,
      ...updatedExercise,
    });
  };

  const combinedExercise: ExerciseExtendWithRelatedExercises | undefined =
    exercise
      ? {
          ...exercise,
          relatedToExercises: relatedToExercises,
        }
      : undefined;

  return (
    <ExerciseEditForm
      extraRows={(isValid) => (
        <>
          {isUpdateExerciseError && (
            <Grid item xs={12} justifyContent="center" display="flex">
              <Alert color="error">
                {t("UpdateExercise:errorUpdatingExercise")}
              </Alert>
            </Grid>
          )}
          {isExerciseError && (
            <Grid item xs={12} justifyContent="center" display="flex">
              <Alert color="error">
                {t("UpdateExercise:errorLoadingExercise")}
              </Alert>
            </Grid>
          )}
          {isDeleteExerciseError && (
            <Grid item xs={12} justifyContent="center" display="flex">
              <Alert color="error">
                {t("UpdateExercise:errorDeletingExercise")}
              </Alert>
            </Grid>
          )}
          {isRelatedToExercisesError && (
            <Grid item xs={12} justifyContent="center" display="flex">
              <Alert color="error">
                {t("UpdateExercise:errorLoadingRelatedExercises")}
              </Alert>
            </Grid>
          )}
          <Grid item xs={12} justifyContent="center" display="flex">
            <SoftButton
              color="primary"
              sx={{ marginRight: 1 }}
              type="submit"
              disabled={
                !isValid || isUpdateExerciseLoading || isExerciseLoading
              }
            >
              {t("UpdateExercise:updateExercise")}
            </SoftButton>
            <SoftButton
              onClick={onDeleteExerciseClick}
              color="error"
              type="button"
              disabled={isDeleteExerciseLoading}
            >
              {t("UpdateExercise:deleteExercise")}
            </SoftButton>
          </Grid>
        </>
      )}
      header={<SoftTypography variant="h3">Update Exercise</SoftTypography>}
      initialValues={combinedExercise}
      onSubmit={onSubmit}
      isLoadingInitialValues={isExerciseLoading || isRelatedToExercisesLoading}
    />
  );
};

export default UpdateExercise;
