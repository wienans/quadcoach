import mongoose, { mongo } from "mongoose";

import {
  createCollectionIndex,
  dropCollectionIndex,
  verifyCollectionIndex,
  winningPlanUsesIndex,
} from "../../collectionQuery/operations/indexes";
import { collectPreflight } from "../../collectionQuery/operations/preflight";
import {
  evaluateSyntheticGates,
  measureSynthetic,
  syntheticScale,
  SyntheticMeasurements,
} from "../../collectionQuery/operations/synthetic";

describe("collection-query operations", () => {
  it("preflight reports metadata and plans without mutation or private content", async () => {
    const database = mongoose.connection.db!;
    await Promise.all(
      Object.values(mongoose.models).map((model) => model.init()),
    );
    await database.collection("tacticboards").insertOne({
      name: "private-name-must-not-appear",
      isPrivate: true,
      shareToken: "private-token-must-not-appear",
    });
    const beforeDocument = await database
      .collection("tacticboards")
      .findOne({});
    const beforeIndexes = (
      await database.collection("tacticboards").listIndexes().toArray()
    )
      .map((index) => index.name)
      .sort();
    const report = await collectPreflight(database);
    expect(report.readOnly).toBe(true);
    expect(report.collections.tacticboards.cardinality).toBe(1);
    expect(
      report.collections.tacticboards.documentBytes.maximum,
    ).toBeGreaterThan(0);
    for (const accessCollection of [
      "exerciseaccesses",
      "tacticboardaccesses",
      "practiceplanaccesses",
    ]) {
      expect(report.grants[accessCollection]).toMatchObject({
        indexes: expect.any(Array),
        actorFirstPlan: {
          winningStages: expect.any(Array),
          collectionScan: expect.any(Boolean),
        },
      });
    }
    expect(report.grants.exerciseaccesses.indexes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: { user: 1, exercise: 1 },
          unique: true,
        }),
      ]),
    );
    expect(report.grants.tacticboardaccesses.indexes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: { user: 1, tacticboard: 1 },
          unique: true,
        }),
      ]),
    );
    expect(report.grants.practiceplanaccesses.indexes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: { user: 1, practicePlan: 1 },
          unique: true,
        }),
      ]),
    );
    expect(report.grants.tacticboardaccesses.actorFirstPlan).toMatchObject({
      winningStages: expect.arrayContaining(["IXSCAN"]),
      collectionScan: false,
    });
    expect(JSON.stringify(report)).not.toContain(
      "private-name-must-not-appear",
    );
    expect(JSON.stringify(report)).not.toContain(
      "private-token-must-not-appear",
    );
    expect(await database.collection("tacticboards").findOne({})).toEqual(
      beforeDocument,
    );
    expect(
      (await database.collection("tacticboards").listIndexes().toArray())
        .map((index) => index.name)
        .sort(),
    ).toEqual(beforeIndexes);
  });

  it("creates, verifies, and independently drops one named index", async () => {
    const database = mongoose.connection.db!;
    const collection = database.collection("tacticboards");
    await collection.insertMany([
      { name: "Board 2", isPrivate: false },
      { name: "Board 10", isPrivate: false },
    ]);
    await collection.createIndex(
      { user: 1 },
      { name: "existing_actor_first_access_evidence" },
    );

    await expect(
      createCollectionIndex(database, "cq_tacticboards_name"),
    ).resolves.toMatchObject({
      action: "create",
      name: "cq_tacticboards_name",
    });
    await expect(
      verifyCollectionIndex(database, "cq_tacticboards_name"),
    ).resolves.toMatchObject({
      action: "verify",
      selected: true,
    });
    await expect(
      dropCollectionIndex(database, "cq_tacticboards_name"),
    ).resolves.toMatchObject({
      action: "drop",
    });
    const names = (await collection.listIndexes().toArray()).map(
      (index) => index.name,
    );
    expect(names).toContain("existing_actor_first_access_evidence");
    expect(names).not.toContain("cq_tacticboards_name");
  });

  it("does not treat an index in rejected plans as planner-selected", () => {
    expect(
      winningPlanUsesIndex(
        {
          queryPlanner: {
            winningPlan: { stage: "COLLSCAN" },
            rejectedPlans: [
              { stage: "IXSCAN", indexName: "cq_tacticboards_name" },
            ],
          },
          unrelated: { indexName: "cq_tacticboards_name" },
        },
        "cq_tacticboards_name",
      ),
    ).toBe(false);
    expect(
      winningPlanUsesIndex(
        {
          queryPlanner: {
            winningPlan: {
              stage: "FETCH",
              inputStage: {
                stage: "IXSCAN",
                indexName: "cq_tacticboards_name",
              },
            },
          },
        },
        "cq_tacticboards_name",
      ),
    ).toBe(true);
  });

  it("runs synthetic browse and facet measurements against an isolated native database", async () => {
    const client = new mongo.MongoClient(global.__MONGO_SERVER__.getUri());
    await client.connect();
    const database = client.db(`synthetic-isolated-${new mongo.ObjectId()}`);
    try {
      const measurements = await measureSynthetic(database, {
        resources: 20,
        grantsPerActor: 5,
      });
      expect(measurements.response100Bytes).toBeGreaterThan(0);
      expect(measurements.facetWarmP95Ms).toBeGreaterThanOrEqual(0);
      expect(measurements).toMatchObject({
        grantIdsLoaded: 5,
        grantIdsAreStrings: true,
        publicResourceCount: 15,
        browseVisibleTotal: 17,
      });
      expect(measurements.grantIdsBytes).toBeGreaterThan(
        mongo.BSON.calculateObjectSize({
          ids: Array.from({ length: 5 }, () => new mongo.ObjectId()),
        }),
      );
      expect(evaluateSyntheticGates(measurements)).toMatchObject({
        activation: expect.stringMatching(/^(proceed|pause)$/),
        gates: expect.any(Array),
      });
    } finally {
      await database.dropDatabase();
      await client.close();
    }
  });

  it("doubles observed maxima with approved floors and pauses failed gates", () => {
    expect(
      syntheticScale({ resources: 12_000, grantsPerActor: 3_000 }),
    ).toEqual({
      resources: 24_000,
      grantsPerActor: 6_000,
    });
    expect(syntheticScale({ resources: 10, grantsPerActor: 10 })).toEqual({
      resources: 20_000,
      grantsPerActor: 5_000,
    });
    const passing: SyntheticMeasurements = {
      countWarmP95Ms: 100,
      pageWarmP95Ms: 100,
      browseWarmP95Ms: 300,
      facetWarmP95Ms: 700,
      maximumBrowseDatabaseMs: 900,
      maximumFacetDatabaseMs: 1_900,
      defaultPageExplain: {
        winningStages: ["IXSCAN"],
        totalDocsExamined: 50,
        totalKeysExamined: 50,
        returned: 50,
        collectionScan: false,
        blockingSort: false,
        spilled: false,
      },
      skip: 0,
      limit: 50,
      response100Bytes: 200_000,
      grantIdsBytes: 800_000,
      grantIdsLoaded: 5_000,
      grantIdsAreStrings: true,
      publicResourceCount: 15_000,
      browseVisibleTotal: 16_000,
    };
    expect(evaluateSyntheticGates(passing).activation).toBe("proceed");
    const failed = evaluateSyntheticGates({
      ...passing,
      grantIdsBytes: 1024 * 1024,
    });
    expect(failed.activation).toBe("pause");
    expect(failed.exceptions).toEqual(
      expect.arrayContaining([
        expect.stringContaining("substring search"),
        expect.stringContaining("facets"),
      ]),
    );
  });
});
