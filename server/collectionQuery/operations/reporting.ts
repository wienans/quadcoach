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

export function summarizeExplain(explain: unknown): ExplainSummary {
  const stages = valuesFor(explain, "stage").filter(
    (stage): stage is string => typeof stage === "string",
  );
  return {
    winningStages: [...new Set(stages)].sort(),
    totalDocsExamined: numericMaximum(explain, "totalDocsExamined"),
    totalKeysExamined: numericMaximum(explain, "totalKeysExamined"),
    returned: numericMaximum(explain, "nReturned"),
    collectionScan: stages.includes("COLLSCAN"),
    blockingSort: stages.includes("SORT"),
    spilled: valuesFor(explain, "usedDisk").includes(true),
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
