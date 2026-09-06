import { configureStore } from "@reduxjs/toolkit";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { quadcoachApi } from "..";
import { practicePlansApiSlice } from "./practicePlansApi";

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
  items: [],
  pagination: { page: 1, limit: 50, total: 0, pages: 0 },
};

const lastBaseQueryRequest = () =>
  baseQueryMock.mock.calls[baseQueryMock.mock.calls.length - 1]?.[0];

describe("PracticePlan RTK Query contracts", () => {
  beforeEach(() => {
    baseQueryMock.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("emits semantic collection parameters without legacy bracket syntax", async () => {
    baseQueryMock.mockResolvedValue({ data: emptyPage });
    const store = createApiStore();

    await store.dispatch(
      practicePlansApiSlice.endpoints.getPracticePlans.initiate({
        search: "Press .* [break]",
        tags: ["Attack", "Fast play"],
        tagMode: "any",
        privacy: "private",
        sort: "updated",
        direction: "desc",
        page: 2,
        limit: 25,
      }),
    );

    expect(lastBaseQueryRequest()).toEqual({
      url: "/api/practice-plans?search=Press+.*+%5Bbreak%5D&tags=Attack&tags=Fast+play&tagMode=any&privacy=private&sort=updated&direction=desc&page=2&limit=25",
      method: "get",
    });
    expect(lastBaseQueryRequest().url).not.toContain("name%5Bregex%5D");
    expect(lastBaseQueryRequest().url).not.toContain("tags%5Bin%5D");
    expect(lastBaseQueryRequest().url).not.toContain("sortBy");
  });

  it("maps fixed summaries and uses a query-free tag facet envelope", async () => {
    baseQueryMock
      .mockResolvedValueOnce({
        data: {
          items: [
            {
              _id: "plan-1",
              name: "Press",
              description: "Card description",
              tags: ["Attack"],
              isPrivate: false,
              sectionCount: 2,
              durationMinutes: 105,
              sections: [{ secret: true }],
              shareToken: "must-not-leak",
            },
          ],
          pagination: { page: 1, limit: 50, total: 1, pages: 1 },
        },
      })
      .mockResolvedValueOnce({ data: { items: ["Attack", "Zone"] } });
    const store = createApiStore();

    const plans = await store.dispatch(
      practicePlansApiSlice.endpoints.getPracticePlans.initiate(undefined),
    );
    const tags = await store.dispatch(
      practicePlansApiSlice.endpoints.getAllPracticePlanTags.initiate(),
    );

    expect(plans.data?.items).toEqual([
      {
        _id: "plan-1",
        name: "Press",
        description: "Card description",
        tags: ["Attack"],
        isPrivate: false,
        sectionCount: 2,
        durationMinutes: 105,
        sections: [{ secret: true }],
        shareToken: "must-not-leak",
      },
    ]);
    expect((plans.data as unknown as { practiceplans?: unknown }).practiceplans).toBeUndefined();
    expect(tags.data).toEqual({ items: ["Attack", "Zone"] });
    expect(baseQueryMock.mock.calls.map(([request]) => request)).toEqual([
      { url: "/api/practice-plans", method: "get" },
      { url: "/api/tags/practiceplans", method: "get" },
    ]);
  });

  it("provides an item cache tag that matching updates invalidate", async () => {
    const plan = {
      _id: "plan-1",
      name: "Press",
      tags: [],
      sections: [],
      user: "user-1",
      isPrivate: false,
    };
    baseQueryMock.mockImplementation((request: { method: string }) => {
      if (request.method === "patch") {
        return Promise.resolve({ data: plan });
      }
      return Promise.resolve({ data: plan });
    });
    const store = createApiStore();

    const query = store.dispatch(
      practicePlansApiSlice.endpoints.getPracticePlan.initiate("plan-1"),
    );
    await query;

    expect(baseQueryMock).toHaveBeenCalledTimes(1);

    await store.dispatch(
      practicePlansApiSlice.endpoints.patchPracticePlan.initiate(plan),
    );

    await vi.waitFor(() => expect(baseQueryMock).toHaveBeenCalledTimes(3));
    expect(
      baseQueryMock.mock.calls.map(([request]) => ({
        url: request.url,
        method: request.method,
      })),
    ).toEqual([
      { url: "/api/practice-plans/plan-1", method: "get" },
      { url: "/api/practice-plans/plan-1", method: "patch" },
      { url: "/api/practice-plans/plan-1", method: "get" },
    ]);

    query.unsubscribe();
  });
});
