# Collection Query Activation Operations

Exercise browsing and its tags/materials facets are the first active source contract. TacticBoard and PracticePlan collection routes remain dormant. Do not deploy an activation until preflight, synthetic gates, and each relevant index verification pass.

## Read-only preflight

Run `MONGO_URI=... npm run collection:preflight`. The JSON report contains only counts, index definitions, BSON size statistics, and sanitized explain summaries. It never prints documents, field values, credentials, or connection strings and issues no writes or DDL.

## Synthetic gates

Run `MONGO_URI=... npm run collection:synthetic`. Production access is read-only and only determines observed maxima. Workload data is generated in a disposable `MongoMemoryServer` at twice the maxima, with floors of 20,000 resources and 5,000 grants. The report retains the shared TacticBoard/grant foundation and adds an `exercise` section with semantic workload correctness/timings for every approved sort family in both directions, count/page timings for default, created, updated, ranged, and filtered paths, fixed-summary size, planner scan/sort/spill evidence, each approved index's creation/selection evidence, and an independently usable drop command. Filtered planner records are diagnostics: duration/person paths may require computed missing-last sorts, while tag/material paths may select the name index to satisfy semantic ordering. Activation gates require strict default-page planner behavior and independent selection verification for every named index, not selection of the semantically related index by every combined filtered workload. Exit code `2` and `activation: "pause"` mean activation must stop; do not relax visibility semantics or switch strategy automatically.

Search and low-selectivity facets remain time-bounded explicit scan/sort exceptions. They are not evidence of B-tree coverage.

## Reversible indexes

List names in `operations/indexes.ts`. Apply exactly one at a time:

```sh
MONGO_URI=... npm run collection:index:create -- cq_tacticboards_name
MONGO_URI=... npm run collection:index:verify -- cq_tacticboards_name
MONGO_URI=... npm run collection:index:drop -- cq_tacticboards_name
```

Create reports elapsed time and index size where the server exposes it. Verify runs the representative query without a hint, reports whether the planner selected the named index, and includes scan/sort/spill evidence. Drop removes only that named index. Existing actor-first Access indexes are not included and must be preserved.

## Checklist

1. Archive the preflight report in the deployment evidence without `MONGO_URI` or credentials.
2. Confirm synthetic output says `activation: "proceed"`, every gate passes, all 21 named Exercise workloads are present, created and updated sorts cover both directions, the default Exercise page avoids collection scan, blocking sort, and spill within its examination limit, and all seven approved `cq_exercises_*` indexes pass isolated planner selection verification. Review filtered planner diagnostics without treating expected computed sorts or alternate approved planner choices as gates.
3. Create and verify only the indexes for the next resource tracer bullet.
4. Re-run preflight and representative production explains after each index.
5. Drop only the independently named index if rollback is required.
6. Keep each unactivated resource route on its legacy contract until its separate activation ticket.

## Exercise deployment and rollback

The Exercise activation uses the existing named definitions `cq_exercises_name`, `cq_exercises_created`, `cq_exercises_updated`, `cq_exercises_duration`, `cq_exercises_persons`, `cq_exercises_tags`, and `cq_exercises_materials`. Create and verify only those justified by the archived production plans, one at a time; the definitions do not by themselves prove planner selection or latency.

Deploy the server and first-party client artifacts atomically because the Exercise browse envelope and facet envelopes replace their legacy contracts. Artifact rollback must restore both artifacts together. Index rollback remains independent: drop only a named `cq_exercises_*` index that was created for this activation, using the command above, and preserve unrelated indexes.
