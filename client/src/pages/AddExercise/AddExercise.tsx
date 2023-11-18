import { useNavigate } from "react-router-dom";
import { Grid } from "@mui/material";
import { SoftBox, SoftButton, SoftTypography } from "../../components";
import { useUpdateBreadcrumbs } from "../../components/Layout/hooks";
import ExerciseEditForm from "../../components/ExerciseEditForm";
import { ExerciseWithOutId } from "../../api/quadcoachApi/domain";
import { useEffect } from "react";
import { useAddExerciseMutation } from "../exerciseApi";
import { useTranslation } from "react-i18next";
import "./translations";

const AddExercise = () => {
  const { t } = useTranslation("AddExercise");

  useUpdateBreadcrumbs("Add Exercise", [
    { title: "Exercises", to: "exercises" },
  ]);

  const navigate = useNavigate();
  const [
    addExercise,
    {
      isLoading: isAddExerciseLoading,
      isError: isAddExerciseError,
      isSuccess: isAddExerciseSuccess,
    },
  ] = useAddExerciseMutation();

  useEffect(() => {
    if (!isAddExerciseSuccess) return;

    navigate("/");
  }, [isAddExerciseSuccess, navigate]);

  const onSubmit = (values: ExerciseWithOutId) => {
    addExercise(values);
  };

  return (
    <ExerciseEditForm
      extraRows={() => (
        <>
          {isAddExerciseError && (
            <Grid item xs={12} justifyContent="center" display="flex">
              <SoftBox bgColor="error">
                {t("AddExercise:errorWhileAdding")}
              </SoftBox>
            </Grid>
          )}
          <Grid item xs={12} justifyContent="center" display="flex">
            <SoftButton
              type="submit"
              color="primary"
              disabled={isAddExerciseLoading}
            >
              {t("AddExercise:addExcercise")}
            </SoftButton>
          </Grid>
        </>
      )}
      header={
        <SoftTypography variant="h3">
          {t("AddExercise:addExcercise")}
        </SoftTypography>
      }
      onSubmit={onSubmit}
    />
  );
};

export default AddExercise;
