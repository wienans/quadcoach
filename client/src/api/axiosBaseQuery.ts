import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import axios from "axios";
import type { AxiosRequestConfig, AxiosError } from "axios";
import { deserializeDatesInObject } from "../helpers/dateHelpers";
import { setCredentials } from "./auth/authSlice";

/**
 * Base query with automatic re-auth (refresh token) handling.
 * Avoids importing the store directly to prevent circular dependencies.
 */
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
  async ({ url, method, data, params }, api) => {
    const getToken = () => {
      const state = api.getState() as { auth?: { token?: string | null } };
      return state.auth?.token || null;
    };

    try {
      const result = await axios({
        url: baseUrl + url,
        method,
        data,
        params,
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
          Authorization: getToken() ? `Bearer ${getToken()}` : undefined,
        },
      });
      return { data: deserializeDatesInObject(result.data) };
    } catch (axiosError) {
      const err = axiosError as AxiosError;
      if (err.response?.status === 403) {
        // Attempt refresh
        try {
          const refreshResult = await axios({
            url: baseUrl + "/api/auth/refresh",
            method,
            data,
            params,
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
              Authorization: getToken() ? `Bearer ${getToken()}` : undefined,
            },
          });
          if (refreshResult?.data) {
            // store the new token
            api.dispatch(setCredentials({ ...refreshResult.data }));

            // retry original query with new access token
            const retryResult = await axios({
              url: baseUrl + url,
              method,
              data,
              params,
              withCredentials: true,
              headers: {
                "Content-Type": "application/json",
                Authorization: getToken() ? `Bearer ${getToken()}` : undefined,
              },
            });
            return { data: deserializeDatesInObject(retryResult.data) };
          }
          return {
            error: {
              status: err.response?.status,
              data: err.response?.data || err.message,
            },
          };
        } catch (axiosErrorRefresh) {
          const errRefresh = axiosErrorRefresh as AxiosError;
          return {
            error: {
              status: errRefresh.response?.status,
              data: { message: "Login expired" },
            },
          };
        }
      }
      return {
        error: {
          status: err.response?.status,
            data: err.response?.data || err.message,
        },
      };
    }
  };

/**
 * Simple base query without refresh logic.
 */
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
  async ({ url, method, data, params }, api) => {
    const state = api.getState() as { auth?: { token?: string | null } };
    const token = state.auth?.token;
    try {
      const result = await axios({
        url: baseUrl + url,
        method,
        data,
        params,
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : undefined,
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
