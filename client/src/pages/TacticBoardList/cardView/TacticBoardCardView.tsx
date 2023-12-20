import { Alert, Grid } from "@mui/material";
import { Exercise } from "../../../api/quadcoachApi/domain";
import { useTranslation } from "react-i18next";
import TacticBoardLoadingCard from "./TacticBoardLoadingCard";
import TacticBoardCard from "./TacticBoardCard";

export type TacticBoardCardViewProps = {
  exercises?: Exercise[];
  isExercisesLoading: boolean;
  onOpenExerciseClick: (exerciseId: string) => void;
};

const TacticBoardCardView = ({
  exercises,
  isExercisesLoading,
  onOpenExerciseClick,
}: TacticBoardCardViewProps): JSX.Element => {
  const { t } = useTranslation("TacticBoardList");

  if ((exercises?.length ?? 0) < 1 && !isExercisesLoading) {
    return <Alert color="info">{t("TacticBoardList:noExercisesFound")}</Alert>;
  }

  return (
    <Grid container spacing={1}>
      {isExercisesLoading
        ? Array.from(Array(10).keys()).map((loadingNumber) => (
            <Grid item xs={12} md={6} xl={4} xxl={3} key={loadingNumber}>
              <TacticBoardLoadingCard />
            </Grid>
          ))
        : exercises?.map((exercise) => (
            <Grid item xs={12} md={6} xl={4} xxl={3} key={exercise._id}>
              <TacticBoardCard
                exercise={exercise}
                onOpenExerciseClick={() => onOpenExerciseClick(exercise._id)}
              />
            </Grid>
          ))}
    </Grid>
  );
};

export default TacticBoardCardView;
