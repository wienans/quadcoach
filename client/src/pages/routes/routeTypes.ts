export enum RouteHandleType {
  layout = "layout",
  dashboard = "dashboard",
  exercises = "exercises",
  addExercise = "addExercise",
  exercise = "exercise",
  updateExercise = "updateExercise",
  tacticBoards = "tacticBoards",
  tacticBoard = "tacticBoard",
  tacticBoardProfile = "tacitcBoardProfile",
  addTacticBoard = "addTacticBoard",
  updateTacticBoard = "updateTacticBoard",
  componentsTest = "componentsTest",
  userProfile = "userProfile",
}

export type RouteHandle = {
  type: RouteHandleType;
};
