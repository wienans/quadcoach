# Naming convention: PascalCase entities, camelCase fields, lowercase-plural storage

To stop the casing drift already in the codebase, we standardize on one convention and record the known deviations as a cleanup backlog. Code is **not** renamed in this pass — the working app is left untouched; the backlog is addressed opportunistically.

- **Entities / types / components**: PascalCase — `TacticBoard`, `PracticePlan`, `Exercise`. `TacticBoard` is canonical; `Tacticboard` and `TacticsBoard` (e.g. `TacticsBoardToolBar`) are legacy variants.
- **Fields**: camelCase — `tacticBoard`, `practicePlan`. The existing snake_case field `tactics_board` on Exercise is non-canonical.
- **Collections & routes**: lowercase plural — `tacticboards`, `practiceplans`, `exercises`.

## Cleanup backlog (rename later)

- `client/src/api/quadcoachApi/domain/Favorits.ts` → `Favorites.ts`
- `client/src/components/PresistLogin` → `PersistLogin`
- `client/src/hooks/taticBoard/` → `tacticBoard/`
- enum value `tacitcBoardProfile` (`client/src/pages/routes/routeTypes.ts`) → `tacticBoardProfile`
- `TacticsBoardToolBar` → `TacticBoardToolBar`

## Consequences

New code follows the convention; existing deviations stay until the backlog is done. The glossary entries (see `CONTEXT-MAP.md`) are the source of truth for canonical casing, so docs and new code are consistent even while old code lags.
