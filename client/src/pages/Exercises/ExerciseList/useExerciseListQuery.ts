import { useCallback, useEffect, useRef, useState } from "react";
import type { ExerciseSummary } from "../../../api/quadcoachApi/domain";
import type {
  GetExercisesRequest,
  GetExercisesResponse,
} from "../../exerciseApi";

export const MAX_PERSONS = 20;
export const MAX_TIME = 60;
export const MAX_CHASERS = 10;
export const MAX_BEATERS = 10;

export type ExerciseFilter = {
  searchValue: string;
  minPersons: number;
  maxPersons: number;
  tagInput: string;
  tags: string[];
  materialInput: string;
  materials: string[];
  minTime: number;
  maxTime: number;
  minBeaters: number;
  maxBeaters: number;
  minChasers: number;
  maxChasers: number;
  sort: "name" | "duration" | "persons" | "created" | "updated";
  direction: "asc" | "desc";
  limit: number;
};

export type ExerciseListQueryStatus = "loading" | "ready" | "error";

type ExerciseQueryTriggerResult = {
  abort: () => void;
  unwrap: () => Promise<GetExercisesResponse>;
};

export type LazyGetExercisesTrigger = (
  request: GetExercisesRequest,
) => ExerciseQueryTriggerResult;

type UseExerciseListQueryOptions = {
  filter: ExerciseFilter;
  debounceMs?: number;
  getExercises: LazyGetExercisesTrigger;
};

export type UseExerciseListQueryResult = {
  exercises: ExerciseSummary[];
  pagination: GetExercisesResponse["pagination"] | null;
  status: ExerciseListQueryStatus;
  isLoadingMore: boolean;
  loadMore: () => void;
};

type ExercisePageRequest = {
  generation: number;
  page: number;
  query: GetExercisesRequest;
};

export function toGetExercisesRequest(
  filter: ExerciseFilter,
  page: number,
): GetExercisesRequest {
  const tagSearch = filter.tagInput.trim();

  return {
    personsMax:
      filter.maxPersons === MAX_PERSONS ? undefined : filter.maxPersons,
    personsMin: filter.minPersons === 0 ? undefined : filter.minPersons,
    search: filter.searchValue,
    tagSearch: tagSearch || undefined,
    tags: filter.tags,
    tagMode: "all",
    materials: filter.materials,
    materialMode: "all",
    durationMin: filter.minTime === 0 ? undefined : filter.minTime,
    durationMax: filter.maxTime === MAX_TIME ? undefined : filter.maxTime,
    beatersMin: filter.minBeaters === 0 ? undefined : filter.minBeaters,
    beatersMax:
      filter.maxBeaters === MAX_BEATERS ? undefined : filter.maxBeaters,
    chasersMin: filter.minChasers === 0 ? undefined : filter.minChasers,
    chasersMax:
      filter.maxChasers === MAX_CHASERS ? undefined : filter.maxChasers,
    sort: filter.sort,
    direction: filter.direction,
    page,
    limit: filter.limit,
  };
}

function mergeExercisePage(
  current: ExerciseSummary[],
  incoming: ExerciseSummary[],
): ExerciseSummary[] {
  const exercisesById = new Map(
    current.map((exercise) => [exercise._id, exercise]),
  );
  incoming.forEach((exercise) => exercisesById.set(exercise._id, exercise));
  return Array.from(exercisesById.values());
}

export function useExerciseListQuery({
  filter,
  debounceMs = 500,
  getExercises,
}: UseExerciseListQueryOptions): UseExerciseListQueryResult {
  const [exercises, setExercises] = useState<ExerciseSummary[]>([]);
  const [pagination, setPagination] = useState<
    GetExercisesResponse["pagination"] | null
  >(null);
  const [status, setStatus] = useState<ExerciseListQueryStatus>("loading");
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const activeGenerationRef = useRef(0);
  const activeRequestRef = useRef<ExerciseQueryTriggerResult | null>(null);
  const activeFilterRef = useRef(filter);
  const isLoadingMoreRef = useRef(false);

  const loadExercises = useCallback(
    async (request: ExercisePageRequest): Promise<void> => {
      const trigger = getExercises(request.query);
      activeRequestRef.current = trigger;

      try {
        const response = await trigger.unwrap();
        if (request.generation !== activeGenerationRef.current) return;

        setExercises((current) =>
          request.page === 1
            ? response.items
            : mergeExercisePage(current, response.items),
        );
        setPagination(response.pagination);
        setStatus("ready");
      } catch {
        if (request.generation !== activeGenerationRef.current) return;
        setStatus("error");
      } finally {
        if (activeRequestRef.current === trigger) {
          activeRequestRef.current = null;
        }
        if (request.generation === activeGenerationRef.current) {
          isLoadingMoreRef.current = false;
          setIsLoadingMore(false);
        }
      }
    },
    [getExercises],
  );

  useEffect(() => {
    const generation = ++activeGenerationRef.current;
    activeFilterRef.current = filter;
    activeRequestRef.current?.abort();
    activeRequestRef.current = null;
    isLoadingMoreRef.current = false;

    setExercises([]);
    setPagination(null);
    setStatus("loading");
    setIsLoadingMore(false);

    const timer = window.setTimeout(() => {
      void loadExercises({
        generation,
        page: 1,
        query: toGetExercisesRequest(filter, 1),
      });
    }, debounceMs);

    return () => window.clearTimeout(timer);
  }, [debounceMs, filter, loadExercises]);

  useEffect(
    () => () => {
      ++activeGenerationRef.current;
      activeRequestRef.current?.abort();
      activeRequestRef.current = null;
    },
    [],
  );

  const loadMore = useCallback(() => {
    if (
      status !== "ready" ||
      isLoadingMoreRef.current ||
      pagination === null ||
      pagination.page >= pagination.pages
    ) {
      return;
    }

    const page = pagination.page + 1;
    isLoadingMoreRef.current = true;
    setIsLoadingMore(true);
    void loadExercises({
      generation: activeGenerationRef.current,
      page,
      query: toGetExercisesRequest(activeFilterRef.current, page),
    });
  }, [loadExercises, pagination, status]);

  return {
    exercises,
    pagination,
    status,
    isLoadingMore,
    loadMore,
  };
}
