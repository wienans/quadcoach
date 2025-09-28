<!--
Sync Impact Report
Version change: (template) -> 1.0.0
Modified principles: (all defined from template placeholders)
Added sections: Architecture & Technical Constraints; Development Workflow & Quality Gates
Removed sections: None
Templates updated:
 - .specify/templates/plan-template.md ✅ (version reference)
 - .specify/templates/spec-template.md ✅ (no version reference; aligned)
 - .specify/templates/tasks-template.md ✅ (no changes required)
Runtime guidance updated: AGENTS.md ✅ (already consistent; no outdated contradictions)
Deferred TODOs:
 - TODO(TEST_FRAMEWORK_SELECTION): Adopt and configure test frameworks (e.g., Vitest/RTL for client, Jest + Supertest for server) before introducing complex new features.
-->

# QuadCoach Constitution

## Core Principles

### I. User Value & Simplicity First

QuadCoach features MUST directly support coaching, training, or strategic analysis for Quadball roles: Chaser, Keeper, Beater, Seeker. Every change MUST state its user-facing outcome in the feature spec summary. Reject abstractions or layers that do not remove duplication, improve clarity, or enable a near‑term feature. Prefer the simplest working solution; remove code once obsolete. UI components MUST avoid premature generalization: promote to shared only after a second concrete reuse. Rationale: Focus prevents framework drift and ensures velocity stays tied to tangible coaching value.

### II. Type Safety & Explicit Contracts

All new frontend logic MUST use strict TypeScript types—no `any` except in narrow, documented interop boundaries. Backend models MUST define explicit Mongoose schemas with validation and indexes where needed for performance. API endpoints MUST document request/response shapes (OpenAPI stub or typed interface) before implementation. Breaking contract changes MUST be versioned or coordinated with the consuming client in the same PR. Rationale: Explicit contracts reduce runtime defects and accelerate safe iteration.

### III. Secure & Responsible Data Handling

All protected routes MUST enforce JWT verification and role/ownership checks (e.g., only board owners or explicitly granted users access a tactic board). Rate limiting MUST remain enabled on auth-sensitive endpoints. Sensitive operations MUST return consistent generic error messages to avoid information leakage. Never log raw tokens or passwords. Password resets and email verification flows MUST preserve idempotency and token expiry. Rationale: Coaching data and user credentials require trust; security lapses erode adoption.

### IV. Operational Clarity: Observability, Performance, Workflow

Code MUST pass linting (ESLint) and formatting (Prettier) before merge. Each PR MUST state if it impacts performance or security; if yes, include measurement or rationale. Server endpoints SHOULD target p95 latency <300ms under normal load; client critical interactions (navigation to interactive state) SHOULD complete <1s on a mid‑tier laptop. Introduce logging at: request entry (route + correlation id), auth failures (without sensitive payload), and error boundaries (stack traces server-side only). Avoid silent catches—propagate or handle with user-facing feedback. Rationale: Consistent workflow and observability reduce firefighting and facilitate scaling.

## Architecture & Technical Constraints

Stack is fixed unless governance change: Frontend (React + Vite + Material UI + Redux Toolkit), Backend (Node.js + Express + TypeScript + Mongoose + MongoDB), Auth (JWT). Docker Compose orchestrates services; container definitions MUST stay minimal (no dev-only bloat in production images). Feature code aligns with existing directory segmentation: `client/src/{components,pages,api,store}` and `server/{controllers,routes,models,middleware}`. Shared logic SHOULD prefer explicit module exports over deep relative imports. No addition of a second state management library without formal governance approval. Performance-sensitive data access MUST justify added indices in model definition.

## Development Workflow & Quality Gates

1. Spec (WHAT/WHY) → Plan (structure & constitutional check) → Tasks (ordered, TDD) → Implementation → Validation.
2. Each plan MUST document any constitution deviations under Complexity Tracking with justification and rejected simpler alternative.
3. Tests (once framework present) MUST fail before implementation for new capabilities; green tests gate merge.
4. All PRs MUST: pass lint, include user-facing summary, state contract impacts, and list added/changed endpoints.
5. Breaking changes MUST coordinate client/server in same PR or provide backward compatible layer.
6. Manual verification steps (if no automated test yet) MUST be documented in the PR until replaced by tests.
7. Feature branches MUST follow pattern `###-short-description` (issue/sequence number then kebab summary).

## Governance

Amendments: Any principle addition, removal, or redefinition requires PR section "Governance Impact" summarizing rationale and version bump type. Minor wording clarifications (non-semantic) may raise a PATCH version. All contributors MUST enforce principles during review—"nice to have" language is disallowed; violations require revision or documented waiver in Complexity Tracking (temporary, with removal date). Versioning: Semantic rules—MAJOR for removing/replacing a principle or changing enforcement level, MINOR for adding a new principle/section or materially expanding scope, PATCH for clarifications that do not change obligations. Compliance Review: At plan stage and post-design (Plan Phase checkpoints) reviewers confirm alignment; unresolved deviations block progression. Runtime Guidance: Operational norms (build, lint, run) reside in `AGENTS.md`; if a governance change affects that file it MUST be updated in the same PR. Security or performance emergency patches may bypass some workflow steps but MUST backfill tests and governance notes within 48 hours.

**Version**: 1.0.0 | **Ratified**: 2025-09-28 | **Last Amended**: 2025-09-28
