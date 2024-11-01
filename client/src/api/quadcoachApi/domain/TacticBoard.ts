import { PartialBy } from "../../../helpers/typeHelpers";
import TacticPage from "./TacticPage";

type TacticBoard = {
  _id: string;
  name?: string;
  isPrivate?: boolean;
  tags?: string[];
  creator?: string;
  users?: string[];
  pages: TacticPage[];
  description?: string;
  coaching_points?: string;
};

export default TacticBoard;
export type TacticBoardWithOutId = Omit<TacticBoard, "_id">;
export type TacticBoardPartialId = PartialBy<TacticBoard, "_id">;
