import { Avatar, Tooltip } from "@mui/material";
import { Exercise } from "../../../api/quadcoachApi/domain";
import { useTranslation } from "react-i18next";
import {
  ExerciseType,
  getExerciseType,
} from "../../../helpers/exerciseHelpers";

export type ExerciseAvatarProps = {
  exercise: Exercise;
  exerciseType?: ExerciseType;
};

const ExerciseAvatar = ({
  exercise,
  exerciseType,
}: ExerciseAvatarProps): JSX.Element => {
  const { t } = useTranslation("ExerciseList");

  const typeToUse = exerciseType ?? getExerciseType(exercise);

  return (
    <Tooltip
      title={t("ExerciseList:cardView.exerciseType", {
        context: typeToUse,
      })}
    >
      <Avatar
        sx={{
          ...(typeToUse === ExerciseType.beater && {
            backgroundColor: "black",
            color: "white",
          }),
          ...(typeToUse === ExerciseType.chaser && {
            backgroundColor: "white",
            color: "black",
          }),
          ...(typeToUse === ExerciseType.all && {
            background:
              "linear-gradient(145deg, rgba(0,0,0,1) 0%, rgba(255,255,255,1) 50%, rgba(44,237,0,1) 100%)",
            color: "grey",
          }),
        }}
      >
        {exercise.beaters > 0 && "B"}
        {exercise.chasers > 0 && "C"}
      </Avatar>
    </Tooltip>
  );
};

export default ExerciseAvatar;
