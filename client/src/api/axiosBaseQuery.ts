import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import axios from "axios";
import type { AxiosRequestConfig, AxiosError } from "axios";
import { deserializeDatesInObject } from "../helpers/dateHelpers";
import { store } from "../store";
import { setCredentials } from "./auth/authSlice";

export const axiosBaseReauthQuery =
  (
    { baseUrl }: { baseUrl: string } = { baseUrl: "" },
  ): BaseQueryFn<
    {
      url: string;
      method: AxiosRequestConfig["method"];
      data?: AxiosRequestConfig["data"];
      params?: AxiosRequestConfig["params"];
    },
    unknown,
    unknown
  > =>
  async ({ url, method, data, params }) => {
    try {
      const result = await axios({
        url: baseUrl + url,
        method,
        data,
        params,
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${store.getState().auth.token}`,
        },
      });
      return { data: deserializeDatesInObject(result.data) };
    } catch (axiosError) {
      const err = axiosError as AxiosError;
      if (err.response?.status === 403) {
        // Send the Refresh Token to get a new Access Token
        try {
          const refreshResult = await axios({
            url: baseUrl + "/api/auth/refresh",
            method,
            data,
            params,
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${store.getState().auth.token}`,
            },
          });
          if (refreshResult?.data) {
            // store the new token
            store.dispatch(setCredentials({ ...refreshResult.data }));

            // retry original query with new access token
            const result = await axios({
              url: baseUrl + url,
              method,
              data,
              params,
              withCredentials: true,
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${store.getState().auth.token}`,
              },
            });
            return { data: deserializeDatesInObject(result.data) };
          }
          return {
            error: {
              status: err.response?.status,
              data: err.response?.data || err.message,
            },
          };
        } catch (axiosErrorRefresh) {
          const errRefresh = axiosErrorRefresh as AxiosError;
          console.log("Login expired");
          return {
            error: {
              status: errRefresh.response?.status,
              data: {
                message: "Login expired",
              },
            },
          };
        }
      }
      console.log("Other Error Code");
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      };
    }
  };

export const axiosBaseQuery =
  (
    { baseUrl }: { baseUrl: string } = { baseUrl: "" },
  ): BaseQueryFn<
    {
      url: string;
      method: AxiosRequestConfig["method"];
      data?: AxiosRequestConfig["data"];
      params?: AxiosRequestConfig["params"];
    },
    unknown,
    unknown
  > =>
  async ({ url, method, data, params }) => {
    try {
      const result = await axios({
        url: baseUrl + url,
        method,
        data,
        params,
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${store.getState().auth.token}`,
        },
      });
      return { data: deserializeDatesInObject(result.data) };
    } catch (axiosError) {
      const err = axiosError as AxiosError;
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      };
    }
  };

export default axiosBaseQuery;
