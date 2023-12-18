import { PartialBy } from "../../../helpers/typeHelpers";
import TacticPage from "./TacticPage";

type TacticBoard = {
  _id: string;
  name?: string;
  tags?: string[];
  creator?: string;
  pages: TacticPage[];
  related_to?: string[];
};

export default TacticBoard;
export type TacticBoardWithOutId = Omit<TacticBoard, "_id">;
export type TacticBoardPartialId = PartialBy<TacticBoard, "_id">;
