import { PartialBy } from "../../../helpers/typeHelpers";
import TacticPage, { TacticPageWithOutId } from "./TacticPage";

export type TacticBoardHeader = {
  _id: string;
  name?: string;
  tags?: string[];
  isPrivate?: boolean;
  creator?: string;
  user?: string;
};

type TacticBoard = {
  _id: string;
  name?: string;
  isPrivate?: boolean;
  tags?: string[];
  creator?: string;
  user?: string;
  pages: TacticPage[];
  description?: string;
  coaching_points?: string;
  shareToken?: string | null;
};

type TacticBoardWithOutPageId = {
  _id: string;
  name?: string;
  isPrivate?: boolean;
  tags?: string[];
  creator?: string;
  user?: string;
  pages: TacticPageWithOutId[];
  description?: string;
  coaching_points?: string;
};

export default TacticBoard;
export type TacticBoardWithOutIds = Omit<TacticBoardWithOutPageId, "_id">;
export type TacticBoardWithOutId = Omit<TacticBoard, "_id">;
export type TacticBoardPartialId = PartialBy<TacticBoard, "_id">;
