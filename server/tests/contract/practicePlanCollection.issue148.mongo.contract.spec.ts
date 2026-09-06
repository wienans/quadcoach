import mongoose, { mongo } from "mongoose";

import { browse, parseCollectionQuery } from "../../collectionQuery";
import { collectionVisibility } from "../../collectionQuery/types";
import { decideCollectionVisibility } from "../../authorization/collectionVisibility";
import { createVerifiedUser } from "../utils/auth";
import { PracticePlan } from "../../models/practicePlan";
import PracticePlanAccess from "../../models/practicePlanAccess";

describe("issue 148 PracticePlan collection Mongo contract", () => {
  it("computes sectionCount and durationMinutes only for selected-page items", async () => {
    const database = mongoose.connection.db!;
    await database.collection("practiceplans").insertMany([
      {
        name: "Beta",
        description: "Second",
        tags: ["Zone"],
        isPrivate: false,
        sections: [
          { name: "Warm Up", targetDuration: 10, groups: [] },
          { name: "Main", targetDuration: 20, groups: [] },
        ],
      },
      {
        name: "Alpha",
        description: null,
        tags: [],
        isPrivate: false,
        sections: [],
        creator: "must-not-leak",
        createdAt: new Date("2020-01-01T00:00:00Z"),
        updatedAt: new Date("2020-01-02T00:00:00Z"),
      },
    ]);

    const first = await browse({
      intent: parseCollectionQuery("practicePlan", {
        sort: "name",
        direction: "asc",
        limit: "1",
      }),
      visibility: collectionVisibility.public(),
    });

    expect(first.items).toHaveLength(1);
    expect(first.items[0]).toMatchObject({
      name: "Alpha",
      sectionCount: 0,
      durationMinutes: 0,
    });
    for (const field of [
      "sections",
      "shareToken",
      "shareLink",
      "user",
      "creator",
      "createdAt",
      "updatedAt",
      "__v",
    ]) {
      expect(first.items[0]).not.toHaveProperty(field);
    }
    expect(first.pagination).toEqual({ page: 1, limit: 1, total: 2, pages: 2 });

    const aggregateSpy = jest.spyOn(mongo.Collection.prototype, "aggregate");
    await browse({
      intent: parseCollectionQuery("practicePlan", {
        sort: "name",
        direction: "asc",
        limit: "1",
      }),
      visibility: collectionVisibility.public(),
    });
    // Note: countDocuments runs an internal $match/$group aggregation,
    // so select the browse pipeline (the one carrying $project).
    const pipelines = aggregateSpy.mock.calls.map((call) => call[0]) as Record<
      string,
      unknown
    >[][];
    const pipeline = pipelines.find((stages) =>
      stages.some((stage) => "$project" in stage),
    );
    expect(pipeline?.map((stage) => Object.keys(stage)[0])).toEqual([
      "$match",
      "$sort",
      "$skip",
      "$limit",
      "$set",
      "$project",
    ]);
    const project = pipeline?.[pipeline.length - 1]?.["$project"] as
      | Record<string, unknown>
      | undefined;
    expect(project).not.toHaveProperty("shareToken");
    expect(project).not.toHaveProperty("__v");
    expect(project).not.toHaveProperty("user");
    expect(project).not.toHaveProperty("creator");
    expect(project).not.toHaveProperty("createdAt");
    expect(project).not.toHaveProperty("updatedAt");
    // Full sections must not travel Mongo→Node; the card metrics are
    // derived in-aggregation for the selected page only.
    expect(project).not.toHaveProperty("sections");
    expect(project).toHaveProperty("sectionCount");
    expect(project).toHaveProperty("durationMinutes");
    aggregateSpy.mockRestore();

    const second = await browse({
      intent: parseCollectionQuery("practicePlan", {
        sort: "name",
        direction: "asc",
        page: "2",
        limit: "1",
      }),
      visibility: collectionVisibility.public(),
    });
    expect(second.items[0]).toMatchObject({
      name: "Beta",
      sectionCount: 2,
      durationMinutes: 30,
    });
  });

  it("uses ascending IDs as deterministic ties and succeeds empty beyond-end pages", async () => {
    const ids = [
      new mongo.ObjectId("000000000000000000000003"),
      new mongo.ObjectId("000000000000000000000001"),
      new mongo.ObjectId("000000000000000000000002"),
    ];
    await mongoose.connection
      .db!.collection("practiceplans")
      .insertMany(ids.map((_id) => ({ _id, name: "Same", isPrivate: false })));

    const first = await browse({
      intent: parseCollectionQuery("practicePlan", { limit: "2" }),
      visibility: collectionVisibility.public(),
    });
    const deep = await browse({
      intent: parseCollectionQuery("practicePlan", {
        page: "2",
        limit: "2",
      }),
      visibility: collectionVisibility.public(),
    });

    expect(first.items.map((item) => item._id)).toEqual([
      "000000000000000000000001",
      "000000000000000000000002",
    ]);
    expect(deep.items.map((item) => item._id)).toEqual([
      "000000000000000000000003",
    ]);
    expect(deep.pagination).toEqual({ page: 2, limit: 2, total: 3, pages: 2 });
  });

  it("composes visibility from authorization without absorbing Access policy", async () => {
    const { user: owner } = await createVerifiedUser({
      email: "plan_mongo_owner@example.com",
    });
    const { user: viewer } = await createVerifiedUser({
      email: "plan_mongo_viewer@example.com",
    });
    const granted = await PracticePlan.create({
      name: "Granted",
      isPrivate: true,
      user: owner._id,
    });
    await PracticePlan.create({
      name: "Hidden",
      isPrivate: true,
      user: owner._id,
    });
    await PracticePlanAccess.create({
      user: viewer._id,
      practicePlan: granted._id,
      access: "view",
    });

    const visibility = await decideCollectionVisibility("practicePlan", {
      id: viewer._id.toString(),
      roles: ["user"],
    });

    const result = await browse({
      intent: parseCollectionQuery("practicePlan", {}),
      visibility,
    });
    expect(result.items.map((item) => item.name)).toEqual(["Granted"]);
  });
});
