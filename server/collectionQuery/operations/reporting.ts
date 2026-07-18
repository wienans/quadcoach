/// <reference types="node" />

import process from "node:process";

import { mongo } from "mongoose";

export interface ExplainSummary {
  readonly winningStages: readonly string[];
  readonly totalDocsExamined: number;
  readonly totalKeysExamined: number;
  readonly returned: number;
  readonly collectionScan: boolean;
  readonly blockingSort: boolean;
  readonly spilled: boolean;
}

function valuesFor(value: unknown, key: string): unknown[] {
  if (!value || typeof value !== "object") return [];
  return Object.entries(value).flatMap(([entryKey, entryValue]) => [
    ...(entryKey === key ? [entryValue] : []),
    ...valuesFor(entryValue, key),
  ]);
}

function numericMaximum(value: unknown, key: string): number {
  return Math.max(
    0,
    ...valuesFor(value, key).filter(
      (entry): entry is number => typeof entry === "number",
    ),
  );
}

function objectValuesFor(value: unknown, key: string): object[] {
  return valuesFor(value, key).filter(
    (entry): entry is object => entry !== null && typeof entry === "object",
  );
}

export function summarizeExplain(explain: unknown): ExplainSummary {
  const queryPlanners = objectValuesFor(explain, "queryPlanner") as {
    readonly winningPlan?: unknown;
  }[];
  const executionReports = objectValuesFor(explain, "executionStats") as {
    readonly executionStages?: unknown;
  }[];
  const planEvidence = [
    ...queryPlanners.map((planner) => planner.winningPlan),
    ...executionReports.map((execution) => execution.executionStages),
  ];
  const stages = planEvidence
    .flatMap((value) => valuesFor(value, "stage"))
    .filter((stage): stage is string => typeof stage === "string");
  const executedPipelineSorts = valuesFor(explain, "stages")
    .filter((value): value is unknown[] => Array.isArray(value))
    .flatMap((pipeline) =>
      pipeline.filter(
        (stage): stage is Record<string, unknown> =>
          stage !== null &&
          typeof stage === "object" &&
          Object.prototype.hasOwnProperty.call(stage, "$sort"),
      ),
    )
    .map((stage) => stage.$sort);
  return {
    winningStages: [...new Set(stages)].sort(),
    totalDocsExamined: numericMaximum(executionReports, "totalDocsExamined"),
    totalKeysExamined: numericMaximum(executionReports, "totalKeysExamined"),
    returned: numericMaximum(executionReports, "nReturned"),
    collectionScan: stages.includes("COLLSCAN"),
    blockingSort: stages.includes("SORT") || executedPipelineSorts.length > 0,
    spilled:
      valuesFor(executionReports, "usedDisk").includes(true) ||
      executedPipelineSorts.some((sort) =>
        valuesFor(sort, "usedDisk").includes(true),
      ),
  };
}

export async function connectForOperations(): Promise<{
  readonly client: mongo.MongoClient;
  readonly database: mongo.Db;
}> {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI is required");
  const client = new mongo.MongoClient(uri, {
    serverSelectionTimeoutMS: 10_000,
    appName: "quadcoach-collection-operations",
  });
  await client.connect();
  return { client, database: client.db() };
}
