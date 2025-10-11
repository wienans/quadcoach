import { quadcoachApi } from "..";
import { TagType } from "../enum";
import type {
  PracticePlanEntity,
  PracticePlanSection,
} from "./domain/PracticePlan";
import { AccessLevel } from "./tacticboardApi";

export interface CreatePracticePlanRequest {
  name: string;
  description?: string;
  tags?: string[];
}

export interface PatchPracticePlanRequest {
  id: string;
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

export interface AddAccessRequest {
  id: string; // practicePlan id
  userId: string;
}
export interface RemoveAccessRequest {
  id: string; // practicePlan id
  accessId: string;
}

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
      PatchPracticePlanRequest
    >({
      query: ({ id, ...data }) => ({
        url: `/api/practice-plans/${id}`,
        method: "patch",
        data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: TagType.practiceplan, id },
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
      { access: any[] },
      AddAccessRequest
    >({
      query: ({ id, userId }) => ({
        url: `/api/practice-plans/${id}/access`,
        method: "post",
        data: { userId },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: TagType.practiceplan, id: `${id}-access` },
      ],
    }),
    removePracticePlanAccess: builder.mutation<
      { access: any[] },
      RemoveAccessRequest
    >({
      query: ({ id, accessId }) => ({
        url: `/api/practice-plans/${id}/access/${accessId}`,
        method: "delete",
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: TagType.practiceplan, id: `${id}-access` },
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
} = practicePlansApiSlice;
