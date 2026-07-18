import mongoose, { mongo } from "mongoose";

import { currentCollectionDatabase } from "./internal/databaseContext";

import {
  assertCollectionVisibility,
  assertValidatedIntent,
  CollectionIntent,
  CollectionPage,
  CollectionResource,
  CollectionSummary,
  CollectionVisibility,
  ExerciseIntent,
  IntegerRange,
  PrivateResourceIntent,
  ValueSelection,
} from "./types";

const COLLATION = {
  locale: "en",
  strength: 2,
  numericOrdering: true,
} as const;
const BROWSE_BUDGET_MS = 1_000;
const FACET_BUDGET_MS = 2_000;

type Facet = "tags" | "materials";

interface Adapter {
  readonly collectionName: string;
  readonly ownerField?: string;
  readonly privacyField?: string;
  readonly projection: Readonly<Record<string, 0 | 1>>;
  readonly sortFields: Readonly<Record<string, string>>;
  readonly facets: readonly Facet[];
  map(document: mongo.Document): CollectionSummary;
}

function textArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string")
    : [];
}

function idString(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "toString" in value) {
    return String(value);
  }
  return undefined;
}

function commonSummary(document: mongo.Document): CollectionSummary {
  return {
    _id: idString(document._id) ?? "",
    name: typeof document.name === "string" ? document.name : "",
    tags: textArray(document.tags),
    creator:
      typeof document.creator === "string" ? document.creator : undefined,
    user: idString(document.user),
    createdAt:
      document.createdAt instanceof Date ? document.createdAt : undefined,
    updatedAt:
      document.updatedAt instanceof Date ? document.updatedAt : undefined,
  };
}

const commonProjection = {
  _id: 1,
  name: 1,
  tags: 1,
  creator: 1,
  user: 1,
  createdAt: 1,
  updatedAt: 1,
} as const;

const adapters: Readonly<Record<CollectionResource, Adapter>> = Object.freeze({
  exercise: {
    collectionName: "exercises",
    projection: {
      ...commonProjection,
      materials: 1,
      time_min: 1,
      persons: 1,
      beaters: 1,
      chasers: 1,
      related_to: 1,
    },
    sortFields: {
      name: "name",
      created: "createdAt",
      updated: "updatedAt",
      duration: "time_min",
      persons: "persons",
    },
    facets: ["tags", "materials"],
    map(document) {
      return {
        ...commonSummary(document),
        materials: textArray(document.materials),
        durationMinutes:
          typeof document.time_min === "number" ? document.time_min : null,
        persons: typeof document.persons === "number" ? document.persons : null,
        beaters: typeof document.beaters === "number" ? document.beaters : null,
        chasers: typeof document.chasers === "number" ? document.chasers : null,
        relatedTo: Array.isArray(document.related_to)
          ? document.related_to.map(String)
          : [],
      };
    },
  },
  tacticBoard: {
    collectionName: "tacticboards",
    ownerField: "user",
    privacyField: "isPrivate",
    projection: { ...commonProjection, isPrivate: 1 },
    sortFields: { name: "name", created: "createdAt", updated: "updatedAt" },
    facets: ["tags"],
    map(document) {
      return {
        ...commonSummary(document),
        isPrivate: document.isPrivate === true,
      };
    },
  },
  practicePlan: {
    collectionName: "practiceplans",
    ownerField: "user",
    privacyField: "isPrivate",
    projection: {
      ...commonProjection,
      isPrivate: 1,
      description: 1,
      sections: 1,
    },
    sortFields: { name: "name", created: "createdAt", updated: "updatedAt" },
    facets: ["tags"],
    map(document) {
      const sections = Array.isArray(document.sections)
        ? document.sections
        : [];
      return {
        ...commonSummary(document),
        isPrivate: document.isPrivate === true,
        description:
          typeof document.description === "string"
            ? document.description
            : null,
        sectionCount: sections.length,
        durationMinutes: sections.reduce(
          (total: number, section: unknown) =>
            total +
            (section &&
            typeof section === "object" &&
            "targetDuration" in section &&
            typeof section.targetDuration === "number"
              ? section.targetDuration
              : 0),
          0,
        ),
      };
    },
  },
});

function objectId(value: string): string | mongo.ObjectId {
  return mongo.ObjectId.isValid(value) ? new mongo.ObjectId(value) : value;
}

function visibilityMatch(
  visibility: CollectionVisibility,
  adapter: Adapter,
): mongo.Filter<mongo.Document> {
  if (visibility.kind === "all" || !adapter.privacyField) return {};
  const publicMatch = { [adapter.privacyField]: { $ne: true } };
  if (visibility.kind === "public") return publicMatch;
  return {
    $or: [
      publicMatch,
      { [adapter.ownerField ?? "user"]: objectId(visibility.ownerId) },
      {
        _id: {
          $in: visibility.grantedResourceIds.map(objectId),
        },
      } as mongo.Document,
    ],
  };
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function exactCaseInsensitive(value: string): RegExp {
  return new RegExp(`^${escapeRegex(value)}$`, "i");
}

function selectionMatch(selection: ValueSelection): mongo.Document {
  const expressions = selection.values.map(exactCaseInsensitive);
  return selection.mode === "all"
    ? { $all: expressions }
    : { $in: expressions };
}

function rangeMatch(range: IntegerRange): mongo.Document {
  return {
    ...(range.minimum !== undefined ? { $gte: range.minimum } : {}),
    ...(range.maximum !== undefined ? { $lte: range.maximum } : {}),
  };
}

function callerMatch(intent: CollectionIntent): mongo.Filter<mongo.Document> {
  const match: mongo.Filter<mongo.Document> = {};
  if (intent.search) match.name = new RegExp(escapeRegex(intent.search), "i");
  if (intent.tags) match.tags = selectionMatch(intent.tags);
  if (intent.resource === "exercise") {
    const fields: readonly [
      keyof Pick<
        ExerciseIntent,
        "persons" | "duration" | "beaters" | "chasers"
      >,
      string,
    ][] = [
      ["persons", "persons"],
      ["duration", "time_min"],
      ["beaters", "beaters"],
      ["chasers", "chasers"],
    ];
    if (intent.materials) match.materials = selectionMatch(intent.materials);
    for (const [semanticField, persistenceField] of fields) {
      const selectedRange = intent[semanticField];
      if (selectedRange) match[persistenceField] = rangeMatch(selectedRange);
    }
  } else if (intent.privacy) {
    match.isPrivate = intent.privacy === "private" ? true : { $ne: true };
  }
  return match;
}

function composeMatch(
  visibility: CollectionVisibility,
  adapter: Adapter,
  intent?: CollectionIntent,
): mongo.Filter<mongo.Document> {
  const required = visibilityMatch(visibility, adapter);
  if (!intent) return required;
  const caller = callerMatch(intent);
  return Object.keys(required).length && Object.keys(caller).length
    ? { $and: [required, caller] }
    : { ...required, ...caller };
}

export class CollectionQueryInfrastructureError extends Error {
  readonly statusCode = 500;

  constructor() {
    super("Collection query unavailable");
    this.name = "CollectionQueryInfrastructureError";
  }
}

export interface CollectionQueries {
  browse(request: {
    readonly intent: CollectionIntent;
    readonly visibility: CollectionVisibility;
  }): Promise<CollectionPage>;
  listFacet(request: {
    readonly resource: CollectionResource;
    readonly facet: Facet;
    readonly visibility: CollectionVisibility;
  }): Promise<{ readonly items: readonly string[] }>;
}

function createCollectionQueries(database: mongo.Db): CollectionQueries {
  return {
    async browse({ intent, visibility }) {
      assertValidatedIntent(intent);
      assertCollectionVisibility(visibility);
      const adapter = adapters[intent.resource];
      const collection = database.collection(adapter.collectionName);
      const match = composeMatch(visibility, adapter, intent);
      const sortField = adapter.sortFields[intent.sort.by];
      const direction = intent.sort.direction === "asc" ? 1 : -1;
      const skip = (intent.page - 1) * intent.limit;
      const missingMetricSort =
        intent.resource === "exercise" &&
        (intent.sort.by === "duration" || intent.sort.by === "persons");
      const pipeline: mongo.Document[] = [
        { $match: match },
        ...(missingMetricSort
          ? [
              {
                $set: {
                  __collectionQueryMissing: {
                    $cond: [{ $isNumber: `$${sortField}` }, 0, 1],
                  },
                },
              },
            ]
          : []),
        {
          $sort: {
            ...(missingMetricSort ? { __collectionQueryMissing: 1 } : {}),
            [sortField]: direction,
            _id: 1,
          },
        },
        { $skip: skip },
        { $limit: intent.limit },
        { $project: adapter.projection },
      ];
      try {
        const [total, documents] = await Promise.all([
          collection.countDocuments(match, { maxTimeMS: BROWSE_BUDGET_MS }),
          collection
            .aggregate(pipeline, {
              collation: COLLATION,
              maxTimeMS: BROWSE_BUDGET_MS,
            })
            .toArray(),
        ]);
        return {
          items: documents.map(adapter.map),
          pagination: {
            page: intent.page,
            limit: intent.limit,
            total,
            pages: Math.ceil(total / intent.limit),
          },
        };
      } catch {
        throw new CollectionQueryInfrastructureError();
      }
    },

    async listFacet({ resource, facet, visibility }) {
      assertCollectionVisibility(visibility);
      const adapter = adapters[resource];
      if (!adapter.facets.includes(facet)) {
        throw new TypeError(`Unsupported ${resource} facet`);
      }
      const pipeline: mongo.Document[] = [
        { $match: composeMatch(visibility, adapter) },
        { $unwind: `$${facet}` },
        { $match: { [facet]: { $type: "string", $ne: "" } } },
        {
          $group: {
            _id: {
              normalized: { $toLower: `$${facet}` },
              display: `$${facet}`,
            },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            normalized: "$_id.normalized",
            display: "$_id.display",
            count: 1,
          },
        },
      ];
      try {
        const documents = await database
          .collection(adapter.collectionName)
          .aggregate(pipeline, {
            collation: { locale: "simple" },
            maxTimeMS: FACET_BUDGET_MS,
          })
          .toArray();
        const preferred = new Map<string, { display: string; count: number }>();
        for (const document of documents) {
          if (
            typeof document.normalized !== "string" ||
            typeof document.display !== "string" ||
            typeof document.count !== "number"
          )
            continue;
          const current = preferred.get(document.normalized);
          if (
            !current ||
            document.count > current.count ||
            (document.count === current.count &&
              document.display < current.display)
          ) {
            preferred.set(document.normalized, {
              display: document.display,
              count: document.count,
            });
          }
        }
        return {
          items: [...preferred.values()]
            .map(({ display }) => display)
            .sort(
              (left, right) =>
                left.localeCompare(right, "en", {
                  sensitivity: "accent",
                  numeric: true,
                }) || (left < right ? -1 : left > right ? 1 : 0),
            ),
        };
      } catch {
        throw new CollectionQueryInfrastructureError();
      }
    },
  };
}

function connectedQueries(): CollectionQueries {
  const database = currentCollectionDatabase() ?? mongoose.connection.db;
  if (!database) throw new CollectionQueryInfrastructureError();
  return createCollectionQueries(database);
}

export function browse(
  request: Parameters<CollectionQueries["browse"]>[0],
): Promise<CollectionPage> {
  return connectedQueries().browse(request);
}

export function listFacet(
  request: Parameters<CollectionQueries["listFacet"]>[0],
): Promise<{ readonly items: readonly string[] }> {
  return connectedQueries().listFacet(request);
}

export * from "./parser";
export {
  CollectionIntent,
  CollectionPage,
  CollectionResource,
  CollectionSummary,
  CollectionVisibility,
} from "./types";
