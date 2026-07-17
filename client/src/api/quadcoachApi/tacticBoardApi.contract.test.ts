import { configureStore } from "@reduxjs/toolkit";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { quadcoachApi } from "..";
import { favoriteApiSlice } from "./favoriteApi";
import { tacticBoardApiSlice } from "./tacticboardApi";
import routes from "../../pages/routes/routes";

const { baseQueryMock } = vi.hoisted(() => ({
  baseQueryMock: vi.fn(),
}));

vi.mock("../axiosBaseQuery", () => ({
  axiosBaseReauthQuery: () => baseQueryMock,
}));

const createApiStore = () =>
  configureStore({
    reducer: { [quadcoachApi.reducerPath]: quadcoachApi.reducer },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(quadcoachApi.middleware),
  });

const emptyPage = {
  tacticboards: [],
  pagination: { page: 1, total: 0, pages: 0 },
};

const lastBaseQueryRequest = () =>
  baseQueryMock.mock.calls[baseQueryMock.mock.calls.length - 1]?.[0];

describe("TacticBoard RTK Query contracts", () => {
  beforeEach(() => {
    baseQueryMock.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("emits representative permanent methods, URLs, and request bodies", async () => {
    baseQueryMock.mockResolvedValue({ data: emptyPage });
    const store = createApiStore();

    await store.dispatch(
      tacticBoardApiSlice.endpoints.getTacticBoards.initiate({
        nameRegex: "Press break",
        page: 2,
        limit: 25,
      }),
    );

    expect(lastBaseQueryRequest()).toEqual({
      url: "/api/tacticboards?page=2&limit=25&name%5Bregex%5D=Press+break&name%5Boptions%5D=i",
      method: "get",
    });

    baseQueryMock.mockResolvedValueOnce({ data: { message: "saved" } });
    await store.dispatch(
      tacticBoardApiSlice.endpoints.updateTacticBoardPage.initiate({
        tacticboardId: "board-1",
        pageId: "page-1",
        pageData: { version: "5.0.0" },
      }),
    );

    expect(lastBaseQueryRequest()).toEqual({
      url: "/api/tacticboards/board-1/pages/page-1",
      method: "patch",
      data: { version: "5.0.0" },
    });

    baseQueryMock.mockResolvedValueOnce({
      data: {
        _id: "favorite-1",
        user: "user-1",
        tacticboard: "board-1",
      },
    });
    await store.dispatch(
      favoriteApiSlice.endpoints.addFavoriteTacticboard.initiate({
        userId: "user-1",
        tacticBoardId: "board-1",
      }),
    );

    expect(lastBaseQueryRequest()).toEqual({
      url: "/api/favorites/tacticboards",
      method: "post",
      data: { userId: "user-1", tacticboardId: "board-1" },
    });
  });

  it("maps permanent relationship DTO keys before values enter the cache", async () => {
    baseQueryMock.mockResolvedValueOnce({
      data: [
        {
          _id: "access-1",
          user: { _id: "user-1", name: "Coach" },
          tacticboard: "board-1",
          access: "view",
          createdAt: "2026-07-17T10:00:00.000Z",
        },
      ],
    });
    const store = createApiStore();

    const result = await store.dispatch(
      tacticBoardApiSlice.endpoints.getAllTacticboardAccessUsers.initiate(
        "board-1",
      ),
    );

    expect(result.data).toEqual([
      {
        user: { _id: "user-1", name: "Coach" },
        tacticBoardId: "board-1",
        access: "view",
        createdAt: "2026-07-17T10:00:00.000Z",
      },
    ]);
  });

  it("preserves the actual browser Share Link path", () => {
    const tacticBoardRoute = routes[0].children?.find(
      (route) => route.path === "/tacticboards",
    );

    expect(
      tacticBoardRoute?.children?.some(({ path }) => path === "share/:token"),
    ).toBe(true);
  });

  it("provides an item cache tag that matching updates invalidate", async () => {
    const board = { _id: "board-1", name: "Press", pages: [] };
    baseQueryMock.mockImplementation((request: { method: string }) => {
      if (request.method === "put") {
        return Promise.resolve({ data: { message: "saved" } });
      }
      return Promise.resolve({ data: board });
    });
    const store = createApiStore();

    const query = store.dispatch(
      tacticBoardApiSlice.endpoints.getTacticBoard.initiate("board-1"),
    );
    await query;

    expect(baseQueryMock).toHaveBeenCalledTimes(1);

    await store.dispatch(
      tacticBoardApiSlice.endpoints.updateTacticBoard.initiate(board),
    );

    await vi.waitFor(() => expect(baseQueryMock).toHaveBeenCalledTimes(3));
    expect(
      baseQueryMock.mock.calls.map(([request]) => ({
        url: request.url,
        method: request.method,
      })),
    ).toEqual([
      { url: "/api/tacticboards/board-1", method: "get" },
      { url: "/api/tacticboards/board-1", method: "put" },
      { url: "/api/tacticboards/board-1", method: "get" },
    ]);

    query.unsubscribe();
  });
});
