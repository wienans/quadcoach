import { configureStore } from "@reduxjs/toolkit";
import { beforeEach, describe, expect, expectTypeOf, it, vi } from "vitest";

import { quadcoachApi } from "..";
import type { TacticBoard } from "./domain";
import type { PracticePlanEntity } from "./domain/PracticePlan";
import { practicePlansApiSlice } from "./practicePlansApi";
import { tacticBoardApiSlice } from "./tacticBoardApi";
import {
  PRACTICE_PLAN_SHARED_READ_TAG_ID,
  SharedPracticePlanDto,
  SharedTacticBoardDto,
  TACTIC_BOARD_SHARED_READ_TAG_ID,
} from "./shareLink";
import { TagType } from "../enum";
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

describe("Share Link client contracts", () => {
  beforeEach(() => {
    baseQueryMock.mockReset();
  });

  it("uses the exact lifecycle methods and paths without request bodies", async () => {
    baseQueryMock.mockResolvedValue({ data: { status: "inactive" } });
    const store = createApiStore();

    const boardStatus = store.dispatch(
      tacticBoardApiSlice.endpoints.getTacticBoardShareLinkStatus.initiate(
        "board-1",
      ),
    );
    await boardStatus;
    boardStatus.unsubscribe();
    await store.dispatch(
      tacticBoardApiSlice.endpoints.ensureTacticBoardShareLink.initiate(
        "board-1",
      ),
    );
    await store.dispatch(
      tacticBoardApiSlice.endpoints.rotateTacticBoardShareLink.initiate(
        "board-1",
      ),
    );
    await store.dispatch(
      tacticBoardApiSlice.endpoints.revokeTacticBoardShareLink.initiate(
        "board-1",
      ),
    );
    const planStatus = store.dispatch(
      practicePlansApiSlice.endpoints.getPracticePlanShareLinkStatus.initiate(
        "plan-1",
      ),
    );
    await planStatus;
    planStatus.unsubscribe();
    await store.dispatch(
      practicePlansApiSlice.endpoints.ensurePracticePlanShareLink.initiate(
        "plan-1",
      ),
    );
    await store.dispatch(
      practicePlansApiSlice.endpoints.rotatePracticePlanShareLink.initiate(
        "plan-1",
      ),
    );
    await store.dispatch(
      practicePlansApiSlice.endpoints.revokePracticePlanShareLink.initiate(
        "plan-1",
      ),
    );

    expect(baseQueryMock.mock.calls.map(([request]) => request)).toEqual([
      { url: "/api/tacticboards/board-1/share-link", method: "get" },
      { url: "/api/tacticboards/board-1/share-link", method: "post" },
      { url: "/api/tacticboards/board-1/share-link", method: "put" },
      { url: "/api/tacticboards/board-1/share-link", method: "delete" },
      { url: "/api/practice-plans/plan-1/share-link", method: "get" },
      { url: "/api/practice-plans/plan-1/share-link", method: "post" },
      { url: "/api/practice-plans/plan-1/share-link", method: "put" },
      { url: "/api/practice-plans/plan-1/share-link", method: "delete" },
    ]);
  });

  it("passes through only the server-returned absolute Share Link", async () => {
    const serverShareLink =
      "https://api.example.test/tacticboards/share/server-owned";
    baseQueryMock.mockResolvedValue({
      data: { status: "created", shareLink: serverShareLink },
    });
    const store = createApiStore();

    const result = await store.dispatch(
      tacticBoardApiSlice.endpoints.ensureTacticBoardShareLink.initiate(
        "board-1",
      ),
    );

    expect(result.data).toEqual({
      status: "created",
      shareLink: serverShareLink,
    });
  });

  it("invalidates only the matching resource Share Link status", async () => {
    baseQueryMock.mockImplementation(
      (request: { url: string; method: string }) => {
        if (request.method === "get") {
          return Promise.resolve({ data: { status: "inactive" } });
        }
        return Promise.resolve({ data: { status: "inactive" } });
      },
    );
    const store = createApiStore();
    const boardStatus = store.dispatch(
      tacticBoardApiSlice.endpoints.getTacticBoardShareLinkStatus.initiate(
        "shared-id",
      ),
    );
    const planStatus = store.dispatch(
      practicePlansApiSlice.endpoints.getPracticePlanShareLinkStatus.initiate(
        "shared-id",
      ),
    );
    await Promise.all([boardStatus, planStatus]);

    await store.dispatch(
      tacticBoardApiSlice.endpoints.revokeTacticBoardShareLink.initiate(
        "shared-id",
      ),
    );

    await vi.waitFor(() => expect(baseQueryMock).toHaveBeenCalledTimes(4));
    expect(
      baseQueryMock.mock.calls.map(([request]) => ({
        url: request.url,
        method: request.method,
      })),
    ).toEqual([
      { url: "/api/tacticboards/shared-id/share-link", method: "get" },
      { url: "/api/practice-plans/shared-id/share-link", method: "get" },
      { url: "/api/tacticboards/shared-id/share-link", method: "delete" },
      { url: "/api/tacticboards/shared-id/share-link", method: "get" },
    ]);

    boardStatus.unsubscribe();
    planStatus.unsubscribe();
  });

  it("refetches a cached shared read after lifecycle mutation", async () => {
    baseQueryMock.mockImplementation((request: { method: string }) =>
      Promise.resolve({
        data:
          request.method === "get"
            ? { kind: "tacticBoard", pages: [] }
            : { status: "inactive" },
      }),
    );
    const store = createApiStore();
    const sharedRead = store.dispatch(
      tacticBoardApiSlice.endpoints.getSharedTacticBoard.initiate("old-token"),
    );
    await sharedRead;

    await store.dispatch(
      tacticBoardApiSlice.endpoints.revokeTacticBoardShareLink.initiate(
        "board-1",
      ),
    );

    await vi.waitFor(() => expect(baseQueryMock).toHaveBeenCalledTimes(3));
    expect(baseQueryMock.mock.calls.map(([request]) => request.method)).toEqual(
      ["get", "delete", "get"],
    );

    sharedRead.unsubscribe();
  });

  it("tags shared reads without relying on omitted persistence IDs", async () => {
    baseQueryMock.mockImplementation((request: { url: string }) =>
      Promise.resolve({
        data: request.url.includes("practice-plans")
          ? { kind: "practicePlan", name: "Shared Plan", tags: [], sections: [] }
          : { kind: "tacticBoard", pages: [] },
      }),
    );
    const store = createApiStore();
    const boardRead = store.dispatch(
      tacticBoardApiSlice.endpoints.getSharedTacticBoard.initiate("board-token"),
    );
    const planRead = store.dispatch(
      practicePlansApiSlice.endpoints.getSharedPracticePlan.initiate("plan-token"),
    );
    await Promise.all([boardRead, planRead]);

    expect(
      quadcoachApi.util
        .selectInvalidatedBy(store.getState(), [
          { type: TagType.shareLink, id: TACTIC_BOARD_SHARED_READ_TAG_ID },
        ])
        .map(({ endpointName }) => endpointName),
    ).toEqual(["getSharedTacticBoard"]);
    expect(
      quadcoachApi.util
        .selectInvalidatedBy(store.getState(), [
          { type: TagType.shareLink, id: PRACTICE_PLAN_SHARED_READ_TAG_ID },
        ])
        .map(({ endpointName }) => endpointName),
    ).toEqual(["getSharedPracticePlan"]);

    boardRead.unsubscribe();
    planRead.unsubscribe();
  });

  it("refetches resource-specific status and shared reads after publishing", async () => {
    baseQueryMock.mockImplementation(
      (request: { url: string; method: string }) => {
        if (request.method !== "get") {
          return Promise.resolve({ data: { message: "updated" } });
        }
        if (request.url.endsWith("share-link")) {
          return Promise.resolve({ data: { status: "active", shareLink: "https://example.test" } });
        }
        return Promise.resolve({
          data: request.url.includes("practice-plans")
            ? { kind: "practicePlan", name: "Shared Plan", tags: [], sections: [] }
            : { kind: "tacticBoard", pages: [] },
        });
      },
    );
    const store = createApiStore();
    const subscriptions = [
      store.dispatch(
        tacticBoardApiSlice.endpoints.getSharedTacticBoard.initiate("board-token"),
      ),
      store.dispatch(
        tacticBoardApiSlice.endpoints.getTacticBoardShareLinkStatus.initiate("board-1"),
      ),
      store.dispatch(
        practicePlansApiSlice.endpoints.getSharedPracticePlan.initiate("plan-token"),
      ),
      store.dispatch(
        practicePlansApiSlice.endpoints.getPracticePlanShareLinkStatus.initiate("plan-1"),
      ),
    ];
    await Promise.all(subscriptions);

    await store.dispatch(
      tacticBoardApiSlice.endpoints.updateTacticBoardMeta.initiate({
        tacticBoardId: "board-1",
        metaData: { isPrivate: false },
      }),
    );
    await vi.waitFor(() => expect(baseQueryMock).toHaveBeenCalledTimes(7));
    expect(
      baseQueryMock.mock.calls.slice(5, 7).map(([request]) => request.url).sort(),
    ).toEqual([
      "/api/tacticboards/board-1/share-link",
      "/api/tacticboards/share/board-token",
    ]);

    await store.dispatch(
      practicePlansApiSlice.endpoints.patchPracticePlan.initiate({
        _id: "plan-1",
        name: "Published Plan",
        tags: [],
        sections: [],
        user: "owner-1",
        isPrivate: false,
      }),
    );
    await vi.waitFor(() => expect(baseQueryMock).toHaveBeenCalledTimes(10));
    expect(
      baseQueryMock.mock.calls.slice(8, 10).map(([request]) => request.url).sort(),
    ).toEqual([
      "/api/practice-plans/plan-1/share-link",
      "/api/practice-plans/share/plan-token",
    ]);

    subscriptions.forEach((subscription) => subscription.unsubscribe());
  });

  it("encodes reserved token path characters for both shared reads", async () => {
    baseQueryMock.mockResolvedValue({ data: { _id: "shared" } });
    const store = createApiStore();
    const token = "segment/with ?#%";

    await store.dispatch(
      tacticBoardApiSlice.endpoints.getSharedTacticBoard.initiate(token),
    );
    await store.dispatch(
      practicePlansApiSlice.endpoints.getSharedPracticePlan.initiate(token),
    );

    expect(baseQueryMock.mock.calls.map(([request]) => request.url)).toEqual([
      "/api/tacticboards/share/segment%2Fwith%20%3F%23%25",
      "/api/practice-plans/share/segment%2Fwith%20%3F%23%25",
    ]);
  });

  it("keeps both established read-only browser routes", () => {
    const rootRoutes = routes[0].children ?? [];
    const tacticBoardRoute = rootRoutes.find(
      (route) => route.path === "/tacticboards",
    );
    const practicePlanRoute = rootRoutes.find(
      (route) => route.path === "/practice-plans",
    );

    expect(
      tacticBoardRoute?.children?.some(({ path }) => path === "share/:token"),
    ).toBe(true);
    expect(
      practicePlanRoute?.children?.some(({ path }) => path === "share/:token"),
    ).toBe(true);
  });

  it("omits lifecycle tokens from ordinary domain contracts", () => {
    expectTypeOf<TacticBoard>().not.toHaveProperty("shareToken");
    expectTypeOf<PracticePlanEntity>().not.toHaveProperty("shareToken");
  });

  it("models shared reads as distinct allowlisted DTOs", () => {
    expectTypeOf<SharedTacticBoardDto>().toHaveProperty("kind");
    expectTypeOf<SharedTacticBoardDto>().not.toHaveProperty("_id");
    expectTypeOf<SharedTacticBoardDto>().not.toHaveProperty("user");
    expectTypeOf<SharedTacticBoardDto>().not.toHaveProperty("isPrivate");
    expectTypeOf<SharedTacticBoardDto>().not.toHaveProperty("shareToken");
    expectTypeOf<SharedPracticePlanDto>().toHaveProperty("kind");
    expectTypeOf<SharedPracticePlanDto>().not.toHaveProperty("_id");
    expectTypeOf<SharedPracticePlanDto>().not.toHaveProperty("user");
    expectTypeOf<SharedPracticePlanDto>().not.toHaveProperty("isPrivate");
    expectTypeOf<SharedPracticePlanDto>().not.toHaveProperty("createdAt");
    expectTypeOf<SharedPracticePlanDto>().not.toHaveProperty("updatedAt");
    expectTypeOf<SharedPracticePlanDto>().not.toHaveProperty("shareToken");
  });
});
