import { configureStore } from "@reduxjs/toolkit";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { quadcoachApi } from "../api";
import { userApiSlice } from "./userApi";

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

const exerciseSummaryDto = (overrides: Record<string, unknown> = {}) => ({
  _id: "exercise-1",
  name: "Shared drill",
  tags: ["Passing"],
  creator: "Coach",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-02T00:00:00.000Z",
  materials: ["Cone"],
  durationMinutes: 15,
  persons: 8,
  beaters: 2,
  chasers: 6,
  relatedTo: ["exercise-2"],
  ...overrides,
});

describe("User profile API contract", () => {
  beforeEach(() => {
    baseQueryMock.mockReset();
  });

  it("requests the profile collection routes without query syntax", async () => {
    baseQueryMock
      .mockResolvedValueOnce({ data: { owned: [], accessible: [] } })
      .mockResolvedValueOnce({ data: { owned: [], accessible: [] } });
    const store = createApiStore();

    await store.dispatch(
      userApiSlice.endpoints.getUserExercises.initiate("user-1"),
    );
    await store.dispatch(
      userApiSlice.endpoints.getUserTacticBoards.initiate("user-1"),
    );

    expect(baseQueryMock.mock.calls.map(([request]) => request)).toEqual([
      { url: "/api/user/user-1/exercises", method: "get" },
      { url: "/api/user/user-1/tacticboards", method: "get" },
    ]);
  });

  it("maps owned Exercise summaries and keeps the grant on the relationship", async () => {
    baseQueryMock.mockResolvedValue({
      data: {
        owned: [
          exerciseSummaryDto({
            _id: "owned-exercise",
            name: "Owned drill",
            tags: undefined,
            materials: undefined,
            relatedTo: undefined,
            description_blocks: [{ _id: "must-not-leak" }],
          }),
        ],
        accessible: [
          {
            item: exerciseSummaryDto({
              _id: "view-exercise",
              name: "View granted",
              durationMinutes: null,
              persons: null,
              beaters: null,
              chasers: null,
            }),
            accessLevel: "view",
          },
          {
            item: exerciseSummaryDto({
              _id: "edit-exercise",
              name: "Edit granted",
            }),
            accessLevel: "edit",
          },
        ],
      },
    });
    const store = createApiStore();

    const result = await store.dispatch(
      userApiSlice.endpoints.getUserExercises.initiate("user-1"),
    );

    expect(result.data).toEqual({
      owned: [
        {
          _id: "owned-exercise",
          name: "Owned drill",
          tags: [],
          creator: "Coach",
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-02T00:00:00.000Z",
          materials: [],
          durationMinutes: 15,
          persons: 8,
          beaters: 2,
          chasers: 6,
          relatedTo: [],
        },
      ],
      accessible: [
        {
          item: {
            _id: "view-exercise",
            name: "View granted",
            tags: ["Passing"],
            creator: "Coach",
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-02T00:00:00.000Z",
            materials: ["Cone"],
            durationMinutes: null,
            persons: null,
            beaters: null,
            chasers: null,
            relatedTo: ["exercise-2"],
          },
          accessLevel: "view",
        },
        {
          item: {
            _id: "edit-exercise",
            name: "Edit granted",
            tags: ["Passing"],
            creator: "Coach",
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-02T00:00:00.000Z",
            materials: ["Cone"],
            durationMinutes: 15,
            persons: 8,
            beaters: 2,
            chasers: 6,
            relatedTo: ["exercise-2"],
          },
          accessLevel: "edit",
        },
      ],
    });
  });

  it("handles owned-only, accessible-only, and empty Exercise profiles", async () => {
    const store = createApiStore();

    baseQueryMock.mockResolvedValueOnce({
      data: { owned: [exerciseSummaryDto()], accessible: [] },
    });
    const ownedOnly = await store.dispatch(
      userApiSlice.endpoints.getUserExercises.initiate("user-1"),
    );
    expect(ownedOnly.data?.accessible).toEqual([]);
    expect(ownedOnly.data?.owned).toHaveLength(1);

    baseQueryMock.mockResolvedValueOnce({
      data: {
        owned: [],
        accessible: [
          {
            item: exerciseSummaryDto(),
            accessLevel: "edit",
          },
        ],
      },
    });
    const accessibleOnly = await store.dispatch(
      userApiSlice.endpoints.getUserExercises.initiate("user-2"),
    );
    expect(accessibleOnly.data?.owned).toEqual([]);
    expect(accessibleOnly.data?.accessible).toEqual([
      {
        item: expect.objectContaining({ _id: "exercise-1" }),
        accessLevel: "edit",
      },
    ]);

    baseQueryMock.mockResolvedValueOnce({
      data: { owned: [], accessible: [] },
    });
    const empty = await store.dispatch(
      userApiSlice.endpoints.getUserExercises.initiate("user-3"),
    );
    expect(empty.data).toEqual({ owned: [], accessible: [] });
  });

  it("consumes TacticBoard profile relationships for both grant levels", async () => {
    baseQueryMock.mockResolvedValue({
      data: {
        owned: [
          {
            _id: "owned-board",
            name: "Owned board",
            tags: undefined,
            isPrivate: true,
            creator: "Coach",
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-02T00:00:00.000Z",
          },
        ],
        accessible: [
          {
            item: {
              _id: "view-board",
              name: "View granted",
              isPrivate: true,
            },
            accessLevel: "view",
          },
          {
            item: {
              _id: "edit-board",
              name: "Edit granted",
              tags: ["Zone"],
              isPrivate: false,
            },
            accessLevel: "edit",
          },
        ],
      },
    });
    const store = createApiStore();

    const result = await store.dispatch(
      userApiSlice.endpoints.getUserTacticBoards.initiate("user-1"),
    );

    expect(result.data).toEqual({
      owned: [
        {
          _id: "owned-board",
          name: "Owned board",
          tags: [],
          isPrivate: true,
          creator: "Coach",
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-02T00:00:00.000Z",
        },
      ],
      accessible: [
        {
          item: {
            _id: "view-board",
            name: "View granted",
            tags: [],
            isPrivate: true,
          },
          accessLevel: "view",
        },
        {
          item: {
            _id: "edit-board",
            name: "Edit granted",
            tags: ["Zone"],
            isPrivate: false,
          },
          accessLevel: "edit",
        },
      ],
    });
  });
});
