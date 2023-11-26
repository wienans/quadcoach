import { TagDescription } from "@reduxjs/toolkit/dist/query";
import { quadcoachApi } from "../api";
import { TagType } from "../api/enum";
import { Exercise } from "../api/quadcoachApi/domain";

export type GetExercisesRequest = {
  nameRegex?: string;
  minPersons?: number;
  maxPersons?: number;
  tagString?: string;
};

export const exerciseApiSlice = quadcoachApi.injectEndpoints({
  endpoints: (builder) => ({
    getExercise: builder.query<Exercise, string>({
      query: (exerciseId: string) => ({
        url: `/api/exercise/${exerciseId}`,
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
          url: `/api/exercise/${data._id}`,
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
          url: `/api/exercise/${exerciseId}`,
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
          url: "/api/add-exercise",
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
        url: `/api/exercise/${exerciseId}/relatedExercises`,
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
          url: `/api/tags${
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
    getExercises: builder.query<Exercise[], GetExercisesRequest | undefined>({
      query: (request) => {
        const { maxPersons, minPersons, nameRegex, tagString } = request || {};
        const urlParams = new URLSearchParams();

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
        if (tagString != null && tagString !== "") {
          urlParams.append("tags[regex]", tagString);
          urlParams.append("tags[options]", "i");
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
  }),
});

export const {
  useGetExerciseQuery,
  useDeleteExerciseMutation,
  useUpdateExerciseMutation,
  useAddExerciseMutation,
  useGetRelatedExercisesQuery,
  useGetAllTagsQuery,
  useGetAllMaterialsQuery,
  useGetExercisesQuery,
  useLazyGetExercisesQuery,
} = exerciseApiSlice;
