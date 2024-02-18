import "./translations";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Alert, Card, CardHeader, Grid } from "@mui/material";
import { SoftButton, SoftTypography } from "../../../../components";
import ExerciseEditForm from "../../../../components/ExerciseEditForm";
import { ExerciseWithOutId } from "../../../../api/quadcoachApi/domain";
import {
  useDeleteExerciseMutation,
  useGetExerciseQuery,
  useGetRelatedExercisesQuery,
  useUpdateExerciseMutation,
} from "../../../exerciseApi";
import { ExerciseExtendWithRelatedExercises } from "../../../../components/ExerciseEditForm/ExerciseEditForm";
import { useTranslation } from "react-i18next";
import { DashboardLayout } from "../../../../components/LayoutContainers";

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
    navigate("/exercises");
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
                {t("UpdateExercise:title")}
              </SoftTypography>
            }
          />
        </Card>
      )}
    >
      {() => (
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
          initialValues={combinedExercise}
          onSubmit={onSubmit}
          isLoadingInitialValues={
            isExerciseLoading || isRelatedToExercisesLoading
          }
        />
      )}
    </DashboardLayout>
  );
};

export default UpdateExercise;
