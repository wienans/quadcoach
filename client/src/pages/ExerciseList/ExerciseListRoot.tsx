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
