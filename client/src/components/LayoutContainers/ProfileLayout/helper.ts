import { Theme } from "@mui/material";
import { ExerciseType } from "../../../helpers/exerciseHelpers";
import curved0 from "../../../assets/images/curved-images/curved0.jpg";

export const getExerciseTypeHeaderBackgroundImage = (
  exerciseType: ExerciseType,
  {
    functions: { rgba, linearGradient },
    palette: { white, black, gradients },
  }: Theme,
) => {
  switch (exerciseType) {
    case ExerciseType.all:
      return `linear-gradient(145deg, rgba(0,0,0,0.6) 0%, rgba(255,255,255,0.6) 50%, rgba(44,237,0,0.6) 100%), url(${curved0})`;
    case ExerciseType.beater:
      return `${linearGradient(
        rgba(black.main, 0.6),
        rgba(black.light, 0.6),
      )}, url(${curved0})`;
    case ExerciseType.chaser:
      return `${linearGradient(
        rgba(white.main, 0.6),
        rgba(white.light, 0.6),
      )}, url(${curved0})`;
    case ExerciseType.general:
      return `${linearGradient(
        rgba(gradients.info.main, 0.6),
        rgba(gradients.info.state, 0.6),
      )}, url(${curved0})`;
  }
};
