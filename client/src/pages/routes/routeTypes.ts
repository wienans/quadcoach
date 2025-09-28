export enum RouteHandleType {
  layout = "layout",
  dashboard = "dashboard",
  exercises = "exercises",

  exercise = "exercise",

  tacticBoards = "tacticBoards",
  tacticBoard = "tacticBoard",
  tacticBoardProfile = "tacitcBoardProfile",
  addTacticBoard = "addTacticBoard",
  updateTacticBoard = "updateTacticBoard",
  draftingBoard = "draftingBoard",
  componentsTest = "componentsTest",
  userProfile = "userProfile",
  practicePlanner = "practicePlanner",
}

export type RouteHandle = {
  type: RouteHandleType;
};
