import { PartialBy } from "../../../helpers/typeHelpers";

export type ExerciseFavorite = {
  _id: string;
  user: string;
  exercise: string;
  createdAt: Date;
};

export type ExerciseListFavorite = {
  _id: string;
  user: string;
  exerciseList: string;
  createdAt: Date;
};

export type TacticBoardFavorite = {
  _id: string;
  user: string;
  tacticboard: string;
  createdAt: Date;
};

export type ExerciseFavoriteWithOutId = Omit<ExerciseFavorite, "_id">;
export type ExerciseFavoritePartialId = PartialBy<ExerciseFavorite, "_id">;

export type TacticBoardFavoriteWithOutId = Omit<TacticBoardFavorite, "_id">;
export type TacticBoardFavoritePartialId = PartialBy<
  TacticBoardFavorite,
  "_id"
>;

export type ExerciseListFavoriteWithOutId = Omit<ExerciseListFavorite, "_id">;
export type ExerciseListFavoritePartialId = PartialBy<
  ExerciseListFavorite,
  "_id"
>;
