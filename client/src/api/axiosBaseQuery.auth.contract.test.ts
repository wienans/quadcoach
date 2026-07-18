import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { axiosBaseQuery, axiosBaseReauthQuery } from "./axiosBaseQuery";

vi.mock("axios");

const authState = vi.hoisted(() => ({ token: null as unknown }));

vi.mock("../store", () => ({
  store: {
    getState: () => ({ auth: authState }),
    dispatch: (action: { payload: { accessToken: unknown } }) => {
      authState.token = action.payload.accessToken;
    },
  },
}));

const mockedAxios = vi.mocked(axios);
const query = { url: "/api/tacticboards", method: "get" as const };

describe("API Authorization header contract", () => {
  beforeEach(() => {
    mockedAxios.mockReset();
    authState.token = null;
  });

  it.each([
    ["plain", axiosBaseQuery, null],
    ["plain", axiosBaseQuery, undefined],
    ["plain", axiosBaseQuery, ""],
    ["plain", axiosBaseQuery, "   "],
    ["reauth", axiosBaseReauthQuery, null],
    ["reauth", axiosBaseReauthQuery, undefined],
    ["reauth", axiosBaseReauthQuery, ""],
    ["reauth", axiosBaseReauthQuery, "   "],
  ] as const)(
    "%s query omits Authorization without a non-empty access token (%s)",
    async (_name, baseQuery, accessToken) => {
      authState.token = accessToken;
      mockedAxios.mockResolvedValueOnce({ data: [] });

      await baseQuery()(query, {} as never, {});

      expect(mockedAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: { "Content-Type": "application/json" },
        }),
      );
    },
  );

  it("sends a valid access token", async () => {
    authState.token = "access-token";
    mockedAxios.mockResolvedValueOnce({ data: [] });

    await axiosBaseQuery()(query, {} as never, {});

    expect(mockedAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer access-token",
        },
      }),
    );
  });

  it("refreshes after an expired access token and retries as the same actor", async () => {
    authState.token = "expired-token";
    mockedAxios
      .mockRejectedValueOnce({ response: { status: 401 } })
      .mockResolvedValueOnce({ data: { accessToken: "refreshed-token" } })
      .mockResolvedValueOnce({ data: { actor: "same-user" } });

    const result = await axiosBaseReauthQuery()(query, {} as never, {});

    expect(result).toEqual({ data: { actor: "same-user" } });
    expect(mockedAxios).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer refreshed-token",
        },
      }),
    );
  });
});
