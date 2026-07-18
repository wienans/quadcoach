import {
  brandIntent,
  CollectionIntent,
  CollectionResource,
  ExerciseIntentInput,
  IntegerRange,
  PrivateResourceIntentInput,
  SelectionMode,
  ValueSelection,
} from "./types";

export type CollectionQueryErrorCode =
  | "unknown"
  | "duplicate"
  | "malformed"
  | "blank"
  | "outOfRange"
  | "unsupported";

export interface CollectionQueryError {
  readonly field: string;
  readonly code: CollectionQueryErrorCode;
}

export interface CollectionQueryErrorEnvelope {
  readonly message: "Invalid collection query";
  readonly errors: readonly CollectionQueryError[];
}

export class CollectionQueryValidationError extends Error {
  readonly statusCode = 400;

  constructor(readonly errors: readonly CollectionQueryError[]) {
    super("Invalid collection query");
    this.name = "CollectionQueryValidationError";
  }

  serialize(): CollectionQueryErrorEnvelope {
    return { message: "Invalid collection query", errors: this.errors };
  }
}

export function parseCollectionFacetQuery(query: Query): void {
  const errors = Object.keys(query)
    .sort()
    .map((field) => ({ field, code: "unknown" as const }));
  if (errors.length) throw new CollectionQueryValidationError(errors);
}

const commonFields = new Set([
  "search",
  "tags",
  "tagMode",
  "sort",
  "direction",
  "page",
  "limit",
]);
const exerciseFields = new Set([
  ...commonFields,
  "materials",
  "materialMode",
  "personsMin",
  "personsMax",
  "durationMin",
  "durationMax",
  "beatersMin",
  "beatersMax",
  "chasersMin",
  "chasersMax",
]);
const privateFields = new Set([...commonFields, "privacy"]);

type Query = Readonly<Record<string, unknown>>;

function valuesOf(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [value];
}

function singleton(
  query: Query,
  field: string,
  errors: CollectionQueryError[],
): string | undefined {
  const value = query[field];
  if (value === undefined) return undefined;
  const values = valuesOf(value);
  if (values.length !== 1) {
    errors.push({ field, code: "duplicate" });
    return undefined;
  }
  if (typeof values[0] !== "string") {
    errors.push({ field, code: "malformed" });
    return undefined;
  }
  const trimmed = values[0].trim();
  if (!trimmed) {
    errors.push({ field, code: "blank" });
    return undefined;
  }
  if (trimmed.length > (field === "search" ? 200 : 100)) {
    errors.push({ field, code: "outOfRange" });
    return undefined;
  }
  return trimmed;
}

function selectedValues(
  query: Query,
  field: "tags" | "materials",
  modeField: "tagMode" | "materialMode",
  errors: CollectionQueryError[],
): ValueSelection | undefined {
  if (query[field] === undefined) {
    if (query[modeField] !== undefined) {
      singleton(query, modeField, errors);
      errors.push({ field: modeField, code: "unsupported" });
    }
    return undefined;
  }
  const rawValues = valuesOf(query[field]);
  if (rawValues.length === 0) errors.push({ field, code: "malformed" });
  const values: string[] = [];
  const normalized = new Set<string>();
  for (const rawValue of rawValues) {
    if (typeof rawValue !== "string") {
      errors.push({ field, code: "malformed" });
      continue;
    }
    const value = rawValue.trim();
    if (!value) {
      errors.push({ field, code: "blank" });
      continue;
    }
    if (value.length > 100) {
      errors.push({ field, code: "outOfRange" });
      continue;
    }
    const key = value.toLocaleLowerCase("en");
    if (normalized.has(key)) {
      errors.push({ field, code: "duplicate" });
      continue;
    }
    normalized.add(key);
    values.push(value);
  }
  if (values.length > 20) errors.push({ field, code: "outOfRange" });
  const rawMode = singleton(query, modeField, errors);
  let mode: SelectionMode = "all";
  if (rawMode && rawMode !== "all" && rawMode !== "any") {
    errors.push({ field: modeField, code: "unsupported" });
  } else if (rawMode === "all" || rawMode === "any") {
    mode = rawMode;
  }
  return { values, mode };
}

function positiveInteger(
  query: Query,
  field: string,
  defaultValue: number,
  maximum: number | undefined,
  errors: CollectionQueryError[],
): number {
  const raw = singleton(query, field, errors);
  if (raw === undefined) return defaultValue;
  if (!/^\d+$/.test(raw)) {
    errors.push({ field, code: "malformed" });
    return defaultValue;
  }
  const value = Number(raw);
  if (
    !Number.isSafeInteger(value) ||
    value < 1 ||
    (maximum !== undefined && value > maximum)
  ) {
    errors.push({ field, code: "outOfRange" });
    return defaultValue;
  }
  return value;
}

function nonnegativeInteger(
  query: Query,
  field: string,
  errors: CollectionQueryError[],
): number | undefined {
  const raw = singleton(query, field, errors);
  if (raw === undefined) return undefined;
  if (!/^\d+$/.test(raw)) {
    errors.push({ field, code: "malformed" });
    return undefined;
  }
  const value = Number(raw);
  if (!Number.isSafeInteger(value)) {
    errors.push({ field, code: "outOfRange" });
    return undefined;
  }
  return value;
}

function range(
  query: Query,
  prefix: "persons" | "duration" | "beaters" | "chasers",
  errors: CollectionQueryError[],
): IntegerRange | undefined {
  const minimum = nonnegativeInteger(query, `${prefix}Min`, errors);
  const maximum = nonnegativeInteger(query, `${prefix}Max`, errors);
  if (minimum !== undefined && maximum !== undefined && minimum > maximum) {
    errors.push({ field: prefix, code: "outOfRange" });
  }
  return minimum === undefined && maximum === undefined
    ? undefined
    : { minimum, maximum };
}

export function parseCollectionQuery(
  resource: CollectionResource,
  query: Query,
): CollectionIntent {
  const errors: CollectionQueryError[] = [];
  const allowed = resource === "exercise" ? exerciseFields : privateFields;
  for (const field of Object.keys(query).sort()) {
    if (!allowed.has(field)) errors.push({ field, code: "unknown" });
  }

  const search = singleton(query, "search", errors);
  const tags = selectedValues(query, "tags", "tagMode", errors);
  const page = positiveInteger(query, "page", 1, undefined, errors);
  const limit = positiveInteger(query, "limit", 50, 100, errors);
  if (!Number.isSafeInteger((page - 1) * limit)) {
    errors.push({ field: "page", code: "outOfRange" });
  }
  const rawSort = singleton(query, "sort", errors) ?? "name";
  const rawDirection = singleton(query, "direction", errors) ?? "asc";
  const commonSorts = ["name", "created", "updated"];
  const allowedSorts =
    resource === "exercise"
      ? [...commonSorts, "duration", "persons"]
      : commonSorts;
  if (!allowedSorts.includes(rawSort)) {
    errors.push({ field: "sort", code: "unsupported" });
  }
  if (rawDirection !== "asc" && rawDirection !== "desc") {
    errors.push({ field: "direction", code: "unsupported" });
  }
  const direction = rawDirection === "desc" ? "desc" : "asc";
  if (resource === "exercise") {
    const by: ExerciseIntentInput["sort"]["by"] =
      rawSort === "created" ||
      rawSort === "updated" ||
      rawSort === "duration" ||
      rawSort === "persons"
        ? rawSort
        : "name";
    const intent: ExerciseIntentInput = {
      resource,
      search,
      tags,
      materials: selectedValues(query, "materials", "materialMode", errors),
      persons: range(query, "persons", errors),
      duration: range(query, "duration", errors),
      beaters: range(query, "beaters", errors),
      chasers: range(query, "chasers", errors),
      sort: { by, direction },
      page,
      limit,
    };
    if (errors.length) throw new CollectionQueryValidationError(errors);
    return brandIntent(intent);
  }

  {
    const privacy = singleton(query, "privacy", errors);
    if (privacy && privacy !== "public" && privacy !== "private") {
      errors.push({ field: "privacy", code: "unsupported" });
    }
    const by: PrivateResourceIntentInput["sort"]["by"] =
      rawSort === "created" || rawSort === "updated" ? rawSort : "name";
    const intent: PrivateResourceIntentInput = {
      resource,
      search,
      tags,
      privacy:
        privacy === "public" || privacy === "private" ? privacy : undefined,
      sort: { by, direction },
      page,
      limit,
    };
    if (errors.length) throw new CollectionQueryValidationError(errors);
    return brandIntent(intent);
  }
}
