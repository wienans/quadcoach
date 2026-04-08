// Re-export unified types from the centralized location
export type { 
  TacticBoardObject as TacticsObject,
  TacticBoardBackgroundImage as TacticsBackImg,
  TacticBoardPage as TacticPage,
  TacticBoardPageWithoutId as TacticPageWithOutId
} from "../../../contexts/tacticBoard/TacticBoardFabricJsContext/tacticBoardTypes";

export type { TacticBoardPage as default } from "../../../contexts/tacticBoard/TacticBoardFabricJsContext/tacticBoardTypes";
