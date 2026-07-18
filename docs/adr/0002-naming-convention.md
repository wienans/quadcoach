# Naming convention: PascalCase entities, camelCase fields, lowercase-plural storage

To stop casing drift, the codebase uses one naming convention while explicit boundary adapters preserve permanent external contracts.

- **Entities / types / components**: PascalCase — `TacticBoard`, `PracticePlan`, `Exercise`.
- **Fields**: camelCase — `tacticBoard`, `practicePlan`. The existing snake_case field `tactics_board` on Exercise is non-canonical.
- **Collections & routes**: lowercase plural — `tacticboards`, `practiceplans`, `exercises`.

## Remaining cleanup backlog

- `client/src/api/quadcoachApi/domain/Favorits.ts` → `Favorites.ts`
- `client/src/components/PresistLogin` → `PersistLogin`

## Consequences

New code follows the convention. Permanent HTTP, browser-route, JSON, and persistence names stay unchanged and are translated by compatibility adapters. The glossary entries (see `CONTEXT-MAP.md`) are the source of truth for canonical casing.
