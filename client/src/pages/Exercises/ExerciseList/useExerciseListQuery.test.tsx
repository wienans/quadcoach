// @vitest-environment jsdom

import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ExerciseSummary } from "../../../api/quadcoachApi/domain";
import type { GetExercisesResponse } from "../../exerciseApi";
import {
  ExerciseFilter,
  LazyGetExercisesTrigger,
  MAX_BEATERS,
  MAX_CHASERS,
  MAX_PERSONS,
  MAX_TIME,
  toGetExercisesRequest,
  useExerciseListQuery,
} from "./useExerciseListQuery";

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (error: unknown) => void;
};

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

const defaultFilter: ExerciseFilter = {
  searchValue: "",
  minPersons: 0,
  maxPersons: MAX_PERSONS,
  tagInput: "",
  tags: [],
  materialInput: "",
  materials: [],
  minTime: 0,
  maxTime: MAX_TIME,
  minBeaters: 0,
  maxBeaters: MAX_BEATERS,
  minChasers: 0,
  maxChasers: MAX_CHASERS,
  sort: "name",
  direction: "asc",
  limit: 50,
};

function exercise(id: string, name = `Exercise ${id}`): ExerciseSummary {
  return {
    _id: id,
    name,
    tags: [],
    materials: [],
    durationMinutes: null,
    persons: null,
    beaters: null,
    chasers: null,
    relatedTo: [],
  };
}

function page(
  items: ExerciseSummary[],
  pageNumber = 1,
  pages = 1,
): GetExercisesResponse {
  return {
    items,
    pagination: {
      page: pageNumber,
      limit: 50,
      total: items.length,
      pages,
    },
  };
}

function createTriggerMock() {
  const requests: Array<{
    deferred: Deferred<GetExercisesResponse>;
    abort: ReturnType<typeof vi.fn>;
  }> = [];
  const getExercises = vi.fn(() => {
    const request = {
      deferred: deferred<GetExercisesResponse>(),
      abort: vi.fn(),
    };
    requests.push(request);
    return {
      abort: request.abort,
      unwrap: () => request.deferred.promise,
    };
  }) as unknown as LazyGetExercisesTrigger;

  return { getExercises, requests };
}

describe("toGetExercisesRequest", () => {
  it("trims partial tag text and preserves exact selections and sentinels", () => {
    expect(
      toGetExercisesRequest(
        {
          ...defaultFilter,
          tagInput: "  WaR.*  ",
          tags: ["Warmup"],
        },
        3,
      ),
    ).toEqual(
      expect.objectContaining({
        tagSearch: "WaR.*",
        tags: ["Warmup"],
        tagMode: "all",
        personsMin: undefined,
        personsMax: undefined,
        page: 3,
      }),
    );
  });

  it("omits whitespace-only partial tag text", () => {
    expect(
      toGetExercisesRequest({ ...defaultFilter, tagInput: "   " }, 1)
        .tagSearch,
    ).toBeUndefined();
  });
});

describe("useExerciseListQuery", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it("restarts the debounce when the filter changes", () => {
    const { getExercises } = createTriggerMock();
    const { rerender } = renderHook(
      ({ filter }) =>
        useExerciseListQuery({ filter, debounceMs: 500, getExercises }),
      { initialProps: { filter: defaultFilter } },
    );

    act(() => vi.advanceTimersByTime(499));
    expect(getExercises).not.toHaveBeenCalled();

    rerender({ filter: { ...defaultFilter, tagInput: "fen" } });
    act(() => vi.advanceTimersByTime(499));
    expect(getExercises).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(1));
    expect(getExercises).toHaveBeenCalledTimes(1);
    expect(getExercises).toHaveBeenCalledWith(
      expect.objectContaining({ tagSearch: "fen", page: 1 }),
    );
  });

  it("replaces first-page results and reports active request errors", async () => {
    const { getExercises, requests } = createTriggerMock();
    const { result, rerender } = renderHook(
      ({ filter }) =>
        useExerciseListQuery({ filter, debounceMs: 500, getExercises }),
      { initialProps: { filter: defaultFilter } },
    );

    act(() => vi.advanceTimersByTime(500));
    await act(async () => requests[0].deferred.resolve(page([exercise("1")])))
    expect(result.current.status).toBe("ready");
    expect(result.current.exercises.map(({ _id }) => _id)).toEqual(["1"]);

    rerender({ filter: { ...defaultFilter, tagInput: "new" } });
    expect(result.current.status).toBe("loading");
    expect(result.current.exercises).toEqual([]);
    act(() => vi.advanceTimersByTime(500));
    await act(async () => requests[1].deferred.reject(new Error("failed")));
    expect(result.current.status).toBe("error");
  });

  it("ignores stale successes and failures", async () => {
    const { getExercises, requests } = createTriggerMock();
    const { result, rerender } = renderHook(
      ({ filter }) =>
        useExerciseListQuery({ filter, debounceMs: 500, getExercises }),
      { initialProps: { filter: defaultFilter } },
    );

    act(() => vi.advanceTimersByTime(500));
    rerender({ filter: { ...defaultFilter, tagInput: "second" } });
    act(() => vi.advanceTimersByTime(500));
    await act(async () =>
      requests[0].deferred.resolve(page([exercise("stale")]))
    );
    expect(result.current.status).toBe("loading");
    expect(result.current.exercises).toEqual([]);

    rerender({ filter: { ...defaultFilter, tagInput: "third" } });
    act(() => vi.advanceTimersByTime(500));
    await act(async () => requests[1].deferred.reject(new Error("stale")));
    expect(result.current.status).toBe("loading");

    await act(async () =>
      requests[2].deferred.resolve(page([exercise("current")]))
    );
    expect(result.current.status).toBe("ready");
    expect(result.current.exercises.map(({ _id }) => _id)).toEqual([
      "current",
    ]);
  });

  it("aborts superseded and unmounted requests", () => {
    const { getExercises, requests } = createTriggerMock();
    const { rerender, unmount } = renderHook(
      ({ filter }) =>
        useExerciseListQuery({ filter, debounceMs: 500, getExercises }),
      { initialProps: { filter: defaultFilter } },
    );

    act(() => vi.advanceTimersByTime(500));
    rerender({ filter: { ...defaultFilter, tagInput: "next" } });
    expect(requests[0].abort).toHaveBeenCalledOnce();

    act(() => vi.advanceTimersByTime(500));
    unmount();
    expect(requests[1].abort).toHaveBeenCalledOnce();
  });

  it("appends deduplicated pages and surfaces pagination failures", async () => {
    const { getExercises, requests } = createTriggerMock();
    const { result } = renderHook(() =>
      useExerciseListQuery({
        filter: defaultFilter,
        debounceMs: 500,
        getExercises,
      }),
    );

    act(() => vi.advanceTimersByTime(500));
    await act(async () =>
      requests[0].deferred.resolve(page([exercise("1", "Old")], 1, 3))
    );

    act(() => result.current.loadMore());
    expect(result.current.isLoadingMore).toBe(true);
    expect(getExercises).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 2 }),
    );
    await act(async () =>
      requests[1].deferred.resolve(
        page([exercise("1", "Updated"), exercise("2")], 2, 3),
      )
    );
    expect(result.current.exercises.map(({ _id }) => _id)).toEqual(["1", "2"]);
    expect(result.current.exercises[0].name).toBe("Updated");
    expect(result.current.isLoadingMore).toBe(false);

    act(() => result.current.loadMore());
    await act(async () =>
      requests[2].deferred.reject(new Error("pagination failed"))
    );
    expect(result.current.status).toBe("error");
    expect(result.current.exercises.map(({ _id }) => _id)).toEqual(["1", "2"]);
    expect(result.current.isLoadingMore).toBe(false);
  });

  it("rejects a pagination response after the filter changes", async () => {
    const { getExercises, requests } = createTriggerMock();
    const { result, rerender } = renderHook(
      ({ filter }) =>
        useExerciseListQuery({ filter, debounceMs: 500, getExercises }),
      { initialProps: { filter: defaultFilter } },
    );

    act(() => vi.advanceTimersByTime(500));
    await act(async () =>
      requests[0].deferred.resolve(page([exercise("1")], 1, 2))
    );
    act(() => result.current.loadMore());

    rerender({ filter: { ...defaultFilter, tagInput: "latest" } });
    expect(requests[1].abort).toHaveBeenCalledOnce();
    expect(result.current.exercises).toEqual([]);
    await act(async () =>
      requests[1].deferred.resolve(page([exercise("stale-page")], 2, 2))
    );
    expect(result.current.exercises).toEqual([]);

    act(() => vi.advanceTimersByTime(500));
    await act(async () =>
      requests[2].deferred.resolve(page([exercise("latest")]))
    );
    expect(result.current.exercises.map(({ _id }) => _id)).toEqual(["latest"]);
  });
});
