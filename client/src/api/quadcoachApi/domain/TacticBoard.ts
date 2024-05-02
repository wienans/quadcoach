import { PartialBy } from "../../../helpers/typeHelpers";
import TacticPage from "./TacticPage";

type TacticBoard = {
  _id: string;
  name?: string;
  isPrivate?: boolean;
  tags?: string[];
  creator?: string;
  user?: string;
  pages: TacticPage[];
};

export default TacticBoard;
export type TacticBoardWithOutId = Omit<TacticBoard, "_id">;
export type TacticBoardPartialId = PartialBy<TacticBoard, "_id">;
