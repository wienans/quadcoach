import { quadcoachApi } from "../api";
import { TagType } from "../api/enum";
import { User } from "../api/quadcoachApi/domain";
export type GetUserRequest = {
  nameRegex?: string;
  emailRegex?: string;
  roleString?: string;
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
    getUsers: builder.query<User[], GetUserRequest | undefined>({
      query: (request) => {
        const { nameRegex, emailRegex, roleString } = request || {};
        const urlParams = new URLSearchParams();

        if (nameRegex != null && nameRegex !== "") {
          urlParams.append("name[regex]", nameRegex);
          urlParams.append("name[options]", "i");
        }

        if (emailRegex != null && emailRegex !== "") {
          urlParams.append("email[regex]", emailRegex);
          urlParams.append("email[options]", "i");
        }
        if (roleString != null && roleString !== "") {
          urlParams.append("roles[regex]", roleString);
          urlParams.append("roles[options]", "i");
        }
        const urlParamsString = urlParams.toString();
        return {
          url: `/api/user${
            urlParamsString === "" ? "" : `?${urlParamsString}`
          }`,
          method: "get",
        };
      },
      providesTags: () => [TagType.user],
    }),
    getUserByEmail: builder.query<User, string>({
      query: (email: string) => ({
        url: `/api/user/email/${encodeURIComponent(email)}`,
        method: "get",
      }),
      providesTags: () => [TagType.user],
    }),
  }),
});

export const {
  useGetUserQuery,
  useLazyGetUsersQuery,
  useDeleteUserMutation,
  useUpdateUserMutation,
  useAddUserMutation,
  useGetUsersQuery,
  useLazyGetUserByEmailQuery,
} = userApiSlice;
