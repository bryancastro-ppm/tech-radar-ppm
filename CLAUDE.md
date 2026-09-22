# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tech Radar for Frontend tools used by PPM's Membresías chapter — a Next.js app (App Router) that visualizes each product's dependencies as a radar (quadrant + ring), built with Clean Architecture. See `AGENTS.md` for the canonical project rules (also read by other agent tools) and `docs/` for feature-level specs.

## Commands

```bash
npm run dev              # Start dev server (http://localhost:3000)
npm run build             # Production build
npm start                 # Run production build

npm run lint               # ESLint (next/core-web-vitals + next/typescript)
npm run lint:fix
npm run format              # Prettier write on src/**/*.{ts,tsx}
npm run format:check
npm run typecheck            # tsc --noEmit

npm run test                # Vitest watch mode
npm run test:run             # Vitest single run
npm run test:coverage
npx vitest run path/to/file.test.ts        # Run a single test file
npx vitest run -t "test name"              # Filter by test name

npm run scan               # Legacy CLI: scripts/ingest/scanDependencies.ts (superseded by `ingest`)
npm run ingest              # Detect deps for one repo and write radar-data/<product>.json (see below)
```

Node version is pinned via `.nvmrc` (20). Tests use Vitest + jsdom + Testing Library (`vitest.config.ts`), with the `@` alias resolving to `src/`.

## Architecture

Two independent Clean Architecture modules live under `src/`: `src/radar` (renders the radar) and `src/ingest` (produces the data the radar reads). Each follows the same layering, enforced by convention, not lint rules:

- `domain/` — entities/value-objects/pure services, no imports from other layers.
- `application/` — use-cases and ports (interfaces); only imports from `domain`.
- `infrastructure/` — adapters implementing the ports (filesystem, HTTP, lockfile parsers).
- `presentation/` (radar module only) — React/Next components; uses application use-cases, never infrastructure directly. Follows atomic-design naming: `base/` (atoms, wrap HeroUI), `elements/` (molecules), `blocks/` (organisms), `layouts/` (templates).

`src/core/config` holds cross-cutting config: `categorization-map.ts` maps package names to radar quadrants (uncategorized deps fall into `sin-categorizar` and get flagged during ingest), `env.ts` validates process env with Zod.

### Data flow: two ways radar-data gets populated

1. **Automated (GitHub Actions)** — `.github/workflows/scan-dependencies.yml` is a reusable workflow product repos call on push; it runs `npm run ingest` (`src/ingest/index.ts`), which reads `package.json` + lockfile, resolves exact versions, categorizes, diffs against the previous JSON to flag new deps, and writes `radar-data/<product>.json` in this repo. `scan-self.yml` runs the same pipeline against this repo's own `package.json`. Note: `radar-scan.yml` is an older variant of this same workflow that pushed to a separate `radar-data` repo instead of writing into this repo — treat it as legacy/inactive next to `scan-dependencies.yml`.
2. **Manual upload (`/upload` page → `POST /api/upload-package`)** — takes a raw `package.json` upload (no lockfile), so versions are shown as declared ranges (e.g. `^19.0.0`) rather than resolved exact versions. Uses `detectDependenciesFromContent.ts` instead of the lockfile-based `detectDependencies.ts`, then shares the rest of the ingest pipeline (categorize → diff → write) and calls `revalidateTag('radar-data')` directly.

Both paths converge on the same use-cases (`toRadarEntries`, `markNewEntries`, `writeRadarJson`), so changes to entry shape/categorization only need to happen once in `src/ingest/application`.

### Reading radar data

`RadarRepository` (port in `src/radar/application/ports`) has two implementations selected by call site, not by env flag:
- `LocalRadarRepository` reads `radar-data/*.json` directly off disk — the one actually wired up, in `src/app/page.tsx` (the deployed app reads its own bundled `radar-data/`).
- `GitRadarRepository` fetches each product's JSON over HTTP from `RADAR_DATA_URL` (falling back to the local `/api/radar-data/[product]` route). It's implemented and exported from `src/radar/index.ts` but currently unused by any page/route — swap it in if radar data ever needs to live outside the deployed instance.

The product list is **never hardcoded**: `getAvailableProducts()` (`src/radar/infrastructure/utils/getAvailableProducts.ts`) discovers products by scanning filenames in `radar-data/`, and both repository implementations call it. Adding a product is just adding a JSON file there.

Cache invalidation: `POST /api/revalidate` (guarded by `x-radar-secret` header matching `RADAR_REVALIDATE_SECRET`) and the upload route both call `revalidateTag('radar-data')` to bust the Next.js data cache after `radar-data/` changes.

## Deployment

Deploys to Netlify (`netlify.toml`, `@netlify/plugin-nextjs`, `NPM_FLAGS=--legacy-peer-deps`). CI (`.github/workflows/ci.yml`) runs lint, `test:run`, and build on every push/PR to `main`.
