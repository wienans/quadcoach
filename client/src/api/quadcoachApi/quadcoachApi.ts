import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseReauthQuery } from "../axiosBaseQuery";
import { TagType } from "../enum";

const quadcoachApi = createApi({
  reducerPath: "quadcoachApi",
  baseQuery: axiosBaseReauthQuery({
    // Fill in your own server starting URL here
    baseUrl: "",
  }),
  endpoints: () => ({}),
  tagTypes: Object.values(TagType),
});

export default quadcoachApi;
