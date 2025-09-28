import { quadcoachApi } from "../api";
import { TagType } from "../api/enum";
import { User, Exercise, TacticBoard } from "../api/quadcoachApi/domain";

export type UserExercisesResponse = {
  owned: Exercise[];
  accessible: Exercise[];
};

export type UserTacticboardsResponse = {
  owned: TacticBoard[];
  accessible: TacticBoard[];
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
      providesTags: () => [TagType.exercise],
    }),
    getUserTacticboards: builder.query<UserTacticboardsResponse, string>({
      query: (userId: string) => ({
        url: `/api/user/${userId}/tacticboards`, 
        method: "get",
      }),
      providesTags: () => [TagType.tacticboard],
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
  useGetUserTacticboardsQuery,
} = userApiSlice;
