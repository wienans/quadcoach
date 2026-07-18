import type { TagDescription } from "@reduxjs/toolkit/query";
import { quadcoachApi } from "../api";
import { TagType } from "../api/enum";
import {
  Exercise,
  ExerciseSummary,
  ResourceAuthorizationResponse,
} from "../api/quadcoachApi/domain";
import {
  ExerciseResponseDto,
  ExerciseSummaryResponseDto,
  fromExerciseResponseDto,
  fromExerciseSummaryResponseDto,
  toExerciseRequestDto,
} from "../api/quadcoachApi/compatibility/tacticBoardWire";

export type GetExercisesRequest = {
  search?: string;
  tags?: string[];
  tagMode?: "all" | "any";
  materials?: string[];
  materialMode?: "all" | "any";
  personsMin?: number;
  personsMax?: number;
  durationMin?: number;
  durationMax?: number;
  beatersMin?: number;
  beatersMax?: number;
  chasersMin?: number;
  chasersMax?: number;
  sort?: "name" | "duration" | "persons" | "created" | "updated";
  direction?: "asc" | "desc";
  page?: number;
  limit?: number;
};

export type GetExercisesResponse = {
  items: ExerciseSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

type GetExercisesResponseDto = Omit<GetExercisesResponse, "items"> & {
  items: ExerciseSummaryResponseDto[];
};

export type ExerciseFacetResponse = { items: string[] };

const EXERCISE_LIST_TAG = "LIST";

export type AccessLevel = "edit";

export type ExerciseAccessEntry = {
  user: {
    _id: string;
    name: string;
  };
  exercise: string;
  access: AccessLevel;
  createdAt: string;
};

export const exerciseApiSlice = quadcoachApi.injectEndpoints({
  endpoints: (builder) => ({
    getExercise: builder.query<Exercise, string>({
      query: (exerciseId: string) => ({
        url: `/api/exercises/${exerciseId}`,
        method: "get",
      }),
      transformResponse: fromExerciseResponseDto,
      providesTags: (result) =>
        result
          ? [
              { type: TagType.exercise, id: result._id },
              ...(result.description_blocks
                ? result.description_blocks.map((block) => ({
                    type: TagType.block,
                    id: block._id,
                  }))
                : [TagType.block]),
            ]
          : [TagType.exercise, TagType.block],
    }),
    updateExercise: builder.mutation<Exercise, Exercise>({
      query(data) {
        return {
          url: `/api/exercises/${data._id}`,
          method: "put",
          data: toExerciseRequestDto(data),
        };
      },
      invalidatesTags: (_result, _error, exercise) => [
        TagType.tag,
        TagType.material,
        { type: TagType.exercise, id: EXERCISE_LIST_TAG },
        { type: TagType.exercise, id: exercise._id },
        ...exercise.description_blocks.map((block) => ({
          type: TagType.block,
          id: block._id,
        })),
      ],
    }),
    deleteExercise: builder.mutation<void, string>({
      query(exerciseId) {
        return {
          url: `/api/exercises/${exerciseId}`,
          method: "delete",
        };
      },
      invalidatesTags: (_result, _error, exerciseId) => [
        { type: TagType.exercise, id: exerciseId },
        { type: TagType.exercise, id: EXERCISE_LIST_TAG },
        TagType.block,
        TagType.tag,
        TagType.material,
      ],
    }),
    addExercise: builder.mutation<Exercise, Omit<Exercise, "_id">>({
      query(data) {
        return {
          url: "/api/exercises",
          method: "post",
          data: toExerciseRequestDto(data),
        };
      },
      transformResponse: fromExerciseResponseDto,
      invalidatesTags: (result) =>
        result
          ? [
              TagType.tag,
              TagType.material,
              { type: TagType.exercise, id: EXERCISE_LIST_TAG },
              { type: TagType.exercise, id: result._id },
              ...(result.description_blocks
                ? result.description_blocks.map((block) => ({
                    type: TagType.block,
                    id: block._id,
                  }))
                : [TagType.block]),
            ]
          : [TagType.exercise, TagType.block, TagType.tag, TagType.material],
    }),
    getRelatedExercises: builder.query<Exercise[], string>({
      query: (exerciseId: string) => ({
        url: `/api/exercises/${exerciseId}/relatedExercises`,
        method: "get",
      }),
      transformResponse: (response: ExerciseResponseDto[]) =>
        response.map(fromExerciseResponseDto),
      providesTags: (result) =>
        result
          ? result.reduce((allTags, exercise) => {
              return allTags.concat([
                { type: TagType.exercise, id: exercise._id },
                ...(exercise.description_blocks
                  ? exercise.description_blocks.map((block) => ({
                      type: TagType.block,
                      id: block._id,
                    }))
                  : [TagType.block]),
              ]);
            }, new Array<TagDescription<TagType>>())
          : [TagType.exercise, TagType.block],
    }),
    getAllTags: builder.query<ExerciseFacetResponse, void>({
      query: () => ({
        url: "/api/tags/exercises",
        method: "get",
      }),
      providesTags: () => [TagType.tag],
    }),
    getAllMaterials: builder.query<ExerciseFacetResponse, void>({
      query: () => ({
        url: "/api/materials",
        method: "get",
      }),
      providesTags: () => [TagType.material],
    }),
    getExercises: builder.query<
      GetExercisesResponse,
      GetExercisesRequest | undefined
    >({
      query: (request) => {
        const {
          search,
          tags,
          tagMode,
          materials,
          materialMode,
          personsMin,
          personsMax,
          durationMin,
          durationMax,
          beatersMin,
          beatersMax,
          chasersMin,
          chasersMax,
          sort,
          direction,
          page,
          limit,
        } = request || {};
        const urlParams = new URLSearchParams();

        if (search) urlParams.append("search", search);
        tags?.forEach((tag) => urlParams.append("tags", tag));
        if (tags?.length && tagMode) urlParams.append("tagMode", tagMode);
        materials?.forEach((material) =>
          urlParams.append("materials", material),
        );
        if (materials?.length && materialMode) {
          urlParams.append("materialMode", materialMode);
        }
        const ranges = {
          personsMin,
          personsMax,
          durationMin,
          durationMax,
          beatersMin,
          beatersMax,
          chasersMin,
          chasersMax,
        };
        Object.entries(ranges).forEach(([field, value]) => {
          if (value != null && (!field.endsWith("Min") || value > 0)) {
            urlParams.append(field, value.toString());
          }
        });
        if (sort) urlParams.append("sort", sort);
        if (direction) urlParams.append("direction", direction);
        if (page != null) urlParams.append("page", page.toString());
        if (limit != null) urlParams.append("limit", limit.toString());

        const urlParamsString = urlParams.toString();
        return {
          url: `/api/exercises${
            urlParamsString === "" ? "" : `?${urlParamsString}`
          }`,
          method: "get",
        };
      },
      transformResponse: (response: GetExercisesResponseDto) => ({
        ...response,
        items: response.items.map(fromExerciseSummaryResponseDto),
      }),
      providesTags: (result) =>
        result
          ? [
              { type: TagType.exercise, id: EXERCISE_LIST_TAG },
              ...result.items.map((exercise) => ({
                type: TagType.exercise as const,
                id: exercise._id,
              })),
            ]
          : [{ type: TagType.exercise, id: EXERCISE_LIST_TAG }],
    }),
    checkExerciseAccess: builder.query<ResourceAuthorizationResponse, string>({
      query: (exerciseId) => ({
        url: `/api/exercises/${exerciseId}/checkAccess`,
        method: "get",
      }),
      providesTags: (_result, _error, exerciseId) => [
        { type: TagType.exercise, id: `${exerciseId}-access` },
      ],
    }),
    getAllExerciseAccessUsers: builder.query<ExerciseAccessEntry[], string>({
      query: (exerciseId) => ({
        url: `/api/exercises/${exerciseId}/access`,
        method: "get",
      }),
      providesTags: (_result, _error, exerciseId) => [
        { type: TagType.exercise, id: `${exerciseId}-access` },
      ],
    }),
    setExerciseAccess: builder.mutation<
      ExerciseAccessEntry,
      { exerciseId: string; userId: string; access: AccessLevel }
    >({
      query: ({ exerciseId, userId, access }) => ({
        url: `/api/exercises/${exerciseId}/access`,
        method: "post",
        data: { userId, access },
      }),
      invalidatesTags: (_result, _error, { exerciseId }) => [
        { type: TagType.exercise, id: `${exerciseId}-access` },
      ],
    }),
    deleteExerciseAccess: builder.mutation<
      { message: string },
      { exerciseId: string; userId: string }
    >({
      query: ({ exerciseId, userId }) => ({
        url: `/api/exercises/${exerciseId}/access`,
        method: "delete",
        data: { userId },
      }),
      invalidatesTags: (_result, _error, { exerciseId }) => [
        { type: TagType.exercise, id: `${exerciseId}-access` },
      ],
    }),
    shareExercise: builder.mutation<
      { message: string },
      { exerciseId: string; email: string; access: AccessLevel }
    >({
      query: ({ exerciseId, email, access }) => ({
        url: `/api/exercises/${exerciseId}/share`,
        method: "post",
        data: { email, access },
      }),
      invalidatesTags: (_result, _error, { exerciseId }) => [
        { type: TagType.exercise, id: `${exerciseId}-access` },
      ],
    }),
  }),
});

export const {
  useGetExerciseQuery,
  useLazyGetExerciseQuery,
  useDeleteExerciseMutation,
  useUpdateExerciseMutation,
  useAddExerciseMutation,
  useGetRelatedExercisesQuery,
  useGetAllTagsQuery,
  useLazyGetAllTagsQuery,
  useGetAllMaterialsQuery,
  useLazyGetAllMaterialsQuery,
  useGetExercisesQuery,
  useLazyGetExercisesQuery,
  useCheckExerciseAccessQuery,
  useGetAllExerciseAccessUsersQuery,
  useSetExerciseAccessMutation,
  useDeleteExerciseAccessMutation,
  useShareExerciseMutation,
} = exerciseApiSlice;
