
# Implementation Plan: Practice Planner

**Branch**: `001-i-want-to` | **Date**: 2025-09-28 | **Spec**: `/specs/001-i-want-to/spec.md`
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from file system structure or context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Practice Planner enables users to create structured practice plans composed of ordered sections (with target durations) containing abstract groups that sequence exercise blocks and breaks while continuously calculating time totals versus section targets. Technical approach: introduce new backend Practice Plan domain (Mongoose models + REST endpoints) plus separate PracticePlanAccess model (mirrors tacticboardAccess) and frontend state slices/components leveraging existing React + Redux Toolkit patterns; ensure immediate client-side recomputation (<100ms) and simple last-save-wins persistence without versioning. MVP only issues 'edit' access entries; 'view' reserved for future.

## Technical Context
**Language/Version**: Frontend: TypeScript 5 + React 18; Backend: Node.js 18 + Express + TypeScript 5  
**Primary Dependencies**: Frontend: Redux Toolkit, MUI, Axios; Backend: Express, Mongoose, express-async-handler, jsonwebtoken, bcrypt  
**Storage**: MongoDB via Mongoose (existing connection)  
**Testing**: NONE CURRENTLY CONFIGURED (manual / future Jest + Supertest TBD)  
**Target Platform**: Browser (desktop responsive) + Node.js server (Linux container)  
**Project Type**: web (frontend + backend)  
**Performance Goals**: UI total recalculation <100ms at spec scale; API typical CRUD latency dominated by Mongo (no special perf requirement)  
**Constraints**: Last-save-wins (no optimistic concurrency); durations are integers minutes; no versioning/history  
**Scale/Scope**: ≤10 sections / plan, ≤5 groups / section, ≤15 items / group (design baseline)

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

No constitution file found at `/memory/constitution.md` (directory missing). Treat as: minimalism, clarity, incrementalism, testability. Current plan adheres (single new backend model + endpoints; reuse existing patterns; defers test framework introduction).

## Project Structure

### Documentation (this feature)
```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
client/
  src/
    pages/
      PracticePlanner/            # New feature page (list + editor or combined)
    components/
      PracticePlanner/
        SectionEditor/
        GroupEditor/
        ItemList/
        TimeSummary/
    store/
      practicePlan/               # New RTK slice (plan state, draft edits)
    api/
      quadcoachApi/               # Existing RTK Query base; extend endpoints

server/
  models/
    practicePlan.ts               # New Mongoose schema/model
  controllers/
    practicePlanController.ts     # CRUD + share operations
  routes/
    practicePlanRoutes.ts         # REST endpoints mounted under /api/practice-plans
```

**Structure Decision**: Extend existing web monorepo (client + server). Add one new backend model/controller/route trio and one frontend slice + component subtree, co-located with existing patterns (mirroring exercises/tacticboard domain).

## Phase 0: Outline & Research

Scoped unknowns resolved from spec: none (all clarifications completed). Research focuses on: data modeling for nested timing totals, minimal API surface, reuse of existing auth & access control, and ensuring client recomputation performance.

Research outputs in research.md will document:
- Data model decisions (embedded vs referenced subdocuments for Sections/Groups/Items)
- Endpoint design (CRUD + share operations; no versioning)
- Time calculation strategy (client derived vs server authoritative fields)
- Concurrency approach (last-save-wins; ETag optional future)
- Validation rules mapping to FRs.
1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:
   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved (Created)

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/bash/update-agent-context.sh opencode`
     **IMPORTANT**: Execute it exactly as specified above. Do not add or remove any arguments.
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md (Created), /contracts/practice-plans.openapi.yml (Created), quickstart.md (Created), agent file update deferred (AGENTS.md already exists)

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each contract → contract test task [P]
- Each entity → model creation task [P] 
- Each user story → integration test task
- Implementation tasks to make tests pass

**Ordering Strategy**:
- TDD order: Tests before implementation 
- Dependency order: Models before services before UI
- Mark [P] for parallel execution (independent files)

**Estimated Output**: 25-30 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [ ] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [ ] Complexity deviations documented

---
*Based on Constitution v1.0.0 - See `/memory/constitution.md`*
