import { performance } from "node:perf_hooks";
import { mongo } from "mongoose";

import { loadAllCollectionGrantIds } from "../../authorization/collectionGrantIds";
import { browse, listFacet } from "../index";
import { runWithCollectionDatabase } from "../internal/databaseContext";
import { parseCollectionQuery } from "../parser";
import { collectionVisibility } from "../types";
import { ExplainSummary } from "./reporting";

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

function percentile95(values: readonly number[]): number {
  const ordered = [...values].sort((left, right) => left - right);
  return ordered[Math.max(0, Math.ceil(ordered.length * 0.95) - 1)] ?? 0;
}

async function durations(
  iterations: number,
  operation: () => Promise<unknown>,
): Promise<number[]> {
  const measured: number[] = [];
  await operation();
  for (let iteration = 0; iteration < iterations; iteration += 1) {
    const started = performance.now();
    await operation();
    measured.push(performance.now() - started);
  }
  return measured;
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
    {
      name: "cq_tacticboards_name",
      collation: { locale: "en", strength: 2, numericOrdering: true },
    },
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
      .collation({ locale: "en", strength: 2, numericOrdering: true })
      .sort({ name: 1, _id: 1 })
      .limit(100)
      .project({ _id: 1, name: 1, tags: 1, isPrivate: 1 });
  const countTimes = await durations(10, () =>
    resources.countDocuments(match, { maxTimeMS: 1_000 }),
  );
  const pageTimes = await durations(10, () => cursor().toArray());
  const intent = parseCollectionQuery("tacticBoard", { limit: "100" });
  const explain = await cursor().explain("executionStats");
  const { summarizeExplain } = await import("./reporting");
  return runWithCollectionDatabase(database, async () => {
    const browseTimes = await durations(10, () =>
      browse({ intent, visibility }),
    );
    const facetTimes = await durations(10, () =>
      listFacet({ resource: "tacticBoard", facet: "tags", visibility }),
    );
    const page = await browse({ intent, visibility });
    return {
      countWarmP95Ms: percentile95(countTimes),
      pageWarmP95Ms: percentile95(pageTimes),
      browseWarmP95Ms: percentile95(browseTimes),
      facetWarmP95Ms: percentile95(facetTimes),
      maximumBrowseDatabaseMs: Math.max(...countTimes, ...pageTimes),
      maximumFacetDatabaseMs: Math.max(...facetTimes),
      defaultPageExplain: summarizeExplain(explain),
      skip: 0,
      limit: 100,
      response100Bytes: mongo.BSON.calculateObjectSize(page),
      grantIdsBytes: mongo.BSON.calculateObjectSize({
        ids: visibility.grantedResourceIds,
      }),
      grantIdsLoaded: visibility.grantedResourceIds.length,
      grantIdsAreStrings: visibility.grantedResourceIds.every(
        (id) => typeof id === "string",
      ),
      publicResourceCount,
      browseVisibleTotal: page.pagination.total,
    };
  });
}
