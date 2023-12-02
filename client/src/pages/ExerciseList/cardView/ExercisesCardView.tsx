import { Alert, Grid } from "@mui/material";
import { Exercise } from "../../../api/quadcoachApi/domain";
import { useTranslation } from "react-i18next";
import ExerciseLoadingCard from "./ExerciseLoadingCard";
import ExerciseCard from "./ExerciseCard";

export type ExercisesCardViewProps = {
  exercises?: Exercise[];
  isExercisesLoading: boolean;
  onOpenExerciseClick: (exerciseId: string) => void;
};

const ExercisesCardView = ({
  exercises,
  isExercisesLoading,
  onOpenExerciseClick,
}: ExercisesCardViewProps): JSX.Element => {
  const { t } = useTranslation("ExerciseList");

  if ((exercises?.length ?? 0) < 1 && !isExercisesLoading) {
    return <Alert color="info">{t("ExerciseList:noExercisesFound")}</Alert>;
  }

  return (
    <Grid container spacing={1}>
      {isExercisesLoading
        ? Array.from(Array(10).keys()).map((loadingNumber) => (
            <Grid item xs={12} md={6} xl={4} xxl={3} key={loadingNumber}>
              <ExerciseLoadingCard />
            </Grid>
          ))
        : exercises?.map((exercise) => (
            <Grid item xs={12} md={6} xl={4} xxl={3} key={exercise._id}>
              <ExerciseCard
                exercise={exercise}
                onOpenExerciseClick={() => onOpenExerciseClick(exercise._id)}
              />
            </Grid>
          ))}
    </Grid>
  );
};

export default ExercisesCardView;
