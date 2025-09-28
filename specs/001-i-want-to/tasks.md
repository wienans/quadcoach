# Tasks: Practice Planner

**Feature Directory**: /home/explainingrobotics/quadcoach/specs/001-i-want-to
**Design Inputs**: plan.md (required), research.md, data-model.md, contracts/practice-plans.openapi.yml, quickstart.md
**Tech Stack**: React 18 + TypeScript (client), Node.js 18 + Express + TypeScript + Mongoose (server)

## Generation Summary
Derived entities (data-model.md): PracticePlan, Section, Group, Item (ExerciseItem|BreakItem), PracticePlanAccess
Endpoints (contracts): POST /api/practice-plans, GET /api/practice-plans/{id}, PATCH /api/practice-plans/{id}, DELETE /api/practice-plans/{id}, POST /api/practice-plans/{id}/access, DELETE /api/practice-plans/{id}/access/{accessId}
Integration Scenarios (quickstart steps 1-12): plan creation defaults, rename + target duration, add groups/items + totals, override duration recalculation, duplicate section, delete/undo group, target below total styling, missing exercise placeholder, access grant edit, concurrent edits last-save-wins, empty sections persistence, cleanup delete plan.

## Execution Flow (Phase 3 Main)
```
1. Setup testing + scaffolds (Jest + Supertest for server)
2. Write contract test files (one per endpoint) – expect failures
3. Write integration scenario test files – expect failures
4. Implement Mongoose models (entities) & access model
5. Implement controller logic (CRUD + access) sequentially
6. Implement routes and mount in server
7. Implement frontend slice, API hooks, components
8. Polish: unit tests (selectors), performance validation notes, docs updates
```

## Format: `[ID] [P?] Description`
[P] = Task can run in parallel (different file & no unmet dependency conflicts). Tasks touching the same file are sequential (no [P]). All file paths are absolute.

---
## Phase 3.1: Setup
- [ ] T001 Initialize server test infra: add dev deps (jest, ts-jest, @types/jest, supertest, mongodb-memory-server) in `/home/explainingrobotics/quadcoach/server/package.json`; add `test` script and create `/home/explainingrobotics/quadcoach/server/jest.config.cjs`.
- [ ] T002 [P] Create test folders & config: `/home/explainingrobotics/quadcoach/server/tests/contract/`, `/home/explainingrobotics/quadcoach/server/tests/integration/`, global setup `/home/explainingrobotics/quadcoach/server/tests/setup.ts` (MongoMemoryServer connect) & update Jest config to use it.
- [ ] T003 [P] Add TypeScript test build support: ensure `/home/explainingrobotics/quadcoach/server/tsconfig.json` includes `tests` paths & ES module interop for jest.
- [ ] T004 [P] Create empty backend feature scaffold files: models `/home/explainingrobotics/quadcoach/server/models/practicePlan.ts`, `/home/explainingrobotics/quadcoach/server/models/practicePlanAccess.ts`, controller `/home/explainingrobotics/quadcoach/server/controllers/practicePlanController.ts`, routes `/home/explainingrobotics/quadcoach/server/routes/practicePlanRoutes.ts` exporting placeholders so tests compile.
- [ ] T005 [P] Frontend scaffold: create slice file `/home/explainingrobotics/quadcoach/client/src/store/practicePlan/practicePlanSlice.ts` with placeholder initial state & add to `/home/explainingrobotics/quadcoach/client/src/store/store.ts` (not implemented yet) so future imports resolve.

## Phase 3.2: Tests First (Contract & Integration) – MUST FAIL BEFORE IMPLEMENTATION
### Contract Tests (one per endpoint)
- [ ] T006 [P] Contract test POST /api/practice-plans in `/home/explainingrobotics/quadcoach/server/tests/contract/practicePlans.post.spec.ts` validating 201 schema vs OpenAPI.
- [ ] T007 [P] Contract test GET /api/practice-plans/{id} in `/home/explainingrobotics/quadcoach/server/tests/contract/practicePlans.get.spec.ts` validating 200 + 404.
- [ ] T008 [P] Contract test PATCH /api/practice-plans/{id} in `/home/explainingrobotics/quadcoach/server/tests/contract/practicePlans.patch.spec.ts` validating partial update behavior.
- [ ] T009 [P] Contract test DELETE /api/practice-plans/{id} in `/home/explainingrobotics/quadcoach/server/tests/contract/practicePlans.delete.spec.ts` validating 204 + 404.
- [ ] T010 [P] Contract test POST /api/practice-plans/{id}/access in `/home/explainingrobotics/quadcoach/server/tests/contract/practicePlans.access.post.spec.ts` validating access list schema.
- [ ] T011 [P] Contract test DELETE /api/practice-plans/{id}/access/{accessId} in `/home/explainingrobotics/quadcoach/server/tests/contract/practicePlans.access.delete.spec.ts` validating updated list.

### Integration Scenario Tests (Quickstart)
- [ ] T012 [P] Integration: create plan with defaults (steps 1-2) in `/home/explainingrobotics/quadcoach/server/tests/integration/practicePlan.createDefaults.spec.ts`.
- [ ] T013 [P] Integration: rename section + set targetDuration (step 3) in `/home/explainingrobotics/quadcoach/server/tests/integration/practicePlan.renameTarget.spec.ts`.
- [ ] T014 [P] Integration: add groups/items + totals calculation (step 4) in `/home/explainingrobotics/quadcoach/server/tests/integration/practicePlan.groupsItemsTotals.spec.ts` (assert derived totals client-simulated function).
- [ ] T015 [P] Integration: override exercise duration recalculation (step 5) in `/home/explainingrobotics/quadcoach/server/tests/integration/practicePlan.overrideDuration.spec.ts`.
- [ ] T016 [P] Integration: duplicate section deep copy (step 6) in `/home/explainingrobotics/quadcoach/server/tests/integration/practicePlan.duplicateSection.spec.ts`.
- [ ] T017 [P] Integration: delete group then reconstruct (step 7) in `/home/explainingrobotics/quadcoach/server/tests/integration/practicePlan.deleteGroupUndo.spec.ts`.
- [ ] T018 [P] Integration: target below current total style trigger logic (step 8) in `/home/explainingrobotics/quadcoach/server/tests/integration/practicePlan.targetBelowTotal.spec.ts` (verifies server stores unchanged; client calc helper marks exceed).
- [ ] T019 [P] Integration: missing exercise placeholder (step 9) in `/home/explainingrobotics/quadcoach/server/tests/integration/practicePlan.missingExercise.spec.ts`.
- [ ] T020 [P] Integration: access grant & edit by second user (step 10) in `/home/explainingrobotics/quadcoach/server/tests/integration/practicePlan.accessGrant.spec.ts`.
- [ ] T021 [P] Integration: concurrent edits last-save-wins (step 11) in `/home/explainingrobotics/quadcoach/server/tests/integration/practicePlan.concurrentEdits.spec.ts`.
- [ ] T022 [P] Integration: empty sections persistence + cleanup (steps 12 & 26) in `/home/explainingrobotics/quadcoach/server/tests/integration/practicePlan.emptyAndCleanup.spec.ts`.

## Phase 3.3: Core Models (Entities)
- [ ] T023 Implement PracticePlan model (with embedded Section, Group, Item discriminated shapes) in `/home/explainingrobotics/quadcoach/server/models/practicePlan.ts`.
- [ ] T024 [P] Implement PracticePlanAccess model in `/home/explainingrobotics/quadcoach/server/models/practicePlanAccess.ts`.

## Phase 3.4: Controller (Sequential per shared file)
- [ ] T025 Scaffold controller structure & create handler stubs (createPlan, getPlan, patchPlan, deletePlan, grantAccess, revokeAccess) in `/home/explainingrobotics/quadcoach/server/controllers/practicePlanController.ts` (no logic yet just signatures).
- [ ] T026 Implement createPlan logic (POST) with defaults & validation in same controller file.
- [ ] T027 Implement getPlan logic (GET) with access authorization.
- [ ] T028 Implement patchPlan logic (PATCH) applying partial updates & updatedAt refresh.
- [ ] T029 Implement deletePlan logic (DELETE) removing related access docs.
- [ ] T030 Implement grantAccess logic (POST /:id/access) ensuring unique compound index handling.
- [ ] T031 Implement revokeAccess logic (DELETE /:id/access/:accessId) with ownership protection.

## Phase 3.5: Routes & Server Wiring
- [ ] T032 [P] Define Express routes in `/home/explainingrobotics/quadcoach/server/routes/practicePlanRoutes.ts` mapping endpoints to controller handlers with `verifyJWT` middleware.
- [ ] T033 Mount practice plan routes in `/home/explainingrobotics/quadcoach/server/server.ts` under `/api/practice-plans` and ensure error handling passes through existing middleware.

## Phase 3.6: Frontend State & Components
- [ ] T034 Implement practicePlanSlice (state: plans map, activePlanId, draft editing arrays) & selectors for derived totals in `/home/explainingrobotics/quadcoach/client/src/store/practicePlan/practicePlanSlice.ts`.
- [ ] T035 [P] Extend RTK Query endpoints (create, get, patch, delete, grantAccess, revokeAccess) in `/home/explainingrobotics/quadcoach/client/src/api/quadcoachApi/index.ts` (or appropriate domain file) reusing axios base query.
- [ ] T036 Create PracticePlanner page skeleton in `/home/explainingrobotics/quadcoach/client/src/pages/PracticePlanner/index.tsx` with placeholder layout.
- [ ] T037 [P] Create SectionEditor component in `/home/explainingrobotics/quadcoach/client/src/components/PracticePlanner/SectionEditor/SectionEditor.tsx`.
- [ ] T038 [P] Create GroupEditor component in `/home/explainingrobotics/quadcoach/client/src/components/PracticePlanner/GroupEditor/GroupEditor.tsx`.
- [ ] T039 [P] Create ItemList component in `/home/explainingrobotics/quadcoach/client/src/components/PracticePlanner/ItemList/ItemList.tsx`.
- [ ] T040 [P] Create TimeSummary component in `/home/explainingrobotics/quadcoach/client/src/components/PracticePlanner/TimeSummary/TimeSummary.tsx` computing totals from selectors.

## Phase 3.7: Polish & Validation
- [ ] T041 Unit tests for selector logic (derived totals, overrides) in `/home/explainingrobotics/quadcoach/client/src/store/practicePlan/practicePlanSlice.selectors.spec.ts` (requires frontend jest setup extension of root config or new config).
- [ ] T042 [P] Add performance measurement script for large plan scenario in `/home/explainingrobotics/quadcoach/client/scripts/measurePracticePlannerPerf.ts` (log recalculation time <100ms).
- [ ] T043 [P] Update feature documentation: add usage section to `/home/explainingrobotics/quadcoach/specs/001-i-want-to/quickstart.md` for new UI components & commands.
- [ ] T044 Refactor duplication in controller (shared validation helpers) introducing `/home/explainingrobotics/quadcoach/server/controllers/practicePlanValidation.ts` if needed.
- [ ] T045 Final manual validation pass executing all quickstart steps; document outcomes in `/home/explainingrobotics/quadcoach/specs/001-i-want-to/quickstart.md` (append Validation Results section).

## Dependencies
```
T001 → (T002,T003,T004,T005)
Contract tests (T006-T011) depend on (T001-T004)
Integration tests (T012-T022) depend on (T001-T004)
Models: T023 depends on (T006-T022 written) but before controller impl; T024 parallel with T023
Controller: T025 depends on (T023,T024); T026-T031 sequential
Routes: T032 depends on (T025) stubs; T033 depends on (T032, T026-T031 complete for full pass)
Frontend: T034 depends on (T023 model schema knowledge); T035 depends on (T032 routes mounted); Components (T036-T040) depend on (T034,T035)
Polish: T041 depends on (T034); T042 depends on (T036-T040); T043 depends on (T036-T040); T044 depends on (T026-T031); T045 depends on all implementation tasks (T023-T044)
```

## Parallel Execution Guidance
Early Parallel Batch Example (after T001 complete):
```
Task: "T002 Create test folders & setup"
Task: "T003 Add tsconfig test support"
Task: "T004 Create backend feature scaffold files"
Task: "T005 Frontend scaffold slice placeholder"
```
Contract Tests Parallel Batch:
```
Task: "T006 Contract test POST /api/practice-plans"
Task: "T007 Contract test GET /api/practice-plans/{id}"
Task: "T008 Contract test PATCH /api/practice-plans/{id}"
Task: "T009 Contract test DELETE /api/practice-plans/{id}"
Task: "T010 Contract test POST /api/practice-plans/{id}/access"
Task: "T011 Contract test DELETE /api/practice-plans/{id}/access/{accessId}"
```
Integration Tests Parallel Batch:
```
Task: "T012 Integration create defaults"
Task: "T013 Integration rename target"
Task: "T014 Integration groups items totals"
Task: "T015 Integration override duration"
Task: "T016 Integration duplicate section"
Task: "T017 Integration delete group undo"
Task: "T018 Integration target below total"
Task: "T019 Integration missing exercise"
Task: "T020 Integration access grant"
Task: "T021 Integration concurrent edits"
Task: "T022 Integration empty and cleanup"
```
Frontend Components Parallel Batch (after T034-T035):
```
Task: "T037 SectionEditor component"
Task: "T038 GroupEditor component"
Task: "T039 ItemList component"
Task: "T040 TimeSummary component"
```
Polish Parallel Batch:
```
Task: "T041 Selector unit tests"
Task: "T042 Performance measurement script"
Task: "T043 Update feature documentation"
Task: "T044 Controller validation refactor"  # May serialize if same file edits
```
(Note: If T044 touches same controller file as post-refactor changes, run it after completing other polish tasks editing different files.)

## Validation Checklist
- [ ] All contract endpoints have tests (T006-T011)
- [ ] All entities have model tasks (T023, T024 include embedded entities)
- [ ] Tests precede implementation of logic (controllers/routes after tests)
- [ ] Parallel tasks use distinct files
- [ ] Each task lists absolute file paths
- [ ] Controller logic tasks sequential for shared file

## Notes
- Ensure failing state of contract & integration tests before starting T023.
- Keep model lean (no derived stored fields as per research.md).
- Access control mirrors existing tacticboard patterns (reuse middleware).
- Last-save-wins accepted; concurrent test ensures earlier write overwritten.
- Selector unit tests should simulate exercise defaultDuration absence & override logic.
- Performance script can rely on Date.now micro-benchmark; no external deps.
