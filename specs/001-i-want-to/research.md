# Research: Practice Planner (Phase 0)

## Data Model Shape
Decision: Single PracticePlan document embedding Sections -> Groups -> Items (exercise | break)
Rationale: Scale bounded (≤10 * 5 * 15 = 750 items worst-case); embedding keeps atomic saves and simple retrieval; avoids multiple round-trips.
Alternatives: Referenced collections for Sections/Groups rejected (adds joins/populates, unnecessary complexity at bounded scale).

Sections: array ordered
Groups: per Section, array ordered
Items: per Group, array ordered; discriminated union by type { kind: 'exercise' | 'break' }

## Exercise Block Reference Strategy
Decision: Store exerciseId reference only plus overrideDuration; fetch exercise meta lazily (or rely on existing exercise fetch/cache) and tolerate missing -> placeholder.
Rationale: Avoid denormalizing exercise names that can change; handle deletion by absence.
Alternatives: Snapshot exercise name/duration into plan rejected (stale data risk, duplication).

## Time Calculation
Decision: All totals derived client-side from embedded structure; server does not persist redundant totals.
Rationale: Simplicity and immediate recompute; avoids stale persisted aggregates.
Alternatives: Persist computed fields (e.g., sectionCurrentTotal) rejected (write amplification, concurrency issues).

## Concurrency
Decision: Last-save-wins only; no ETag now.
Rationale: Clarified requirement; minimal complexity.
Future: Could add If-Match with updatedAt for conflict detection.

## Validation
Decision: Enforce non-empty name; non-negative integer durations; arrays length within soft limits not strictly validated (client UI constrains usage).
Rationale: Keep backend permissive within reason; rely on client for UX constraints.

## Access Control
Decision: Separate PracticePlanAccess collection with records { planId, userId, access: 'view' | 'edit', createdAt }. Owner stored on PracticePlan as field `user` and has implicit 'edit'. Middleware authorizes if requester is owner or has an access record (matching required level; MVP only creates 'edit').
Rationale: Extensible for future view-only roles and auditing; mirrors existing tacticboardAccess pattern; avoids unbounded embedded array growth inside plan document.

## API Surface
Decision: REST endpoints under /api/practice-plans
- POST / (create) new empty plan with defaults
- GET /:id (fetch one)
- PATCH /:id (update full document or partial fields)
- DELETE /:id
- POST /:id/share (add shared coach)
- DELETE /:id/share/:coachId (remove shared coach)
Potential list endpoint (GET /) for owner + shared accessible plans (optional MVP include)

Rationale: Mirrors existing REST patterns; minimal endpoints.
Alternatives: Fine-grained endpoints (e.g., /:id/sections/:sid/items) rejected—would increase complexity; whole-document updates acceptable at bounded size.

## Performance
Decision: Client recomputation pure O(total items) on mutation; with <750 items trivial; use memoized selectors to avoid unnecessary re-renders.
Rationale: Meets <100ms target comfortably.

## Testing Approach (Future)
Decision: Defer adding Jest now; manual verification + potential future introduction with contract tests (scaffold only if test framework later added).
Rationale: Repo currently lacks test infra; adding now would expand scope.

## Risks
- Missing constitution file means principles inferred; ensure no over-engineering.
- Whole-document PATCH risk of overwriting concurrent changes (accepted per requirement).

## Open Future Enhancements (Out-of-scope now)
- Version history
- Real-time collaborative presence
- Player assignment to groups
- Conflict detection (ETag)
- Duration auto-balancing tools
