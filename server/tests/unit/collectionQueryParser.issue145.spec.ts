import {
  CollectionQueryValidationError,
  parseCollectionFacetQuery,
  parseCollectionQuery,
} from "../../collectionQuery";

function errorsFor(
  resource: "exercise" | "tacticBoard" | "practicePlan",
  query: Record<string, unknown>,
) {
  try {
    parseCollectionQuery(resource, query);
    throw new Error("Expected validation failure");
  } catch (error) {
    expect(error).toBeInstanceOf(CollectionQueryValidationError);
    return (error as CollectionQueryValidationError).serialize();
  }
}

describe("collection query transport parser", () => {
  it("applies one-based defaults and produces branded semantic intent", () => {
    expect(parseCollectionQuery("exercise", {})).toMatchObject({
      resource: "exercise",
      sort: { by: "name", direction: "asc" },
      page: 1,
      limit: 50,
    });
  });

  it("rejects the whole request with the exact error envelope", () => {
    expect(
      errorsFor("exercise", {
        mystery: "x",
        search: " ",
        page: ["1", "2"],
        limit: "101",
        sort: "user",
      }),
    ).toEqual({
      message: "Invalid collection query",
      errors: [
        { field: "mystery", code: "unknown" },
        { field: "search", code: "blank" },
        { field: "page", code: "duplicate" },
        { field: "limit", code: "outOfRange" },
        { field: "sort", code: "unsupported" },
      ],
    });
  });

  it("enforces search/value/set bounds and normalized uniqueness", () => {
    expect(
      errorsFor("exercise", {
        search: "x".repeat(201),
        tags: ["Fast", " fast ", "x".repeat(101)],
        materials: Array.from({ length: 21 }, (_, index) => `m${index}`),
      }).errors,
    ).toEqual([
      { field: "search", code: "outOfRange" },
      { field: "tags", code: "duplicate" },
      { field: "tags", code: "outOfRange" },
      { field: "materials", code: "outOfRange" },
    ]);
  });

  it("accepts repeated unique sets and rejects malformed ranges", () => {
    expect(
      parseCollectionQuery("exercise", {
        tags: ["Passing", "Beaters"],
        tagMode: "any",
        durationMin: "5",
        durationMax: "10",
        sort: "duration",
        direction: "desc",
      }),
    ).toMatchObject({
      tags: { values: ["Passing", "Beaters"], mode: "any" },
      duration: { minimum: 5, maximum: 10 },
      sort: { by: "duration", direction: "desc" },
    });

    expect(
      errorsFor("exercise", {
        personsMin: "4",
        personsMax: "3",
        beatersMin: "-1",
        chasersMax: "1.5",
      }).errors,
    ).toEqual([
      { field: "persons", code: "outOfRange" },
      { field: "beatersMin", code: "malformed" },
      { field: "chasersMax", code: "malformed" },
    ]);
  });

  it("keeps resource vocabularies closed", () => {
    expect(
      errorsFor("tacticBoard", { materials: "cones", privacy: "secret" })
        .errors,
    ).toEqual([
      { field: "materials", code: "unknown" },
      { field: "privacy", code: "unsupported" },
    ]);
    expect(
      parseCollectionQuery("practicePlan", { privacy: "private" }),
    ).toMatchObject({
      privacy: "private",
    });
    expect(errorsFor("exercise", { tags: [], tagMode: "all" }).errors).toEqual([
      { field: "tags", code: "malformed" },
    ]);
    expect(errorsFor("exercise", { materialMode: "any" }).errors).toEqual([
      { field: "materialMode", code: "unsupported" },
    ]);
  });

  it("rejects unsafe page and limit integers as out of range", () => {
    expect(errorsFor("exercise", { page: "9007199254740992" }).errors).toEqual([
      { field: "page", code: "outOfRange" },
    ]);
    expect(errorsFor("exercise", { limit: "9007199254740992" }).errors).toEqual(
      [{ field: "limit", code: "outOfRange" }],
    );
  });

  it("rejects unsafe pagination skip arithmetic at the exact boundary", () => {
    const maximumSafePageAtLimit100 =
      Math.floor(Number.MAX_SAFE_INTEGER / 100) + 1;
    expect(
      parseCollectionQuery("exercise", {
        page: String(maximumSafePageAtLimit100),
        limit: "100",
      }),
    ).toMatchObject({ page: maximumSafePageAtLimit100, limit: 100 });
    expect(
      errorsFor("exercise", {
        page: String(maximumSafePageAtLimit100 + 1),
        limit: "100",
      }).errors,
    ).toEqual([{ field: "page", code: "outOfRange" }]);
    expect(
      parseCollectionQuery("exercise", {
        page: String(Number.MAX_SAFE_INTEGER),
        limit: "1",
      }),
    ).toMatchObject({ page: Number.MAX_SAFE_INTEGER, limit: 1 });
  });

  it("deeply freezes every parsed semantic value", () => {
    const intent = parseCollectionQuery("exercise", {
      tags: ["Passing", "Beaters"],
      materials: "cones",
      personsMin: "2",
      personsMax: "8",
    });
    expect(Object.isFrozen(intent)).toBe(true);
    expect(Object.isFrozen(intent.sort)).toBe(true);
    expect(Object.isFrozen(intent.tags)).toBe(true);
    expect(Object.isFrozen(intent.tags?.values)).toBe(true);
    if (intent.resource !== "exercise")
      throw new Error("Expected Exercise intent");
    expect(Object.isFrozen(intent.materials)).toBe(true);
    expect(Object.isFrozen(intent.materials?.values)).toBe(true);
    expect(Object.isFrozen(intent.persons)).toBe(true);
    expect(() =>
      (intent.tags?.values as string[] | undefined)?.push("Mutable"),
    ).toThrow(TypeError);
    expect(() => {
      (intent.sort as { by: string }).by = "updated";
    }).toThrow(TypeError);
    expect(() => {
      (intent.persons as { minimum?: number }).minimum = 0;
    }).toThrow(TypeError);
  });

  it("accepts only an empty facet query", () => {
    expect(parseCollectionFacetQuery({})).toBeUndefined();
    expect(() =>
      parseCollectionFacetQuery({ regex: ".*", search: "cone" }),
    ).toThrow(
      expect.objectContaining({
        errors: [
          { field: "regex", code: "unknown" },
          { field: "search", code: "unknown" },
        ],
      }),
    );
  });
});
