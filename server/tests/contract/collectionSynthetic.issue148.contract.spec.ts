import { mongo } from "mongoose";

import {
  evaluateSyntheticGates,
  EXERCISE_DATABASE_WORKLOADS,
  EXERCISE_INDEX_NAMES,
  EXERCISE_WORKLOAD_NAMES,
  SyntheticMeasurements,
} from "../../collectionQuery/operations/synthetic";
import {
  expectedPracticePlanDurationMinutes,
  expectedPracticePlanSectionCount,
  expectedPracticePlanTagFacet,
  isPracticePlanSyntheticSummary,
  practicePlanBrowseWorkloadCorrect,
  practicePlanFacetWorkloadCorrect,
  PRACTICE_PLAN_APPROVED_SORTS,
  PRACTICE_PLAN_DATABASE_WORKLOADS,
  PRACTICE_PLAN_INDEX_NAMES,
  PRACTICE_PLAN_SORT_COVERAGE,
  PRACTICE_PLAN_WORKLOAD_NAMES,
  syntheticPracticePlanDocument,
  PracticePlanSyntheticSummary,
} from "../../collectionQuery/operations/practicePlanSynthetic";

const explain = {
  winningStages: ["IXSCAN"],
  totalDocsExamined: 100,
  totalKeysExamined: 100,
  returned: 100,
  collectionScan: false,
  blockingSort: false,
  spilled: false,
} as const;

function resourceOperations(names: readonly string[]) {
  return names.map((name) => ({
    name,
    operation: name.endsWith("facet")
      ? ("facet" as const)
      : ("browse" as const),
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
}

function passingMeasurements(): SyntheticMeasurements {
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
      operations: resourceOperations(EXERCISE_WORKLOAD_NAMES),
      databaseOperations: EXERCISE_DATABASE_WORKLOADS.map((workload) => ({
        name: workload.name,
        countWarmP95Ms: 1,
        pageWarmP95Ms: 1,
        maximumMs: 1,
      })),
      planners: EXERCISE_DATABASE_WORKLOADS.map((workload) => ({
        name: workload.name,
        expectedIndex: workload.expectedIndex,
        activationGate: workload.activationGate,
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
    practicePlan: {
      generatedDocuments: 20_000,
      documentsWithLegacyMissingPrivacy: 1,
      documentsWithEmptySections: 1,
      documentsWithMissingDescription: 1,
      documentsWithSections: 20_000,
      deterministicTieDocuments: 2,
      summaryOmitsSections: true,
      derivedMetricsAccurate: true,
      response100Bytes: 1,
      grantIdsBytes: 1,
      grantIdsLoaded: 5_000,
      operations: resourceOperations(PRACTICE_PLAN_WORKLOAD_NAMES),
      databaseOperations: PRACTICE_PLAN_DATABASE_WORKLOADS.map((workload) => ({
        name: workload.name,
        countWarmP95Ms: 1,
        pageWarmP95Ms: 1,
        maximumMs: 1,
      })),
      planners: PRACTICE_PLAN_DATABASE_WORKLOADS.map((workload) => ({
        name: workload.name,
        expectedIndex: workload.expectedIndex,
        activationGate: workload.activationGate,
        selected: true,
        explain,
      })),
      indexes: PRACTICE_PLAN_INDEX_NAMES.map((name) => ({
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

function corpusFor(numbers: readonly number[]) {
  const numberForId = new Map(
    numbers.map((number) => [number.toString(16).padStart(24, "0"), number]),
  );
  return { numberForId: (id: string) => numberForId.get(id) };
}

function summaryFor(number: number): PracticePlanSyntheticSummary {
  return {
    _id: number.toString(16).padStart(24, "0"),
    name: `Plan ${number}`,
    tags: [
      number % 2 === 0 ? "synthetic" : "Synthetic",
      `Tag ${number % 40}`,
      number % 3 === 0 ? "Attack" : "Defence",
    ],
    isPrivate: false,
    description: number % 5 === 0 ? null : `Synthetic plan description ${number}`,
    sectionCount: expectedPracticePlanSectionCount(number),
    durationMinutes: expectedPracticePlanDurationMinutes(number),
  };
}

describe("issue 148 PracticePlan synthetic activation evidence", () => {
  it("generates representative private-resource PracticePlan documents", () => {
    const actor = new mongo.ObjectId();
    const owner = syntheticPracticePlanDocument(
      new mongo.ObjectId(),
      8,
      actor,
    );
    const legacy = syntheticPracticePlanDocument(
      new mongo.ObjectId(),
      11,
      actor,
    );
    const privateHidden = syntheticPracticePlanDocument(
      new mongo.ObjectId(),
      4,
      actor,
    );
    const emptySections = syntheticPracticePlanDocument(
      new mongo.ObjectId(),
      7,
      actor,
    );
    const tie = syntheticPracticePlanDocument(new mongo.ObjectId(), 17, actor);

    expect(owner.user).toBe(actor);
    expect(owner.isPrivate).toBe(true);
    expect(legacy).not.toHaveProperty("isPrivate");
    expect(privateHidden.isPrivate).toBe(true);
    expect(privateHidden.user).not.toBe(actor);
    expect(emptySections.sections).toEqual([]);
    expect(
      syntheticPracticePlanDocument(new mongo.ObjectId(), 25, actor),
    ).not.toHaveProperty("description");
    expect(tie.name).toBe("Deterministic Tie");
    expect(owner.sections).toHaveLength(3);
  });

  it("accepts only the explicit typed PracticePlan summary contract", () => {
    const summary = summaryFor(1);

    expect(isPracticePlanSyntheticSummary(summary)).toBe(true);
    expect(
      isPracticePlanSyntheticSummary({
        _id: summary._id,
        name: summary.name,
        tags: summary.tags,
      }),
    ).toBe(false);
    expect(
      isPracticePlanSyntheticSummary({
        ...summary,
        description: undefined,
      } as unknown as typeof summary),
    ).toBe(false);
    for (const field of [
      "sections",
      "shareToken",
      "shareLink",
      "user",
      "creator",
      "createdAt",
      "updatedAt",
    ] as const) {
      expect(isPracticePlanSyntheticSummary({ ...summary, [field]: 1 })).toBe(
        false,
      );
    }
  });

  it("rejects unordered pages and inaccurate derived summaries", () => {
    const numbers = Array.from({ length: 100 }, (_, index) => index + 1);
    const corpus = corpusFor(numbers);
    const ascending = numbers.map(summaryFor);
    const swapped = [...ascending];
    [swapped[9], swapped[10]] = [swapped[10], swapped[9]];

    expect(
      practicePlanBrowseWorkloadCorrect(
        "practiceplan default name page",
        ascending,
        corpus,
      ),
    ).toBe(true);
    expect(
      practicePlanBrowseWorkloadCorrect(
        "practiceplan default name page",
        swapped,
        corpus,
      ),
    ).toBe(false);
    expect(
      practicePlanBrowseWorkloadCorrect(
        "practiceplan name descending page",
        [...ascending].reverse(),
        corpus,
      ),
    ).toBe(true);
    for (const workload of [
      "practiceplan created ascending page",
      "practiceplan updated ascending page",
    ]) {
      expect(practicePlanBrowseWorkloadCorrect(workload, ascending, corpus)).toBe(
        true,
      );
      expect(
        practicePlanBrowseWorkloadCorrect(workload, swapped, corpus),
      ).toBe(false);
    }
    expect(
      practicePlanBrowseWorkloadCorrect(
        "practiceplan created ascending page",
        ascending,
        { numberForId: () => undefined },
      ),
    ).toBe(false);
  });

  it("deduplicates facet casing and orders facets deterministically", () => {
    const scale = { resources: 40, grantsPerActor: 0 };
    const expected = expectedPracticePlanTagFacet(scale);

    expect(expected).toEqual(
      expect.arrayContaining(["Synthetic", "Attack", "Defence", "Tag 0"]),
    );
    expect(expected).not.toContain("synthetic");

    expect(
      practicePlanFacetWorkloadCorrect("practiceplan tags facet", expected, scale),
    ).toBe(true);
    const rotated = [...expected.slice(1), expected[0]];
    expect(
      practicePlanFacetWorkloadCorrect("practiceplan tags facet", rotated, scale),
    ).toBe(false);
    expect(
      practicePlanFacetWorkloadCorrect(
        "practiceplan tags facet",
        [...expected, "Extra"],
        scale,
      ),
    ).toBe(false);
  });

  it("covers every approved workload and index without speculative indexes", () => {
    expect(PRACTICE_PLAN_WORKLOAD_NAMES).toEqual(
      expect.arrayContaining([
        "practiceplan default name page",
        "practiceplan name descending page",
        "practiceplan created ascending page",
        "practiceplan created descending page",
        "practiceplan updated ascending page",
        "practiceplan updated descending page",
        "practiceplan literal substring search",
        "practiceplan tags any",
        "practiceplan tags all",
        "practiceplan privacy private narrowing",
        "practiceplan privacy public narrowing",
        "practiceplan empty beyond-end page",
        "practiceplan tags facet",
      ]),
    );
    expect(PRACTICE_PLAN_INDEX_NAMES).toEqual([
      "cq_practiceplans_name",
      "cq_practiceplans_created",
      "cq_practiceplans_updated",
      "cq_practiceplans_privacy",
      "cq_practiceplans_owner",
      "cq_practiceplans_tags",
    ]);
    expect(PRACTICE_PLAN_INDEX_NAMES.join(" ")).not.toMatch(/access/i);
    for (const sort of PRACTICE_PLAN_APPROVED_SORTS) {
      expect(
        PRACTICE_PLAN_SORT_COVERAGE.filter((entry) => entry.family === sort).map(
          (entry) => entry.direction,
        ),
      ).toEqual(expect.arrayContaining(["asc", "desc"]));
    }
    expect(PRACTICE_PLAN_DATABASE_WORKLOADS).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ expectedIndex: "cq_practiceplans_privacy" }),
        expect.objectContaining({ expectedIndex: "cq_practiceplans_owner" }),
      ]),
    );
  });

  it.each([
    [
      "missing practiceplan evidence",
      (measurements: SyntheticMeasurements) => ({
        ...measurements,
        practicePlan: undefined,
      }),
    ],
    [
      "inaccurate derived summaries",
      (measurements: SyntheticMeasurements) => ({
        ...measurements,
        practicePlan: {
          ...measurements.practicePlan!,
          derivedMetricsAccurate: false,
        },
      }),
    ],
    [
      "Sections leaked into summaries",
      (measurements: SyntheticMeasurements) => ({
        ...measurements,
        practicePlan: {
          ...measurements.practicePlan!,
          summaryOmitsSections: false,
        },
      }),
    ],
    [
      "oversized practiceplan response",
      (measurements: SyntheticMeasurements) => ({
        ...measurements,
        practicePlan: {
          ...measurements.practicePlan!,
          response100Bytes: 256 * 1024 + 1,
        },
      }),
    ],
    [
      "failed practiceplan workload correctness",
      (measurements: SyntheticMeasurements) => ({
        ...measurements,
        practicePlan: {
          ...measurements.practicePlan!,
          operations: measurements.practicePlan!.operations.map((operation) =>
            operation.name === "practiceplan tags any"
              ? { ...operation, correct: false }
              : operation,
          ),
        },
      }),
    ],
    [
      "missing practiceplan planner evidence",
      (measurements: SyntheticMeasurements) => ({
        ...measurements,
        practicePlan: {
          ...measurements.practicePlan!,
          planners: measurements.practicePlan!.planners.filter(
            (planner) => planner.activationGate,
          ),
        },
      }),
    ],
    [
      "default practiceplan index not selected",
      (measurements: SyntheticMeasurements) => ({
        ...measurements,
        practicePlan: {
          ...measurements.practicePlan!,
          planners: measurements.practicePlan!.planners.map((planner) =>
            planner.activationGate ? { ...planner, selected: false } : planner,
          ),
        },
      }),
    ],
    [
      "practiceplan grant memory exceeded",
      (measurements: SyntheticMeasurements) => ({
        ...measurements,
        practicePlan: {
          ...measurements.practicePlan!,
          grantIdsBytes: 1024 * 1024,
        },
      }),
    ],
  ] as const)("pauses on %s", (_name, failGate) => {
    expect(
      evaluateSyntheticGates(failGate(passingMeasurements())).activation,
    ).toBe("pause");
  });

  it("proceeds only with complete passing evidence", () => {
    const passing = passingMeasurements();
    expect(evaluateSyntheticGates(passing).activation).toBe("proceed");

    const missingWorkload = {
      ...passing,
      practicePlan: {
        ...passing.practicePlan!,
        operations: passing.practicePlan!.operations.slice(1),
      },
    };
    expect(evaluateSyntheticGates(missingWorkload).activation).toBe("pause");

    const missingDatabaseOperation = {
      ...passing,
      practicePlan: {
        ...passing.practicePlan!,
        databaseOperations:
          passing.practicePlan!.databaseOperations.filter(
            (operation) => !operation.name.includes("default indexed"),
          ),
      },
    };
    expect(evaluateSyntheticGates(missingDatabaseOperation).activation).toBe(
      "pause",
    );

    const unrepresentedLegacyPrivacy = {
      ...passing,
      practicePlan: {
        ...passing.practicePlan!,
        documentsWithLegacyMissingPrivacy: 0,
      },
    };
    expect(evaluateSyntheticGates(unrepresentedLegacyPrivacy).activation).toBe(
      "pause",
    );
  });
});
