import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "../axiosBaseQuery";
import { TagType } from "../enum";

const quadcoachApi = createApi({
  reducerPath: "quadcoachApi",
  baseQuery: axiosBaseQuery({
    // Fill in your own server starting URL here
    baseUrl: "",
  }),
  endpoints: () => ({}),
  tagTypes: Object.values(TagType),
});

export default quadcoachApi;
