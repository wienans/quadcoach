import { quadcoachApi } from "..";
import { TagType } from "../enum";
import { TacticBoard, TacticPage } from "./domain";
export type GetTacticBoardRequest = {
  nameRegex?: string;
  tagString?: string;
};

export const tacticBoardApiSlice = quadcoachApi.injectEndpoints({
  endpoints: (builder) => ({
    getTacticBoard: builder.query<TacticBoard, string>({
      query: (tacticboardId: string) => ({
        url: `/api/tacticboards/${tacticboardId}`,
        method: "get",
      }),
      providesTags: () => [TagType.tacticboard],
    }),
    updateTacticBoard: builder.mutation<{ message: string }, TacticBoard>({
      query(data) {
        return {
          url: `/api/tacticboards/${data._id}`,
          method: "put",
          data,
        };
      },
      invalidatesTags: () => [TagType.tacticboard, TagType.tacticboardTag],
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
      invalidatesTags: () => [TagType.tacticboard, TagType.tacticboardTag],
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
        TagType.tacticboardTag,
      ],
    }),
    addTacticBoard: builder.mutation<
      { message: string },
      Omit<TacticBoard, "_id">
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
      TacticBoard[],
      GetTacticBoardRequest | undefined
    >({
      query: (request) => {
        const { nameRegex, tagString } = request || {};
        const urlParams = new URLSearchParams();

        if (nameRegex != null && nameRegex !== "") {
          urlParams.append("name[regex]", nameRegex);
          urlParams.append("name[options]", "i");
        }
        if (tagString != null && tagString !== "") {
          urlParams.append("tags[regex]", tagString);
          urlParams.append("tags[options]", "i");
        }

        const urlParamsString = urlParams.toString();
        return {
          url: `/api/tacticboards${
            urlParamsString === "" ? "" : `?${urlParamsString}`
          }`,
          method: "get",
        };
      },
      providesTags: () => [TagType.tacticboard],
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
      invalidatesTags: () => [TagType.tacticboard, TagType.tacticboardTag],
    }),
    deleteTacticBoardPage: builder.mutation<
      { message: string },
      { tacticboardId: string; pageId: string }
    >({
      query: ({ tacticboardId, pageId }) => ({
        url: `/api/tacticboards/${tacticboardId}/pages/${pageId}`,
        method: "delete",
      }),
      invalidatesTags: () => [TagType.tacticboard, TagType.tacticboardTag],
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
      invalidatesTags: () => [TagType.tacticboard, TagType.tacticboardTag],
    }),
  }),
});

export const {
  useGetTacticBoardQuery,
  useLazyGetTacticBoardsQuery,
  useDeleteTacticBoardMutation,
  useUpdateTacticBoardMutation,
  useUpdateTacticBoardMetaMutation,
  useUpdateTacticBoardPageMutation,
  useAddTacticBoardMutation,
  useGetTacticBoardsQuery,
  useGetAllTacticBoardTagsQuery,
  useCreateTacticBoardPageMutation,
  useDeleteTacticBoardPageMutation,
} = tacticBoardApiSlice;
