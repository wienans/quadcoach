import { useOutlet } from "react-router-dom";
import PracticePlanner from "./PracticePlanner";

const PracticePlannerRoot = (): JSX.Element => {
  const outlet = useOutlet();

  if (outlet) {
    return outlet;
  }

  return <PracticePlanner />;
};

export default PracticePlannerRoot;
