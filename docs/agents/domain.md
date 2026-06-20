# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

This is a **multi-context** repo: the QuadCoach system has two distinct contexts — a React/TypeScript frontend (`client/`) and a Node/Express/MongoDB backend (`server/`). Each gets its own `CONTEXT.md`.

## Before exploring, read these

1. **`CONTEXT-MAP.md`** at the repo root — the entry point. It lists each context and where its `CONTEXT.md` lives.
2. The relevant **per-context `CONTEXT.md`**:
   - **`client/CONTEXT.md`** — frontend domain language (UI, coaching flows, state, components).
   - **`server/CONTEXT.md`** — backend domain language (auth, data models, REST API, integrations).
3. **Architectural Decision Records**:
   - **`docs/adr/`** — system-wide decisions spanning both contexts.
   - **`client/docs/adr/`** — frontend-only decisions.
   - **`server/docs/adr/`** — backend-only decisions.

Read the ADRs that touch the area you're about to work in. When working across the stack (e.g. an end-to-end feature), read the system-wide ADRs plus the relevant context ADRs from both sides.

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The producer skill (`/grill-with-docs`) creates them lazily when terms or decisions actually get resolved.

## File structure

```
/
├── CONTEXT-MAP.md            ← points at each context's CONTEXT.md
├── docs/adr/                 ← system-wide decisions (span client + server)
├── client/
│   ├── CONTEXT.md            ← frontend domain language
│   └── docs/adr/             ← frontend-only decisions
└── server/
    ├── CONTEXT.md            ← backend domain language
    └── docs/adr/             ← backend-only decisions
```

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in the relevant `CONTEXT.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal — either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/grill-with-docs`).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0007 (event-sourced orders) — but worth reopening because…_

## When you create a new CONTEXT.md or ADR

- Pick the right scope. A term used only in the frontend goes in `client/CONTEXT.md`; a term shared by both client and server (e.g. a canonical REST resource shape) goes in `CONTEXT-MAP.md` as a shared term, or in `docs/adr/` if it's a decision.
- Update `CONTEXT-MAP.md` whenever you add a new per-context `CONTEXT.md` or move one.
