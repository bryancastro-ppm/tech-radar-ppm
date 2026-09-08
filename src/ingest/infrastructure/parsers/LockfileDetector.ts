import { existsSync } from 'node:fs';
import { join } from 'node:path';

export type LockfileType = 'npm' | 'yarn' | 'pnpm' | 'unknown';

/**
 * Detects which package manager lockfile is present in a repository.
 * Checks for package-lock.json (npm), yarn.lock (yarn), or pnpm-lock.yaml (pnpm).
 * 
 * @param repoPath - Absolute path to the repository root
 * @returns The detected lockfile type
 */
export function detectLockfileType(repoPath: string): LockfileType {
  if (existsSync(join(repoPath, 'package-lock.json'))) return 'npm';
  if (existsSync(join(repoPath, 'yarn.lock'))) return 'yarn';
  if (existsSync(join(repoPath, 'pnpm-lock.yaml'))) return 'pnpm';
  return 'unknown';
}
