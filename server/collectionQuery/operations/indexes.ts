import { performance } from "node:perf_hooks";
import { mongo } from "mongoose";

import { summarizeExplain } from "./reporting";

const collation = { locale: "en", strength: 2, numericOrdering: true } as const;

export interface CollectionIndexDefinition {
  readonly collection: string;
  readonly key: mongo.IndexSpecification;
  readonly options: mongo.CreateIndexesOptions;
  readonly verifySort?: mongo.Sort;
  readonly verifyFilter?: mongo.Filter<mongo.Document>;
}

export const collectionIndexes: Readonly<
  Record<string, CollectionIndexDefinition>
> = Object.freeze({
  cq_exercises_name: {
    collection: "exercises",
    key: { name: 1, _id: 1 },
    options: { name: "cq_exercises_name", collation },
    verifySort: { name: 1, _id: 1 },
  },
  cq_exercises_created: {
    collection: "exercises",
    key: { createdAt: 1, _id: 1 },
    options: { name: "cq_exercises_created" },
    verifySort: { createdAt: 1, _id: 1 },
  },
  cq_exercises_updated: {
    collection: "exercises",
    key: { updatedAt: 1, _id: 1 },
    options: { name: "cq_exercises_updated" },
    verifySort: { updatedAt: 1, _id: 1 },
  },
  cq_exercises_duration: {
    collection: "exercises",
    key: { time_min: 1, _id: 1 },
    options: { name: "cq_exercises_duration" },
    verifySort: { time_min: 1, _id: 1 },
  },
  cq_exercises_persons: {
    collection: "exercises",
    key: { persons: 1, _id: 1 },
    options: { name: "cq_exercises_persons" },
    verifySort: { persons: 1, _id: 1 },
  },
  cq_exercises_tags: {
    collection: "exercises",
    key: { tags: 1 },
    options: { name: "cq_exercises_tags" },
    verifyFilter: { tags: "synthetic" },
  },
  cq_exercises_materials: {
    collection: "exercises",
    key: { materials: 1 },
    options: { name: "cq_exercises_materials" },
    verifyFilter: { materials: "synthetic" },
  },
  cq_tacticboards_name: {
    collection: "tacticboards",
    key: { name: 1, _id: 1 },
    options: { name: "cq_tacticboards_name", collation },
    verifySort: { name: 1, _id: 1 },
  },
  cq_tacticboards_created: {
    collection: "tacticboards",
    key: { createdAt: 1, _id: 1 },
    options: { name: "cq_tacticboards_created" },
    verifySort: { createdAt: 1, _id: 1 },
  },
  cq_tacticboards_updated: {
    collection: "tacticboards",
    key: { updatedAt: 1, _id: 1 },
    options: { name: "cq_tacticboards_updated" },
    verifySort: { updatedAt: 1, _id: 1 },
  },
  cq_tacticboards_privacy: {
    collection: "tacticboards",
    key: { isPrivate: 1, name: 1, _id: 1 },
    options: { name: "cq_tacticboards_privacy", collation },
    verifyFilter: { isPrivate: false },
    verifySort: { name: 1, _id: 1 },
  },
  cq_tacticboards_owner: {
    collection: "tacticboards",
    key: { user: 1, name: 1, _id: 1 },
    options: { name: "cq_tacticboards_owner", collation },
    verifyFilter: { user: new mongo.ObjectId("000000000000000000000000") },
    verifySort: { name: 1, _id: 1 },
  },
  cq_tacticboards_tags: {
    collection: "tacticboards",
    key: { tags: 1 },
    options: { name: "cq_tacticboards_tags" },
    verifyFilter: { tags: "synthetic" },
  },
  cq_practiceplans_name: {
    collection: "practiceplans",
    key: { name: 1, _id: 1 },
    options: { name: "cq_practiceplans_name", collation },
    verifySort: { name: 1, _id: 1 },
  },
  cq_practiceplans_created: {
    collection: "practiceplans",
    key: { createdAt: 1, _id: 1 },
    options: { name: "cq_practiceplans_created" },
    verifySort: { createdAt: 1, _id: 1 },
  },
  cq_practiceplans_updated: {
    collection: "practiceplans",
    key: { updatedAt: 1, _id: 1 },
    options: { name: "cq_practiceplans_updated" },
    verifySort: { updatedAt: 1, _id: 1 },
  },
  cq_practiceplans_privacy: {
    collection: "practiceplans",
    key: { isPrivate: 1, name: 1, _id: 1 },
    options: { name: "cq_practiceplans_privacy", collation },
    verifyFilter: { isPrivate: false },
    verifySort: { name: 1, _id: 1 },
  },
  cq_practiceplans_owner: {
    collection: "practiceplans",
    key: { user: 1, name: 1, _id: 1 },
    options: { name: "cq_practiceplans_owner", collation },
    verifyFilter: { user: new mongo.ObjectId("000000000000000000000000") },
    verifySort: { name: 1, _id: 1 },
  },
  cq_practiceplans_tags: {
    collection: "practiceplans",
    key: { tags: 1 },
    options: { name: "cq_practiceplans_tags" },
    verifyFilter: { tags: "synthetic" },
  },
});

function definition(name: string): CollectionIndexDefinition {
  const selected = collectionIndexes[name];
  if (!selected) throw new Error(`Unknown collection index: ${name}`);
  return selected;
}

async function indexSize(
  database: mongo.Db,
  collection: string,
  name: string,
): Promise<number | null> {
  try {
    const stats = await database.command({
      collStats: collection,
      indexDetails: true,
    });
    const sizes = stats.indexSizes;
    return sizes && typeof sizes === "object" && typeof sizes[name] === "number"
      ? sizes[name]
      : null;
  } catch {
    return null;
  }
}

export async function createCollectionIndex(database: mongo.Db, name: string) {
  const selected = definition(name);
  const started = performance.now();
  await database
    .collection(selected.collection)
    .createIndex(selected.key, selected.options);
  return {
    action: "create" as const,
    name,
    durationMs: Math.round(performance.now() - started),
    sizeBytes: await indexSize(database, selected.collection, name),
  };
}

function planUsesIndex(value: unknown, name: string): boolean {
  if (!value || typeof value !== "object") return false;
  return Object.entries(value).some(
    ([key, nested]) =>
      (key === "indexName" && nested === name) || planUsesIndex(nested, name),
  );
}

export function winningPlanUsesIndex(
  explanation: unknown,
  name: string,
): boolean {
  if (!explanation || typeof explanation !== "object") return false;
  const queryPlanner = (explanation as { queryPlanner?: unknown }).queryPlanner;
  if (!queryPlanner || typeof queryPlanner !== "object") return false;
  const winningPlan = (queryPlanner as { winningPlan?: unknown }).winningPlan;
  return planUsesIndex(winningPlan, name);
}

export async function verifyCollectionIndex(database: mongo.Db, name: string) {
  const selected = definition(name);
  const collection = database.collection(selected.collection);
  let cursor = collection.find(selected.verifyFilter ?? {}).limit(50);
  if (selected.verifySort) cursor = cursor.sort(selected.verifySort);
  if (selected.options.collation)
    cursor = cursor.collation(selected.options.collation);
  const explanation = await cursor.explain("executionStats");
  const summary = summarizeExplain(explanation);
  return {
    action: "verify" as const,
    name,
    selected: winningPlanUsesIndex(explanation, name),
    summary,
  };
}

export async function dropCollectionIndex(database: mongo.Db, name: string) {
  const selected = definition(name);
  const started = performance.now();
  await database.collection(selected.collection).dropIndex(name);
  return {
    action: "drop" as const,
    name,
    durationMs: Math.round(performance.now() - started),
  };
}
