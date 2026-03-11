import { quadcoachApi } from "..";
import { TagType } from "../enum";
import { TacticBoard, TacticPage } from "./domain";
import { TacticBoardWithOutIds } from "./domain/TacticBoard";
import { TacticBoardHeader } from "./domain/TacticBoard";

export type GetTacticBoardRequest = {
  nameRegex?: string;
  tagRegex?: string;
  tagList?: string[];
  isPrivate?: boolean;
  sortBy?: "name" | "created" | "updated";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
};

export type GetTacticBoardHeadersResponse = {
  tacticboards: TacticBoardHeader[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

export type GetTacticBoardResponse = {
  tacticboards: TacticBoard[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

export type AccessLevel = "view" | "edit";

export type AccessEntry = {
  user: {
    _id: string;
    name: string;
  };
  tacticboard: string;
  access: AccessLevel;
  createdAt: string;
};

export type AccessResponse = {
  hasAccess: boolean;
  type: "owner" | "admin" | "granted" | null;
  level: AccessLevel | null;
};

export type ShareLinkResponse = {
  message: string;
  token: string;
  shareLink: string;
};

export const tacticBoardApiSlice = quadcoachApi.injectEndpoints({
  endpoints: (builder) => ({
    getTacticBoard: builder.query<TacticBoard, string>({
      query: (tacticboardId: string) => ({
        url: `/api/tacticboards/${tacticboardId}`,
        method: "get",
      }),
      // Tag both the list and the individual item
      providesTags: (result) =>
        result
          ? [{ type: TagType.tacticboard, id: result._id }, TagType.tacticboard]
          : [TagType.tacticboard],
    }),
    getSharedTacticBoard: builder.query<TacticBoard, string>({
      query: (token: string) => ({
        url: `/api/tacticboards/share/${token}`,
        method: "get",
      }),
      providesTags: (result) =>
        result
          ? [{ type: TagType.tacticboard, id: result._id }, TagType.tacticboard]
          : [TagType.tacticboard],
    }),
    updateTacticBoard: builder.mutation<{ message: string }, TacticBoard>({
      query(data) {
        return {
          url: `/api/tacticboards/${data._id}`,
          method: "put",
          data,
        };
      },
      invalidatesTags: (_result, _error, data) => [
        { type: TagType.tacticboard, id: data._id },
        TagType.tacticboardTag,
      ],
    }),
    updateTacticBoardPage: builder.mutation<
      { message: string },
      { tacticboardId: string; pageId: string; pageData: Partial<TacticPage> }
    >({
      query({ tacticboardId, pageId, pageData }) {
        return {
          url: `/api/tacticboards/${tacticboardId}/pages/${pageId}`,
          method: "patch",
          data: pageData,
        };
      },
      invalidatesTags: (_result, _error, { tacticboardId }) => [
        { type: TagType.tacticboard, id: tacticboardId },
      ],
    }),
    deleteTacticBoard: builder.mutation<{ message: string }, string>({
      query(tacticboardId) {
        return {
          url: `/api/tacticboards/${tacticboardId}`,
          method: "delete",
        };
      },
      invalidatesTags: (_result, _error, tacticboardId) => [
        { type: TagType.tacticboard, id: tacticboardId },
        TagType.tacticboard,
        TagType.tacticboardTag,
      ],
    }),
    duplicateTacticBoard: builder.mutation<
      { message: string; _id: string },
      string
    >({
      query(tacticboardId) {
        return {
          url: `/api/tacticboards/${tacticboardId}/duplicate`,
          method: "post",
        };
      },
      invalidatesTags: () => [TagType.tacticboard, TagType.tacticboardTag],
    }),
    addTacticBoard: builder.mutation<
      { message: string; _id: string },
      TacticBoardWithOutIds
    >({
      query(data) {
        return {
          url: "/api/tacticboards",
          method: "post",
          data,
        };
      },
      invalidatesTags: () => [TagType.tacticboard, TagType.tacticboardTag],
    }),
    getTacticBoards: builder.query<
      GetTacticBoardResponse,
      GetTacticBoardRequest | undefined
    >({
      query: (request) => {
        const {
          nameRegex,
          tagRegex,
          tagList,
          isPrivate,
          sortBy,
          sortOrder,
          page = 1,
          limit = 50,
        } = request || {};
        const urlParams = new URLSearchParams();

        urlParams.append("page", page.toString());
        urlParams.append("limit", limit.toString());

        if (nameRegex != null && nameRegex !== "") {
          urlParams.append("name[regex]", nameRegex);
          urlParams.append("name[options]", "i");
        }
        if (tagList != null && tagList.length > 0) {
          urlParams.append("tags[in]", tagList.join(","));
        }
        if (tagRegex != null && tagRegex !== "") {
          urlParams.append("tags[regex]", tagRegex);
          urlParams.append("tags[options]", "i");
        }
        if (isPrivate !== undefined) {
          urlParams.append("isPrivate[eq]", String(isPrivate));
        }
        if (sortBy != null) {
          urlParams.append("sortBy", sortBy);
        }
        if (sortOrder != null) {
          urlParams.append("sortOrder", sortOrder);
        }

        const urlParamsString = urlParams.toString();
        return {
          url: `/api/tacticboards${
            urlParamsString === "" ? "" : `?${urlParamsString}`
          }`,
          method: "get",
        };
      },
      // Tag the list and each individual tacticboard
      providesTags: (result) =>
        result
          ? [
              ...result.tacticboards.map(({ _id }) => ({
                type: TagType.tacticboard as const,
                id: _id,
              })),
              TagType.tacticboard,
            ]
          : [TagType.tacticboard],
    }),
    getAllTacticBoardTags: builder.query<string[], string | undefined>({
      query: (tagRegex) => {
        const urlParams = new URLSearchParams();

        if (tagRegex != null && tagRegex !== "") {
          urlParams.append("tagName[regex]", tagRegex);
          urlParams.append("tagName[options]", "i");
        }

        const urlParamsString = urlParams.toString();

        return {
          url: `/api/tags/tacticboards${
            urlParamsString === "" ? "" : `?${urlParamsString}`
          }`,
          method: "get",
        };
      },
      providesTags: () => [TagType.tacticboardTag],
    }),
    createTacticBoardPage: builder.mutation<
      { message: string },
      { tacticboardId: string; pageData: Partial<TacticPage> }
    >({
      query({ tacticboardId, pageData }) {
        return {
          url: `/api/tacticboards/${tacticboardId}/newPage`,
          method: "post",
          data: pageData,
        };
      },
      invalidatesTags: (_result, _error, { tacticboardId }) => [
        { type: TagType.tacticboard, id: tacticboardId },
      ],
    }),
    insertTacticBoardPage: builder.mutation<
      { message: string },
      { tacticboardId: string; position: number; pageData: Partial<TacticPage> }
    >({
      query({ tacticboardId, position, pageData }) {
        return {
          url: `/api/tacticboards/${tacticboardId}/insertPage/${position}`,
          method: "post",
          data: pageData,
        };
      },
      invalidatesTags: (_result, _error, { tacticboardId }) => [
        { type: TagType.tacticboard, id: tacticboardId },
      ],
    }),
    deleteTacticBoardPage: builder.mutation<
      { message: string; exercises?: { id: string; name: string }[] },
      { tacticboardId: string; pageId: string }
    >({
      query: ({ tacticboardId, pageId }) => ({
        url: `/api/tacticboards/${tacticboardId}/pages/${pageId}`,
        method: "delete",
      }),
      invalidatesTags: (_result, _error, { tacticboardId }) => [
        { type: TagType.tacticboard, id: tacticboardId },
      ],
    }),
    updateTacticBoardMeta: builder.mutation<
      { message: string },
      {
        tacticboardId: string;
        metaData: {
          name?: string;
          isPrivate?: boolean;
          tags?: string[];
          creator?: string;
          user?: string;
          description?: string;
          coaching_points?: string;
        };
      }
    >({
      query({ tacticboardId, metaData }) {
        return {
          url: `/api/tacticboards/${tacticboardId}/meta`,
          method: "patch",
          data: metaData,
        };
      },
      // Only invalidate the specific tacticboard and tags
      invalidatesTags: (_result, _error, { tacticboardId }) => [
        { type: TagType.tacticboard, id: tacticboardId },
        TagType.tacticboardTag,
      ],
    }),
    getTacticBoardHeaders: builder.query<
      GetTacticBoardHeadersResponse,
      GetTacticBoardRequest | undefined
    >({
      query: (request) => {
        const {
          nameRegex,
          tagRegex,
          tagList,
          isPrivate,
          sortBy,
          sortOrder,
          page = 1,
          limit = 50,
        } = request || {};
        const urlParams = new URLSearchParams();

        urlParams.append("page", page.toString());
        urlParams.append("limit", limit.toString());

        if (nameRegex != null && nameRegex !== "") {
          urlParams.append("name[regex]", nameRegex);
          urlParams.append("name[options]", "i");
        }
        if (tagList != null && tagList.length > 0) {
          urlParams.append("tags[in]", tagList.join(","));
        }
        if (tagRegex != null && tagRegex !== "") {
          urlParams.append("tags[regex]", tagRegex);
          urlParams.append("tags[options]", "i");
        }
        if (isPrivate !== undefined) {
          urlParams.append("isPrivate[eq]", String(isPrivate));
        }
        if (sortBy != null) {
          urlParams.append("sortBy", sortBy);
        }
        if (sortOrder != null) {
          urlParams.append("sortOrder", sortOrder);
        }

        const urlParamsString = urlParams.toString();
        return {
          url: `/api/tacticboards/header${
            urlParamsString === "" ? "" : `?${urlParamsString}`
          }`,
          method: "get",
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.tacticboards.map(({ _id }) => ({
                type: TagType.tacticboard as const,
                id: _id,
              })),
              TagType.tacticboard,
            ]
          : [TagType.tacticboard],
    }),
    checkTacticboardAccess: builder.query<AccessResponse, string>({
      query: (tacticboardId) => ({
        url: `/api/tacticboards/${tacticboardId}/checkAccess`,
        method: "get",
      }),
      providesTags: (_result, _error, tacticboardId) => [
        { type: TagType.tacticboard, id: `${tacticboardId}-access` },
      ],
    }),
    getAllTacticboardAccessUsers: builder.query<AccessEntry[], string>({
      query: (tacticboardId) => ({
        url: `/api/tacticboards/${tacticboardId}/access`,
        method: "get",
      }),
      providesTags: (_result, _error, tacticboardId) => [
        { type: TagType.tacticboard, id: `${tacticboardId}-access` },
      ],
    }),
    setTacticboardAccess: builder.mutation<
      AccessEntry,
      { tacticboardId: string; userId: string; access: AccessLevel }
    >({
      query: ({ tacticboardId, userId, access }) => ({
        url: `/api/tacticboards/${tacticboardId}/access`,
        method: "post",
        data: { userId, access },
      }),
      invalidatesTags: (_result, _error, { tacticboardId }) => [
        { type: TagType.tacticboard, id: `${tacticboardId}-access` },
      ],
    }),
    deleteTacticboardAccess: builder.mutation<
      { message: string },
      { tacticboardId: string; userId: string }
    >({
      query: ({ tacticboardId, userId }) => ({
        url: `/api/tacticboards/${tacticboardId}/access`,
        method: "delete",
        data: { userId },
      }),
      invalidatesTags: (_result, _error, { tacticboardId }) => [
        { type: TagType.tacticboard, id: `${tacticboardId}-access` },
      ],
    }),
    shareTacticBoard: builder.mutation<
      { message: string },
      { tacticboardId: string; email: string; access: AccessLevel }
    >({
      query: ({ tacticboardId, email, access }) => ({
        url: `/api/tacticboards/${tacticboardId}/share`,
        method: "post",
        data: { email, access },
      }),
      invalidatesTags: (_result, _error, { tacticboardId }) => [
        { type: TagType.tacticboard, id: `${tacticboardId}-access` },
      ],
    }),
    createTacticboardShareLink: builder.mutation<ShareLinkResponse, string>({
      query: (tacticboardId) => ({
        url: `/api/tacticboards/${tacticboardId}/share-link`,
        method: "post",
      }),
      invalidatesTags: (_result, _error, tacticboardId) => [
        { type: TagType.tacticboard, id: tacticboardId },
      ],
    }),
    deleteTacticboardShareLink: builder.mutation<{ message: string }, string>({
      query: (tacticboardId) => ({
        url: `/api/tacticboards/${tacticboardId}/share-link`,
        method: "delete",
      }),
      invalidatesTags: (_result, _error, tacticboardId) => [
        { type: TagType.tacticboard, id: tacticboardId },
      ],
    }),
  }),
});

export const {
  useGetTacticBoardQuery,
  useGetSharedTacticBoardQuery,
  useLazyGetTacticBoardsQuery,
  useDeleteTacticBoardMutation,
  useDuplicateTacticBoardMutation,
  useUpdateTacticBoardMutation,
  useUpdateTacticBoardMetaMutation,
  useUpdateTacticBoardPageMutation,
  useAddTacticBoardMutation,
  useGetTacticBoardsQuery,
  useGetAllTacticBoardTagsQuery,
  useLazyGetAllTacticBoardTagsQuery,
  useCreateTacticBoardPageMutation,
  useInsertTacticBoardPageMutation,
  useDeleteTacticBoardPageMutation,
  useGetTacticBoardHeadersQuery,
  useLazyGetTacticBoardHeadersQuery,
  useCheckTacticboardAccessQuery,
  useGetAllTacticboardAccessUsersQuery,
  useSetTacticboardAccessMutation,
  useDeleteTacticboardAccessMutation,
  useShareTacticBoardMutation,
  useCreateTacticboardShareLinkMutation,
  useDeleteTacticboardShareLinkMutation,
} = tacticBoardApiSlice;
