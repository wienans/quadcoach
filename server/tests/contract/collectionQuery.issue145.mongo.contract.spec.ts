import mongoose, { mongo } from "mongoose";

import { browse, listFacet, parseCollectionQuery } from "../../collectionQuery";
import { collectionVisibility } from "../../collectionQuery/types";

describe("collection query Mongo contract", () => {
  it("composes visibility, literal search, fixed projection and exact totals", async () => {
    const database = mongoose.connection.db!;
    const owner = new mongo.ObjectId();
    const granted = new mongo.ObjectId();
    await database.collection("tacticboards").insertMany([
      {
        _id: new mongo.ObjectId(),
        name: "Public other",
        isPrivate: false,
        tags: ["Attack"],
        pages: [{ secret: true }],
        shareToken: "must-not-leak",
      },
      {
        _id: new mongo.ObjectId(),
        name: "Owned [setup].*",
        isPrivate: true,
        user: owner,
        tags: ["Setup"],
        pages: [{ secret: true }],
      },
      {
        _id: granted,
        name: "Granted [setup].*",
        isPrivate: true,
        tags: ["Setup"],
        shareToken: "not-discovery-authority",
      },
      {
        _id: new mongo.ObjectId(),
        name: "Hidden [setup]xx",
        isPrivate: true,
        tags: ["Hidden"],
        shareToken: "possessing-this-does-not-discover-it",
      },
    ]);
    const result = await browse({
      intent: parseCollectionQuery("tacticBoard", { search: "[setup].*" }),
      visibility: collectionVisibility.publicOwnedOrGranted(owner.toString(), [
        granted.toString(),
      ]),
    });

    expect(result.pagination).toEqual({
      page: 1,
      limit: 50,
      total: 2,
      pages: 1,
    });
    expect(result.items.map((item) => item.name)).toEqual([
      "Granted [setup].*",
      "Owned [setup].*",
    ]);
    expect(result.items[0]).not.toHaveProperty("pages");
    expect(result.items[0]).not.toHaveProperty("shareToken");
  });

  it("filters semantic sets/ranges and sorts missing metrics last both ways", async () => {
    const database = mongoose.connection.db!;
    await database.collection("exercises").insertMany([
      { name: "Unknown", tags: ["FAST"], materials: ["Cone"] },
      {
        name: "Ten",
        tags: ["Fast", "Pass"],
        materials: ["cone"],
        time_min: 10,
        persons: 8,
      },
      {
        name: "Five",
        tags: ["fast"],
        materials: ["CONE"],
        time_min: 5,
        persons: 4,
      },
    ]);
    const visible = collectionVisibility.all();

    for (const direction of ["asc", "desc"] as const) {
      const result = await browse({
        intent: parseCollectionQuery("exercise", {
          tags: "fast",
          materials: "cone",
          sort: "duration",
          direction,
        }),
        visibility: visible,
      });
      expect(result.items.map((item) => item.name)).toEqual(
        direction === "asc"
          ? ["Five", "Ten", "Unknown"]
          : ["Ten", "Five", "Unknown"],
      );
    }

    const bounded = await browse({
      intent: parseCollectionQuery("exercise", {
        durationMin: "6",
        personsMax: "10",
      }),
      visibility: visible,
    });
    expect(bounded.items.map((item) => item.name)).toEqual(["Ten"]);
    expect(bounded.items[0]).not.toHaveProperty("description_blocks");
  });

  it("supports stable pages, successful beyond-end pages, and derived plan summaries", async () => {
    const database = mongoose.connection.db!;
    await database.collection("practiceplans").insertMany([
      {
        name: "Plan 10",
        tags: [],
        isPrivate: false,
        sections: [{ targetDuration: 30 }, { targetDuration: 20 }],
      },
      { name: "Plan 2", tags: [], isPrivate: false, sections: [] },
    ]);
    const first = await browse({
      intent: parseCollectionQuery("practicePlan", { limit: "1" }),
      visibility: collectionVisibility.public(),
    });
    expect(first.items[0]).toMatchObject({
      name: "Plan 2",
      sectionCount: 0,
      durationMinutes: 0,
    });
    expect(first.items[0]).not.toHaveProperty("sections");
    expect(first.pagination).toEqual({ page: 1, limit: 1, total: 2, pages: 2 });

    const beyond = await browse({
      intent: parseCollectionQuery("practicePlan", { page: "9", limit: "1" }),
      visibility: collectionVisibility.public(),
    });
    expect(beyond.items).toEqual([]);
    expect(beyond.pagination.total).toBe(2);
  });

  it("facets only visible resources and chooses most-frequent casing deterministically", async () => {
    const database = mongoose.connection.db!;
    await database.collection("tacticboards").insertMany([
      { name: "A", isPrivate: false, tags: ["Attack", "Zone"] },
      { name: "B", isPrivate: false, tags: ["attack", "zone"] },
      { name: "C", isPrivate: false, tags: ["Attack"] },
      { name: "Hidden", isPrivate: true, tags: ["Secret"] },
    ]);
    const result = await listFacet({
      resource: "tacticBoard",
      facet: "tags",
      visibility: collectionVisibility.public(),
    });
    expect(result).toEqual({ items: ["Attack", "Zone"] });
  });

  it("chooses facet spelling by frequency independent of insertion order", async () => {
    const database = mongoose.connection.db!;
    await database.collection("tacticboards").insertMany([
      { name: "First", isPrivate: false, tags: ["attack"] },
      { name: "Second", isPrivate: false, tags: ["Attack"] },
      { name: "Third", isPrivate: false, tags: ["Attack"] },
    ]);
    await expect(
      listFacet({
        resource: "tacticBoard",
        facet: "tags",
        visibility: collectionVisibility.public(),
      }),
    ).resolves.toEqual({ items: ["Attack"] });
  });

  it("uses a deterministic binary tie for equally frequent facet spellings", async () => {
    const database = mongoose.connection.db!;
    await database.collection("tacticboards").insertMany([
      { name: "First", isPrivate: false, tags: ["zone"] },
      { name: "Second", isPrivate: false, tags: ["Zone"] },
    ]);
    await expect(
      listFacet({
        resource: "tacticBoard",
        facet: "tags",
        visibility: collectionVisibility.public(),
      }),
    ).resolves.toEqual({ items: ["Zone"] });
  });

  it("rejects unbranded semantics and sanitizes infrastructure failures", async () => {
    await expect(
      browse({
        intent: { resource: "exercise" } as never,
        visibility: collectionVisibility.all(),
      }),
    ).rejects.toThrow("not produced by the transport parser");

    const intent = parseCollectionQuery("exercise", {});
    const spy = jest
      .spyOn(mongo.Collection.prototype, "countDocuments")
      .mockRejectedValueOnce(new Error("mongodb://user:password@private-host"));
    await expect(
      browse({ intent, visibility: collectionVisibility.all() }),
    ).rejects.toThrow("Collection query unavailable");
    spy.mockRestore();
  });
});
