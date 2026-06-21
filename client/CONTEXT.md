# Client Context

The React/TypeScript frontend for QuadCoach. Consumes the backend REST API via RTK Query and hosts the tactic-board canvas. This glossary covers frontend-only vocabulary — UI flows and the canvas subsystem. Shared entity shapes (Exercise, TacticBoard, PracticePlan, Page, etc.) live in [`../CONTEXT-MAP.md`](../CONTEXT-MAP.md).

## Language

### Boards & canvas

**Drafting Board**:
An ephemeral, non-persisted TacticBoard used as a scratch pad for on-the-fly / in-game sketching. Auto-seeds a default half-court lineup (1 Keeper, 3 Chasers, 2 Beaters per side). Nothing drawn here is saved to the server.
_Avoid_: scratch board, whiteboard

**Animation**:
A playback mode of a TacticBoard: cycles through its Pages and interpolates each Object's position between consecutive pages (Objects are matched across pages by `uuid`). Can be recorded to MP4. Animation is a runtime behavior of a board, not a persisted artifact.
_Avoid_: play, playback (use "Animation" as the noun)

**Object**:
A fabric.js shape placed on a Page — a player token, ball, accessory, free-draw stroke, text, line, etc. Carries an `objectType` and a `uuid` (the latter is what lets Animation track an Object across pages).

**Team A / Team B**:
The two color-coded sides a board's player tokens belong to. A UI convention only — there is no persistent Team entity, and player tokens are anonymous.

### Palette

The set of placeable Objects on a board, drawn from the shared enums in [`../CONTEXT-MAP.md`](../CONTEXT-MAP.md):
- **Persons** — Chaser, Beater, Keeper, Seeker, per side (Team A / Team B).
- **Balls** — Volleyball, Dodgeball, FlagRunner.
- **Accessories** — cones (red/yellow/blue), Hoop, Ladder, Hurdle.

## Out of scope here

Component structure, Redux/RTK Query wiring, and the fabric.js context provider tree are implementation details, not glossary terms. Shared entity definitions are in [`../CONTEXT-MAP.md`](../CONTEXT-MAP.md); permission/auth vocabulary is in [`../server/CONTEXT.md`](../server/CONTEXT.md).
