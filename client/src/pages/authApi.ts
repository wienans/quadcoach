import { quadcoachApi } from "../api";
import { logOut, setCredentials } from "../api/auth/authSlice";

export const authApiSlice = quadcoachApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => ({
        url: "/api/auth",
        method: "post",
        data,
      }),
    }),
    register: builder.mutation({
      query: (data) => ({
        url: "/api/auth/register",
        method: "post",
        data,
      }),
    }),
    sendLogout: builder.mutation({
      query: () => ({
        url: "/api/auth/logout",
        method: "post",
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(logOut());
          dispatch(quadcoachApi.util.resetApiState());
        } catch (err) {
          console.log(err);
        }
      },
    }),
    refresh: builder.mutation({
      query: () => ({
        url: "/api/auth/refresh",
        method: "get",
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const { accessToken } = data;
          dispatch(setCredentials({ accessToken: accessToken }));
        } catch (err) {
          console.log(err);
        }
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useSendLogoutMutation,
  useRefreshMutation,
} = authApiSlice;
