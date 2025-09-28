# Quickstart: Practice Planner

## Goal
Create and adjust a practice plan verifying timing calculations and access control.

## Steps
1. Authenticate as coach (obtain JWT via existing login).
2. Create new practice plan (POST /api/practice-plans) – expect 3 default sections (Warm Up, Main, Cooldown) each with one group "All Players".
3. Rename a section and set targetDuration (e.g., 30 for Warm Up).
4. Add second group to Warm Up; add exercise items and a break to each group; observe group totals and section max compare vs target.
5. Override duration of an exercise in one group; verify section comparison updates instantly client-side.
6. Duplicate a section; confirm deep copy of groups/items.
7. Delete a group containing items (confirm prompt) then undo by duplicating remaining group.
8. Set targetDuration below current total and verify red styling when exceeded.
9. Remove an exercise from catalog (simulate by using an ID that no longer resolves) and reload plan; verify placeholder item.
10. Share plan with second coach (POST /:id/share) and perform edits as that coach; confirm identical capabilities.
11. Perform concurrent edits from two sessions; last save persists, earlier overwrite lost (accepted behavior).
12. Delete all sections; save plan; confirm empty plan persists and can add section later.

## Expected Outcomes
- All recalculations <100ms perceptually.
- Access denied for unauthorized user IDs.
- Placeholder shown for missing exercises.
- No version retrieval available.

## Cleanup
- Delete test practice plan (DELETE /api/practice-plans/:id).
