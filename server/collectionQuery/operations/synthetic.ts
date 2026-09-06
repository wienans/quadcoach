import { mongo } from "mongoose";

import { loadAllCollectionGrantIds } from "..";
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
  SyntheticDatabaseMeasurement,
  SyntheticIndexMeasurement,
  SyntheticOperationMeasurement,
  SyntheticPlannerMeasurement,
} from "./exerciseSynthetic";
import {
  measurePracticePlanSynthetic,
  PracticePlanSyntheticEvidence,
  PRACTICE_PLAN_DATABASE_WORKLOAD_NAMES,
  PRACTICE_PLAN_INDEX_NAMES,
  PRACTICE_PLAN_WORKLOAD_NAMES,
} from "./practicePlanSynthetic";
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
  exerciseFacetWorkloadCorrect,
  isExerciseSyntheticSummary,
  syntheticExerciseDocument,
} from "./exerciseSynthetic";
export {
  expectedPracticePlanSectionCount,
  expectedPracticePlanDurationMinutes,
  expectedPracticePlanTagFacet,
  isPracticePlanSyntheticSummary,
  measurePracticePlanSynthetic,
  PracticePlanSyntheticEvidence,
  PracticePlanSyntheticSummary,
  PRACTICE_PLAN_APPROVED_SORTS,
  PRACTICE_PLAN_DATABASE_WORKLOADS,
  PRACTICE_PLAN_DATABASE_WORKLOAD_NAMES,
  PRACTICE_PLAN_INDEX_NAMES,
  PRACTICE_PLAN_SORT_COVERAGE,
  PRACTICE_PLAN_WORKLOAD_NAMES,
  practicePlanBrowseWorkloadCorrect,
  practicePlanFacetWorkloadCorrect,
  syntheticPracticePlanDocument,
} from "./practicePlanSynthetic";

const COLLECTION_COLLATION = {
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
  readonly practicePlan?: PracticePlanSyntheticEvidence;
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

interface ResourceSyntheticEvidence {
  readonly response100Bytes: number;
  readonly operations: readonly SyntheticOperationMeasurement[];
  readonly databaseOperations: readonly SyntheticDatabaseMeasurement[];
  readonly planners: readonly SyntheticPlannerMeasurement[];
  readonly indexes: readonly SyntheticIndexMeasurement[];
}

function resourceActivationGates(
  label: string,
  evidence: ResourceSyntheticEvidence,
  workloadNames: readonly string[],
  databaseWorkloadNames: readonly string[],
  indexNames: readonly string[],
  indexDescription: string,
): SyntheticGateReport["gates"] {
  return [
    {
      name: `${label} 100-item response`,
      passed: evidence.response100Bytes <= 256 * 1024,
      observed: evidence.response100Bytes,
      required: "<=262144 bytes",
    },
    {
      name: `${label} workload coverage`,
      passed: workloadNames.every((name) =>
        evidence.operations.some((operation) => operation.name === name),
      ),
      observed: evidence.operations.length,
      required: `${workloadNames.length} named workloads`,
    },
    {
      name: `${label} database operation coverage`,
      passed:
        evidence.databaseOperations.length === databaseWorkloadNames.length &&
        databaseWorkloadNames.every((name) =>
          evidence.databaseOperations.some(
            (operation) => operation.name === name,
          ),
        ),
      observed: evidence.databaseOperations.length,
      required: `${databaseWorkloadNames.length} representative count/page paths`,
    },
    {
      name: `${label} planner coverage`,
      passed:
        evidence.planners.length === databaseWorkloadNames.length &&
        databaseWorkloadNames.every((name) =>
          evidence.planners.some((planner) => planner.name === name),
        ),
      observed: evidence.planners.length,
      required: `${databaseWorkloadNames.length} representative indexed paths`,
    },
    {
      name: `${label} index coverage`,
      passed: indexNames.every((name) =>
        evidence.indexes.some((index) => index.name === name),
      ),
      observed: evidence.indexes.length,
      required: `${indexNames.length} approved ${indexDescription}`,
    },
    ...evidence.operations.map((operation) => ({
      name: `${operation.name} correctness`,
      passed: operation.correct,
      observed: operation.correct,
      required: "true",
    })),
    ...evidence.operations.map((operation) => ({
      name: `${operation.name} warm p95`,
      passed:
        operation.warmP95Ms < (operation.operation === "facet" ? 1_000 : 500),
      observed: operation.warmP95Ms,
      required: operation.operation === "facet" ? "<1000ms" : "<500ms",
    })),
    ...evidence.operations.map((operation) => ({
      name: `${operation.name} database budget`,
      passed:
        operation.maximumMs <=
        (operation.operation === "facet" ? 2_000 : 1_000),
      observed: operation.maximumMs,
      required: operation.operation === "facet" ? "<=2000ms" : "<=1000ms",
    })),
    ...evidence.databaseOperations.flatMap((operation) => [
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
    ...evidence.planners
      .filter((planner) => planner.activationGate)
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
    ...evidence.indexes.map((index) => ({
      name: `${index.name} planner verification`,
      passed: index.selected,
      observed: index.selected,
      required: "true",
    })),
  ];
}

export function evaluateSyntheticGates(
  measurements: SyntheticMeasurements,
): SyntheticGateReport {
  const explain = measurements.defaultPageExplain;
  const scanLimit = measurements.skip + measurements.limit + 100;
  const exercise = measurements.exercise;
  const practicePlan = measurements.practicePlan;
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
              exercise.generatedDocuments ===
                measurements.exercise?.generatedDocuments,
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
          ...resourceActivationGates(
            "Exercise",
            exercise,
            EXERCISE_WORKLOAD_NAMES,
            EXERCISE_DATABASE_WORKLOAD_NAMES,
            EXERCISE_INDEX_NAMES,
            "cq_exercises_* indexes",
          ),
        ]
      : []),
    {
      name: "PracticePlan evidence present",
      passed: practicePlan !== undefined,
      observed: practicePlan !== undefined,
      required: "true",
    },
    ...(practicePlan
      ? [
          {
            name: "PracticePlan dataset scale",
            passed:
              practicePlan.generatedDocuments >= 20_000 &&
              practicePlan.generatedDocuments ===
                measurements.practicePlan?.generatedDocuments,
            observed: practicePlan.generatedDocuments,
            required: ">=20000 documents",
          },
          {
            name: "PracticePlan legacy privacy represented",
            passed: practicePlan.documentsWithLegacyMissingPrivacy > 0,
            observed: practicePlan.documentsWithLegacyMissingPrivacy,
            required: ">0 documents",
          },
          {
            name: "PracticePlan empty sections represented",
            passed: practicePlan.documentsWithEmptySections > 0,
            observed: practicePlan.documentsWithEmptySections,
            required: ">0 documents",
          },
          {
            name: "PracticePlan missing descriptions represented",
            passed: practicePlan.documentsWithMissingDescription > 0,
            observed: practicePlan.documentsWithMissingDescription,
            required: ">0 documents",
          },
          {
            name: "PracticePlan deterministic ties represented",
            passed: practicePlan.deterministicTieDocuments > 1,
            observed: practicePlan.deterministicTieDocuments,
            required: ">1 documents",
          },
          {
            name: "PracticePlan Sections excluded from summaries",
            passed:
              practicePlan.documentsWithSections > 0 &&
              practicePlan.summaryOmitsSections,
            observed: practicePlan.summaryOmitsSections,
            required: "true",
          },
          {
            name: "PracticePlan derived summary accuracy",
            passed: practicePlan.derivedMetricsAccurate,
            observed: practicePlan.derivedMetricsAccurate,
            required: "true",
          },
          {
            name: "PracticePlan grant ID materialization",
            passed: practicePlan.grantIdsBytes < 1024 * 1024,
            observed: practicePlan.grantIdsBytes,
            required: "<1048576 bytes",
          },
          ...resourceActivationGates(
            "PracticePlan",
            practicePlan,
            PRACTICE_PLAN_WORKLOAD_NAMES,
            PRACTICE_PLAN_DATABASE_WORKLOAD_NAMES,
            PRACTICE_PLAN_INDEX_NAMES,
            "cq_practiceplans_* indexes",
          ),
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
    { name: "cq_tacticboards_name", collation: COLLECTION_COLLATION },
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
      .collation(COLLECTION_COLLATION)
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
  const practicePlan = await measurePracticePlanSynthetic(database, scale);
  const practicePlanBrowse = practicePlan.operations.filter(
    (operation) => operation.operation === "browse",
  );
  const practicePlanFacets = practicePlan.operations.filter(
    (operation) => operation.operation === "facet",
  );
  return {
    countWarmP95Ms: Math.max(
      percentile95(countTimes),
      ...exercise.databaseOperations.map(
        (operation) => operation.countWarmP95Ms,
      ),
      ...practicePlan.databaseOperations.map(
        (operation) => operation.countWarmP95Ms,
      ),
    ),
    pageWarmP95Ms: Math.max(
      percentile95(pageTimes),
      ...exercise.databaseOperations.map(
        (operation) => operation.pageWarmP95Ms,
      ),
      ...practicePlan.databaseOperations.map(
        (operation) => operation.pageWarmP95Ms,
      ),
    ),
    browseWarmP95Ms: Math.max(
      percentile95(tacticBoardMeasurements.browseTimes),
      ...exerciseBrowse.map((operation) => operation.warmP95Ms),
      ...practicePlanBrowse.map((operation) => operation.warmP95Ms),
    ),
    facetWarmP95Ms: Math.max(
      percentile95(tacticBoardMeasurements.facetTimes),
      ...exerciseFacets.map((operation) => operation.warmP95Ms),
      ...practicePlanFacets.map((operation) => operation.warmP95Ms),
    ),
    maximumBrowseDatabaseMs: Math.max(
      ...countTimes,
      ...pageTimes,
      ...exercise.databaseOperations.map((operation) => operation.maximumMs),
      ...exerciseBrowse.map((operation) => operation.maximumMs),
      ...practicePlan.databaseOperations.map((operation) => operation.maximumMs),
      ...practicePlanBrowse.map((operation) => operation.maximumMs),
    ),
    maximumFacetDatabaseMs: Math.max(
      ...tacticBoardMeasurements.facetTimes,
      ...exerciseFacets.map((operation) => operation.maximumMs),
      ...practicePlanFacets.map((operation) => operation.maximumMs),
    ),
    defaultPageExplain: summarizeExplain(explain),
    skip: 0,
    limit: 100,
    response100Bytes: Math.max(
      mongo.BSON.calculateObjectSize(tacticBoardMeasurements.page),
      exercise.response100Bytes,
      practicePlan.response100Bytes,
    ),
    grantIdsBytes: Math.max(
      mongo.BSON.calculateObjectSize({
        ids: visibility.grantedResourceIds,
      }),
      practicePlan.grantIdsBytes,
    ),
    grantIdsLoaded: Math.max(
      visibility.grantedResourceIds.length,
      practicePlan.grantIdsLoaded,
    ),
    grantIdsAreStrings: visibility.grantedResourceIds.every(
      (id) => typeof id === "string",
    ),
    publicResourceCount,
    browseVisibleTotal: tacticBoardMeasurements.page.pagination.total,
    exercise,
    practicePlan,
  };
}
