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
  TacticBoardSummaryResponseDto,
  fromExerciseSummaryResponseDto,
  fromTacticBoardSummaryResponseDto,
} from "../api/quadcoachApi/compatibility/tacticBoardWire";

export type AccessibleRelationship<Item> = {
  item: Item;
  accessLevel: ResourceAccessLevel;
};

type OwnedAndAccessible<Item> = {
  owned: Item[];
  accessible: AccessibleRelationship<Item>[];
};

const fromOwnedAndAccessible = <Item, Dto>(
  response: OwnedAndAccessible<Dto>,
  fromItemDto: (itemDto: Dto) => Item,
): OwnedAndAccessible<Item> => ({
  owned: response.owned.map(fromItemDto),
  accessible: response.accessible.map(({ item, accessLevel }) => ({
    item: fromItemDto(item),
    accessLevel,
  })),
});

export type UserExercisesResponse = OwnedAndAccessible<ExerciseSummary>;

export type UserTacticBoardsResponse = OwnedAndAccessible<TacticBoardSummary>;

const fromUserExercisesResponseDto = (
  response: OwnedAndAccessible<ExerciseSummaryResponseDto>,
): UserExercisesResponse =>
  fromOwnedAndAccessible(response, fromExerciseSummaryResponseDto);

const fromUserTacticBoardsResponseDto = (
  response: OwnedAndAccessible<TacticBoardSummaryResponseDto>,
): UserTacticBoardsResponse =>
  fromOwnedAndAccessible(response, fromTacticBoardSummaryResponseDto);

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
      transformResponse: fromUserTacticBoardsResponseDto,
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
