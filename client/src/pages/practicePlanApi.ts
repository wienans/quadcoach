import { quadcoachApi } from "../api";
import { TagType } from "../api/enum";
import { PracticePlan, PracticePlanCreateRequest } from "../api/quadcoachApi/domain";

export type GetPracticePlansRequest = {
  nameRegex?: string;
  tagRegex?: string;
  tagList?: string[];
  sortBy?: 'name' | 'created' | 'updated';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
};

export type GetPracticePlansResponse = {
  practicePlans: PracticePlan[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

export const practicePlanApiSlice = quadcoachApi.injectEndpoints({
  endpoints: (builder) => ({
    getPracticePlan: builder.query<PracticePlan, string>({
      query: (practicePlanId: string) => ({
        url: `/api/practice-plans/${practicePlanId}`,
        method: "get",
      }),
      providesTags: (result) =>
        result
          ? [{ type: TagType.practicePlan, id: result._id }]
          : [TagType.practicePlan],
    }),
    getPracticePlans: builder.query<GetPracticePlansResponse, GetPracticePlansRequest>({
      query: ({
        nameRegex,
        tagRegex,
        tagList,
        sortBy,
        sortOrder,
        page,
        limit,
      }: GetPracticePlansRequest) => {
        const urlParams = new URLSearchParams();
        if (nameRegex != null) {
          urlParams.append("name[$regex]", nameRegex);
          urlParams.append("name[$options]", "i");
        }
        if (tagRegex != null) {
          urlParams.append("tags[$regex]", tagRegex);
          urlParams.append("tags[$options]", "i");
        }
        if (tagList != null && tagList.length > 0) {
          urlParams.append("tags[$all]", tagList.join(","));
        }
        if (sortBy != null) {
          urlParams.append("sortBy", sortBy);
        }
        if (sortOrder != null) {
          urlParams.append("sortOrder", sortOrder);
        }
        if (page != null) {
          urlParams.append("page", page.toString());
        }
        if (limit != null) {
          urlParams.append("limit", limit.toString());
        }

        const urlParamsString = urlParams.toString();
        return {
          url: `/api/practice-plans${
            urlParamsString ? `?${urlParamsString}` : ""
          }`,
          method: "get",
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.practicePlans.map((practicePlan) => ({
                type: TagType.practicePlan as const,
                id: practicePlan._id,
              })),
              TagType.practicePlan,
            ]
          : [TagType.practicePlan],
    }),
    createPracticePlan: builder.mutation<PracticePlan, PracticePlanCreateRequest>({
      query: (practicePlan) => ({
        url: "/api/practice-plans",
        method: "post",
        data: practicePlan,
      }),
      invalidatesTags: [TagType.practicePlan],
    }),
    updatePracticePlan: builder.mutation<
      PracticePlan,
      { id: string; practicePlan: PracticePlanCreateRequest }
    >({
      query: ({ id, practicePlan }) => ({
        url: `/api/practice-plans/${id}`,
        method: "put",
        data: practicePlan,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: TagType.practicePlan, id },
        TagType.practicePlan,
      ],
    }),
    deletePracticePlan: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/practice-plans/${id}`,
        method: "delete",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: TagType.practicePlan, id },
        TagType.practicePlan,
      ],
    }),
  }),
});

export const {
  useGetPracticePlanQuery,
  useGetPracticePlansQuery,
  useLazyGetPracticePlansQuery,
  useCreatePracticePlanMutation,
  useUpdatePracticePlanMutation,
  useDeletePracticePlanMutation,
} = practicePlanApiSlice;