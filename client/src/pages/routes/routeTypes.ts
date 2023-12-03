export enum RouteHandleType {
  layout = "layout",
  dashboard = "dashboard",
  exercises = "exercises",
  addExercise = "addExercise",
  exercise = "exercise",
  updateExercise = "updateExercise",
  componentsTest = "componentsTest",
}

export type RouteHandle = {
  type: RouteHandleType;
};
