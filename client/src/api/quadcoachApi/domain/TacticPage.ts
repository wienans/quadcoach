// Re-export unified types from the centralized location
export type {
  TacticBoardObject as TacticsObject,
  TacticBoardBackgroundImage as TacticsBackImg,
  TacticBoardPage as TacticPage,
  TacticBoardPageWithoutId as TacticPageWithOutId,
} from "../../../contexts/tacticBoard/TacticBoardFabricJsContext/tacticBoardTypes";

// Default export for backward compatibility
import type { TacticBoardPage } from "../../../contexts/tacticBoard/TacticBoardFabricJsContext/tacticBoardTypes";
export default TacticBoardPage;
