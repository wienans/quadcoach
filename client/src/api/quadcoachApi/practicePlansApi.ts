import { quadcoachApi } from "..";
import { TagType } from "../enum";
import type {
  PracticePlanEntity,
  PracticePlanEntityPartialId,
  PracticePlanSection,
} from "./domain/PracticePlan";
import { AccessLevel } from "./tacticboardApi";

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

export type AccessResponse = {
  hasAccess: boolean;
  type: "owner" | "admin" | "granted" | null;
  level: AccessLevel | null;
};

export const practicePlansApiSlice = quadcoachApi.injectEndpoints({
  endpoints: (builder) => ({
    createPracticePlan: builder.mutation<
      PracticePlanEntity,
      CreatePracticePlanRequest
    >({
      query: (data) => ({
        url: "/api/practice-plans",
        method: "post",
        data,
      }),
      invalidatesTags: [TagType.practiceplan],
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
      ],
    }),
    deletePracticePlan: builder.mutation<{ message?: string }, string>({
      query: (id) => ({
        url: `/api/practice-plans/${id}`,
        method: "delete",
      }),
      invalidatesTags: [TagType.practiceplan],
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
  }),
});

export const {
  useCreatePracticePlanMutation,
  useGetPracticePlanQuery,
  usePatchPracticePlanMutation,
  useDeletePracticePlanMutation,
  useGetAllPracticePlanAccessUsersQuery,
  useAddPracticePlanAccessMutation,
  useRemovePracticePlanAccessMutation,
  useSharePracticePlanMutation,
} = practicePlansApiSlice;
