# Collection Query Activation Operations

The collection-query module is dormant. Do not activate a resource route until preflight, synthetic gates, and each relevant index verification pass.

## Read-only preflight

Run `MONGO_URI=... npm run collection:preflight`. The JSON report contains only counts, index definitions, BSON size statistics, and sanitized explain summaries. It never prints documents, field values, credentials, or connection strings and issues no writes or DDL.

## Synthetic gates

Run `MONGO_URI=... npm run collection:synthetic`. Production access is read-only and only determines observed maxima. Workload data is generated in a disposable `MongoMemoryServer` at twice the maxima, with floors of 20,000 resources and 5,000 grants. Exit code `2` and `activation: "pause"` mean activation must stop; do not relax visibility semantics or switch strategy automatically.

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
2. Confirm synthetic output says `activation: "proceed"` and every gate passes.
3. Create and verify only the indexes for the next resource tracer bullet.
4. Re-run preflight and representative production explains after each index.
5. Drop only the independently named index if rollback is required.
6. Keep active routes on their legacy contracts until their separate activation ticket.
