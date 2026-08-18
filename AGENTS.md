<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Tech Radar - Frontend

## Project Overview
Tech Radar for Frontend tools used by the Membresías chapter. Built with Clean Architecture principles.

## Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run typecheck` - TypeScript type checking
- `npm run lint` - ESLint
- `npm run scan` - Scan dependencies from a package.json

## Architecture
This project follows Clean Architecture with the following layers:
- `domain/` - Entities and pure business logic (no external dependencies)
- `application/` - Use cases and ports (interfaces)
- `infrastructure/` - Adapters (repositories, external services)
- `presentation/` - UI components (React/Next.js)

### Key Rules
- Domain layer cannot import from any other layer
- Application layer can only import from domain
- Infrastructure implements ports defined in application
- Presentation uses application use-cases, never infrastructure directly

## Component Structure
Following chapter conventions:
- `base/` - Atomic components (wrappers over HeroUI)
- `elements/` - Molecules
- `blocks/` - Organisms
- `layouts/` - Page layouts

## Testing
- Use Vitest for all tests
- Domain and application layers should have unit tests
- Use fake repositories for testing use-cases

## Data Flow
1. Product repos push changes to `package.json`
2. GitHub Action runs `scanDependencies.ts`
3. Generated JSON is pushed to `radar-data/`
4. App revalidates via `/api/revalidate` endpoint
