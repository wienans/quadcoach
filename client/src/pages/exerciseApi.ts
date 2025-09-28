import { TagDescription } from "@reduxjs/toolkit/dist/query";
import { quadcoachApi } from "../api";
import { TagType } from "../api/enum";
import { Exercise } from "../api/quadcoachApi/domain";

export type GetExercisesRequest = {
  nameRegex?: string;
  minPersons?: number;
  maxPersons?: number;
  tagRegex?: string;
  tagList?: string[];
  materialRegex?: string;
  materialList?: string[];
  minTime?: number;
  maxTime?: number;
  minBeaters?: number;
  maxBeaters?: number;
  minChasers?: number;
  maxChasers?: number;
  sortBy?: "name" | "time" | "persons" | "created" | "updated";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
};

export type GetExercisesResponse = {
  exercises: Exercise[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

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

export type ExerciseAccessResponse = {
  hasAccess: boolean;
  type: "owner" | "admin" | "granted" | null;
};

export const exerciseApiSlice = quadcoachApi.injectEndpoints({
  endpoints: (builder) => ({
    getExercise: builder.query<Exercise, string>({
      query: (exerciseId: string) => ({
        url: `/api/exercises/${exerciseId}`,
        method: "get",
      }),
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
          data,
        };
      },
      invalidatesTags: (result) =>
        result
          ? [
              TagType.tag,
              TagType.material,
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
    deleteExercise: builder.mutation<void, string>({
      query(exerciseId) {
        return {
          url: `/api/exercises/${exerciseId}`,
          method: "delete",
        };
      },
      invalidatesTags: (_result, _error, exerciseId) => [
        { type: TagType.exercise, id: exerciseId },
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
          data,
        };
      },
      invalidatesTags: (result) =>
        result
          ? [
              TagType.tag,
              TagType.material,
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
    getAllTags: builder.query<string[], string | undefined>({
      query: (tagRegex) => {
        const urlParams = new URLSearchParams();

        if (tagRegex != null && tagRegex !== "") {
          urlParams.append("tagName[regex]", tagRegex);
          urlParams.append("tagName[options]", "i");
        }

        const urlParamsString = urlParams.toString();

        return {
          url: `/api/tags/exercises${
            urlParamsString === "" ? "" : `?${urlParamsString}`
          }`,
          method: "get",
        };
      },
      providesTags: () => [TagType.tag],
    }),
    getAllMaterials: builder.query<string[], string | undefined>({
      query: (materialRegex) => {
        const urlParams = new URLSearchParams();

        if (materialRegex != null && materialRegex !== "") {
          urlParams.append("materialName[regex]", materialRegex);
          urlParams.append("materialName[options]", "i");
        }

        const urlParamsString = urlParams.toString();

        return {
          url: `/api/materials${
            urlParamsString === "" ? "" : `?${urlParamsString}`
          }`,
          method: "get",
        };
      },
      providesTags: () => [TagType.material],
    }),
    getExercises: builder.query<
      GetExercisesResponse,
      GetExercisesRequest | undefined
    >({
      query: (request) => {
        const {
          maxPersons,
          minPersons,
          nameRegex,
          tagRegex,
          tagList,
          materialRegex,
          materialList,
          minTime,
          maxTime,
          minBeaters,
          maxBeaters,
          minChasers,
          maxChasers,
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
        if (minPersons != null) {
          urlParams.append("persons[gte]", minPersons.toString());
        }
        if (maxPersons != null) {
          urlParams.append("persons[lte]", maxPersons.toString());
        }
        if (tagList != null && tagList.length > 0) {
          urlParams.append("tags[all]", tagList.join(","));
        }
        if (tagRegex != null && tagRegex !== "") {
          urlParams.append("tags[regex]", tagRegex);
          urlParams.append("tags[options]", "i");
        }
        if (materialList != null && materialList.length > 0) {
          urlParams.append("materials[all]", materialList.join(","));
        }
        if (materialRegex != null && materialRegex !== "") {
          urlParams.append("materials[regex]", materialRegex);
          urlParams.append("materials[options]", "i");
        }
        if (minTime != null) {
          urlParams.append("time_min[gte]", minTime.toString());
        }
        if (maxTime != null) {
          urlParams.append("time_min[lte]", maxTime.toString());
        }
        if (minBeaters != null) {
          urlParams.append("beaters[gte]", minBeaters.toString());
        }
        if (maxBeaters != null) {
          urlParams.append("beaters[lte]", maxBeaters.toString());
        }
        if (minChasers != null) {
          urlParams.append("chasers[gte]", minChasers.toString());
        }
        if (maxChasers != null) {
          urlParams.append("chasers[lte]", maxChasers.toString());
        }
        if (sortBy != null) {
          urlParams.append("sortBy", sortBy);
        }
        if (sortOrder != null) {
          urlParams.append("sortOrder", sortOrder);
        }

        const urlParamsString = urlParams.toString();
        return {
          url: `/api/exercises${
            urlParamsString === "" ? "" : `?${urlParamsString}`
          }`,
          method: "get",
        };
      },
      providesTags: (result) =>
        result?.exercises
          ? result.exercises.reduce((allTags, exercise) => {
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
    checkExerciseAccess: builder.query<ExerciseAccessResponse, string>({
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
