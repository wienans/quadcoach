# Tasks: Practice Planner

**Input**: Design documents from `/specs/001-i-want-to/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)

```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → contract test tasks
   → research.md: Extract decisions → setup & validation tasks
   → quickstart.md: Each scenario step → integration test tasks
3. Generate tasks by category:
   → Setup: test framework init (repo lacks tests), tooling
   → Tests: contract tests, validation tests, integration (quickstart) tests
   → Core: models, services/controllers, routes, frontend state & components
   → Integration: middleware wiring, rate limiting, logging, API client
   → Polish: unit calc tests, performance script, docs update, cleanup
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All endpoints have contract tests & implementation tasks
   → All entities have model tasks
   → All quickstart steps have integration tests
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact absolute file paths in descriptions

## Phase 3.1: Setup

- [x] T001 Add server test dependencies (jest, ts-jest, @types/jest, supertest) in `/home/explainingrobotics/quadcoach/server/package.json` (add devDependencies, do NOT install yet).
- [x] T002 Add Jest config `/home/explainingrobotics/quadcoach/server/jest.config.cjs` (ts-jest preset, testMatch = `**/tests/**/*.spec.ts`).
- [x] T003 Add test script ("test": "jest --runInBand") to `/home/explainingrobotics/quadcoach/server/package.json` (sequential after T001).
- [x] T004 Create test setup file `/home/explainingrobotics/quadcoach/server/tests/setup.ts` (Mongo memory server placeholder or TODO comment) and reference via Jest `setupFilesAfterEnv`.
- [x] T005 Configure ts-node / ts-jest type mappings in `/home/explainingrobotics/quadcoach/server/tsconfig.json` (add `types: ["jest"]`).
- [x] T006 Ensure lint covers new test dir: update `/home/explainingrobotics/quadcoach/server/package.json` eslintIgnore or config if needed (sequential with package edits).
- [x] T007 Create directories: `/home/explainingrobotics/quadcoach/server/tests/contract`, `/home/explainingrobotics/quadcoach/server/tests/integration`, `/home/explainingrobotics/quadcoach/server/tests/unit`.
- [x] T008 Document test usage in `/home/explainingrobotics/quadcoach/specs/001-i-want-to/quickstart.md` append "Run tests with npm test" note.

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

### Contract Tests (one per endpoint — all [P])

- [x] T009 [P] Contract test POST /api/practice-plans in `/home/explainingrobotics/quadcoach/server/tests/contract/practicePlans.post.spec.ts` (201, schema match, empty name 400 placeholder TODO).
- [x] T010 [P] Contract test GET /api/practice-plans/:id in `/home/explainingrobotics/quadcoach/server/tests/contract/practicePlans.get.spec.ts` (200, 404 cases).
- [x] T011 [P] Contract test PATCH /api/practice-plans/:id in `/home/explainingrobotics/quadcoach/server/tests/contract/practicePlans.patch.spec.ts`.
- [x] T012 [P] Contract test DELETE /api/practice-plans/:id in `/home/explainingrobotics/quadcoach/server/tests/contract/practicePlans.delete.spec.ts`.
- [x] T013 [P] Contract test POST /api/practice-plans/:id/access in `/home/explainingrobotics/quadcoach/server/tests/contract/practicePlans.accessAdd.spec.ts`.
- [x] T014 [P] Contract test DELETE /api/practice-plans/:id/access/:accessId in `/home/explainingrobotics/quadcoach/server/tests/contract/practicePlans.accessDelete.spec.ts`.

### Validation / Negative Tests

- [x] T015 [P] Validation test: reject empty name on create (POST) in `/home/explainingrobotics/quadcoach/server/tests/contract/practicePlans.post.validation.spec.ts`.
- [x] T016 [P] Validation test: reject negative targetDuration / item duration in `/home/explainingrobotics/quadcoach/server/tests/contract/practicePlans.negativeDurations.spec.ts`.
- [x] T017 [P] Unauthorized access test hitting each endpoint without JWT in `/home/explainingrobotics/quadcoach/server/tests/contract/practicePlans.unauthorized.spec.ts`.

### Integration Tests (Quickstart Scenarios 1-12) — independent flows ([P])

- [x] T018 [P] Integration test login (obtain JWT) in `/home/explainingrobotics/quadcoach/server/tests/integration/practicePlans.01.login.spec.ts`.
- [x] T019 [P] Integration test create defaults (3 sections + group) in `/home/explainingrobotics/quadcoach/server/tests/integration/practicePlans.02.createDefaults.spec.ts`.
- [x] T020 [P] Integration test rename section & set targetDuration in `/home/explainingrobotics/quadcoach/server/tests/integration/practicePlans.03.renameSection.spec.ts`.
- [x] T021 [P] Integration test add groups/items/break (structural validation) in `/home/explainingrobotics/quadcoach/server/tests/integration/practicePlans.04.groupsItemsTotals.spec.ts`.
- [x] T022 [P] Integration test override exercise duration (structural) in `/home/explainingrobotics/quadcoach/server/tests/integration/practicePlans.05.overrideDuration.spec.ts`.
- [x] T023 [P] Integration test duplicate section deep copy in `/home/explainingrobotics/quadcoach/server/tests/integration/practicePlans.06.duplicateSection.spec.ts`.
- [x] T024 [P] Integration test delete & recreate group (undo via duplicate) in `/home/explainingrobotics/quadcoach/server/tests/integration/practicePlans.07.groupDeleteUndo.spec.ts`.
- [x] T025 [P] Integration test targetDuration below totals accepted (no enforcement) in `/home/explainingrobotics/quadcoach/server/tests/integration/practicePlans.08.targetBelowTotal.spec.ts`.
- [x] T026 [P] Integration test missing exercise placeholder (unknown exerciseId stored) in `/home/explainingrobotics/quadcoach/server/tests/integration/practicePlans.09.missingExercise.spec.ts`.
- [x] T027 [P] Integration test grant access edit to second user in `/home/explainingrobotics/quadcoach/server/tests/integration/practicePlans.10.grantAccess.spec.ts`.
- [x] T028 [P] Integration test concurrent edit last-save-wins (demonstrate overwrite) in `/home/explainingrobotics/quadcoach/server/tests/integration/practicePlans.11.concurrentSave.spec.ts`.
- [x] T029 [P] Integration test empty plan (sections=[]) in `/home/explainingrobotics/quadcoach/server/tests/integration/practicePlans.12.emptyPlan.spec.ts`.

## Phase 3.3: Core Backend Implementation (ONLY after tests exist & fail)

### Models (entities) — Different files ([P])

- [x] T030 [P] Implement PracticePlan Mongoose schema in `/home/explainingrobotics/quadcoach/server/models/practicePlan.ts` (embedded Section/Group/Item subdocs, validation rules).
- [x] T031 [P] Implement PracticePlanAccess Mongoose schema in `/home/explainingrobotics/quadcoach/server/models/practicePlanAccess.ts` (compound unique index (user, practicePlan)).

### Controller & Routes

- [x] T032 Implement controller skeleton `/home/explainingrobotics/quadcoach/server/controllers/practicePlanController.ts` (create,get,patch,delete,addAccess,removeAccess) with TODO bodies.
- [x] T033 Implement route definitions `/home/explainingrobotics/quadcoach/server/routes/practicePlanRoutes.ts` using `verifyJWT` middleware.
- [x] T034 Register route in `/home/explainingrobotics/quadcoach/server/server.ts` (mount `/api/practice-plans`).
- [x] T035 Fill controller logic for create (validate name, defaults) in `/home/explainingrobotics/quadcoach/server/controllers/practicePlanController.ts`.
- [x] T036 Implement get (404 handling) in same controller file.
- [x] T037 Implement patch (partial update, updatedAt refresh) in same controller file.
- [x] T038 Implement delete with 204 response in same controller file.
- [x] T039 Implement addAccess (validate user exists, upsert access) in same controller file.
- [x] T040 Implement removeAccess (delete entry, return updated list) in same controller file.
- [x] T041 Add validation helpers (non-negative durations) in `/home/explainingrobotics/quadcoach/server/controllers/practicePlanController.ts` or separate util `/home/explainingrobotics/quadcoach/server/controllers/helpers/practicePlanValidation.ts` (if new file create) — sequential with controller tasks (no [P]).

## Phase 3.4: Core Frontend Implementation (after backend endpoints functional)

- [x] T042 Create Redux slice `/home/explainingrobotics/quadcoach/client/src/store/practicePlan/practicePlanSlice.ts` (state: currentPlan, draft edits, selectors for totals).
- [x] T043 Extend API client add endpoints in `/home/explainingrobotics/quadcoach/client/src/api/quadcoachApi/practicePlansApi.ts` (RTK Query create/get/update/delete/grant/revoke).
- [x] T044 Add components directory `/home/explainingrobotics/quadcoach/client/src/components/PracticePlanner/SectionEditor/SectionEditor.tsx` skeleton.
- [x] T045 Add GroupEditor component `/home/explainingrobotics/quadcoach/client/src/components/PracticePlanner/GroupEditor/GroupEditor.tsx`.
- [x] T046 Add ItemList component `/home/explainingrobotics/quadcoach/client/src/components/PracticePlanner/ItemList/ItemList.tsx`.
- [x] T047 Add TimeSummary component `/home/explainingrobotics/quadcoach/client/src/components/PracticePlanner/TimeSummary/TimeSummary.tsx` (shows per-section vs target, highlight exceeded).
- [x] T048 Create page `/home/explainingrobotics/quadcoach/client/src/pages/PracticePlanner/index.tsx` integrating components & API hooks.
- [x] T049 Add navigation entry to existing menu (update `/home/explainingrobotics/quadcoach/client/src/pages/routes/` appropriate config file) for Practice Planner.
- [x] T050 Implement derived selectors (sectionCurrent, groupTotals) in slice file (update same file as T042 — sequential).
- [x] T051 Wire optimistic update logic on PATCH in slice (same slice file — sequential after T050).

## Phase 3.5: Integration & Middleware

- [x] T053 Ensure logger middleware captures new endpoints (verify or adjust in `/home/explainingrobotics/quadcoach/server/server.ts`).
- [x] T054 Add access control check helper (owner or access record) in `/home/explainingrobotics/quadcoach/server/controllers/practicePlanController.ts` (refactor code) sequential.
- [x] T055 Implement error responses for validation failures (shared util) in `/home/explainingrobotics/quadcoach/server/controllers/practicePlanController.ts`.
- [x] T056 Update OpenAPI doc `/home/explainingrobotics/quadcoach/specs/001-i-want-to/contracts/practice-plans.openapi.yml` with any new error responses (400 examples).

## Phase 3.6: Polish

- [ ] T057 [P] Unit test derived time calculation (pure functions) in `/home/explainingrobotics/quadcoach/server/tests/unit/practicePlans.timeCalc.spec.ts` (feed mock plan JSON).
- [ ] T058 [P] Performance script: generate max-size plan & measure recompute (<100ms) in `/home/explainingrobotics/quadcoach/scripts/perf/practicePlanRecalc.ts`.
- [ ] T059 [P] Documentation update: append usage section to `/home/explainingrobotics/quadcoach/specs/001-i-want-to/quickstart.md` summarizing UI steps.
- [ ] T060 Cleanup & dead code removal pass (ensure no leftover TODOs) across new files (no [P] because touches multiple existing files sequentially).

## Dependencies

- Setup (T001–T008) before any tests (T009+).
- All tests (T009–T029) before core backend implementation (T030–T041).
- Models (T030,T031) before controller logic (T035–T040) & validation helpers (T041).
- Controller skeleton & routes (T032–T034) before controller method implementations (T035–T040).
- Backend endpoints (T035–T040) pass before frontend slice & components (T042–T051).
- Slice foundation (T042) before selectors (T050) before optimistic updates (T051).
- Middleware integration (T052–T055) after base endpoints (T035–T040).
- OpenAPI update (T056) after any error response changes (T055).
- Polish tasks (T057–T060) last.

## Parallel Execution Example

```
# Launch all independent contract tests after setup:
Task: "Contract test POST /api/practice-plans in /home/explainingrobotics/quadcoach/server/tests/contract/practicePlans.post.spec.ts"
Task: "Contract test GET /api/practice-plans/:id in /home/explainingrobotics/quadcoach/server/tests/contract/practicePlans.get.spec.ts"
Task: "Contract test PATCH /api/practice-plans/:id in /home/explainingrobotics/quadcoach/server/tests/contract/practicePlans.patch.spec.ts"
Task: "Contract test DELETE /api/practice-plans/:id in /home/explainingrobotics/quadcoach/server/tests/contract/practicePlans.delete.spec.ts"
Task: "Contract test POST /api/practice-plans/:id/access in /home/explainingrobotics/quadcoach/server/tests/contract/practicePlans.accessAdd.spec.ts"
Task: "Contract test DELETE /api/practice-plans/:id/access/:accessId in /home/explainingrobotics/quadcoach/server/tests/contract/practicePlans.accessDelete.spec.ts"

# Launch a subset of integration tests concurrently (independent data):
Task: "Integration test create defaults in /home/explainingrobotics/quadcoach/server/tests/integration/practicePlans.02.createDefaults.spec.ts"
Task: "Integration test duplicate section in /home/explainingrobotics/quadcoach/server/tests/integration/practicePlans.06.duplicateSection.spec.ts"
Task: "Integration test grant access in /home/explainingrobotics/quadcoach/server/tests/integration/practicePlans.10.grantAccess.spec.ts"
Task: "Integration test concurrent last-save-wins in /home/explainingrobotics/quadcoach/server/tests/integration/practicePlans.11.concurrentSave.spec.ts"
```

## Notes

- [P] tasks operate on distinct files with no ordering dependency.
- Ensure tests fail initially (unimplemented endpoints) to confirm TDD path.
- Avoid parallel edits to the same controller file (T035–T041 sequential).
- Frontend tasks assume existing Redux & RTK Query patterns (mirror exercises/tacticboard domains).
- Performance script is illustrative; may log timing to console.

## Validation Checklist

- [x] All endpoints have contract tests (T009–T014)
- [x] All entities modeled (T030, T031)
- [x] All quickstart steps covered (T018–T029)
- [x] Tests precede implementation
- [x] Parallel tasks avoid same-file edits
- [x] Every task includes absolute path
