import { quadcoachApi } from "..";
import { TagType } from "../enum";
import { TacticBoard } from "./domain";
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
    updateTacticBoard: builder.mutation<TacticBoard, TacticBoard>({
      query(data) {
        return {
          url: `/api/tacticboards/${data._id}`,
          method: "put",
          data,
        };
      },
      invalidatesTags: () => [TagType.tacticboard, TagType.tacticboardTag],
    }),
    deleteTacticBoard: builder.mutation<void, string>({
      query(exerciseId) {
        return {
          url: `/api/tacticboards/${exerciseId}`,
          method: "delete",
        };
      },
      invalidatesTags: (_result, _error, exerciseId) => [
        { type: TagType.tacticboard, id: exerciseId },
        TagType.tacticboardTag,
      ],
    }),
    addTacticBoard: builder.mutation<TacticBoard, Omit<TacticBoard, "_id">>({
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
  }),
});

export const {
  useGetTacticBoardQuery,
  useLazyGetTacticBoardsQuery,
  useDeleteTacticBoardMutation,
  useUpdateTacticBoardMutation,
  useAddTacticBoardMutation,
  useGetTacticBoardsQuery,
  useGetAllTacticBoardTagsQuery,
} = tacticBoardApiSlice;
