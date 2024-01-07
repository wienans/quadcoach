/**
 * Exercise list Page  is parent of exercise page in route hirarchy and all pages should be separated page.
 * So if outlet is available, it is exercise page and should be shown instead of exercise list page.
 */

import { useOutlet } from "react-router-dom";
import ExerciseList from "./ExerciseList";

const ExerciseListRoot = (): JSX.Element => {
  const outlet = useOutlet();

  if (outlet) {
    return outlet;
  }

  return <ExerciseList />;
};

export default ExerciseListRoot;
