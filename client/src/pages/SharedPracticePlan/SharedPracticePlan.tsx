import { useParams } from "react-router-dom";
import PracticePlanner from "../PracticePlanner/PracticePlanner";

const SharedPracticePlan = (): JSX.Element => {
  const { token } = useParams();

  return <PracticePlanner sharedToken={token} />;
};

export default SharedPracticePlan;
