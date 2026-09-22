# Dependency Ingestion System

## Overview

The dependency ingestion system automatically detects, parses, and normalizes dependencies from repositories, making them available to the Tech Radar. This implementation follows Clean Architecture principles and is designed to be extensible and maintainable.

## Architecture

The system is organized into three main layers:

### Domain Layer (`src/ingest/domain/`)
- **DetectedDependency**: Pure domain entity representing a dependency with its declared range and resolved version

### Application Layer (`src/ingest/application/use-cases/`)
- **detectDependencies**: Orchestrates the detection process
- **toRadarEntries**: Converts detected dependencies to radar entries
- **markNewEntries**: Marks new dependencies by comparing with previous scans

### Infrastructure Layer (`src/ingest/infrastructure/`)
- **Parsers**: Read and parse lockfiles (npm, yarn, pnpm)
- **PackageJsonReader**: Reads package.json manifests
- **Output**: Writes radar data and fetches previous entries

## What Gets Detected

The system detects **only direct dependencies** (both `dependencies` and `devDependencies` from package.json). Transitive dependencies are intentionally excluded to avoid noise.

### Version Resolution

- **Declared Range**: The version range from package.json (e.g., `^19.0.0`)
- **Resolved Version**: The actual installed version from the lockfile (e.g., `19.0.2`)
- The radar displays the **resolved version** since that's what runs in production

## Supported Package Managers

Currently supported:
- ✅ **npm** (lockfileVersion 3, npm >= 7)

Planned (stubs in place):
- ⏳ **yarn** (not implemented yet)
- ⏳ **pnpm** (not implemented yet)

## Usage

### Local Development

Scan the current repository:

```bash
PRODUCT_NAME=tech-radar GITHUB_REPOSITORY=tech-radar npm run ingest
```

Scan a different repository:

```bash
REPO_PATH=/path/to/repo PRODUCT_NAME=my-product GITHUB_REPOSITORY=my-repo npm run ingest
```

### Environment Variables

- `REPO_PATH`: Path to the repository to scan (default: current directory)
- `PRODUCT_NAME`: Name of the product (required)
- `GITHUB_REPOSITORY`: GitHub repository name (required)
- `OUTPUT_DIR`: Output directory for radar data (default: `./radar-data`)

### GitHub Actions

The system includes two workflows:

#### 1. Reusable Workflow (`scan-dependencies.yml`)

Can be called from product repositories to automatically scan and publish dependencies:

```yaml
# In product repo: .github/workflows/radar-scan.yml
name: Radar Scan
on:
  push:
    branches: [main]
    paths: ['package.json', 'package-lock.json']
jobs:
  scan:
    uses: <org>/tech-radar/.github/workflows/scan-dependencies.yml@main
    with:
      product-name: membresias-web
    secrets:
      RADAR_DATA_PUSH_TOKEN: ${{ secrets.RADAR_DATA_PUSH_TOKEN }}
```

#### 2. Self-Scan Workflow (`scan-self.yml`)

Automatically scans the tech-radar repository itself when dependencies change.

## Categorization

Dependencies are automatically categorized into quadrants using the categorization map at `src/core/config/categorization-map.ts`.

### Quadrants

- `frameworks-librerias`: React, Next.js, Vue, etc.
- `gestion-de-estado`: Zustand, Redux, React Query, etc.
- `testing`: Vitest, Jest, Testing Library, etc.
- `estilos-ui`: Tailwind, PostCSS, styled-components, etc.
- `build-tools`: TypeScript, ESLint, Vite, etc.
- `sin-categorizar`: Uncategorized (needs manual classification)

### Adding New Categories

Edit `src/core/config/categorization-map.ts`:

```typescript
export const categorizationMap: Record<string, Quadrant> = {
  'my-new-package': 'frameworks-librerias',
  // ...
};
```

The CLI will warn about uncategorized dependencies after each scan.

## New Dependency Detection

The system tracks which dependencies are new by comparing against the previous scan:

1. First scan: All dependencies marked as `isNew: true`
2. Subsequent scans: Only newly added packages marked as `isNew: true`
3. Version updates: Same package with different version is NOT marked as new

## Error Handling

| Scenario | Behavior |
|----------|----------|
| Lockfile missing | Job fails explicitly with error message |
| Unsupported lockfile (yarn/pnpm) | Throws `UnsupportedLockfileError` |
| Package in package.json but not in lockfile | Uses declared range as fallback + warning |
| No changes in dependencies | Skips git commit (no-op) |

## Testing

Run tests:

```bash
npm run test:run -- __tests__/ingest
```

Test coverage includes:
- Lockfile detection
- Version resolution from npm lockfile
- Dependency detection with fixtures
- Radar entry conversion
- New entry marking logic

### Test Fixtures

Located at `__tests__/ingest/fixtures/sample-repo/`:
- `package.json`: Sample manifest
- `package-lock.json`: Sample lockfile (npm v3)

## File Structure

```
src/ingest/
├── domain/
│   └── DetectedDependency.ts          # Domain entity
├── application/
│   └── use-cases/
│       ├── detectDependencies.ts      # Main detection logic
│       ├── toRadarEntries.ts          # Conversion to radar format
│       └── markNewEntries.ts          # New dependency detection
├── infrastructure/
│   ├── parsers/
│   │   ├── LockfileDetector.ts        # Detects lockfile type
│   │   ├── NpmLockParser.ts           # npm lockfile parser
│   │   ├── YarnLockParser.ts          # Stub for yarn
│   │   └── PnpmLockParser.ts          # Stub for pnpm
│   ├── PackageJsonReader.ts           # Reads package.json
│   └── output/
│       ├── writeRadarJson.ts          # Writes radar data
│       └── fetchPreviousEntries.ts    # Fetches previous scan
└── index.ts                            # CLI entry point
```

## Output Format

Generated files are stored in `radar-data/<product>.json`:

```json
[
  {
    "name": "react",
    "version": "19.0.2",
    "quadrant": "frameworks-librerias",
    "ring": "adopt",
    "product": "membresias-web",
    "repository": "membresias-web",
    "isNew": false
  }
]
```

## Future Enhancements

- [ ] Implement yarn lockfile parser
- [ ] Implement pnpm lockfile parser
- [ ] Support for monorepos (detect multiple package.json files)
- [ ] Configurable ring assignment (currently all dependencies are "adopt")
- [ ] Dependency change notifications (Slack, email, etc.)
- [ ] Historical tracking of dependency versions over time

## Troubleshooting

### "Lockfile de tipo 'unknown' no soportado todavía"

The repository doesn't have a package-lock.json file. Either:
1. Run `npm install` to generate one
2. The repo uses yarn/pnpm (not supported yet)

### "Package not found in lockfile"

A package is declared in package.json but not resolved in the lockfile. This can happen with:
- npm overrides
- Peer dependencies
- Corrupted lockfile

Solution: Run `npm install` to regenerate the lockfile.

### Uncategorized dependencies

The CLI will list packages that need categorization. Add them to `src/core/config/categorization-map.ts`.

## Related Documentation

- [TECH-DOCUMENTATION.md](./TECH-DOCUMENTATION.md) - Full technical documentation (architecture, data flow, domain model)
- [AGENTS.md](../AGENTS.md) - Project rules and conventions
