import { performance } from "node:perf_hooks";
import { mongo } from "mongoose";

import { browse, listFacet } from "../index";
import { runWithCollectionDatabase } from "../internal/databaseContext";
import { parseCollectionQuery } from "../parser";
import { CollectionSummary, collectionVisibility } from "../types";
import {
  createCollectionIndex,
  verifyCollectionIndex,
  winningPlanUsesIndex,
} from "./indexes";
import { ExplainSummary, summarizeExplain } from "./reporting";

const COLLATION = {
  locale: "en",
  strength: 2,
  numericOrdering: true,
} as const;
const MEASURED_ITERATIONS = 10;

export const EXERCISE_INDEX_NAMES = Object.freeze([
  "cq_exercises_name",
  "cq_exercises_created",
  "cq_exercises_updated",
  "cq_exercises_duration",
  "cq_exercises_persons",
  "cq_exercises_tags",
  "cq_exercises_materials",
] as const);

export const EXERCISE_APPROVED_SORTS = Object.freeze([
  "name",
  "created",
  "updated",
  "duration",
  "persons",
] as const);

export interface ExerciseSyntheticSummary extends CollectionSummary {
  readonly materials: readonly string[];
  readonly durationMinutes: number | null;
  readonly persons: number | null;
  readonly beaters: number | null;
  readonly chasers: number | null;
  readonly relatedTo: readonly string[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

interface ExerciseSyntheticDocument {
  readonly _id: mongo.ObjectId;
  readonly name: string;
  readonly tags: readonly string[];
  readonly materials: readonly string[];
  readonly time_min?: number;
  readonly persons?: number;
  readonly beaters?: number;
  readonly chasers?: number;
  readonly creator: string;
  readonly user: mongo.ObjectId;
  readonly related_to: readonly mongo.ObjectId[];
  readonly description_blocks: readonly {
    readonly description: string;
    readonly coaching_points: string;
  }[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface SyntheticOperationMeasurement {
  readonly name: string;
  readonly operation: "browse" | "facet";
  readonly warmP95Ms: number;
  readonly maximumMs: number;
  readonly resultCount: number;
  readonly correct: boolean;
  readonly plannerException?: "unanchored-search" | "low-selectivity-facet";
}

export interface SyntheticDatabaseMeasurement {
  readonly name: string;
  readonly countWarmP95Ms: number;
  readonly pageWarmP95Ms: number;
  readonly maximumMs: number;
}

export interface SyntheticPlannerMeasurement {
  readonly name: string;
  readonly expectedIndex: string;
  readonly activationGate: boolean;
  readonly selected: boolean;
  readonly explain: ExplainSummary;
}

export interface SyntheticIndexMeasurement {
  readonly name: string;
  readonly createDurationMs: number;
  readonly sizeBytes: number | null;
  readonly selected: boolean;
  readonly explain: ExplainSummary;
  readonly dropCommand: string;
}

export interface ExerciseSyntheticEvidence {
  readonly generatedDocuments: number;
  readonly documentsWithMissingLegacyMetrics: number;
  readonly deterministicTieDocuments: number;
  readonly documentsWithBlocks: number;
  readonly summaryOmitsBlocks: boolean;
  readonly response100Bytes: number;
  readonly operations: readonly SyntheticOperationMeasurement[];
  readonly databaseOperations: readonly SyntheticDatabaseMeasurement[];
  readonly planners: readonly SyntheticPlannerMeasurement[];
  readonly indexes: readonly SyntheticIndexMeasurement[];
}

interface ExerciseScale {
  readonly resources: number;
}

type ExerciseQuery = Readonly<Record<string, string | readonly string[]>>;
type ExerciseSort = (typeof EXERCISE_APPROVED_SORTS)[number];

interface DatabaseCase {
  readonly name: string;
  readonly expectedIndex: (typeof EXERCISE_INDEX_NAMES)[number];
  readonly activationGate?: true;
  readonly match: mongo.Filter<ExerciseSyntheticDocument>;
  readonly pipeline: readonly mongo.Document[];
}

interface BrowseWorkload {
  readonly kind: "browse";
  readonly name: string;
  readonly sort?: {
    readonly family: ExerciseSort;
    readonly direction: "asc" | "desc";
  };
  readonly query: ExerciseQuery | ((scale: ExerciseScale) => ExerciseQuery);
  readonly correct: (items: readonly ExerciseSyntheticSummary[]) => boolean;
  readonly expectedTotal?: (scale: ExerciseScale) => number;
  readonly database?: DatabaseCase;
  readonly plannerException?: "unanchored-search";
}

export function countMatching(
  scale: { readonly resources: number },
  predicate: (number: number) => boolean,
): number {
  let total = 0;
  for (let number = 0; number < scale.resources; number += 1) {
    if (predicate(number)) total += 1;
  }
  return total;
}

interface FacetWorkload {
  readonly kind: "facet";
  readonly name: string;
  readonly facet: "tags" | "materials";
  readonly expectedItems: readonly string[];
  readonly plannerException: "low-selectivity-facet";
}

type ExerciseWorkload = BrowseWorkload | FacetWorkload;

function metricPipeline(
  match: mongo.Document,
  field: "time_min" | "persons",
  direction: 1 | -1,
): mongo.Document[] {
  return [
    { $match: match },
    {
      $set: {
        __collectionQueryMissing: {
          $cond: [{ $isNumber: `$${field}` }, 0, 1],
        },
      },
    },
    {
      $sort: {
        __collectionQueryMissing: 1,
        [field]: direction,
        _id: 1,
      },
    },
    { $limit: 100 },
    { $project: { _id: 1, name: 1, [field]: 1 } },
  ];
}

function indexedSortPipeline(
  field: "name" | "createdAt" | "updatedAt",
  direction: 1 | -1,
): mongo.Document[] {
  return [
    { $match: {} },
    { $sort: { [field]: direction, _id: 1 } },
    { $limit: 100 },
    { $project: { _id: 1, name: 1, [field]: 1 } },
  ];
}

const nameCollator = new Intl.Collator("en", {
  sensitivity: "accent",
  numeric: true,
});

function sortedByName(
  items: readonly ExerciseSyntheticSummary[],
  direction: "asc" | "desc",
): boolean {
  const multiplier = direction === "asc" ? 1 : -1;
  return items.every((item, index) => {
    if (index === 0) return true;
    const previous = items[index - 1];
    const nameOrder =
      nameCollator.compare(previous.name, item.name) * multiplier;
    const idOrder = previous._id.localeCompare(item._id);
    return nameOrder < 0 || (nameOrder === 0 && idOrder <= 0);
  });
}

function sortedByMetric(
  items: readonly ExerciseSyntheticSummary[],
  field: "durationMinutes" | "persons",
  direction: "asc" | "desc",
): boolean {
  if (items.length !== 100) return false;
  const multiplier = direction === "asc" ? 1 : -1;
  for (let index = 1; index < items.length; index += 1) {
    const previous = items[index - 1];
    const current = items[index];
    const previousValue = previous[field];
    const currentValue = current[field];
    if (previousValue === null) {
      if (currentValue !== null) return false;
      if (previous._id.localeCompare(current._id) > 0) return false;
      continue;
    }
    if (currentValue === null) continue;
    const metricOrder = (previousValue - currentValue) * multiplier;
    const idOrder = previous._id.localeCompare(current._id);
    if (metricOrder > 0 || (metricOrder === 0 && idOrder > 0)) return false;
  }
  return true;
}

function sortedByDate(
  items: readonly ExerciseSyntheticSummary[],
  field: "createdAt" | "updatedAt",
  direction: "asc" | "desc",
): boolean {
  if (items.length !== 100) return false;
  for (let index = 1; index < items.length; index += 1) {
    const previous = items[index - 1];
    const current = items[index];
    const dateOrder =
      (previous[field].getTime() - current[field].getTime()) *
      (direction === "asc" ? 1 : -1);
    const idOrder = previous._id.localeCompare(current._id);
    if (dateOrder > 0 || (dateOrder === 0 && idOrder > 0)) {
      return false;
    }
  }
  return true;
}

const exerciseWorkloads = [
  {
    kind: "browse",
    name: "exercise default name page",
    sort: { family: "name", direction: "asc" },
    query: { limit: "100" },
    correct: (items) => sortedByName(items, "asc"),
    database: {
      name: "exercise default indexed page",
      expectedIndex: "cq_exercises_name",
      activationGate: true,
      match: {},
      pipeline: indexedSortPipeline("name", 1),
    },
  },
  {
    kind: "browse",
    name: "exercise name descending page",
    sort: { family: "name", direction: "desc" },
    query: { sort: "name", direction: "desc", limit: "100" },
    correct: (items) => sortedByName(items, "desc"),
    database: {
      name: "exercise name descending indexed page",
      expectedIndex: "cq_exercises_name",
      match: {},
      pipeline: indexedSortPipeline("name", -1),
    },
  },
  {
    kind: "browse",
    name: "exercise created ascending page",
    sort: { family: "created", direction: "asc" },
    query: { sort: "created", direction: "asc", limit: "100" },
    correct: (items) => sortedByDate(items, "createdAt", "asc"),
    database: {
      name: "exercise created ascending indexed page",
      expectedIndex: "cq_exercises_created",
      match: {},
      pipeline: indexedSortPipeline("createdAt", 1),
    },
  },
  {
    kind: "browse",
    name: "exercise created descending page",
    sort: { family: "created", direction: "desc" },
    query: { sort: "created", direction: "desc", limit: "100" },
    correct: (items) => sortedByDate(items, "createdAt", "desc"),
    database: {
      name: "exercise created descending indexed page",
      expectedIndex: "cq_exercises_created",
      match: {},
      pipeline: indexedSortPipeline("createdAt", -1),
    },
  },
  {
    kind: "browse",
    name: "exercise updated ascending page",
    sort: { family: "updated", direction: "asc" },
    query: { sort: "updated", direction: "asc", limit: "100" },
    correct: (items) => sortedByDate(items, "updatedAt", "asc"),
    database: {
      name: "exercise updated ascending indexed page",
      expectedIndex: "cq_exercises_updated",
      match: {},
      pipeline: indexedSortPipeline("updatedAt", 1),
    },
  },
  {
    kind: "browse",
    name: "exercise updated descending page",
    sort: { family: "updated", direction: "desc" },
    query: { sort: "updated", direction: "desc", limit: "100" },
    correct: (items) => sortedByDate(items, "updatedAt", "desc"),
    database: {
      name: "exercise updated descending indexed page",
      expectedIndex: "cq_exercises_updated",
      match: {},
      pipeline: indexedSortPipeline("updatedAt", -1),
    },
  },
  {
    kind: "browse",
    name: "exercise literal substring search",
    query: { search: "Exercise 10", limit: "100" },
    correct: (items) =>
      items.length > 0 && items.every((item) => /exercise 10/i.test(item.name)),
    plannerException: "unanchored-search",
  },
  {
    kind: "browse",
    name: "exercise duration sort",
    sort: { family: "duration", direction: "desc" },
    query: { sort: "duration", direction: "desc", limit: "100" },
    correct: (items) =>
      items.length === 100 && sortedByMetric(items, "durationMinutes", "desc"),
  },
  {
    kind: "browse",
    name: "exercise duration range and sort",
    sort: { family: "duration", direction: "asc" },
    query: {
      durationMin: "20",
      durationMax: "40",
      sort: "duration",
      limit: "100",
    },
    correct: (items) =>
      items.length > 0 &&
      sortedByMetric(items, "durationMinutes", "asc") &&
      items.every(
        (item) =>
          item.durationMinutes !== null &&
          item.durationMinutes >= 20 &&
          item.durationMinutes <= 40,
      ),
    expectedTotal: (scale) =>
      countMatching(
        scale,
        (number) => number % 13 !== 0 && number % 24 >= 3 && number % 24 <= 7,
      ),
    database: {
      name: "exercise duration ranged page",
      expectedIndex: "cq_exercises_duration",
      match: { time_min: { $gte: 20, $lte: 40 } },
      pipeline: metricPipeline(
        { time_min: { $gte: 20, $lte: 40 } },
        "time_min",
        1,
      ),
    },
  },
  {
    kind: "browse",
    name: "exercise duration missing metrics last",
    query: (scale) => ({
      sort: "duration",
      page: String(
        Math.floor((scale.resources - Math.ceil(scale.resources / 13)) / 100) +
          2,
      ),
      limit: "100",
    }),
    correct: (items) =>
      items.length === 100 &&
      items.every((item) => item.durationMinutes === null),
  },
  {
    kind: "browse",
    name: "exercise persons sort",
    sort: { family: "persons", direction: "desc" },
    query: { sort: "persons", direction: "desc", limit: "100" },
    correct: (items) =>
      items.length === 100 && sortedByMetric(items, "persons", "desc"),
  },
  {
    kind: "browse",
    name: "exercise persons range and sort",
    sort: { family: "persons", direction: "asc" },
    query: {
      personsMin: "4",
      personsMax: "8",
      sort: "persons",
      limit: "100",
    },
    correct: (items) =>
      items.length > 0 &&
      sortedByMetric(items, "persons", "asc") &&
      items.every(
        (item) =>
          item.persons !== null && item.persons >= 4 && item.persons <= 8,
      ),
    expectedTotal: (scale) =>
      countMatching(
        scale,
        (number) => number % 13 !== 0 && number % 20 >= 3 && number % 20 <= 7,
      ),
    database: {
      name: "exercise persons ranged page",
      expectedIndex: "cq_exercises_persons",
      match: { persons: { $gte: 4, $lte: 8 } },
      pipeline: metricPipeline({ persons: { $gte: 4, $lte: 8 } }, "persons", 1),
    },
  },
  {
    kind: "browse",
    name: "exercise persons missing metrics last",
    query: (scale) => ({
      sort: "persons",
      page: String(
        Math.floor((scale.resources - Math.ceil(scale.resources / 13)) / 100) +
          2,
      ),
      limit: "100",
    }),
    correct: (items) =>
      items.length === 100 && items.every((item) => item.persons === null),
  },
  {
    kind: "browse",
    name: "exercise beaters range",
    query: { beatersMin: "2", beatersMax: "4", limit: "100" },
    correct: (items) =>
      items.length > 0 &&
      items.every(
        (item) =>
          item.beaters !== null && item.beaters >= 2 && item.beaters <= 4,
      ),
    expectedTotal: (scale) =>
      countMatching(
        scale,
        (number) => number % 13 !== 0 && number % 7 >= 2 && number % 7 <= 4,
      ),
  },
  {
    kind: "browse",
    name: "exercise chasers range",
    query: { chasersMin: "3", chasersMax: "6", limit: "100" },
    correct: (items) =>
      items.length > 0 &&
      items.every(
        (item) =>
          item.chasers !== null && item.chasers >= 3 && item.chasers <= 6,
      ),
    expectedTotal: (scale) =>
      countMatching(
        scale,
        (number) => number % 13 !== 0 && number % 9 >= 3 && number % 9 <= 6,
      ),
  },
  {
    kind: "browse",
    name: "exercise tags any",
    query: { tags: ["Attack", "Missing"], tagMode: "any", limit: "100" },
    correct: (items) =>
      items.length === 100 &&
      items.every((item) =>
        item.tags.some((tag) => tag.toLowerCase() === "attack"),
      ),
    expectedTotal: (scale) =>
      countMatching(scale, (number) => number % 3 === 0),
    database: {
      name: "exercise tags filtered page",
      expectedIndex: "cq_exercises_tags",
      match: { tags: /^Attack$/i },
      pipeline: [
        { $match: { tags: /^Attack$/i } },
        { $sort: { name: 1, _id: 1 } },
        { $limit: 100 },
        { $project: { _id: 1, name: 1, tags: 1 } },
      ],
    },
  },
  {
    kind: "browse",
    name: "exercise tags all",
    query: { tags: ["Synthetic", "Attack"], tagMode: "all", limit: "100" },
    correct: (items) =>
      items.length > 0 &&
      items.every((item) =>
        ["synthetic", "attack"].every((selected) =>
          item.tags.some((tag) => tag.toLowerCase() === selected),
        ),
      ),
    expectedTotal: (scale) =>
      countMatching(scale, (number) => number % 3 === 0),
  },
  {
    kind: "browse",
    name: "exercise materials any",
    query: {
      materials: ["Cones", "Missing"],
      materialMode: "any",
      limit: "100",
    },
    correct: (items) =>
      items.length === 100 &&
      items.every((item) =>
        item.materials.some((material) => material.toLowerCase() === "cones"),
      ),
    expectedTotal: (scale) =>
      countMatching(scale, (number) => number % 4 === 0),
    database: {
      name: "exercise materials filtered page",
      expectedIndex: "cq_exercises_materials",
      match: { materials: /^Cones$/i },
      pipeline: [
        { $match: { materials: /^Cones$/i } },
        { $sort: { name: 1, _id: 1 } },
        { $limit: 100 },
        { $project: { _id: 1, name: 1, materials: 1 } },
      ],
    },
  },
  {
    kind: "browse",
    name: "exercise materials all",
    query: {
      materials: ["Synthetic", "Cones"],
      materialMode: "all",
      limit: "100",
    },
    correct: (items) =>
      items.length > 0 &&
      items.every((item) =>
        ["synthetic", "cones"].every((selected) =>
          item.materials.some(
            (material) => material.toLowerCase() === selected,
          ),
        ),
      ),
    expectedTotal: (scale) =>
      countMatching(scale, (number) => number % 4 === 0),
  },
  {
    kind: "facet",
    name: "exercise tags facet",
    facet: "tags",
    expectedItems: [
      "Attack",
      "Defence",
      "Synthetic",
      ...Array.from({ length: 40 }, (_, index) => `Tag ${index}`),
    ],
    plannerException: "low-selectivity-facet",
  },
  {
    kind: "facet",
    name: "exercise materials facet",
    facet: "materials",
    expectedItems: [
      "Balls",
      "Cones",
      ...Array.from({ length: 30 }, (_, index) => `Material ${index}`),
      "Synthetic",
    ],
    plannerException: "low-selectivity-facet",
  },
] as const satisfies readonly ExerciseWorkload[];

const browseWorkloads = exerciseWorkloads.filter(
  (workload): workload is (typeof exerciseWorkloads)[number] & BrowseWorkload =>
    workload.kind === "browse",
);
const facetWorkloads = exerciseWorkloads.filter(
  (workload): workload is (typeof exerciseWorkloads)[number] & FacetWorkload =>
    workload.kind === "facet",
);
const databaseWorkloads = browseWorkloads.filter(
  (
    workload,
  ): workload is (typeof browseWorkloads)[number] & {
    readonly database: DatabaseCase;
  } => workload.database !== undefined,
);

export const EXERCISE_WORKLOAD_NAMES = Object.freeze(
  exerciseWorkloads.map((workload) => workload.name),
);
export const EXERCISE_DATABASE_WORKLOADS = Object.freeze(
  databaseWorkloads.map((workload) => ({
    name: workload.database.name,
    expectedIndex: workload.database.expectedIndex,
    activationGate: workload.database.activationGate === true,
  })),
);
export const EXERCISE_DATABASE_WORKLOAD_NAMES = Object.freeze(
  EXERCISE_DATABASE_WORKLOADS.map((workload) => workload.name),
);
export const EXERCISE_SORT_COVERAGE = Object.freeze(
  browseWorkloads.flatMap((workload) => (workload.sort ? [workload.sort] : [])),
);

function isNullableNumber(value: unknown): value is number | null {
  return value === null || typeof value === "number";
}

export function isExerciseSyntheticSummary(
  value: CollectionSummary,
): value is ExerciseSyntheticSummary {
  return (
    !("description_blocks" in value) &&
    !("blocks" in value) &&
    !("Blocks" in value) &&
    "materials" in value &&
    Array.isArray(value.materials) &&
    value.materials.every((entry) => typeof entry === "string") &&
    "durationMinutes" in value &&
    isNullableNumber(value.durationMinutes) &&
    "persons" in value &&
    isNullableNumber(value.persons) &&
    "beaters" in value &&
    isNullableNumber(value.beaters) &&
    "chasers" in value &&
    isNullableNumber(value.chasers) &&
    "relatedTo" in value &&
    Array.isArray(value.relatedTo) &&
    value.relatedTo.every((entry) => typeof entry === "string") &&
    value.createdAt instanceof Date &&
    value.updatedAt instanceof Date
  );
}

export function exerciseBrowseWorkloadCorrect(
  workloadName: string,
  items: readonly CollectionSummary[],
): boolean {
  const workload = browseWorkloads.find(
    (candidate) => candidate.name === workloadName,
  );
  return (
    workload !== undefined &&
    items.every(isExerciseSyntheticSummary) &&
    workload.correct(items)
  );
}

export function exerciseFacetWorkloadCorrect(
  workloadName: string,
  items: readonly string[],
): boolean {
  const workload = facetWorkloads.find(
    (candidate) => candidate.name === workloadName,
  );
  return (
    workload !== undefined &&
    items.length === workload.expectedItems.length &&
    items.every((item, index) => item === workload.expectedItems[index])
  );
}

export function syntheticExerciseDocument(
  _id: mongo.ObjectId,
  number: number,
): ExerciseSyntheticDocument {
  const missingLegacyMetrics = number % 13 === 0;
  return {
    _id,
    name: number % 17 === 0 ? "Deterministic Tie" : `Exercise ${number}`,
    tags: [
      number % 2 === 0 ? "synthetic" : "Synthetic",
      `Tag ${number % 40}`,
      number % 3 === 0 ? "Attack" : "Defence",
    ],
    materials: [
      number % 2 === 0 ? "synthetic" : "Synthetic",
      `Material ${number % 30}`,
      number % 4 === 0 ? "Cones" : "Balls",
    ],
    ...(!missingLegacyMetrics
      ? {
          time_min: 5 + (number % 24) * 5,
          persons: 1 + (number % 20),
          beaters: number % 7,
          chasers: number % 9,
        }
      : {}),
    creator: `Coach ${number % 100}`,
    user: new mongo.ObjectId(number.toString(16).padStart(24, "0").slice(-24)),
    related_to: [
      new mongo.ObjectId(
        (number + 1).toString(16).padStart(24, "0").slice(-24),
      ),
      new mongo.ObjectId(
        (number + 2).toString(16).padStart(24, "0").slice(-24),
      ),
    ],
    description_blocks: [
      {
        description: `Synthetic nested content ${"x".repeat(256)}`,
        coaching_points: "Must not appear in collection summaries",
      },
    ],
    createdAt: new Date(Date.UTC(2020, 0, 1 + (number % 365))),
    updatedAt: new Date(Date.UTC(2024, 0, 1 + (number % 365))),
  };
}

export function percentile95(values: readonly number[]): number {
  const ordered = [...values].sort((left, right) => left - right);
  return ordered[Math.max(0, Math.ceil(ordered.length * 0.95) - 1)] ?? 0;
}

export async function operationDurations(
  operation: () => Promise<unknown>,
): Promise<number[]> {
  const measured: number[] = [];
  await operation();
  for (let iteration = 0; iteration < MEASURED_ITERATIONS; iteration += 1) {
    const started = performance.now();
    await operation();
    measured.push(performance.now() - started);
  }
  return measured;
}

async function explainAggregate(
  collection: mongo.Collection<ExerciseSyntheticDocument>,
  pipeline: readonly mongo.Document[],
): Promise<unknown> {
  return collection
    .aggregate([...pipeline], { collation: COLLATION, maxTimeMS: 1_000 })
    .explain("executionStats");
}

export async function measureExerciseSynthetic(
  database: mongo.Db,
  scale: ExerciseScale,
): Promise<ExerciseSyntheticEvidence> {
  const exercises = database.collection<ExerciseSyntheticDocument>("exercises");
  const ids = Array.from(
    { length: scale.resources },
    () => new mongo.ObjectId(),
  );
  for (let start = 0; start < ids.length; start += 1_000) {
    await exercises.insertMany(
      ids
        .slice(start, start + 1_000)
        .map((_id, offset) => syntheticExerciseDocument(_id, start + offset)),
    );
  }

  const indexes: SyntheticIndexMeasurement[] = [];
  for (const name of EXERCISE_INDEX_NAMES) {
    const created = await createCollectionIndex(database, name);
    const verified = await verifyCollectionIndex(database, name);
    indexes.push({
      name,
      createDurationMs: created.durationMs,
      sizeBytes: created.sizeBytes,
      selected: verified.selected,
      explain: verified.summary,
      dropCommand: `npm run collection:index:drop -- ${name}`,
    });
  }

  const visibility = collectionVisibility.all();
  const operations: SyntheticOperationMeasurement[] = [];
  let response100Bytes = 0;
  let summaryOmitsBlocks = true;
  await runWithCollectionDatabase(database, async () => {
    for (const workload of browseWorkloads) {
      const query =
        typeof workload.query === "function"
          ? workload.query(scale)
          : workload.query;
      const intent = parseCollectionQuery("exercise", query);
      const times = await operationDurations(() =>
        browse({ intent, visibility }),
      );
      const result = await browse({ intent, visibility });
      if (workload.name === "exercise default name page") {
        response100Bytes = mongo.BSON.calculateObjectSize(result);
      }
      summaryOmitsBlocks =
        summaryOmitsBlocks && result.items.every(isExerciseSyntheticSummary);
      operations.push({
        name: workload.name,
        operation: "browse",
        warmP95Ms: percentile95(times),
        maximumMs: Math.max(...times),
        resultCount: result.items.length,
        correct:
          exerciseBrowseWorkloadCorrect(workload.name, result.items) &&
          (workload.expectedTotal === undefined ||
            result.pagination.total === workload.expectedTotal(scale)),
        plannerException: workload.plannerException,
      });
    }
    for (const workload of facetWorkloads) {
      const times = await operationDurations(() =>
        listFacet({ resource: "exercise", facet: workload.facet, visibility }),
      );
      const result = await listFacet({
        resource: "exercise",
        facet: workload.facet,
        visibility,
      });
      operations.push({
        name: workload.name,
        operation: "facet",
        warmP95Ms: percentile95(times),
        maximumMs: Math.max(...times),
        resultCount: result.items.length,
        correct: exerciseFacetWorkloadCorrect(workload.name, result.items),
        plannerException: workload.plannerException,
      });
    }
  });

  const databaseOperations: SyntheticDatabaseMeasurement[] = [];
  const planners: SyntheticPlannerMeasurement[] = [];
  for (const workload of databaseWorkloads) {
    const countTimes = await operationDurations(() =>
      exercises.countDocuments(workload.database.match, { maxTimeMS: 1_000 }),
    );
    const pageTimes = await operationDurations(() =>
      exercises
        .aggregate([...workload.database.pipeline], {
          collation: COLLATION,
          maxTimeMS: 1_000,
        })
        .toArray(),
    );
    databaseOperations.push({
      name: workload.database.name,
      countWarmP95Ms: percentile95(countTimes),
      pageWarmP95Ms: percentile95(pageTimes),
      maximumMs: Math.max(...countTimes, ...pageTimes),
    });
    const explanation = await explainAggregate(
      exercises,
      workload.database.pipeline,
    );
    planners.push({
      name: workload.database.name,
      expectedIndex: workload.database.expectedIndex,
      activationGate: workload.database.activationGate === true,
      selected: winningPlanUsesIndex(
        explanation,
        workload.database.expectedIndex,
      ),
      explain: summarizeExplain(explanation),
    });
  }

  return {
    generatedDocuments: ids.length,
    documentsWithMissingLegacyMetrics: Math.ceil(ids.length / 13),
    deterministicTieDocuments: Math.ceil(ids.length / 17),
    documentsWithBlocks: ids.length,
    summaryOmitsBlocks,
    response100Bytes,
    operations,
    databaseOperations,
    planners,
    indexes,
  };
}
