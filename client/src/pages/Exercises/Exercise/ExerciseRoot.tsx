/**
 * Exercise Page  is parent of edit exercise in route hirarchy and all pages should be separated page.
 * So if outlet is available, it is edit exercise and should be shown instead of view exercise page.
 */
import { useOutlet } from "react-router-dom";
import ViewExercise from "./ViewExercise";

const ExerciseRoot = (): JSX.Element => {
  const outlet = useOutlet();

  if (outlet) {
    return outlet;
  }

  return <ViewExercise />;
};

export default ExerciseRoot;
