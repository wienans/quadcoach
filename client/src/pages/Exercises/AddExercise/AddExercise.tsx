import { useNavigate } from "react-router-dom";
import { Card, CardHeader, Grid } from "@mui/material";
import { SoftBox, SoftButton, SoftTypography } from "../../../components";
import ExerciseEditForm from "../../../components/ExerciseEditForm";
import { ExerciseWithOutId } from "../../../api/quadcoachApi/domain";
import { useEffect } from "react";
import { useAddExerciseMutation } from "../../exerciseApi";
import { useTranslation } from "react-i18next";
import "./translations";
import { DashboardLayout } from "../../../components/LayoutContainers";

const AddExercise = () => {
  const { t } = useTranslation("AddExercise");

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

    navigate("/exercises");
  }, [isAddExerciseSuccess, navigate]);

  const onSubmit = (values: ExerciseWithOutId) => {
    addExercise(values);
  };

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
                {t("AddExercise:addExcercise")}
              </SoftTypography>
            }
          />
        </Card>
      )}
    >
      {() => (
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
          onSubmit={onSubmit}
        />
      )}
    </DashboardLayout>
  );
};

export default AddExercise;
