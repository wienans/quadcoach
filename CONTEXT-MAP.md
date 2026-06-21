# Context Map

QuadCoach is the digital assistant coach for Quadball. It is a **multi-context** system: a React/TypeScript frontend (`client/`) and a Node/Express/MongoDB backend (`server/`).

This file is the entry point for the project's domain documentation. It lists the contexts, how they relate, and the **shared language** used across both. Each context also has its own `CONTEXT.md` for context-specific vocabulary.

## Contexts

- [Client](./client/CONTEXT.md) — the React frontend: UI, coaching flows, the tactic-board canvas, and client-side state.
- [Server](./server/CONTEXT.md) — the Express + MongoDB backend: data models, REST API, auth, and sharing/permissions.

## Relationships

- **Client → Server**: the client consumes the REST API under `/api/*` via RTK Query; the server serves the built client in production.
- **Client ↔ Server**: share canonical resource shapes for the core content entities (Exercise, TacticBoard, PracticePlan) and the auth model (JWT access token + refresh cookie).

## Shared Language

These terms belong to the sport of Quadball and are used identically on both sides of the stack. See [ADR-0001](./docs/adr/0001-quadball-rulebook-naming.md) for why the balls use generic names.

**Volleyball**:
The scoring ball — put through the hoops by Chasers/Keepers. Not a Quaffle; the name follows the post-rename Quadball rulebook.
_Avoid_: Quaffle

**Dodgeball**:
The knockout ball — thrown by Beaters to disrupt players. Not a Bludger; rulebook name.
_Avoid_: Bludger

**FlagRunner**:
The snitch/flag ball pursued by Seekers. Not a Snitch; rulebook name.
_Avoid_: Snitch

**Chaser**:
A player position; scores with the Volleyball. One of the two "tracks" exercises are counted against (the other is Beater).

**Beater**:
A player position; throws Dodgeballs.

**Keeper**:
A Chaser with extra privileges that apply only in defence. In attack a Keeper plays as a Chaser, so Exercises do not count Keepers separately — they are folded into the Chaser count.

**Seeker**:
A player position; pursues the FlagRunner. Not counted on Exercises today; seeker-specific drills are handled via tags.

### Why Exercises count only Chasers and Beaters

Quadball drills split naturally into the chaser-track (Chasers + Keeper) and the beater-track (Beaters). Seekers are a special case addressed with tags. So the Exercise model carries only `chasers` and `beaters` counts (plus a total `persons`), and `ExerciseType` derives as `general | all | beater | chaser`.

**Court / Pitch**:
The playing surface. "Court" and "pitch" are used as synonyms; "pitch" is preferred when talking about the full pitch in a game scenario. "Court" is used in compound asset names (`empty-court`, `half-court`, `full-court`) because "half-pitch" sounds wrong.
_Avoid_: none — both terms are fine

## Shared Language — Core Entities

These are the canonical content entities shared across client and server (REST resource shapes). Domain meaning lives here; persistence/rendering details live in the per-context `CONTEXT.md` files.

**Exercise**:
The atomic coaching unit — a named, reusable activity a coach runs at practice. Composed of an ordered list of Blocks.
_Avoid_: Drill (informal synonym), Play

**Block**:
A single ordered step within an Exercise. Has a description, optional video, coaching points, a duration, and an optional embedded TacticBoard. An Exercise's total time is the sum of its Blocks' durations.
_Avoid_: description_block (the storage field name), step

**TacticBoard**:
A multi-page canvas (built on fabric.js) for drawing Quadball situations with players, balls, accessories, free-draw, and text. A board pulls double duty today: it models both **exercise setups** (how to lay a drill out) and **set plays** (in-game tactics). There is no field that distinguishes the two uses.
_Avoid_: Tacticboard, TacticsBoard (legacy casing variants in code — treat `TacticBoard` as canonical)

**Page**:
A single frame of a TacticBoard. Objects are matched across pages by `uuid` so the board can animate movement between consecutive pages.

**Set Play**:
A tactic intended to be executed in a game (distinct from an Exercise, which is practiced). Not a first-class entity: today a set play is just a TacticBoard used for that purpose, with no dedicated feature or field.
_Avoid_: Play (short form is fine informally, but "Set Play" is the canonical term)

**PracticePlan**:
A structured plan for a single practice session. Divided into Sections.

**Section**:
A phase of a practice with its own time slot — e.g. warm-up, main, cool-down. Has a target duration. Contains one or more Groups that run in parallel within the Section's time slot.

**Group**:
A set of players who train together during a Section. Most often split by position (e.g. Chasers vs. Beaters) so different Groups run different exercises in parallel on different parts of the court. A Section may also contain a single Group when the whole team trains together.
_Avoid_: Station (a Group is about the players; "station" is a fine informal description of what each parallel Group experiences, but not the canonical term)

**Item**:
The unit scheduled within a Group — either an Exercise reference (optionally pinning a specific Block) or a Break. Multiple Items fill the Group's time within its Section.

**Break**:
A non-Exercise Item in a PracticePlan (e.g. a water break or rest).
