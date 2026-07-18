import { configureStore } from "@reduxjs/toolkit";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { quadcoachApi } from "../api";
import { exerciseApiSlice } from "./exerciseApi";

const { baseQueryMock } = vi.hoisted(() => ({
  baseQueryMock: vi.fn(),
}));

vi.mock("../api/axiosBaseQuery", () => ({
  axiosBaseReauthQuery: () => baseQueryMock,
}));

const createApiStore = () =>
  configureStore({
    reducer: { [quadcoachApi.reducerPath]: quadcoachApi.reducer },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(quadcoachApi.middleware),
  });

const page = {
  items: [],
  pagination: { page: 1, limit: 50, total: 0, pages: 0 },
};

const lastRequest = () =>
  baseQueryMock.mock.calls[baseQueryMock.mock.calls.length - 1]?.[0];

describe("Exercise collection API contract", () => {
  beforeEach(() => {
    baseQueryMock.mockReset();
  });

  it("serializes literal search and approved semantic collection parameters", async () => {
    baseQueryMock.mockResolvedValue({ data: page });
    const store = createApiStore();

    await store.dispatch(
      exerciseApiSlice.endpoints.getExercises.initiate({
        search: "Press .* [one]",
        tags: ["Defense", "Fast play"],
        tagMode: "any",
        materials: ["Hoops", "Cones"],
        materialMode: "all",
        personsMin: 2,
        personsMax: 12,
        durationMin: 5,
        durationMax: 30,
        beatersMin: 1,
        beatersMax: 4,
        chasersMin: 3,
        chasersMax: 6,
        sort: "duration",
        direction: "desc",
        page: 3,
        limit: 25,
      }),
    );

    expect(lastRequest()).toEqual({
      url: "/api/exercises?search=Press+.*+%5Bone%5D&tags=Defense&tags=Fast+play&tagMode=any&materials=Hoops&materials=Cones&materialMode=all&personsMin=2&personsMax=12&durationMin=5&durationMax=30&beatersMin=1&beatersMax=4&chasersMin=3&chasersMax=6&sort=duration&direction=desc&page=3&limit=25",
      method: "get",
    });
  });

  it("omits default zero minima and unselected bounds instead of sending sentinels", async () => {
    baseQueryMock.mockResolvedValue({ data: page });
    const store = createApiStore();

    await store.dispatch(
      exerciseApiSlice.endpoints.getExercises.initiate({
        personsMin: 0,
        durationMin: 0,
        beatersMin: 0,
        chasersMin: 0,
      }),
    );

    expect(lastRequest()).toEqual({ url: "/api/exercises", method: "get" });
  });

  it("maps the items envelope to block-free summaries and preserves unknown metrics", async () => {
    baseQueryMock.mockResolvedValue({
      data: {
        items: [
          {
            _id: "exercise-1",
            name: "Legacy drill",
            tags: ["Passing"],
            creator: "Coach",
            user: "user-1",
            materials: ["Ball"],
            durationMinutes: null,
            persons: null,
            beaters: null,
            chasers: null,
            relatedTo: ["exercise-2"],
            description_blocks: [{ _id: "must-not-leak" }],
          },
        ],
        pagination: { page: 1, limit: 50, total: 1, pages: 1 },
      },
    });
    const store = createApiStore();

    const result = await store.dispatch(
      exerciseApiSlice.endpoints.getExercises.initiate(undefined),
    );

    expect(result.data).toEqual({
      items: [
        {
          _id: "exercise-1",
          name: "Legacy drill",
          tags: ["Passing"],
          creator: "Coach",
          user: "user-1",
          createdAt: undefined,
          updatedAt: undefined,
          materials: ["Ball"],
          durationMinutes: null,
          persons: null,
          beaters: null,
          chasers: null,
          relatedTo: ["exercise-2"],
        },
      ],
      pagination: { page: 1, limit: 50, total: 1, pages: 1 },
    });
  });

  it("uses query-free items envelopes for Exercise facets", async () => {
    baseQueryMock
      .mockResolvedValueOnce({ data: { items: ["Defense", "Passing"] } })
      .mockResolvedValueOnce({ data: { items: ["Ball", "Cones"] } });
    const store = createApiStore();

    const tags = await store.dispatch(
      exerciseApiSlice.endpoints.getAllTags.initiate(),
    );
    const materials = await store.dispatch(
      exerciseApiSlice.endpoints.getAllMaterials.initiate(),
    );

    expect(baseQueryMock.mock.calls.map(([request]) => request)).toEqual([
      { url: "/api/tags/exercises", method: "get" },
      { url: "/api/materials", method: "get" },
    ]);
    expect(tags.data).toEqual({ items: ["Defense", "Passing"] });
    expect(materials.data).toEqual({ items: ["Ball", "Cones"] });
  });

  it("keeps singular Exercise responses as full Block DTOs", async () => {
    baseQueryMock.mockResolvedValue({
      data: {
        _id: "exercise-1",
        name: "Press",
        time_min: 10,
        persons: 6,
        beaters: 2,
        chasers: 3,
        description_blocks: [
          { _id: "block-1", time_min: 10, tactics_board: "board-1" },
        ],
      },
    });
    const store = createApiStore();

    const result = await store.dispatch(
      exerciseApiSlice.endpoints.getExercise.initiate("exercise-1"),
    );

    expect(result.data?.description_blocks).toEqual([
      { _id: "block-1", time_min: 10, tacticBoardId: "board-1" },
    ]);
  });

  it("invalidates active summary and facet caches after creating an Exercise", async () => {
    baseQueryMock.mockImplementation(
      (request: { method: string; url: string }) => {
        if (request.method === "post") {
          return Promise.resolve({
            data: {
              _id: "exercise-2",
              name: "New drill",
              time_min: 0,
              persons: 0,
              beaters: 0,
              chasers: 0,
              description_blocks: [],
            },
          });
        }
        if (request.url === "/api/tags/exercises") {
          return Promise.resolve({ data: { items: [] } });
        }
        return Promise.resolve({ data: page });
      },
    );
    const store = createApiStore();
    const browse = store.dispatch(
      exerciseApiSlice.endpoints.getExercises.initiate(undefined),
    );
    const facets = store.dispatch(
      exerciseApiSlice.endpoints.getAllTags.initiate(),
    );
    await Promise.all([browse, facets]);

    await store.dispatch(
      exerciseApiSlice.endpoints.addExercise.initiate({
        name: "New drill",
        time_min: 0,
        persons: 0,
        beaters: 0,
        chasers: 0,
        description_blocks: [],
      }),
    );

    await vi.waitFor(() => expect(baseQueryMock).toHaveBeenCalledTimes(5));
    const urls = baseQueryMock.mock.calls.map(([request]) => request.url);
    expect(urls.slice(0, 3)).toEqual([
      "/api/exercises",
      "/api/tags/exercises",
      "/api/exercises",
    ]);
    expect(urls.slice(3).sort()).toEqual(
      ["/api/exercises", "/api/tags/exercises"].sort(),
    );

    browse.unsubscribe();
    facets.unsubscribe();
  });
});
