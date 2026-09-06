import { quadcoachApi } from "..";
import { TagType } from "../enum";
import type {
  PracticePlanEntity,
  PracticePlanEntityPartialId,
  PracticePlanSection,
  PracticePlanSummary,
} from "./domain/PracticePlan";
import {
  GetPracticePlanRequest,
  serializePracticePlanCollectionRequest,
} from "./practicePlanCollectionRequest";
import type {
  ResourceAccessLevel,
  ResourceAuthorizationResponse,
} from "./domain";
import type {
  SharedPracticePlanDto,
  ShareLinkEnsureResponse,
  ShareLinkRevokeResponse,
  ShareLinkRotateResponse,
  ShareLinkStatusResponse,
} from "./shareLink";
import { PRACTICE_PLAN_SHARED_READ_TAG_ID } from "./shareLink";

export type AccessLevel = ResourceAccessLevel;

export interface CreatePracticePlanRequest {
  name: string;
  description?: string;
  tags?: string[];
}

export interface PatchPracticePlanRequest {
  name?: string;
  description?: string;
  tags?: string[];
  sections?: PracticePlanSection[];
  isPrivate?: boolean;
}

export type PracticePlanAccessEntry = {
  user: {
    _id: string;
    name: string;
  };
  practicePlan: string;
  access: AccessLevel;
  createdAt: string;
};

export type { GetPracticePlanRequest } from "./practicePlanCollectionRequest";

export type GetPracticePlansResponse = {
  items: PracticePlanSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

export const practicePlansApiSlice = quadcoachApi.injectEndpoints({
  endpoints: (builder) => ({
    getPracticePlans: builder.query<
      GetPracticePlansResponse,
      GetPracticePlanRequest | undefined
    >({
      query: (request) => {
        const urlParamsString =
          serializePracticePlanCollectionRequest(request);
        return {
          url: `/api/practice-plans${
            urlParamsString === "" ? "" : `?${urlParamsString}`
          }`,
          method: "get",
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ _id }) => ({
                type: TagType.practiceplan as const,
                id: _id,
              })),
              TagType.practiceplan,
            ]
          : [TagType.practiceplan],
    }),
    getAllPracticePlanTags: builder.query<{ items: string[] }, void>({
      query: () => ({
        url: "/api/tags/practiceplans",
        method: "get",
      }),
      providesTags: () => [TagType.practiceplanTag],
    }),
    createPracticePlan: builder.mutation<
      PracticePlanEntity,
      CreatePracticePlanRequest
    >({
      query: (data) => ({
        url: "/api/practice-plans",
        method: "post",
        data,
      }),
      invalidatesTags: [TagType.practiceplan, TagType.practiceplanTag],
    }),
    getPracticePlan: builder.query<PracticePlanEntity, string>({
      query: (id) => ({
        url: `/api/practice-plans/${id}`,
        method: "get",
      }),
      providesTags: (result) =>
        result
          ? [
              { type: TagType.practiceplan, id: result._id },
              TagType.practiceplan,
            ]
          : [TagType.practiceplan],
    }),
    getSharedPracticePlan: builder.query<SharedPracticePlanDto, string>({
      query: (token) => ({
        url: `/api/practice-plans/share/${encodeURIComponent(token)}`,
        method: "get",
      }),
      providesTags: [
        { type: TagType.shareLink, id: PRACTICE_PLAN_SHARED_READ_TAG_ID },
      ],
    }),
    patchPracticePlan: builder.mutation<
      PracticePlanEntity,
      PracticePlanEntityPartialId
    >({
      query: (data) => ({
        url: `/api/practice-plans/${data._id}`,
        method: "patch",
        data,
      }),
      invalidatesTags: (_result, _error, data) => [
        { type: TagType.practiceplan, id: data._id },
        TagType.practiceplanTag,
        { type: TagType.shareLink, id: `practiceplan-${data._id}` },
        { type: TagType.shareLink, id: PRACTICE_PLAN_SHARED_READ_TAG_ID },
      ],
    }),
    deletePracticePlan: builder.mutation<{ message?: string }, string>({
      query: (id) => ({
        url: `/api/practice-plans/${id}`,
        method: "delete",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: TagType.practiceplan, id },
        TagType.practiceplan,
        TagType.practiceplanTag,
        { type: TagType.shareLink, id: `practiceplan-${id}` },
        { type: TagType.shareLink, id: PRACTICE_PLAN_SHARED_READ_TAG_ID },
      ],
    }),
    checkPracticePlanAccess: builder.query<
      ResourceAuthorizationResponse,
      string
    >({
      query: (practicePlanId) => ({
        url: `/api/practice-plans/${practicePlanId}/checkAccess`,
        method: "get",
      }),
      providesTags: (_result, _error, practicePlanId) => [
        { type: TagType.practiceplan, id: `${practicePlanId}-access` },
      ],
    }),
    getAllPracticePlanAccessUsers: builder.query<
      PracticePlanAccessEntry[],
      string
    >({
      query: (practicePlanId) => ({
        url: `/api/practice-plans/${practicePlanId}/access`,
        method: "get",
      }),
      providesTags: (_result, _error, practicePlanId) => [
        { type: TagType.practiceplan, id: `${practicePlanId}-access` },
      ],
    }),
    addPracticePlanAccess: builder.mutation<
      { message: string },
      { practicePlan: string; email: string; access: AccessLevel }
    >({
      query: ({ practicePlan, email, access }) => ({
        url: `/api/practice-plans/${practicePlan}/access`,
        method: "post",
        data: { email, access },
      }),
      invalidatesTags: (_result, _error, { practicePlan }) => [
        { type: TagType.practiceplan, id: `${practicePlan}-access` },
      ],
    }),
    removePracticePlanAccess: builder.mutation<
      { message: string },
      { practicePlan: string; userId: string }
    >({
      query: ({ practicePlan, userId }) => ({
        url: `/api/practice-plans/${practicePlan}/access`,
        method: "delete",
        data: { userId },
      }),
      invalidatesTags: (_result, _error, { practicePlan }) => [
        { type: TagType.practiceplan, id: `${practicePlan}-access` },
      ],
    }),
    sharePracticePlan: builder.mutation<
      { message: string },
      { practicePlan: string; email: string; access: AccessLevel }
    >({
      query: ({ practicePlan, email, access }) => ({
        url: `/api/practice-plans/${practicePlan}/share`,
        method: "post",
        data: { email, access },
      }),
      invalidatesTags: (_result, _error, { practicePlan }) => [
        { type: TagType.practiceplan, id: `${practicePlan}-access` },
      ],
    }),
    getPracticePlanShareLinkStatus: builder.query<
      ShareLinkStatusResponse,
      string
    >({
      query: (practicePlanId) => ({
        url: `/api/practice-plans/${practicePlanId}/share-link`,
        method: "get",
      }),
      providesTags: (_result, _error, practicePlanId) => [
        { type: TagType.shareLink, id: `practiceplan-${practicePlanId}` },
      ],
    }),
    ensurePracticePlanShareLink: builder.mutation<
      ShareLinkEnsureResponse,
      string
    >({
      query: (practicePlanId) => ({
        url: `/api/practice-plans/${practicePlanId}/share-link`,
        method: "post",
      }),
      invalidatesTags: (_result, _error, practicePlanId) => [
        { type: TagType.shareLink, id: `practiceplan-${practicePlanId}` },
        { type: TagType.shareLink, id: PRACTICE_PLAN_SHARED_READ_TAG_ID },
      ],
    }),
    rotatePracticePlanShareLink: builder.mutation<
      ShareLinkRotateResponse,
      string
    >({
      query: (practicePlanId) => ({
        url: `/api/practice-plans/${practicePlanId}/share-link`,
        method: "put",
      }),
      invalidatesTags: (_result, _error, practicePlanId) => [
        { type: TagType.shareLink, id: `practiceplan-${practicePlanId}` },
        { type: TagType.shareLink, id: PRACTICE_PLAN_SHARED_READ_TAG_ID },
      ],
    }),
    revokePracticePlanShareLink: builder.mutation<
      ShareLinkRevokeResponse,
      string
    >({
      query: (practicePlanId) => ({
        url: `/api/practice-plans/${practicePlanId}/share-link`,
        method: "delete",
      }),
      invalidatesTags: (_result, _error, practicePlanId) => [
        { type: TagType.shareLink, id: `practiceplan-${practicePlanId}` },
        { type: TagType.shareLink, id: PRACTICE_PLAN_SHARED_READ_TAG_ID },
      ],
    }),
  }),
});

export const {
  useGetPracticePlansQuery,
  useLazyGetPracticePlansQuery,
  useGetAllPracticePlanTagsQuery,
  useLazyGetAllPracticePlanTagsQuery,
  useCreatePracticePlanMutation,
  useGetPracticePlanQuery,
  useGetSharedPracticePlanQuery,
  usePatchPracticePlanMutation,
  useDeletePracticePlanMutation,
  useCheckPracticePlanAccessQuery,
  useGetAllPracticePlanAccessUsersQuery,
  useAddPracticePlanAccessMutation,
  useRemovePracticePlanAccessMutation,
  useSharePracticePlanMutation,
  useGetPracticePlanShareLinkStatusQuery,
  useEnsurePracticePlanShareLinkMutation,
  useRotatePracticePlanShareLinkMutation,
  useRevokePracticePlanShareLinkMutation,
} = practicePlansApiSlice;
