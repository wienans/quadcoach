# QuadCoach Development Guide

## Build/Test Commands

- **Client**: `cd client && npm run dev` (development), `npm run build` (production), `npm run lint` (ESLint), `npm run lint:fix` (auto-fix)
- **Server**: `cd server && npm run dev` (development), `npm run build` (production)
- **No test framework configured** - verify functionality manually or add testing setup

## Code Style Guidelines

- **TypeScript**: Strict mode enabled, use proper types, avoid `any`
- **Imports**: ES6 imports
- **Formatting**: Prettier with default config (empty .prettierrc), 2-space indentation
- **Naming**: camelCase for variables/functions, PascalCase for components/types, UPPER_CASE for constants
- **Components**: Use forwardRef only when a component intentionally exposes a DOM node or imperative handle. Prefer ordinary function components otherwise.
- **Error Handling**: Use asyncHandler for async routes, return early with status codes
- **State**: Redux Toolkit with typed selectors
- **API**: RESTful endpoints with proper HTTP status codes

## Architecture

- **Frontend**: React + TypeScript + Vite + Redux Toolkit + Material-UI
- **Backend**: Node.js + Express + TypeScript + MongoDB + JWT auth
- **Structure**: Separate client/server directories, feature-based organization

## Important

- **DO NOT RUN THE DEV SERVER I HAVE IT ALREADY RUNNING**
- **Only commit changes if instructed to**

## Agent skills

### Issue tracker

Issues live in GitHub Issues; skills use the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Canonical triage labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Multi-context layout — `CONTEXT-MAP.md` at root points to per-context `CONTEXT.md` files under `client/` and `server/`. See `docs/agents/domain.md`.
