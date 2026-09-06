import { mongo } from "mongoose";

import { browse, listFacet, loadAllCollectionGrantIds } from "../index";
import { runWithCollectionDatabase } from "../internal/databaseContext";
import { parseCollectionQuery } from "../parser";
import { CollectionSummary, collectionVisibility } from "../types";
import {
  countMatching,
  operationDurations,
  percentile95,
  SyntheticDatabaseMeasurement,
  SyntheticIndexMeasurement,
  SyntheticOperationMeasurement,
  SyntheticPlannerMeasurement,
} from "./exerciseSynthetic";
import {
  createCollectionIndex,
  verifyCollectionIndex,
  winningPlanUsesIndex,
} from "./indexes";
import { summarizeExplain } from "./reporting";

const COLLATION = {
  locale: "en",
  strength: 2,
  numericOrdering: true,
} as const;

export const PRACTICE_PLAN_INDEX_NAMES = Object.freeze([
  "cq_practiceplans_name",
  "cq_practiceplans_created",
  "cq_practiceplans_updated",
  "cq_practiceplans_privacy",
  "cq_practiceplans_owner",
  "cq_practiceplans_tags",
] as const);

export const PRACTICE_PLAN_APPROVED_SORTS = Object.freeze([
  "name",
  "created",
  "updated",
] as const);

export interface PracticePlanSyntheticSummary {
  readonly _id: string;
  readonly name: string;
  readonly tags: readonly string[];
  readonly isPrivate: boolean;
  readonly description: string | null;
  readonly sectionCount: number;
  readonly durationMinutes: number;
}

export interface PracticePlanSyntheticDocument {
  readonly _id: mongo.ObjectId;
  readonly name: string;
  readonly tags: readonly string[];
  readonly description?: string;
  readonly isPrivate?: boolean;
  readonly user: mongo.ObjectId;
  readonly sections: readonly {
    readonly name: string;
    readonly targetDuration: number;
    readonly groups: readonly {
      readonly name: string;
      readonly items: readonly PracticePlanSyntheticItem[];
    }[];
  }[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

type PracticePlanSyntheticItem =
  | { readonly kind: "break"; readonly description: string; readonly duration: number }
  | {
      readonly kind: "exercise";
      readonly exerciseId: string;
      readonly blockId: string;
      readonly duration: number;
    };

export interface PracticePlanSyntheticEvidence {
  readonly generatedDocuments: number;
  readonly documentsWithLegacyMissingPrivacy: number;
  readonly documentsWithEmptySections: number;
  readonly documentsWithMissingDescription: number;
  readonly documentsWithSections: number;
  readonly deterministicTieDocuments: number;
  readonly summaryOmitsSections: boolean;
  readonly derivedMetricsAccurate: boolean;
  readonly response100Bytes: number;
  readonly grantIdsBytes: number;
  readonly grantIdsLoaded: number;
  readonly operations: readonly SyntheticOperationMeasurement[];
  readonly databaseOperations: readonly SyntheticDatabaseMeasurement[];
  readonly planners: readonly SyntheticPlannerMeasurement[];
  readonly indexes: readonly SyntheticIndexMeasurement[];
}

export interface PracticePlanScale {
  readonly resources: number;
  readonly grantsPerActor: number;
}

export interface PracticePlanSyntheticCorpus {
  readonly numberForId: (id: string) => number | undefined;
}

type PracticePlanQuery = Readonly<Record<string, string | readonly string[]>>;
type PracticePlanSort = (typeof PRACTICE_PLAN_APPROVED_SORTS)[number];

interface DatabaseCase {
  readonly name: string;
  readonly expectedIndex: (typeof PRACTICE_PLAN_INDEX_NAMES)[number];
  readonly activationGate?: true;
  readonly match: mongo.Filter<PracticePlanSyntheticDocument>;
  readonly pipeline: readonly mongo.Document[];
}

interface BrowseWorkload {
  readonly kind: "browse";
  readonly name: string;
  readonly sort?: {
    readonly family: PracticePlanSort;
    readonly direction: "asc" | "desc";
  };
  readonly query:
    | PracticePlanQuery
    | ((scale: PracticePlanScale) => PracticePlanQuery);
  readonly correct: (
    items: readonly PracticePlanSyntheticSummary[],
    corpus: PracticePlanSyntheticCorpus,
  ) => boolean;
  readonly expectedTotal?: (scale: PracticePlanScale) => number;
  readonly database?: DatabaseCase;
  readonly plannerException?: "unanchored-search";
}

interface FacetWorkload {
  readonly kind: "facet";
  readonly name: string;
  readonly facet: "tags";
  readonly expectedItems: (scale: PracticePlanScale) => readonly string[];
  readonly plannerException: "low-selectivity-facet";
}

type PracticePlanWorkload = BrowseWorkload | FacetWorkload;

function legacyMissingPrivacyNumber(number: number): boolean {
  return number % 11 === 0;
}

function privateNumber(number: number): boolean {
  return number % 4 === 0 && !legacyMissingPrivacyNumber(number);
}

function ownerNumber(number: number): boolean {
  return number % 8 === 0;
}

function emptySectionsNumber(number: number): boolean {
  return number % 7 === 0;
}

function tieNumber(number: number): boolean {
  return number % 17 === 0;
}

function missingDescriptionNumber(number: number): boolean {
  return number % 5 === 0;
}

function visiblePracticePlan(scale: PracticePlanScale, number: number): boolean {
  return (
    !privateNumber(number) ||
    ownerNumber(number) ||
    number < scale.grantsPerActor
  );
}

export function expectedPracticePlanSectionCount(number: number): number {
  return emptySectionsNumber(number) ? 0 : 3;
}

export function expectedPracticePlanDurationMinutes(number: number): number {
  return emptySectionsNumber(number) ? 0 : 35 + (number % 3) * 10;
}

export function syntheticPracticePlanCreationTime(number: number): number {
  return Date.UTC(2020, 0, 1 + (number % 365));
}

export function syntheticPracticePlanUpdateTime(number: number): number {
  return Date.UTC(2024, 0, 1 + (number % 365));
}

export function syntheticPracticePlanTags(number: number): readonly string[] {
  return [
    number % 2 === 0 ? "synthetic" : "Synthetic",
    `Tag ${number % 40}`,
    number % 3 === 0 ? "Attack" : "Defence",
  ];
}

export function syntheticPracticePlanDocument(
  _id: mongo.ObjectId,
  number: number,
  actor: mongo.ObjectId,
): PracticePlanSyntheticDocument {
  return {
    _id,
    name: tieNumber(number) ? "Deterministic Tie" : `Plan ${number}`,
    ...(missingDescriptionNumber(number)
      ? {}
      : { description: `Synthetic plan description ${number}` }),
    tags: syntheticPracticePlanTags(number),
    ...(legacyMissingPrivacyNumber(number)
      ? {}
      : { isPrivate: privateNumber(number) }),
    user: ownerNumber(number)
      ? actor
      : new mongo.ObjectId(
          number.toString(16).padStart(24, "0").slice(-24),
        ),
    sections: emptySectionsNumber(number)
      ? []
      : [
          { name: "Warm Up", targetDuration: 10, groups: [] },
          {
            name: "Main",
            targetDuration: 10 + (number % 3) * 10,
            groups: [
              {
                name: "Drills",
                items: [
                  {
                    kind: "break",
                    description: "Water break".repeat(8),
                    duration: 5,
                  },
                  {
                    kind: "exercise",
                    exerciseId: _id.toString(),
                    blockId: _id.toString(),
                    duration: 10,
                  },
                ],
              },
            ],
          },
          { name: "Cooldown", targetDuration: 15, groups: [] },
        ],
    createdAt: new Date(syntheticPracticePlanCreationTime(number)),
    updatedAt: new Date(syntheticPracticePlanUpdateTime(number)),
  };
}

const nameCollator = new Intl.Collator("en", {
  sensitivity: "accent",
  numeric: true,
});

function idOrder(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function sortedByName(
  items: readonly PracticePlanSyntheticSummary[],
  direction: "asc" | "desc",
): boolean {
  const multiplier = direction === "asc" ? 1 : -1;
  return items.every((item, index) => {
    if (index === 0) return true;
    const previous = items[index - 1];
    const nameOrder =
      nameCollator.compare(previous.name, item.name) * multiplier;
    return (
      nameOrder < 0 || (nameOrder === 0 && idOrder(previous._id, item._id) <= 0)
    );
  });
}

function sortedByDate(
  items: readonly PracticePlanSyntheticSummary[],
  corpus: PracticePlanSyntheticCorpus,
  timeOf: (number: number) => number,
  direction: "asc" | "desc",
): boolean {
  if (items.length !== 100) return false;
  for (let index = 1; index < items.length; index += 1) {
    const previous = items[index - 1];
    const current = items[index];
    const previousNumber = corpus.numberForId(previous._id);
    const currentNumber = corpus.numberForId(current._id);
    if (previousNumber === undefined || currentNumber === undefined) {
      return false;
    }
    const dateOrder =
      (timeOf(previousNumber) - timeOf(currentNumber)) *
      (direction === "asc" ? 1 : -1);
    if (dateOrder > 0 || (dateOrder === 0 && idOrder(previous._id, current._id) > 0)) {
      return false;
    }
  }
  return true;
}

function compareFacetItems(left: string, right: string): number {
  return (
    left.localeCompare(right, "en", { sensitivity: "accent", numeric: true }) ||
    (left < right ? -1 : left > right ? 1 : 0)
  );
}

export function expectedPracticePlanTagFacet(
  scale: PracticePlanScale,
): readonly string[] {
  const displaysByNormalized = new Map<string, Map<string, number>>();
  for (let number = 0; number < scale.resources; number += 1) {
    if (!visiblePracticePlan(scale, number)) continue;
    for (const tag of syntheticPracticePlanTags(number)) {
      const normalized = tag.toLowerCase();
      let displays = displaysByNormalized.get(normalized);
      if (!displays) {
        displays = new Map<string, number>();
        displaysByNormalized.set(normalized, displays);
      }
      displays.set(tag, (displays.get(tag) ?? 0) + 1);
    }
  }
  const preferred: string[] = [];
  for (const displays of displaysByNormalized.values()) {
    let selected: { display: string; count: number } | undefined;
    for (const [display, count] of displays) {
      if (
        !selected ||
        count > selected.count ||
        (count === selected.count && display < selected.display)
      ) {
        selected = { display, count };
      }
    }
    if (selected) preferred.push(selected.display);
  }
  return preferred.sort(compareFacetItems);
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

const filteredSortPipeline = (
  match: mongo.Document,
): mongo.Document[] => [
  { $match: match },
  { $sort: { name: 1, _id: 1 } },
  { $limit: 100 },
  { $project: { _id: 1, name: 1 } },
];

const practicePlanWorkloads = [
  {
    kind: "browse",
    name: "practiceplan default name page",
    sort: { family: "name", direction: "asc" },
    query: { limit: "100" },
    correct: (items) => sortedByName(items, "asc"),
    expectedTotal: (scale) =>
      countMatching(scale, (number) => visiblePracticePlan(scale, number)),
    database: {
      name: "practiceplan default indexed page",
      expectedIndex: "cq_practiceplans_name",
      activationGate: true,
      match: {},
      pipeline: indexedSortPipeline("name", 1),
    },
  },
  {
    kind: "browse",
    name: "practiceplan name descending page",
    sort: { family: "name", direction: "desc" },
    query: { sort: "name", direction: "desc", limit: "100" },
    correct: (items) => sortedByName(items, "desc"),
    database: {
      name: "practiceplan name descending indexed page",
      expectedIndex: "cq_practiceplans_name",
      match: {},
      pipeline: indexedSortPipeline("name", -1),
    },
  },
  {
    kind: "browse",
    name: "practiceplan created ascending page",
    sort: { family: "created", direction: "asc" },
    query: { sort: "created", direction: "asc", limit: "100" },
    correct: (items, corpus) =>
      sortedByDate(items, corpus, syntheticPracticePlanCreationTime, "asc"),
    database: {
      name: "practiceplan created ascending indexed page",
      expectedIndex: "cq_practiceplans_created",
      match: {},
      pipeline: indexedSortPipeline("createdAt", 1),
    },
  },
  {
    kind: "browse",
    name: "practiceplan created descending page",
    sort: { family: "created", direction: "desc" },
    query: { sort: "created", direction: "desc", limit: "100" },
    correct: (items, corpus) =>
      sortedByDate(items, corpus, syntheticPracticePlanCreationTime, "desc"),
    database: {
      name: "practiceplan created descending indexed page",
      expectedIndex: "cq_practiceplans_created",
      match: {},
      pipeline: indexedSortPipeline("createdAt", -1),
    },
  },
  {
    kind: "browse",
    name: "practiceplan updated ascending page",
    sort: { family: "updated", direction: "asc" },
    query: { sort: "updated", direction: "asc", limit: "100" },
    correct: (items, corpus) =>
      sortedByDate(items, corpus, syntheticPracticePlanUpdateTime, "asc"),
    database: {
      name: "practiceplan updated ascending indexed page",
      expectedIndex: "cq_practiceplans_updated",
      match: {},
      pipeline: indexedSortPipeline("updatedAt", 1),
    },
  },
  {
    kind: "browse",
    name: "practiceplan updated descending page",
    sort: { family: "updated", direction: "desc" },
    query: { sort: "updated", direction: "desc", limit: "100" },
    correct: (items, corpus) =>
      sortedByDate(items, corpus, syntheticPracticePlanUpdateTime, "desc"),
    database: {
      name: "practiceplan updated descending indexed page",
      expectedIndex: "cq_practiceplans_updated",
      match: {},
      pipeline: indexedSortPipeline("updatedAt", -1),
    },
  },
  {
    kind: "browse",
    name: "practiceplan literal substring search",
    query: { search: "Plan 10", limit: "100" },
    correct: (items) =>
      items.length > 0 && items.every((item) => /plan 10/i.test(item.name)),
    plannerException: "unanchored-search",
  },
  {
    kind: "browse",
    name: "practiceplan tags any",
    query: { tags: ["Attack", "Missing"], tagMode: "any", limit: "100" },
    correct: (items) =>
      items.length === 100 &&
      items.every((item) =>
        item.tags.some((tag) => tag.toLowerCase() === "attack"),
      ),
    expectedTotal: (scale) =>
      countMatching(
        scale,
        (number) => visiblePracticePlan(scale, number) && number % 3 === 0,
      ),
    database: {
      name: "practiceplan tags filtered page",
      expectedIndex: "cq_practiceplans_tags",
      match: { tags: /^Attack$/i },
      pipeline: filteredSortPipeline({ tags: /^Attack$/i }),
    },
  },
  {
    kind: "browse",
    name: "practiceplan tags all",
    query: { tags: ["Synthetic", "Attack"], tagMode: "all", limit: "100" },
    correct: (items) =>
      items.length > 0 &&
      items.every((item) =>
        ["synthetic", "attack"].every((selected) =>
          item.tags.some((tag) => tag.toLowerCase() === selected),
        ),
      ),
    expectedTotal: (scale) =>
      countMatching(
        scale,
        (number) => visiblePracticePlan(scale, number) && number % 3 === 0,
      ),
  },
  {
    kind: "browse",
    name: "practiceplan privacy private narrowing",
    query: { privacy: "private", limit: "100" },
    correct: (items) =>
      items.length === 100 && items.every((item) => item.isPrivate === true),
    expectedTotal: (scale) =>
      countMatching(
        scale,
        (number) => visiblePracticePlan(scale, number) && privateNumber(number),
      ),
    database: {
      name: "practiceplan owner filtered page",
      expectedIndex: "cq_practiceplans_owner",
      match: {
        user: new mongo.ObjectId("000000000000000000000001"),
      },
      pipeline: filteredSortPipeline({
        user: new mongo.ObjectId("000000000000000000000001"),
      }),
    },
  },
  {
    kind: "browse",
    name: "practiceplan privacy public narrowing",
    query: { privacy: "public", limit: "100" },
    correct: (items) =>
      items.length === 100 && items.every((item) => item.isPrivate === false),
    expectedTotal: (scale) =>
      countMatching(
        scale,
        (number) => visiblePracticePlan(scale, number) && !privateNumber(number),
      ),
    database: {
      name: "practiceplan privacy filtered page",
      expectedIndex: "cq_practiceplans_privacy",
      match: { isPrivate: false },
      pipeline: filteredSortPipeline({ isPrivate: false }),
    },
  },
  {
    kind: "browse",
    name: "practiceplan empty beyond-end page",
    query: (scale) => ({
      page: String(
        Math.ceil(
          countMatching(scale, (number) =>
            visiblePracticePlan(scale, number),
          ) / 100,
        ) + 1,
      ),
      limit: "100",
    }),
    correct: (items) => items.length === 0,
    expectedTotal: (scale) =>
      countMatching(scale, (number) => visiblePracticePlan(scale, number)),
  },
  {
    kind: "facet",
    name: "practiceplan tags facet",
    facet: "tags",
    expectedItems: expectedPracticePlanTagFacet,
    plannerException: "low-selectivity-facet",
  },
] as const satisfies readonly PracticePlanWorkload[];

const browseWorkloads = practicePlanWorkloads.filter(
  (
    workload,
  ): workload is (typeof practicePlanWorkloads)[number] & BrowseWorkload =>
    workload.kind === "browse",
);
const facetWorkloads = practicePlanWorkloads.filter(
  (
    workload,
  ): workload is (typeof practicePlanWorkloads)[number] & FacetWorkload =>
    workload.kind === "facet",
);
const databaseWorkloads = browseWorkloads.filter(
  (
    workload,
  ): workload is (typeof browseWorkloads)[number] & {
    readonly database: DatabaseCase;
  } => workload.database !== undefined,
);

export const PRACTICE_PLAN_WORKLOAD_NAMES = Object.freeze(
  practicePlanWorkloads.map((workload) => workload.name),
);
export const PRACTICE_PLAN_DATABASE_WORKLOADS = Object.freeze(
  databaseWorkloads.map((workload) => ({
    name: workload.database.name,
    expectedIndex: workload.database.expectedIndex,
    activationGate: workload.database.activationGate === true,
  })),
);
export const PRACTICE_PLAN_DATABASE_WORKLOAD_NAMES = Object.freeze(
  PRACTICE_PLAN_DATABASE_WORKLOADS.map((workload) => workload.name),
);
export const PRACTICE_PLAN_SORT_COVERAGE = Object.freeze(
  browseWorkloads.flatMap((workload) => (workload.sort ? [workload.sort] : [])),
);

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

export function isPracticePlanSyntheticSummary(
  value: CollectionSummary,
): value is PracticePlanSyntheticSummary {
  return (
    !("sections" in value) &&
    !("shareToken" in value) &&
    !("shareLink" in value) &&
    !("user" in value) &&
    !("creator" in value) &&
    !("createdAt" in value) &&
    !("updatedAt" in value) &&
    "isPrivate" in value &&
    typeof value.isPrivate === "boolean" &&
    "description" in value &&
    isNullableString(value.description) &&
    "sectionCount" in value &&
    typeof value.sectionCount === "number" &&
    "durationMinutes" in value &&
    typeof value.durationMinutes === "number"
  );
}

export function practicePlanBrowseWorkloadCorrect(
  workloadName: string,
  items: readonly CollectionSummary[],
  corpus: PracticePlanSyntheticCorpus,
): boolean {
  const workload = browseWorkloads.find(
    (candidate) => candidate.name === workloadName,
  );
  return (
    workload !== undefined &&
    items.every(isPracticePlanSyntheticSummary) &&
    workload.correct(items, corpus)
  );
}

export function practicePlanFacetWorkloadCorrect(
  workloadName: string,
  items: readonly string[],
  scale: PracticePlanScale,
): boolean {
  const workload = facetWorkloads.find(
    (candidate) => candidate.name === workloadName,
  );
  const expected = workload ? workload.expectedItems(scale) : [];
  return (
    workload !== undefined &&
    items.length === expected.length &&
    items.every((item, index) => item === expected[index])
  );
}

function derivedMetricsMatch(
  items: readonly CollectionSummary[],
  corpus: PracticePlanSyntheticCorpus,
): boolean {
  return items.every((item) => {
    if (!isPracticePlanSyntheticSummary(item)) return false;
    const number = corpus.numberForId(item._id);
    if (number === undefined) return false;
    return (
      item.sectionCount === expectedPracticePlanSectionCount(number) &&
      item.durationMinutes === expectedPracticePlanDurationMinutes(number)
    );
  });
}

async function explainAggregate(
  collection: mongo.Collection<PracticePlanSyntheticDocument>,
  pipeline: readonly mongo.Document[],
): Promise<unknown> {
  return collection
    .aggregate([...pipeline], { collation: COLLATION, maxTimeMS: 1_000 })
    .explain("executionStats");
}

export async function measurePracticePlanSynthetic(
  database: mongo.Db,
  scale: PracticePlanScale,
): Promise<PracticePlanSyntheticEvidence> {
  const plans = database.collection<PracticePlanSyntheticDocument>(
    "practiceplans",
  );
  const accesses = database.collection("practiceplanaccesses");
  const actor = new mongo.ObjectId();
  const ids = Array.from(
    { length: scale.resources },
    () => new mongo.ObjectId(),
  );
  for (let start = 0; start < ids.length; start += 1_000) {
    await plans.insertMany(
      ids
        .slice(start, start + 1_000)
        .map((_id, offset) =>
          syntheticPracticePlanDocument(_id, start + offset, actor),
        ),
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
        .map((practicePlan) => ({
          user: actor,
          practicePlan,
          access: "view",
        })),
    );
  }
  await accesses.createIndex(
    { user: 1, practicePlan: 1 },
    { name: "actor_first_access", unique: true },
  );

  const indexes: SyntheticIndexMeasurement[] = [];
  for (const name of PRACTICE_PLAN_INDEX_NAMES) {
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

  const loadedGrantIds = await loadAllCollectionGrantIds(
    database,
    "practicePlan",
    actor.toString(),
  );
  const visibility = collectionVisibility.publicOwnedOrGranted(
    actor.toString(),
    loadedGrantIds,
  );
  const numberById = new Map(
    ids.map((id, index) => [id.toString(), index] as const),
  );
  const corpus: PracticePlanSyntheticCorpus = {
    numberForId: (id) => numberById.get(id),
  };

  const operations: SyntheticOperationMeasurement[] = [];
  let response100Bytes = 0;
  let summaryOmitsSections = true;
  let derivedMetricsAccurate = true;
  await runWithCollectionDatabase(database, async () => {
    for (const workload of browseWorkloads) {
      const query =
        typeof workload.query === "function"
          ? workload.query(scale)
          : workload.query;
      const intent = parseCollectionQuery("practicePlan", query);
      const times = await operationDurations(() =>
        browse({ intent, visibility }),
      );
      const result = await browse({ intent, visibility });
      if (workload.name === "practiceplan default name page") {
        response100Bytes = mongo.BSON.calculateObjectSize(result);
      }
      summaryOmitsSections =
        summaryOmitsSections && result.items.every(isPracticePlanSyntheticSummary);
      derivedMetricsAccurate =
        derivedMetricsAccurate && derivedMetricsMatch(result.items, corpus);
      operations.push({
        name: workload.name,
        operation: "browse",
        warmP95Ms: percentile95(times),
        maximumMs: Math.max(...times),
        resultCount: result.items.length,
        correct:
          practicePlanBrowseWorkloadCorrect(workload.name, result.items, corpus) &&
          (workload.expectedTotal === undefined ||
            result.pagination.total === workload.expectedTotal(scale)),
        plannerException: workload.plannerException,
      });
    }
    for (const workload of facetWorkloads) {
      const times = await operationDurations(() =>
        listFacet({ resource: "practicePlan", facet: workload.facet, visibility }),
      );
      const result = await listFacet({
        resource: "practicePlan",
        facet: workload.facet,
        visibility,
      });
      operations.push({
        name: workload.name,
        operation: "facet",
        warmP95Ms: percentile95(times),
        maximumMs: Math.max(...times),
        resultCount: result.items.length,
        correct: practicePlanFacetWorkloadCorrect(
          workload.name,
          result.items,
          scale,
        ),
        plannerException: workload.plannerException,
      });
    }
  });

  const databaseOperations: SyntheticDatabaseMeasurement[] = [];
  const planners: SyntheticPlannerMeasurement[] = [];
  for (const workload of databaseWorkloads) {
    const countTimes = await operationDurations(() =>
      plans.countDocuments(workload.database.match, { maxTimeMS: 1_000 }),
    );
    const pageTimes = await operationDurations(() =>
      plans
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
      plans,
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
    documentsWithLegacyMissingPrivacy: countMatching(
      scale,
      legacyMissingPrivacyNumber,
    ),
    documentsWithEmptySections: countMatching(scale, emptySectionsNumber),
    documentsWithMissingDescription: countMatching(
      scale,
      missingDescriptionNumber,
    ),
    documentsWithSections: countMatching(
      scale,
      (number) => !emptySectionsNumber(number),
    ),
    deterministicTieDocuments: countMatching(scale, tieNumber),
    summaryOmitsSections,
    derivedMetricsAccurate,
    response100Bytes,
    grantIdsBytes: mongo.BSON.calculateObjectSize({
      ids: visibility.grantedResourceIds,
    }),
    grantIdsLoaded: visibility.grantedResourceIds.length,
    operations,
    databaseOperations,
    planners,
    indexes,
  };
}
