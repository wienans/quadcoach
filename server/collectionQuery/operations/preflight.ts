import { mongo } from "mongoose";

import { summarizeExplain } from "./reporting";

const resources = ["exercises", "tacticboards", "practiceplans"] as const;
const accesses = [
  "exerciseaccesses",
  "tacticboardaccesses",
  "practiceplanaccesses",
] as const;

export interface PreflightReport {
  readonly generatedAt: string;
  readonly readOnly: true;
  readonly collections: Readonly<
    Record<
      string,
      {
        readonly cardinality: number;
        readonly indexes: readonly {
          readonly name: string;
          readonly key: mongo.Document;
        }[];
        readonly documentBytes: {
          readonly minimum: number;
          readonly average: number;
          readonly maximum: number;
        };
        readonly defaultPlan: ReturnType<typeof summarizeExplain>;
      }
    >
  >;
  readonly grants: Readonly<
    Record<
      string,
      {
        readonly cardinality: number;
        readonly maximumPerActor: number;
        readonly indexes: readonly {
          readonly name: string;
          readonly key: mongo.Document;
          readonly unique: boolean;
        }[];
        readonly actorFirstPlan: ReturnType<typeof summarizeExplain>;
      }
    >
  >;
  readonly checklist: readonly string[];
}

async function documentStatistics(collection: mongo.Collection): Promise<{
  minimum: number;
  average: number;
  maximum: number;
}> {
  const rows = await collection
    .aggregate<{
      minimum: number;
      average: number;
      maximum: number;
    }>(
      [
        { $project: { bytes: { $bsonSize: "$$ROOT" } } },
        {
          $group: {
            _id: null,
            minimum: { $min: "$bytes" },
            average: { $avg: "$bytes" },
            maximum: { $max: "$bytes" },
          },
        },
        {
          $project: {
            _id: 0,
            minimum: 1,
            average: { $round: ["$average", 0] },
            maximum: 1,
          },
        },
      ],
      { maxTimeMS: 5_000 },
    )
    .toArray();
  return rows[0] ?? { minimum: 0, average: 0, maximum: 0 };
}

export async function collectPreflight(
  database: mongo.Db,
): Promise<PreflightReport> {
  const collectionEntries = await Promise.all(
    resources.map(async (name) => {
      const collection = database.collection(name);
      const [cardinality, indexes, sizes, explain] = await Promise.all([
        collection.countDocuments({}, { maxTimeMS: 5_000 }),
        collection
          .listIndexes()
          .toArray()
          .catch((error: unknown) => {
            if (
              error instanceof mongo.MongoServerError &&
              error.codeName === "NamespaceNotFound"
            )
              return [];
            throw error;
          }),
        documentStatistics(collection),
        collection
          .find({}, { projection: { _id: 1, name: 1 }, maxTimeMS: 1_000 })
          .collation({ locale: "en", strength: 2, numericOrdering: true })
          .sort({ name: 1, _id: 1 })
          .limit(50)
          .explain("executionStats"),
      ]);
      return [
        name,
        {
          cardinality,
          indexes: indexes.map((index) => ({
            name: index.name ?? "unnamed",
            key: index.key,
          })),
          documentBytes: sizes,
          defaultPlan: summarizeExplain(explain),
        },
      ] as const;
    }),
  );
  const accessResourceFields: Readonly<
    Record<(typeof accesses)[number], string>
  > = {
    exerciseaccesses: "exercise",
    tacticboardaccesses: "tacticboard",
    practiceplanaccesses: "practicePlan",
  };
  const grantEntries = await Promise.all(
    accesses.map(async (name) => {
      const collection = database.collection(name);
      const resourceField = accessResourceFields[name];
      const [cardinality, maximum, indexes, actorExplain] = await Promise.all([
        collection.countDocuments({}, { maxTimeMS: 5_000 }),
        collection
          .aggregate<{ count: number }>(
            [
              { $group: { _id: "$user", count: { $sum: 1 } } },
              { $sort: { count: -1 } },
              { $limit: 1 },
              { $project: { _id: 0, count: 1 } },
            ],
            { maxTimeMS: 5_000 },
          )
          .toArray(),
        collection
          .listIndexes()
          .toArray()
          .catch((error: unknown) => {
            if (
              error instanceof mongo.MongoServerError &&
              error.codeName === "NamespaceNotFound"
            )
              return [];
            throw error;
          }),
        collection
          .find(
            { user: new mongo.ObjectId("000000000000000000000000") },
            { projection: { _id: 0, [resourceField]: 1 }, maxTimeMS: 1_000 },
          )
          .limit(50)
          .explain("executionStats"),
      ]);
      return [
        name,
        {
          cardinality,
          maximumPerActor: maximum[0]?.count ?? 0,
          indexes: indexes.map((index) => ({
            name: index.name ?? "unnamed",
            key: index.key,
            unique: index.unique === true,
          })),
          actorFirstPlan: summarizeExplain(actorExplain),
        },
      ] as const;
    }),
  );
  return {
    generatedAt: new Date().toISOString(),
    readOnly: true,
    collections: Object.fromEntries(collectionEntries),
    grants: Object.fromEntries(grantEntries),
    checklist: [
      "Confirm the report contains no private document values or credentials.",
      "Run synthetic validation at twice the observed maxima.",
      "Create and verify each proposed index independently before activation.",
      "Pause activation on any failed correctness, latency, scan, sort, spill, size, or grant-memory gate.",
    ],
  };
}
