import { mongo } from "mongoose";

import { loadAllCollectionGrantIds } from "../../authorization/collectionGrantIds";
import { browse, listFacet } from "../index";
import { runWithCollectionDatabase } from "../internal/databaseContext";
import { parseCollectionQuery } from "../parser";
import { collectionVisibility } from "../types";
import {
  ExerciseSyntheticEvidence,
  EXERCISE_DATABASE_WORKLOAD_NAMES,
  EXERCISE_INDEX_NAMES,
  EXERCISE_WORKLOAD_NAMES,
  measureExerciseSynthetic,
  operationDurations,
  percentile95,
} from "./exerciseSynthetic";
import { ExplainSummary, summarizeExplain } from "./reporting";

export {
  ExerciseSyntheticEvidence,
  EXERCISE_APPROVED_SORTS,
  EXERCISE_DATABASE_WORKLOADS,
  EXERCISE_DATABASE_WORKLOAD_NAMES,
  EXERCISE_INDEX_NAMES,
  EXERCISE_SORT_COVERAGE,
  EXERCISE_WORKLOAD_NAMES,
  exerciseBrowseWorkloadCorrect,
  isExerciseSyntheticSummary,
  syntheticExerciseDocument,
} from "./exerciseSynthetic";

const EXERCISE_COLLATION = {
  locale: "en",
  strength: 2,
  numericOrdering: true,
} as const;

export interface ObservedMaxima {
  readonly resources: number;
  readonly grantsPerActor: number;
}

export interface SyntheticScale {
  readonly resources: number;
  readonly grantsPerActor: number;
}

export function syntheticScale(observed: ObservedMaxima): SyntheticScale {
  return {
    resources: Math.max(20_000, observed.resources * 2),
    grantsPerActor: Math.max(5_000, observed.grantsPerActor * 2),
  };
}

export interface SyntheticMeasurements {
  readonly countWarmP95Ms: number;
  readonly pageWarmP95Ms: number;
  readonly browseWarmP95Ms: number;
  readonly facetWarmP95Ms: number;
  readonly maximumBrowseDatabaseMs: number;
  readonly maximumFacetDatabaseMs: number;
  readonly defaultPageExplain: ExplainSummary;
  readonly skip: number;
  readonly limit: number;
  readonly response100Bytes: number;
  readonly grantIdsBytes: number;
  readonly grantIdsLoaded: number;
  readonly grantIdsAreStrings: boolean;
  readonly publicResourceCount: number;
  readonly browseVisibleTotal: number;
  readonly exercise?: ExerciseSyntheticEvidence;
}

export interface SyntheticGateReport {
  readonly activation: "proceed" | "pause";
  readonly gates: readonly {
    readonly name: string;
    readonly passed: boolean;
    readonly observed: number | boolean;
    readonly required: string;
  }[];
  readonly exceptions: readonly string[];
}

export function evaluateSyntheticGates(
  measurements: SyntheticMeasurements,
): SyntheticGateReport {
  const explain = measurements.defaultPageExplain;
  const scanLimit = measurements.skip + measurements.limit + 100;
  const exercise = measurements.exercise;
  const gates = [
    {
      name: "count warm p95",
      passed: measurements.countWarmP95Ms < 250,
      observed: measurements.countWarmP95Ms,
      required: "<250ms",
    },
    {
      name: "page warm p95",
      passed: measurements.pageWarmP95Ms < 250,
      observed: measurements.pageWarmP95Ms,
      required: "<250ms",
    },
    {
      name: "browse end-to-end",
      passed: measurements.browseWarmP95Ms < 500,
      observed: measurements.browseWarmP95Ms,
      required: "<500ms",
    },
    {
      name: "facet end-to-end",
      passed: measurements.facetWarmP95Ms < 1_000,
      observed: measurements.facetWarmP95Ms,
      required: "<1000ms",
    },
    {
      name: "browse database budget",
      passed: measurements.maximumBrowseDatabaseMs <= 1_000,
      observed: measurements.maximumBrowseDatabaseMs,
      required: "<=1000ms",
    },
    {
      name: "facet database budget",
      passed: measurements.maximumFacetDatabaseMs <= 2_000,
      observed: measurements.maximumFacetDatabaseMs,
      required: "<=2000ms",
    },
    {
      name: "default page avoids COLLSCAN",
      passed: !explain.collectionScan,
      observed: explain.collectionScan,
      required: "false",
    },
    {
      name: "default page avoids blocking sort",
      passed: !explain.blockingSort,
      observed: explain.blockingSort,
      required: "false",
    },
    {
      name: "default page avoids spill",
      passed: !explain.spilled,
      observed: explain.spilled,
      required: "false",
    },
    {
      name: "default page documents examined",
      passed: explain.totalDocsExamined <= scanLimit,
      observed: explain.totalDocsExamined,
      required: `<=${scanLimit}`,
    },
    {
      name: "100-item response",
      passed: measurements.response100Bytes <= 256 * 1024,
      observed: measurements.response100Bytes,
      required: "<=262144 bytes",
    },
    {
      name: "grant ID materialization",
      passed: measurements.grantIdsBytes < 1024 * 1024,
      observed: measurements.grantIdsBytes,
      required: "<1048576 bytes",
    },
    {
      name: "Exercise evidence present",
      passed: exercise !== undefined,
      observed: exercise !== undefined,
      required: "true",
    },
    ...(exercise
      ? [
          {
            name: "Exercise dataset scale",
            passed:
              exercise.generatedDocuments >= 20_000 &&
              exercise.generatedDocuments === measurements.exercise?.generatedDocuments,
            observed: exercise.generatedDocuments,
            required: ">=20000 documents",
          },
          {
            name: "Exercise legacy metrics represented",
            passed: exercise.documentsWithMissingLegacyMetrics > 0,
            observed: exercise.documentsWithMissingLegacyMetrics,
            required: ">0 documents",
          },
          {
            name: "Exercise deterministic ties represented",
            passed: exercise.deterministicTieDocuments > 1,
            observed: exercise.deterministicTieDocuments,
            required: ">1 documents",
          },
          {
            name: "Exercise Blocks excluded from summaries",
            passed:
              exercise.documentsWithBlocks > 0 && exercise.summaryOmitsBlocks,
            observed: exercise.summaryOmitsBlocks,
            required: "true",
          },
          {
            name: "Exercise 100-item response",
            passed: exercise.response100Bytes <= 256 * 1024,
            observed: exercise.response100Bytes,
            required: "<=262144 bytes",
          },
          {
            name: "Exercise workload coverage",
            passed: EXERCISE_WORKLOAD_NAMES.every((name) =>
              exercise.operations.some((operation) => operation.name === name),
            ),
            observed: exercise.operations.length,
            required: `${EXERCISE_WORKLOAD_NAMES.length} named workloads`,
          },
          {
            name: "Exercise database operation coverage",
            passed:
              exercise.databaseOperations.length ===
                EXERCISE_DATABASE_WORKLOAD_NAMES.length &&
              EXERCISE_DATABASE_WORKLOAD_NAMES.every((name) =>
                exercise.databaseOperations.some(
                  (operation) => operation.name === name,
                ),
              ),
            observed: exercise.databaseOperations.length,
            required: `${EXERCISE_DATABASE_WORKLOAD_NAMES.length} representative count/page paths`,
          },
          {
            name: "Exercise planner coverage",
            passed:
              exercise.planners.length ===
                EXERCISE_DATABASE_WORKLOAD_NAMES.length &&
              EXERCISE_DATABASE_WORKLOAD_NAMES.every((name) =>
                exercise.planners.some((planner) => planner.name === name),
              ),
            observed: exercise.planners.length,
            required: `${EXERCISE_DATABASE_WORKLOAD_NAMES.length} representative indexed paths`,
          },
          {
            name: "Exercise index coverage",
            passed: EXERCISE_INDEX_NAMES.every((name) =>
              exercise.indexes.some((index) => index.name === name),
            ),
            observed: exercise.indexes.length,
            required: `${EXERCISE_INDEX_NAMES.length} approved cq_exercises_* indexes`,
          },
          ...exercise.operations.map((operation) => ({
            name: `${operation.name} correctness`,
            passed: operation.correct,
            observed: operation.correct,
            required: "true",
          })),
          ...exercise.operations.map((operation) => ({
            name: `${operation.name} warm p95`,
            passed:
              operation.warmP95Ms <
              (operation.operation === "facet" ? 1_000 : 500),
            observed: operation.warmP95Ms,
            required:
              operation.operation === "facet" ? "<1000ms" : "<500ms",
          })),
          ...exercise.operations.map((operation) => ({
            name: `${operation.name} database budget`,
            passed:
              operation.maximumMs <=
              (operation.operation === "facet" ? 2_000 : 1_000),
            observed: operation.maximumMs,
            required:
              operation.operation === "facet" ? "<=2000ms" : "<=1000ms",
          })),
          ...exercise.databaseOperations.flatMap((operation) => [
            {
              name: `${operation.name} count warm p95`,
              passed: operation.countWarmP95Ms < 250,
              observed: operation.countWarmP95Ms,
              required: "<250ms",
            },
            {
              name: `${operation.name} page warm p95`,
              passed: operation.pageWarmP95Ms < 250,
              observed: operation.pageWarmP95Ms,
              required: "<250ms",
            },
            {
              name: `${operation.name} database budget`,
              passed: operation.maximumMs <= 1_000,
              observed: operation.maximumMs,
              required: "<=1000ms",
            },
          ]),
          ...exercise.planners
            .filter((planner) => planner.strictDefault)
            .flatMap((planner) => [
              {
                name: `${planner.name} selects ${planner.expectedIndex}`,
                passed: planner.selected,
                observed: planner.selected,
                required: "true",
              },
              {
                name: `${planner.name} avoids COLLSCAN`,
                passed: !planner.explain.collectionScan,
                observed: planner.explain.collectionScan,
                required: "false",
              },
              {
                name: `${planner.name} avoids blocking sort`,
                passed: !planner.explain.blockingSort,
                observed: planner.explain.blockingSort,
                required: "false",
              },
              {
                name: `${planner.name} avoids spill`,
                passed: !planner.explain.spilled,
                observed: planner.explain.spilled,
                required: "false",
              },
              {
                name: `${planner.name} documents examined`,
                passed: planner.explain.totalDocsExamined <= 200,
                observed: planner.explain.totalDocsExamined,
                required: "<=200",
              },
            ]),
          ...exercise.indexes.map((index) => ({
            name: `${index.name} planner verification`,
            passed: index.selected,
            observed: index.selected,
            required: "true",
          })),
        ]
      : []),
  ];
  return {
    activation: gates.every((gate) => gate.passed) ? "proceed" : "pause",
    gates,
    exceptions: [
      "Unanchored literal substring search is time-bounded but exempt from index scan and blocking-sort gates.",
      "Low-selectivity facets are time-bounded but exempt from default-page scan and sort gates.",
    ],
  };
}

export async function measureSynthetic(
  database: mongo.Db,
  scale: SyntheticScale,
): Promise<SyntheticMeasurements> {
  const resources = database.collection("tacticboards");
  const accesses = database.collection("tacticboardaccesses");
  const actor = new mongo.ObjectId();
  const ids = Array.from(
    { length: scale.resources },
    () => new mongo.ObjectId(),
  );
  for (let start = 0; start < ids.length; start += 1_000) {
    await resources.insertMany(
      ids.slice(start, start + 1_000).map((_id, offset) => {
        const number = start + offset;
        return {
          _id,
          name: `Board ${number}`,
          tags: [`tag-${number % 40}`],
          isPrivate: number % 4 === 0,
          user: new mongo.ObjectId(),
          pages: [
            { objects: Array.from({ length: 10 }, () => ({ x: number })) },
          ],
        };
      }),
    );
  }
  const grantedIds = Array.from(
    { length: scale.grantsPerActor },
    (_, index) => ids[index] ?? new mongo.ObjectId(),
  );
  for (let start = 0; start < grantedIds.length; start += 1_000) {
    await accesses.insertMany(
      grantedIds
        .slice(start, start + 1_000)
        .map((tacticboard) => ({ user: actor, tacticboard, access: "view" })),
    );
  }
  await resources.createIndex(
    { name: 1, _id: 1 },
    { name: "cq_tacticboards_name", collation: EXERCISE_COLLATION },
  );
  await accesses.createIndex(
    { user: 1, tacticboard: 1 },
    { name: "actor_first_access", unique: true },
  );
  const loadedGrantIds = await loadAllCollectionGrantIds(
    database,
    "tacticBoard",
    actor.toString(),
  );
  const visibility = collectionVisibility.publicOwnedOrGranted(
    actor.toString(),
    loadedGrantIds,
  );
  const publicResourceCount = await resources.countDocuments({
    isPrivate: { $ne: true },
  });
  const match = {
    $or: [
      { isPrivate: { $ne: true } },
      { user: actor },
      {
        _id: {
          $in: visibility.grantedResourceIds.map(
            (id) => new mongo.ObjectId(id),
          ),
        },
      },
    ],
  };
  const cursor = () =>
    resources
      .find(match)
      .collation(EXERCISE_COLLATION)
      .sort({ name: 1, _id: 1 })
      .limit(100)
      .project({ _id: 1, name: 1, tags: 1, isPrivate: 1 });
  const countTimes = await operationDurations(() =>
    resources.countDocuments(match, { maxTimeMS: 1_000 }),
  );
  const pageTimes = await operationDurations(() => cursor().toArray());
  const intent = parseCollectionQuery("tacticBoard", { limit: "100" });
  const explain = await cursor().explain("executionStats");
  const tacticBoardMeasurements = await runWithCollectionDatabase(
    database,
    async () => {
      const browseTimes = await operationDurations(() =>
        browse({ intent, visibility }),
      );
      const facetTimes = await operationDurations(() =>
        listFacet({ resource: "tacticBoard", facet: "tags", visibility }),
      );
      const page = await browse({ intent, visibility });
      return { browseTimes, facetTimes, page };
    },
  );
  const exercise = await measureExerciseSynthetic(database, scale);
  const exerciseBrowse = exercise.operations.filter(
    (operation) => operation.operation === "browse",
  );
  const exerciseFacets = exercise.operations.filter(
    (operation) => operation.operation === "facet",
  );
  return {
    countWarmP95Ms: Math.max(
      percentile95(countTimes),
      ...exercise.databaseOperations.map((operation) => operation.countWarmP95Ms),
    ),
    pageWarmP95Ms: Math.max(
      percentile95(pageTimes),
      ...exercise.databaseOperations.map((operation) => operation.pageWarmP95Ms),
    ),
    browseWarmP95Ms: Math.max(
      percentile95(tacticBoardMeasurements.browseTimes),
      ...exerciseBrowse.map((operation) => operation.warmP95Ms),
    ),
    facetWarmP95Ms: Math.max(
      percentile95(tacticBoardMeasurements.facetTimes),
      ...exerciseFacets.map((operation) => operation.warmP95Ms),
    ),
    maximumBrowseDatabaseMs: Math.max(
      ...countTimes,
      ...pageTimes,
      ...exercise.databaseOperations.map((operation) => operation.maximumMs),
      ...exerciseBrowse.map((operation) => operation.maximumMs),
    ),
    maximumFacetDatabaseMs: Math.max(
      ...tacticBoardMeasurements.facetTimes,
      ...exerciseFacets.map((operation) => operation.maximumMs),
    ),
    defaultPageExplain: summarizeExplain(explain),
    skip: 0,
    limit: 100,
    response100Bytes: Math.max(
      mongo.BSON.calculateObjectSize(tacticBoardMeasurements.page),
      exercise.response100Bytes,
    ),
    grantIdsBytes: mongo.BSON.calculateObjectSize({
      ids: visibility.grantedResourceIds,
    }),
    grantIdsLoaded: visibility.grantedResourceIds.length,
    grantIdsAreStrings: visibility.grantedResourceIds.every(
      (id) => typeof id === "string",
    ),
    publicResourceCount,
    browseVisibleTotal: tacticBoardMeasurements.page.pagination.total,
    exercise,
  };
}
