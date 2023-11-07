import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Alert, Grid } from "@mui/material";
import { SoftButton, SoftTypography } from "../../components";
import { useUpdateBreadcrumbs } from "../../components/Layout/hooks";
import ExerciseEditForm from "../../components/ExerciseEditForm";
import { ExerciseWithOutId } from "../../api/quadcoachApi/domain";
import {
  useDeleteExerciseMutation,
  useGetExerciseQuery,
  useGetRelatedExercisesQuery,
  useUpdateExerciseMutation,
} from "../exerciseApi";
import { ExerciseExtendWithRelatedExercises } from "../../components/ExerciseEditForm/ExerciseEditForm";

const defaultEBreadcrumbRoutes = [{ title: "Exercises", to: "exercises" }];

const UpdateExercise = () => {
  const { id: exerciseId } = useParams();
  const navigate = useNavigate();

  const [breadcrumbRoutes, setBreadcrumbRoutes] = useState([
    ...defaultEBreadcrumbRoutes,
  ]);

  useUpdateBreadcrumbs("update", breadcrumbRoutes);

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

  useEffect(() => {
    const routes = [...defaultEBreadcrumbRoutes];
    if (exercise) {
      routes.push({ title: exercise.name, to: `exercises/${exercise._id}` });
    }

    setBreadcrumbRoutes(routes);
  }, [exercise]);

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
                Some error occurred while updating exercise
              </Alert>
            </Grid>
          )}
          {isExerciseError && (
            <Grid item xs={12} justifyContent="center" display="flex">
              <Alert color="error">
                Some error occurred while loading exercise
              </Alert>
            </Grid>
          )}
          {isDeleteExerciseError && (
            <Grid item xs={12} justifyContent="center" display="flex">
              <Alert color="error">
                Some error occurred while deleting exercise
              </Alert>
            </Grid>
          )}
          {isRelatedToExercisesError && (
            <Grid item xs={12} justifyContent="center" display="flex">
              <Alert color="error">
                Some error occurred while loading realted exercises
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
              Update Exercise
            </SoftButton>
            <SoftButton
              onClick={onDeleteExerciseClick}
              color="error"
              type="button"
              disabled={isDeleteExerciseLoading}
            >
              Delete Exercise
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
