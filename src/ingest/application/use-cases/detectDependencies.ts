import { join } from 'node:path';
import { readPackageJson } from '@/ingest/infrastructure/PackageJsonReader';
import { detectLockfileType } from '@/ingest/infrastructure/parsers/LockfileDetector';
import { resolveVersionFromNpmLock } from '@/ingest/infrastructure/parsers/NpmLockParser';
import type { DetectedDependency } from '@/ingest/domain/DetectedDependency';

/**
 * Error thrown when the lockfile type is not supported yet
 */
export class UnsupportedLockfileError extends Error {
  constructor(type: string) {
    super(`Lockfile de tipo "${type}" no soportado todavía`);
    this.name = 'UnsupportedLockfileError';
  }
}

/**
 * Detects all direct dependencies (dependencies + devDependencies) from a repository.
 * Reads package.json for declared ranges and the lockfile for resolved versions.
 * 
 * @param repoPath - Absolute path to the repository root
 * @returns Array of detected dependencies with their resolved versions
 * 
 * @throws {UnsupportedLockfileError} If the lockfile type is not npm (yarn/pnpm not supported yet)
 * @throws {Error} If package.json or lockfile cannot be read
 * 
 * @example
 * ```ts
 * const deps = await detectDependencies('/path/to/repo');
 * // Returns: [
 * //   { name: 'react', declaredRange: '^19.0.0', resolvedVersion: '19.0.2', isDev: false, source: 'dependencies' },
 * //   { name: 'vitest', declaredRange: '^2.0.0', resolvedVersion: '2.0.5', isDev: true, source: 'devDependencies' }
 * // ]
 * ```
 */
export async function detectDependencies(repoPath: string): Promise<DetectedDependency[]> {
  const lockType = detectLockfileType(repoPath);
  if (lockType !== 'npm') {
    throw new UnsupportedLockfileError(lockType);
  }

  const manifest = await readPackageJson(join(repoPath, 'package.json'));
  const lockPath = join(repoPath, 'package-lock.json');
  const entries: DetectedDependency[] = [];

  const groups = [
    { deps: manifest.dependencies, isDev: false, source: 'dependencies' as const },
    { deps: manifest.devDependencies, isDev: true, source: 'devDependencies' as const },
  ];

  for (const group of groups) {
    for (const [name, declaredRange] of Object.entries(group.deps ?? {})) {
      const resolvedVersion = await resolveVersionFromNpmLock(lockPath, name);
      
      // Fallback to declared range if not found in lockfile (rare case with overrides)
      const version = resolvedVersion ?? declaredRange;
      
      if (!resolvedVersion) {
        console.warn(`⚠️  Package "${name}" not found in lockfile, using declared range`);
      }
      
      entries.push({
        name,
        declaredRange,
        resolvedVersion: version,
        isDev: group.isDev,
        source: group.source,
      });
    }
  }

  return entries;
}
