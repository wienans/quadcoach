import { quadcoachApi } from "..";
import { TagType } from "../enum";
import {
  ExerciseFavorite,
  ExerciseListFavorite,
  TacticBoardFavorite,
  ExerciseFavoriteWithOutId,
  ExerciseListFavoriteWithOutId,
  TacticBoardFavoriteWithOutId,
} from "./domain/Favorits";

type FavoriteRequest = {
  userId: string;
};

type ExerciseFavoriteRequest = FavoriteRequest & {
  exerciseId: string;
};

type TacticboardFavoriteRequest = FavoriteRequest & {
  tacticboardId: string;
};

type ExerciseListFavoriteRequest = FavoriteRequest & {
  exerciseListId: string;
};

export const favoriteApiSlice = quadcoachApi.injectEndpoints({
  endpoints: (builder) => ({
    // Exercise Favorites
    getFavoriteExercises: builder.query<ExerciseFavorite[], FavoriteRequest>({
      query: (request) => ({
        url: "/api/favorites/exercises",
        method: "get",
        data: request,
      }),
      providesTags: [TagType.favorite],
    }),

    addFavoriteExercise: builder.mutation<
      ExerciseFavoriteWithOutId,
      ExerciseFavoriteRequest
    >({
      query: (request) => ({
        url: "/api/favorites/exercises",
        method: "post",
        data: request,
      }),
      invalidatesTags: [TagType.favorite],
    }),

    removeFavoriteExercise: builder.mutation<void, ExerciseFavoriteRequest>({
      query: (request) => ({
        url: "/api/favorites/exercises",
        method: "delete",
        data: request,
      }),
      invalidatesTags: [TagType.favorite],
    }),

    // Tacticboard Favorites
    getFavoriteTacticboards: builder.query<
      TacticBoardFavorite[],
      FavoriteRequest
    >({
      query: (request) => ({
        url: "/api/favorites/tacticboards",
        method: "get",
        data: request,
      }),
      providesTags: [TagType.favorite],
    }),

    addFavoriteTacticboard: builder.mutation<
      TacticBoardFavoriteWithOutId,
      TacticboardFavoriteRequest
    >({
      query: (request) => ({
        url: "/api/favorites/tacticboards",
        method: "post",
        data: request,
      }),
      invalidatesTags: [TagType.favorite],
    }),

    removeFavoriteTacticboard: builder.mutation<
      void,
      TacticboardFavoriteRequest
    >({
      query: (request) => ({
        url: "/api/favorites/tacticboards",
        method: "delete",
        data: request,
      }),
      invalidatesTags: [TagType.favorite],
    }),

    // Exercise List Favorites
    getFavoriteExerciseLists: builder.query<
      ExerciseListFavorite[],
      FavoriteRequest
    >({
      query: (request) => ({
        url: "/api/favorites/exerciseLists",
        method: "get",
        data: request,
      }),
      providesTags: [TagType.favorite],
    }),

    addFavoriteExerciseList: builder.mutation<
      ExerciseListFavoriteWithOutId,
      ExerciseListFavoriteRequest
    >({
      query: (request) => ({
        url: "/api/favorites/exerciseLists",
        method: "post",
        data: request,
      }),
      invalidatesTags: [TagType.favorite],
    }),

    removeFavoriteExerciseList: builder.mutation<
      void,
      ExerciseListFavoriteRequest
    >({
      query: (request) => ({
        url: "/api/favorites/exerciseLists",
        method: "delete",
        data: request,
      }),
      invalidatesTags: [TagType.favorite],
    }),
  }),
});

export const {
  // Exercise Favorites
  useGetFavoriteExercisesQuery,
  useAddFavoriteExerciseMutation,
  useRemoveFavoriteExerciseMutation,

  // Tacticboard Favorites
  useGetFavoriteTacticboardsQuery,
  useLazyGetFavoriteTacticboardsQuery,
  useAddFavoriteTacticboardMutation,
  useRemoveFavoriteTacticboardMutation,

  // Exercise List Favorites
  useGetFavoriteExerciseListsQuery,
  useAddFavoriteExerciseListMutation,
  useRemoveFavoriteExerciseListMutation,
} = favoriteApiSlice;
