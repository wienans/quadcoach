# QuadCoach - Digital Assistant Coach for Quadball

**ALWAYS FOLLOW THESE INSTRUCTIONS FIRST.** Only fallback to additional search and context gathering if the information in these instructions is incomplete or found to be in error.

## Working Effectively

### Required Environment Setup
- **Node.js**: Version 20+ (confirmed working with v20.19.5)
- **Docker**: Required for development and production environments
- **CRITICAL**: Create `secret.env` file in repository root before any Docker operations:

```bash
node -e "console.log('ACCESS_TOKEN_SECRET=' + require('crypto').randomBytes(64).toString('hex')); console.log('REFRESH_TOKEN_SECRET=' + require('crypto').randomBytes(64).toString('hex'));" > secret.env
```

### Build Commands and Timing

**NEVER CANCEL ANY BUILD COMMANDS. ALWAYS WAIT FOR COMPLETION.**

#### Client (Frontend) Build
```bash
cd client
npm install                    # ~30 seconds
npm run build                  # ~45 seconds - NEVER CANCEL, set timeout to 120+ seconds
npm run lint                   # ~5 seconds 
npm run lint:fix              # ~30 seconds - runs ESLint fix + Prettier
```

#### Server (Backend) Build
```bash
cd server
npm install                    # ~6 seconds
npm run build                  # ~4 seconds - TypeScript compilation
```

#### Production Build (Complete)
```bash
bash start_prod.bash          # 15+ minutes - NEVER CANCEL, set timeout to 30+ minutes
```
This command:
1. Builds client (~45 seconds)
2. Builds server (~4 seconds) 
3. Builds Docker images and starts containers (13+ minutes)

### Development Environment

**CRITICAL**: DO NOT run `npm run dev` commands - development servers may already be running.

#### Docker Development Setup
```bash
# Validate configuration (always run first)
docker compose -f docker-compose.dev config

# Start development environment (NEVER CANCEL - set timeout to 20+ minutes)
docker compose -f docker-compose.dev up --build

# Start in detached mode
docker compose -f docker-compose.dev up --build -d

# Clean rebuild when adding new Node modules
docker compose -f docker-compose.dev down
docker rm quadcoach-backend quadcoach-frontend
docker image rm quadcoach-backend quadcoach-frontend
```

**Development URLs:**
- Frontend: http://localhost:5173 (Vite dev server)
- Backend API: http://localhost:3001
- MongoDB: localhost:27017

**Production URL:**
- Complete application: http://localhost:3001 (served from backend)

### Manual Validation Requirements

**ALWAYS perform these validation steps after making changes:**

1. **Build Validation**: Run both client and server builds to ensure no compilation errors
2. **Lint Validation**: Run `npm run lint` in both client and server directories  
3. **Code Style**: Run `npm run lint:fix` in client directory before committing
4. **Integration Testing**: If Docker is available, build and start the development environment to verify integration

**No automated test framework is configured** - verify functionality manually through the application UI.

## Architecture and Codebase Structure

### Technology Stack
- **Frontend**: React + TypeScript + Vite + Redux Toolkit + Material-UI
- **Backend**: Node.js + Express + TypeScript + MongoDB + JWT auth
- **Build Tools**: Vite (frontend), TypeScript (backend), Docker (deployment)
- **Development**: Hot reloading via Vite proxy and nodemon

### Key Directories and Navigation

#### Client Structure (`/client/`)
```
src/
├── api/                    # API layer with RTK Query
├── assets/theme/           # Material-UI theme customization
├── components/            # Reusable React components
├── contexts/              # React contexts (TacticBoard, etc.)
├── pages/                 # Route components and page-level logic
├── store/                 # Redux store and slices
└── helpers/               # Utility functions
```

#### Server Structure (`/server/`)
```
controllers/               # Route handlers and business logic
routes/                   # Express route definitions  
models/                   # MongoDB/Mongoose schemas
middleware/               # Express middleware
config/                   # Database and app configuration
templates/                # Email templates
```

#### Important Files
- `client/vite.config.ts`: Vite configuration with proxy setup
- `client/package.json`: Frontend dependencies and scripts
- `server/package.json`: Backend dependencies and scripts
- `docker-compose.dev`: Development environment setup
- `docker-compose.prod`: Production environment setup
- `start_prod.bash`: Production build and deployment script

### Code Style Guidelines

**ALWAYS follow these patterns:**

- **TypeScript**: Strict mode enabled, use proper types, avoid `any`
- **Imports**: ES6 imports, group by: external libraries, internal modules, relative imports
- **Formatting**: Prettier with 2-space indentation (empty .prettierrc config)
- **Naming**: camelCase for variables/functions, PascalCase for components/types, UPPER_CASE for constants
- **Components**: Use forwardRef pattern for reusable components, export default
- **Error Handling**: Use asyncHandler for async routes, return early with status codes
- **State**: Redux Toolkit with typed selectors, immutable updates
- **API**: RESTful endpoints with proper HTTP status codes (200, 201, 400, 401, 403, 404, 409)

### Database and Authentication
- **MongoDB**: Database with initialization script (`mongo-init.js`)
- **Authentication**: JWT-based with access and refresh tokens
- **User Management**: Role-based with admin capabilities
- **Data Models**: Users, Exercises, TacticBoards, Favorites

### CI/CD Information
- **GitHub Actions**: `.github/workflows/build.yaml` - builds both client and server
- **Lint enforcement**: Currently commented out in CI but works locally
- **ALWAYS run linting before committing** to avoid potential CI failures

## Common Commands Reference

### Dependency Management
```bash
# Client dependencies
cd client && npm install

# Server dependencies  
cd server && npm install

# Clean install (when package-lock.json changes)
cd client && rm -rf node_modules package-lock.json && npm install
cd server && rm -rf node_modules package-lock.json && npm install
```

### Development Workflow
```bash
# 1. Setup (run once)
node -e "console.log('ACCESS_TOKEN_SECRET=' + require('crypto').randomBytes(64).toString('hex')); console.log('REFRESH_TOKEN_SECRET=' + require('crypto').randomBytes(64).toString('hex'));" > secret.env

# 2. Build and validate
cd client && npm install && npm run build && npm run lint
cd server && npm install && npm run build

# 3. Start development environment (if needed)
docker compose -f docker-compose.dev up --build -d

# 4. Before committing changes
cd client && npm run lint:fix
```

### Troubleshooting

**Common Issues:**
- **Missing secret.env**: Create with the Node.js command above
- **Docker build fails**: Ensure secret.env exists and Docker has sufficient memory
- **Port conflicts**: Check if ports 3001, 5173, or 27017 are in use
- **Build warnings about large chunks**: Expected for the current client build configuration
- **npm audit vulnerabilities**: Known issue, dependencies are functional

**When Docker operations take longer than expected:**
- **NEVER CANCEL** - Docker builds can take 15+ minutes
- **Production builds**: Always allow 30+ minutes timeout
- **Development setup**: Allow 20+ minutes for initial setup
- **Image downloads**: Node.js base image is large (~211MB)

This is a well-structured MERN application with modern tooling. The build processes are reliable but require patience due to Docker operations and large dependency trees.