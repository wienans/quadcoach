# QuadCoach Development Guide

## Build/Test Commands

- **Client**: `cd client && npm run dev` (development), `npm run build` (production), `npm run lint` (ESLint), `npm run lint:fix` (auto-fix)
- **Server**: `cd server && npm run dev` (development), `npm run build` (production)
- **No test framework configured** - verify functionality manually or add testing setup

## Code Style Guidelines

- **TypeScript**: Strict mode enabled, use proper types, avoid `any`
- **Imports**: ES6 imports, group by: external libraries, internal modules, relative imports
- **Formatting**: Prettier with default config (empty .prettierrc), 2-space indentation
- **Naming**: camelCase for variables/functions, PascalCase for components/types, UPPER_CASE for constants
- **Components**: Use forwardRef pattern for reusable components, export default
- **Error Handling**: Use asyncHandler for async routes, return early with status codes
- **State**: Redux Toolkit with typed selectors, immutable updates
- **API**: RESTful endpoints with proper HTTP status codes (200, 201, 400, 401, 403, 404, 409)

## Architecture

- **Frontend**: React + TypeScript + Vite + Redux Toolkit + Material-UI
- **Backend**: Node.js + Express + TypeScript + MongoDB + JWT auth
- **Structure**: Separate client/server directories, feature-based organization

## Important

- **DO NOT RUN THE DEV SERVER I HAVE IT ALREADY RUNNING**
- **DO NOT COMMIT YOUR CHANGES**
