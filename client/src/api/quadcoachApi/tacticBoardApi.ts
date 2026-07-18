import { quadcoachApi } from "..";
import { TagType } from "../enum";
import {
  ResourceAccessLevel,
  ResourceAuthorizationResponse,
  TacticBoard,
  TacticPage,
} from "./domain";
import { TacticBoardWithOutIds } from "./domain/TacticBoard";
import { TacticBoardHeader } from "./domain/TacticBoard";
import {
  GetTacticBoardRequest,
  serializeTacticBoardCollectionRequest,
} from "./tacticBoardCollectionRequest";
import {
  TacticBoardAccessDeleteRequest,
  TacticBoardAccessEntry,
  TacticBoardAccessEntryResponseDto,
  TacticBoardAccessMutationResponse,
  TacticBoardAccessMutationResponseDto,
  TacticBoardAccessRequest,
  TacticBoardCollectionResponse,
  TacticBoardCollectionResponseDto,
  fromTacticBoardAccessEntryResponseDto,
  fromTacticBoardAccessMutationResponseDto,
  fromTacticBoardCollectionResponseDto,
  toTacticBoardAccessDeleteRequestDto,
  toTacticBoardAccessRequestDto,
} from "./compatibility/tacticBoardWire";
import type {
  SharedTacticBoardDto,
  ShareLinkEnsureResponse,
  ShareLinkRevokeResponse,
  ShareLinkRotateResponse,
  ShareLinkStatusResponse,
} from "./shareLink";
import { TACTIC_BOARD_SHARED_READ_TAG_ID } from "./shareLink";

export type { GetTacticBoardRequest } from "./tacticBoardCollectionRequest";

export type GetTacticBoardHeadersResponse =
  TacticBoardCollectionResponse<TacticBoardHeader>;

export type GetTacticBoardResponse = TacticBoardCollectionResponse<TacticBoard>;

export type AccessLevel = ResourceAccessLevel;

export type DuplicateTacticBoardResponse = {
  message: string;
  _id: string;
};

export const tacticBoardApiSlice = quadcoachApi.injectEndpoints({
  endpoints: (builder) => ({
    getTacticBoard: builder.query<TacticBoard, string>({
      query: (tacticBoardId: string) => ({
        url: `/api/tacticboards/${tacticBoardId}`,
        method: "get",
      }),
      // Tag both the list and the individual item
      providesTags: (result) =>
        result
          ? [{ type: TagType.tacticBoard, id: result._id }, TagType.tacticBoard]
          : [TagType.tacticBoard],
    }),
    getSharedTacticBoard: builder.query<SharedTacticBoardDto, string>({
      query: (token: string) => ({
        url: `/api/tacticboards/share/${encodeURIComponent(token)}`,
        method: "get",
      }),
      providesTags: [
        { type: TagType.shareLink, id: TACTIC_BOARD_SHARED_READ_TAG_ID },
      ],
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
        { type: TagType.tacticBoard, id: data._id },
        TagType.tacticBoardTag,
        { type: TagType.shareLink, id: `tacticboard-${data._id}` },
        { type: TagType.shareLink, id: TACTIC_BOARD_SHARED_READ_TAG_ID },
      ],
    }),
    updateTacticBoardPage: builder.mutation<
      { message: string },
      { tacticBoardId: string; pageId: string; pageData: Partial<TacticPage> }
    >({
      query({ tacticBoardId, pageId, pageData }) {
        return {
          url: `/api/tacticboards/${tacticBoardId}/pages/${pageId}`,
          method: "patch",
          data: pageData,
        };
      },
      invalidatesTags: (_result, _error, { tacticBoardId }) => [
        { type: TagType.tacticBoard, id: tacticBoardId },
        { type: TagType.shareLink, id: TACTIC_BOARD_SHARED_READ_TAG_ID },
      ],
    }),
    deleteTacticBoard: builder.mutation<{ message: string }, string>({
      query(tacticBoardId) {
        return {
          url: `/api/tacticboards/${tacticBoardId}`,
          method: "delete",
        };
      },
      invalidatesTags: (_result, _error, tacticBoardId) => [
        { type: TagType.tacticBoard, id: tacticBoardId },
        TagType.tacticBoard,
        TagType.tacticBoardTag,
        { type: TagType.shareLink, id: `tacticboard-${tacticBoardId}` },
        { type: TagType.shareLink, id: TACTIC_BOARD_SHARED_READ_TAG_ID },
      ],
    }),
    duplicateTacticBoard: builder.mutation<
      DuplicateTacticBoardResponse,
      string
    >({
      query(tacticBoardId) {
        return {
          url: `/api/tacticboards/${tacticBoardId}/duplicate`,
          method: "post",
        };
      },
      invalidatesTags: [TagType.tacticBoard],
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
      invalidatesTags: () => [TagType.tacticBoard, TagType.tacticBoardTag],
    }),
    getTacticBoards: builder.query<
      GetTacticBoardResponse,
      GetTacticBoardRequest | undefined
    >({
      query: (request) => {
        const urlParamsString = serializeTacticBoardCollectionRequest(request);
        return {
          url: `/api/tacticboards${
            urlParamsString === "" ? "" : `?${urlParamsString}`
          }`,
          method: "get",
        };
      },
      transformResponse: (
        response: TacticBoardCollectionResponseDto<TacticBoard>,
      ) => fromTacticBoardCollectionResponseDto(response),
      // Tag the list and each individual Tactic Board.
      providesTags: (result) =>
        result
          ? [
              ...result.tacticBoards.map(({ _id }) => ({
                type: TagType.tacticBoard as const,
                id: _id,
              })),
              TagType.tacticBoard,
            ]
          : [TagType.tacticBoard],
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
      providesTags: () => [TagType.tacticBoardTag],
    }),
    createTacticBoardPage: builder.mutation<
      { message: string },
      { tacticBoardId: string; pageData: Partial<TacticPage> }
    >({
      query({ tacticBoardId, pageData }) {
        return {
          url: `/api/tacticboards/${tacticBoardId}/newPage`,
          method: "post",
          data: pageData,
        };
      },
      invalidatesTags: (_result, _error, { tacticBoardId }) => [
        { type: TagType.tacticBoard, id: tacticBoardId },
        { type: TagType.shareLink, id: TACTIC_BOARD_SHARED_READ_TAG_ID },
      ],
    }),
    insertTacticBoardPage: builder.mutation<
      { message: string },
      { tacticBoardId: string; position: number; pageData: Partial<TacticPage> }
    >({
      query({ tacticBoardId, position, pageData }) {
        return {
          url: `/api/tacticboards/${tacticBoardId}/insertPage/${position}`,
          method: "post",
          data: pageData,
        };
      },
      invalidatesTags: (_result, _error, { tacticBoardId }) => [
        { type: TagType.tacticBoard, id: tacticBoardId },
        { type: TagType.shareLink, id: TACTIC_BOARD_SHARED_READ_TAG_ID },
      ],
    }),
    deleteTacticBoardPage: builder.mutation<
      { message: string; exercises?: { id: string; name: string }[] },
      { tacticBoardId: string; pageId: string }
    >({
      query: ({ tacticBoardId, pageId }) => ({
        url: `/api/tacticboards/${tacticBoardId}/pages/${pageId}`,
        method: "delete",
      }),
      invalidatesTags: (_result, _error, { tacticBoardId }) => [
        { type: TagType.tacticBoard, id: tacticBoardId },
        { type: TagType.shareLink, id: TACTIC_BOARD_SHARED_READ_TAG_ID },
      ],
    }),
    updateTacticBoardMeta: builder.mutation<
      { message: string },
      {
        tacticBoardId: string;
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
      query({ tacticBoardId, metaData }) {
        return {
          url: `/api/tacticboards/${tacticBoardId}/meta`,
          method: "patch",
          data: metaData,
        };
      },
      // Only invalidate the specific Tactic Board and tags.
      invalidatesTags: (_result, _error, { tacticBoardId }) => [
        { type: TagType.tacticBoard, id: tacticBoardId },
        TagType.tacticBoardTag,
        { type: TagType.shareLink, id: `tacticboard-${tacticBoardId}` },
        { type: TagType.shareLink, id: TACTIC_BOARD_SHARED_READ_TAG_ID },
      ],
    }),
    getTacticBoardHeaders: builder.query<
      GetTacticBoardHeadersResponse,
      GetTacticBoardRequest | undefined
    >({
      query: (request) => {
        const urlParamsString = serializeTacticBoardCollectionRequest(request);
        return {
          url: `/api/tacticboards/header${
            urlParamsString === "" ? "" : `?${urlParamsString}`
          }`,
          method: "get",
        };
      },
      transformResponse: (
        response: TacticBoardCollectionResponseDto<TacticBoardHeader>,
      ) => fromTacticBoardCollectionResponseDto(response),
      providesTags: (result) =>
        result
          ? [
              ...result.tacticBoards.map(({ _id }) => ({
                type: TagType.tacticBoard as const,
                id: _id,
              })),
              TagType.tacticBoard,
            ]
          : [TagType.tacticBoard],
    }),
    checkTacticBoardAccess: builder.query<
      ResourceAuthorizationResponse,
      string
    >({
      query: (tacticBoardId) => ({
        url: `/api/tacticboards/${tacticBoardId}/checkAccess`,
        method: "get",
      }),
      providesTags: (_result, _error, tacticBoardId) => [
        { type: TagType.tacticBoard, id: `${tacticBoardId}-access` },
      ],
    }),
    getAllTacticBoardAccessUsers: builder.query<
      TacticBoardAccessEntry[],
      string
    >({
      query: (tacticBoardId) => ({
        url: `/api/tacticboards/${tacticBoardId}/access`,
        method: "get",
      }),
      transformResponse: (response: TacticBoardAccessEntryResponseDto[]) =>
        response.map(fromTacticBoardAccessEntryResponseDto),
      providesTags: (_result, _error, tacticBoardId) => [
        { type: TagType.tacticBoard, id: `${tacticBoardId}-access` },
      ],
    }),
    setTacticBoardAccess: builder.mutation<
      TacticBoardAccessMutationResponse,
      TacticBoardAccessRequest
    >({
      query: (request) => {
        return {
          url: `/api/tacticboards/${request.tacticBoardId}/access`,
          method: "post",
          data: toTacticBoardAccessRequestDto(request),
        };
      },
      transformResponse: (response: TacticBoardAccessMutationResponseDto) =>
        fromTacticBoardAccessMutationResponseDto(response),
      invalidatesTags: (_result, _error, { tacticBoardId }) => [
        { type: TagType.tacticBoard, id: `${tacticBoardId}-access` },
      ],
    }),
    deleteTacticBoardAccess: builder.mutation<
      { message: string },
      TacticBoardAccessDeleteRequest
    >({
      query: (request) => {
        return {
          url: `/api/tacticboards/${request.tacticBoardId}/access`,
          method: "delete",
          data: toTacticBoardAccessDeleteRequestDto(request),
        };
      },
      invalidatesTags: (_result, _error, { tacticBoardId }) => [
        { type: TagType.tacticBoard, id: `${tacticBoardId}-access` },
      ],
    }),
    shareTacticBoard: builder.mutation<
      { message: string },
      { tacticBoardId: string; email: string; access: AccessLevel }
    >({
      query: ({ tacticBoardId, email, access }) => ({
        url: `/api/tacticboards/${tacticBoardId}/share`,
        method: "post",
        data: { email, access },
      }),
      invalidatesTags: (_result, _error, { tacticBoardId }) => [
        { type: TagType.tacticBoard, id: `${tacticBoardId}-access` },
      ],
    }),
    getTacticBoardShareLinkStatus: builder.query<
      ShareLinkStatusResponse,
      string
    >({
      query: (tacticBoardId) => ({
        url: `/api/tacticboards/${tacticBoardId}/share-link`,
        method: "get",
      }),
      providesTags: (_result, _error, tacticBoardId) => [
        { type: TagType.shareLink, id: `tacticboard-${tacticBoardId}` },
      ],
    }),
    ensureTacticBoardShareLink: builder.mutation<
      ShareLinkEnsureResponse,
      string
    >({
      query: (tacticBoardId) => ({
        url: `/api/tacticboards/${tacticBoardId}/share-link`,
        method: "post",
      }),
      invalidatesTags: (_result, _error, tacticBoardId) => [
        { type: TagType.shareLink, id: `tacticboard-${tacticBoardId}` },
        { type: TagType.shareLink, id: TACTIC_BOARD_SHARED_READ_TAG_ID },
      ],
    }),
    rotateTacticBoardShareLink: builder.mutation<
      ShareLinkRotateResponse,
      string
    >({
      query: (tacticBoardId) => ({
        url: `/api/tacticboards/${tacticBoardId}/share-link`,
        method: "put",
      }),
      invalidatesTags: (_result, _error, tacticBoardId) => [
        { type: TagType.shareLink, id: `tacticboard-${tacticBoardId}` },
        { type: TagType.shareLink, id: TACTIC_BOARD_SHARED_READ_TAG_ID },
      ],
    }),
    revokeTacticBoardShareLink: builder.mutation<
      ShareLinkRevokeResponse,
      string
    >({
      query: (tacticBoardId) => ({
        url: `/api/tacticboards/${tacticBoardId}/share-link`,
        method: "delete",
      }),
      invalidatesTags: (_result, _error, tacticBoardId) => [
        { type: TagType.shareLink, id: `tacticboard-${tacticBoardId}` },
        { type: TagType.shareLink, id: TACTIC_BOARD_SHARED_READ_TAG_ID },
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
  useCheckTacticBoardAccessQuery,
  useGetAllTacticBoardAccessUsersQuery,
  useSetTacticBoardAccessMutation,
  useDeleteTacticBoardAccessMutation,
  useShareTacticBoardMutation,
  useGetTacticBoardShareLinkStatusQuery,
  useEnsureTacticBoardShareLinkMutation,
  useRotateTacticBoardShareLinkMutation,
  useRevokeTacticBoardShareLinkMutation,
} = tacticBoardApiSlice;
