import { quadcoachApi } from "../api";
import { TagType } from "../api/enum";
import {
  ResourceAccessLevel,
  User,
  ExerciseSummary,
} from "../api/quadcoachApi/domain";
import type { TacticBoardSummary } from "../api/quadcoachApi/domain/TacticBoard";
import {
  ExerciseSummaryResponseDto,
  fromExerciseSummaryResponseDto,
} from "../api/quadcoachApi/compatibility/tacticBoardWire";

export type AccessibleExerciseRelationship = {
  item: ExerciseSummary;
  accessLevel: ResourceAccessLevel;
};

export type AccessibleExerciseRelationshipDto = {
  item: ExerciseSummaryResponseDto;
  accessLevel: ResourceAccessLevel;
};

export type UserExercisesResponse = {
  owned: ExerciseSummary[];
  accessible: AccessibleExerciseRelationship[];
};

type UserExercisesResponseDto = {
  owned: ExerciseSummaryResponseDto[];
  accessible: AccessibleExerciseRelationshipDto[];
};

export const fromUserExercisesResponseDto = (
  response: UserExercisesResponseDto,
): UserExercisesResponse => ({
  owned: response.owned.map(fromExerciseSummaryResponseDto),
  accessible: response.accessible.map(({ item, accessLevel }) => ({
    item: fromExerciseSummaryResponseDto(item),
    accessLevel,
  })),
});

export type AccessibleTacticBoardRelationship = {
  item: TacticBoardSummary;
  accessLevel: ResourceAccessLevel;
};

export type UserTacticBoardsResponse = {
  owned: TacticBoardSummary[];
  accessible: AccessibleTacticBoardRelationship[];
};

export const userApiSlice = quadcoachApi.injectEndpoints({
  endpoints: (builder) => ({
    getUser: builder.query<User, string>({
      query: (userId: string) => ({
        url: `/api/user/${userId}`,
        method: "get",
      }),
      providesTags: () => [TagType.user],
    }),
    updateUser: builder.mutation<User, User>({
      query(data) {
        return {
          url: `/api/user`,
          method: "put",
          data: { ...data, id: data._id },
        };
      },
      invalidatesTags: () => [TagType.user],
    }),
    deleteUser: builder.mutation<void, string>({
      query(userId) {
        return {
          url: `/api/user`,
          method: "delete",
          data: { id: userId },
        };
      },
      invalidatesTags: (_result, _error, userId) => [
        { type: TagType.user, id: userId },
      ],
    }),
    addUser: builder.mutation<User, Omit<User, "_id">>({
      query(data) {
        return {
          url: "/api/user",
          method: "post",
          data,
        };
      },
      invalidatesTags: () => [TagType.user],
    }),
    getOnlineUsersCount: builder.query<{ onlineUsersCount: number }, void>({
      query: () => ({
        url: "/api/user/online-count",
        method: "get",
      }),
      providesTags: () => [TagType.user],
    }),
    getUserExercises: builder.query<UserExercisesResponse, string>({
      query: (userId: string) => ({
        url: `/api/user/${userId}/exercises`,
        method: "get",
      }),
      transformResponse: fromUserExercisesResponseDto,
      providesTags: () => [TagType.exercise],
    }),
    getUserTacticBoards: builder.query<UserTacticBoardsResponse, string>({
      query: (userId: string) => ({
        url: `/api/user/${userId}/tacticboards`,
        method: "get",
      }),
      providesTags: () => [TagType.tacticBoard],
    }),
  }),
});

export const {
  useGetUserQuery,
  useDeleteUserMutation,
  useUpdateUserMutation,
  useAddUserMutation,
  useGetOnlineUsersCountQuery,
  useGetUserExercisesQuery,
  useGetUserTacticBoardsQuery,
} = userApiSlice;
