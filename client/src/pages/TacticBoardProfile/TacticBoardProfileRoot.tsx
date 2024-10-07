import { useOutlet } from "react-router-dom";
import TacticBoardProfile from "./TacticBoardProfile";

const TacticBoardProfileRoot = (): JSX.Element => {
  const outlet = useOutlet();

  if (outlet) {
    return outlet;
  }

  return <TacticBoardProfile />;
};

export default TacticBoardProfileRoot;
