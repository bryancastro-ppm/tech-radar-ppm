import { readFile } from 'node:fs/promises';

/**
 * Structure of npm lockfile v3 (npm >= 7)
 * Only includes the fields we need for version resolution
 */
interface NpmLockV3 {
  lockfileVersion?: number;
  packages: Record<string, { version?: string }>;
}

/**
 * Resolves the actual installed version of a package from package-lock.json.
 * 
 * @param lockPath - Absolute path to package-lock.json
 * @param packageName - Name of the package to resolve
 * @returns The resolved version, or undefined if not found
 * 
 * @example
 * ```ts
 * const version = await resolveVersionFromNpmLock(
 *   '/path/to/package-lock.json',
 *   'react'
 * );
 * // Returns: "19.0.2"
 * ```
 */
export async function resolveVersionFromNpmLock(
  lockPath: string,
  packageName: string,
): Promise<string | undefined> {
  const raw = await readFile(lockPath, 'utf-8');
  const lock: NpmLockV3 = JSON.parse(raw);
  
  // In lockfileVersion 3, packages are stored as "node_modules/<package-name>"
  return lock.packages[`node_modules/${packageName}`]?.version;
}
