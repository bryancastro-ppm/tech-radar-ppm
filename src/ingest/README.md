# Dependency Ingestion System

Automatically detects and normalizes dependencies from repositories for the Tech Radar.

## Quick Start

```bash
# Scan current repository
PRODUCT_NAME=my-product GITHUB_REPOSITORY=my-repo npm run ingest

# Scan different repository
REPO_PATH=/path/to/repo PRODUCT_NAME=my-product GITHUB_REPOSITORY=my-repo npm run ingest
```

## Architecture

```
domain/              # Pure business entities
  └── DetectedDependency.ts

application/         # Use cases (business logic)
  └── use-cases/
      ├── detectDependencies.ts
      ├── toRadarEntries.ts
      └── markNewEntries.ts

infrastructure/      # External adapters
  ├── parsers/
  │   ├── LockfileDetector.ts
  │   ├── NpmLockParser.ts
  │   ├── YarnLockParser.ts (stub)
  │   └── PnpmLockParser.ts (stub)
  ├── PackageJsonReader.ts
  └── output/
      ├── writeRadarJson.ts
      └── fetchPreviousEntries.ts

index.ts            # CLI entry point
```

## How It Works

1. **Detect lockfile type** (npm, yarn, pnpm)
2. **Read package.json** for declared dependencies
3. **Resolve versions** from lockfile
4. **Convert to radar entries** with categorization
5. **Mark new dependencies** by comparing with previous scan
6. **Write output** to `radar-data/<product>.json`

## Supported Package Managers

- ✅ npm (lockfileVersion 3)
- ⏳ yarn (planned)
- ⏳ pnpm (planned)

## Output Format

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

## Testing

```bash
npm run test:run -- __tests__/ingest
```

## Documentation

See [docs/ingest-system.md](../../docs/ingest-system.md) for complete documentation.
