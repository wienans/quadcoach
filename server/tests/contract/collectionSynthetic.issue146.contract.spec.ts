import { mongo } from "mongoose";

import {
  evaluateSyntheticGates,
  exerciseBrowseWorkloadCorrect,
  EXERCISE_APPROVED_SORTS,
  EXERCISE_DATABASE_WORKLOADS,
  EXERCISE_INDEX_NAMES,
  EXERCISE_SORT_COVERAGE,
  EXERCISE_WORKLOAD_NAMES,
  isExerciseSyntheticSummary,
  syntheticExerciseDocument,
  SyntheticMeasurements,
} from "../../collectionQuery/operations/synthetic";

const explain = {
  winningStages: ["IXSCAN"],
  totalDocsExamined: 100,
  totalKeysExamined: 100,
  returned: 100,
  collectionScan: false,
  blockingSort: false,
  spilled: false,
} as const;

function passingMeasurements(): SyntheticMeasurements {
  const operations = EXERCISE_WORKLOAD_NAMES.map((name) => ({
    name,
    operation: name.endsWith("facet") ? ("facet" as const) : ("browse" as const),
    warmP95Ms: 1,
    maximumMs: 1,
    resultCount: 1,
    correct: true,
    ...(name.includes("substring")
      ? { plannerException: "unanchored-search" as const }
      : name.endsWith("facet")
        ? { plannerException: "low-selectivity-facet" as const }
        : {}),
  }));
  return {
    countWarmP95Ms: 1,
    pageWarmP95Ms: 1,
    browseWarmP95Ms: 1,
    facetWarmP95Ms: 1,
    maximumBrowseDatabaseMs: 1,
    maximumFacetDatabaseMs: 1,
    defaultPageExplain: explain,
    skip: 0,
    limit: 100,
    response100Bytes: 1,
    grantIdsBytes: 1,
    grantIdsLoaded: 5_000,
    grantIdsAreStrings: true,
    publicResourceCount: 20_000,
    browseVisibleTotal: 20_000,
    exercise: {
      generatedDocuments: 20_000,
      documentsWithMissingLegacyMetrics: 1,
      deterministicTieDocuments: 2,
      documentsWithBlocks: 20_000,
      summaryOmitsBlocks: true,
      response100Bytes: 1,
      operations,
      databaseOperations: EXERCISE_DATABASE_WORKLOADS.map((workload) => ({
        name: workload.name,
        countWarmP95Ms: 1,
        pageWarmP95Ms: 1,
        maximumMs: 1,
      })),
      planners: EXERCISE_DATABASE_WORKLOADS.map((workload) => ({
        name: workload.name,
        expectedIndex: workload.expectedIndex,
        strictDefault: workload.strictDefault,
        selected: true,
        explain,
      })),
      indexes: EXERCISE_INDEX_NAMES.map((name) => ({
        name,
        createDurationMs: 1,
        sizeBytes: 1,
        selected: true,
        explain,
        dropCommand: `npm run collection:index:drop -- ${name}`,
      })),
    },
  };
}

describe("issue 146 Exercise synthetic activation evidence", () => {
  it("generates representative bounded Exercise documents", () => {
    const complete = syntheticExerciseDocument(new mongo.ObjectId(), 1);
    const legacy = syntheticExerciseDocument(new mongo.ObjectId(), 13);
    const tie = syntheticExerciseDocument(new mongo.ObjectId(), 17);

    expect(complete).toMatchObject({
      tags: expect.arrayContaining(["Synthetic", "Defence"]),
      materials: expect.arrayContaining(["Synthetic", "Balls"]),
      time_min: expect.any(Number),
      persons: expect.any(Number),
      beaters: expect.any(Number),
      chasers: expect.any(Number),
      related_to: expect.any(Array),
      description_blocks: expect.any(Array),
    });
    expect(legacy).not.toHaveProperty("time_min");
    expect(legacy).not.toHaveProperty("persons");
    expect(tie.name).toBe("Deterministic Tie");
  });

  it("accepts only the explicit typed Exercise summary contract", () => {
    const summary = {
      _id: "000000000000000000000001",
      name: "Typed summary",
      tags: ["Attack"],
      materials: ["Cones"],
      durationMinutes: 20,
      persons: 8,
      beaters: 2,
      chasers: 3,
      relatedTo: ["000000000000000000000002"],
      createdAt: new Date("2026-01-01T00:00:00Z"),
      updatedAt: new Date("2026-01-02T00:00:00Z"),
    };

    expect(isExerciseSyntheticSummary(summary)).toBe(true);
    expect(
      isExerciseSyntheticSummary({
        _id: summary._id,
        name: summary.name,
        tags: summary.tags,
      }),
    ).toBe(false);
    for (const field of ["description_blocks", "blocks", "Blocks"] as const) {
      expect(isExerciseSyntheticSummary({ ...summary, [field]: [] })).toBe(false);
    }
  });

  it("pauses when a non-default workload leaks Blocks", () => {
    const leakedSummary = {
      _id: "000000000000000000000001",
      name: "Leaked summary",
      tags: ["Attack"],
      materials: ["Cones"],
      durationMinutes: 20,
      persons: 8,
      beaters: 2,
      chasers: 3,
      relatedTo: [],
      createdAt: new Date("2026-01-01T00:00:00Z"),
      updatedAt: new Date("2026-01-02T00:00:00Z"),
      Blocks: [{ description: "must not leak" }],
    };
    const correct = exerciseBrowseWorkloadCorrect(
      "exercise tags any",
      Array.from({ length: 100 }, () => leakedSummary),
    );
    const passing = passingMeasurements();
    const leaked = {
      ...passing,
      exercise: {
        ...passing.exercise!,
        operations: passing.exercise!.operations.map((operation) =>
          operation.name === "exercise tags any"
            ? { ...operation, correct }
            : operation,
        ),
      },
    };
    const report = evaluateSyntheticGates(leaked);

    expect(correct).toBe(false);
    expect(report.activation).toBe("pause");
    expect(report.gates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "exercise tags any correctness",
          passed: false,
        }),
      ]),
    );
  });

  it("covers every approved workload and index without speculative role indexes", () => {
    expect(EXERCISE_WORKLOAD_NAMES).toEqual(
      expect.arrayContaining([
        expect.stringContaining("duration range"),
        "exercise duration missing metrics last",
        expect.stringContaining("persons range"),
        "exercise persons missing metrics last",
        "exercise tags any",
        "exercise tags all",
        "exercise materials any",
        "exercise materials all",
        "exercise tags facet",
        "exercise materials facet",
        "exercise created ascending page",
        "exercise created descending page",
        "exercise updated ascending page",
        "exercise updated descending page",
      ]),
    );
    expect(EXERCISE_INDEX_NAMES).toEqual([
      "cq_exercises_name",
      "cq_exercises_created",
      "cq_exercises_updated",
      "cq_exercises_duration",
      "cq_exercises_persons",
      "cq_exercises_tags",
      "cq_exercises_materials",
    ]);
    expect(EXERCISE_INDEX_NAMES.join(" ")).not.toMatch(/beater|chaser/i);
    for (const sort of EXERCISE_APPROVED_SORTS) {
      expect(
        EXERCISE_SORT_COVERAGE.filter((entry) => entry.family === sort).map(
          (entry) => entry.direction,
        ),
      ).toEqual(expect.arrayContaining(["asc", "desc"]));
    }
    expect(EXERCISE_DATABASE_WORKLOADS).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ expectedIndex: "cq_exercises_created" }),
        expect.objectContaining({ expectedIndex: "cq_exercises_updated" }),
      ]),
    );
  });

  it("does not gate activation on filtered planner diagnostics", () => {
    const passing = passingMeasurements();
    const filteredDiagnostics = {
      ...passing,
      exercise: {
        ...passing.exercise!,
        planners: passing.exercise!.planners.map((planner) =>
          planner.strictDefault
            ? planner
            : {
                ...planner,
                selected: false,
                explain: { ...planner.explain, blockingSort: true },
              },
        ),
      },
    };

    expect(evaluateSyntheticGates(filteredDiagnostics).activation).toBe(
      "proceed",
    );
  });

  it.each([
    ["index selection", (measurements: SyntheticMeasurements) => ({
      ...measurements,
      exercise: {
        ...measurements.exercise!,
        indexes: measurements.exercise!.indexes.map((index) =>
          index.name === "cq_exercises_created"
            ? { ...index, selected: false }
            : index,
        ),
      },
    })],
    ["created count latency", (measurements: SyntheticMeasurements) => ({
      ...measurements,
      exercise: {
        ...measurements.exercise!,
        databaseOperations: measurements.exercise!.databaseOperations.map(
          (operation) =>
            operation.name === "exercise created ascending indexed page"
              ? { ...operation, countWarmP95Ms: 250 }
              : operation,
        ),
      },
    })],
    ["updated page latency", (measurements: SyntheticMeasurements) => ({
      ...measurements,
      exercise: {
        ...measurements.exercise!,
        databaseOperations: measurements.exercise!.databaseOperations.map(
          (operation) =>
            operation.name === "exercise updated descending indexed page"
              ? { ...operation, pageWarmP95Ms: 250 }
              : operation,
        ),
      },
    })],
    ["default index selection", (measurements: SyntheticMeasurements) => ({
      ...measurements,
      exercise: {
        ...measurements.exercise!,
        planners: measurements.exercise!.planners.map((planner) =>
          planner.strictDefault ? { ...planner, selected: false } : planner,
        ),
      },
    })],
    ["default collection scan", (measurements: SyntheticMeasurements) => ({
      ...measurements,
      exercise: {
        ...measurements.exercise!,
        planners: measurements.exercise!.planners.map((planner) =>
          planner.strictDefault
            ? {
                ...planner,
                explain: { ...planner.explain, collectionScan: true },
              }
            : planner,
        ),
      },
    })],
    ["default blocking sort", (measurements: SyntheticMeasurements) => ({
      ...measurements,
      exercise: {
        ...measurements.exercise!,
        planners: measurements.exercise!.planners.map((planner) =>
          planner.strictDefault
            ? {
                ...planner,
                explain: { ...planner.explain, blockingSort: true },
              }
            : planner,
        ),
      },
    })],
    ["default spill", (measurements: SyntheticMeasurements) => ({
      ...measurements,
      exercise: {
        ...measurements.exercise!,
        planners: measurements.exercise!.planners.map((planner) =>
          planner.strictDefault
            ? { ...planner, explain: { ...planner.explain, spilled: true } }
            : planner,
        ),
      },
    })],
    ["default examination budget", (measurements: SyntheticMeasurements) => ({
      ...measurements,
      exercise: {
        ...measurements.exercise!,
        planners: measurements.exercise!.planners.map((planner) =>
          planner.strictDefault
            ? {
                ...planner,
                explain: { ...planner.explain, totalDocsExamined: 201 },
              }
            : planner,
        ),
      },
    })],
    ["default database budget", (measurements: SyntheticMeasurements) => ({
      ...measurements,
      exercise: {
        ...measurements.exercise!,
        databaseOperations: measurements.exercise!.databaseOperations.map(
          (operation, position) =>
            position === 0 ? { ...operation, maximumMs: 1_001 } : operation,
        ),
      },
    })],
  ] as const)("pauses on failed approved %s gate", (_name, failGate) => {
    expect(evaluateSyntheticGates(failGate(passingMeasurements())).activation).toBe(
      "pause",
    );
  });

  it("proceeds only with complete passing evidence and pauses other failure classes", () => {
    const passing = passingMeasurements();
    expect(evaluateSyntheticGates(passing).activation).toBe("proceed");

    const missingWorkloadBase = passingMeasurements();
    const missingWorkload = {
      ...missingWorkloadBase,
      exercise: {
        ...missingWorkloadBase.exercise!,
        operations: missingWorkloadBase.exercise!.operations.slice(1),
      },
    };
    expect(evaluateSyntheticGates(missingWorkload).activation).toBe("pause");

    const missingCreatedDatabaseBase = passingMeasurements();
    const missingCreatedDatabase = {
      ...missingCreatedDatabaseBase,
      exercise: {
        ...missingCreatedDatabaseBase.exercise!,
        databaseOperations:
          missingCreatedDatabaseBase.exercise!.databaseOperations.filter(
            (operation) => !operation.name.includes("created ascending"),
          ),
      },
    };
    expect(evaluateSyntheticGates(missingCreatedDatabase).activation).toBe(
      "pause",
    );

    const failedUpdatedWorkloadBase = passingMeasurements();
    const failedUpdatedWorkload = {
      ...failedUpdatedWorkloadBase,
      exercise: {
        ...failedUpdatedWorkloadBase.exercise!,
        operations: failedUpdatedWorkloadBase.exercise!.operations.map(
          (operation) =>
            operation.name === "exercise updated descending page"
              ? { ...operation, correct: false }
              : operation,
        ),
      },
    };
    expect(evaluateSyntheticGates(failedUpdatedWorkload).activation).toBe(
      "pause",
    );

    const oversizedBase = passingMeasurements();
    const oversized = {
      ...oversizedBase,
      exercise: {
        ...oversizedBase.exercise!,
        response100Bytes: 256 * 1024 + 1,
      },
    };
    expect(evaluateSyntheticGates(oversized).activation).toBe("pause");

    const incorrectBase = passingMeasurements();
    const incorrect = {
      ...incorrectBase,
      exercise: {
        ...incorrectBase.exercise!,
        operations: incorrectBase.exercise!.operations.map(
          (operation, index) =>
            index === 0 ? { ...operation, correct: false } : operation,
        ),
      },
    };
    expect(evaluateSyntheticGates(incorrect).activation).toBe("pause");
  });
});
