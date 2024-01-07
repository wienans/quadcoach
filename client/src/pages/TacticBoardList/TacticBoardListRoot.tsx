import { useOutlet } from "react-router-dom";
import TacticBoardList from "./TacticBoardList";

const TacticBoardListRoot = (): JSX.Element => {
  const outlet = useOutlet();

  if (outlet) {
    return outlet;
  }

  return <TacticBoardList />;
};

export default TacticBoardListRoot;
