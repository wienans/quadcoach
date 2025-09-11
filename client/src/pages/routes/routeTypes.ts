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
  draftingBoard = "draftingBoard",
  componentsTest = "componentsTest",
  userProfile = "userProfile",
  practicePlanners = "practicePlanners",
  addPracticePlanner = "addPracticePlanner",
  practicePlanner = "practicePlanner",
  updatePracticePlanner = "updatePracticePlanner",
}

export type RouteHandle = {
  type: RouteHandleType;
};
