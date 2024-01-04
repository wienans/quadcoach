export enum RouteHandleType {
  layout = "layout",
  dashboard = "dashboard",
  exercises = "exercises",
  addExercise = "addExercise",
  exercise = "exercise",
  updateExercise = "updateExercise",
  tacticBoards = "tacticBoards",
  tacticBoard = "tacticBoard",
  addTacticBoard = "addTacticBoard",
  updateTacticBoard = "updateTacticBoard",
  componentsTest = "componentsTest",
}

export type RouteHandle = {
  type: RouteHandleType;
};
