import mongoose, { mongo } from "mongoose";

import { browse, parseCollectionQuery } from "../../collectionQuery";
import { collectionVisibility } from "../../collectionQuery/types";

describe("issue 146 Exercise collection Mongo contract", () => {
  it.each([
    ["name", "asc", ["Alpha", "Exercise 2", "Exercise 10", "Zulu"]],
    ["name", "desc", ["Zulu", "Exercise 10", "Exercise 2", "Alpha"]],
    ["created", "asc", ["Exercise 2", "Exercise 10", "Alpha", "Zulu"]],
    ["created", "desc", ["Zulu", "Alpha", "Exercise 10", "Exercise 2"]],
    ["updated", "asc", ["Zulu", "Exercise 10", "Alpha", "Exercise 2"]],
    ["updated", "desc", ["Exercise 2", "Alpha", "Exercise 10", "Zulu"]],
    ["duration", "asc", ["Exercise 2", "Exercise 10", "Zulu", "Alpha"]],
    ["duration", "desc", ["Zulu", "Exercise 10", "Exercise 2", "Alpha"]],
    ["persons", "asc", ["Exercise 2", "Exercise 10", "Zulu", "Alpha"]],
    ["persons", "desc", ["Zulu", "Exercise 10", "Exercise 2", "Alpha"]],
  ] as const)(
    "sorts by %s %s with natural names and missing metrics last",
    async (sort, direction, expected) => {
      const database = mongoose.connection.db!;
      const dates = [1, 2, 3, 4].map(
        (day) => new Date(`2026-01-0${day}T00:00:00Z`),
      );
      await database.collection("exercises").insertMany([
        { name: "Alpha", createdAt: dates[2], updatedAt: dates[2] },
        {
          name: "Exercise 10",
          time_min: 10,
          persons: 10,
          createdAt: dates[1],
          updatedAt: dates[1],
        },
        {
          name: "Exercise 2",
          time_min: 2,
          persons: 2,
          createdAt: dates[0],
          updatedAt: dates[3],
        },
        {
          name: "Zulu",
          time_min: 20,
          persons: 20,
          createdAt: dates[3],
          updatedAt: dates[0],
        },
      ]);

      const result = await browse({
        intent: parseCollectionQuery("exercise", { sort, direction }),
        visibility: collectionVisibility.all(),
      });
      expect(result.items.map((item) => item.name)).toEqual(expected);
    },
  );

  it("uses ascending IDs as deterministic ties on first and deep pages", async () => {
    const ids = [
      new mongo.ObjectId("000000000000000000000003"),
      new mongo.ObjectId("000000000000000000000001"),
      new mongo.ObjectId("000000000000000000000002"),
    ];
    await mongoose.connection
      .db!.collection("exercises")
      .insertMany(ids.map((_id) => ({ _id, name: "Same", persons: 4 })));

    const first = await browse({
      intent: parseCollectionQuery("exercise", { limit: "2" }),
      visibility: collectionVisibility.all(),
    });
    const deep = await browse({
      intent: parseCollectionQuery("exercise", { page: "2", limit: "2" }),
      visibility: collectionVisibility.all(),
    });

    expect(first.items.map((item) => item._id)).toEqual([
      "000000000000000000000001",
      "000000000000000000000002",
    ]);
    expect(deep.items.map((item) => item._id)).toEqual([
      "000000000000000000000003",
    ]);
    expect(first.pagination.total).toBe(3);
    expect(deep.pagination.total).toBe(3);
  });
});
