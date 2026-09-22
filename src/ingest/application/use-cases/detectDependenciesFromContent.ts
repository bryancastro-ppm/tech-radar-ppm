import type { DetectedDependency } from '@/ingest/domain/DetectedDependency';
import type { RawManifest } from '@/ingest/infrastructure/PackageJsonReader';

/**
 * Detects dependencies from package.json content (string) without requiring filesystem access.
 * This is useful for processing uploaded files or content from external sources.
 * 
 * Unlike `detectDependencies`, this function:
 * - Works with string content instead of file paths
 * - Does not require a lockfile
 * - Uses declared ranges as resolved versions (less precise but acceptable for manual uploads)
 * 
 * @param packageJsonContent - Raw content of package.json as a string
 * @returns Array of detected dependencies with declared ranges as resolved versions
 * 
 * @throws {Error} If the content is not valid JSON
 * @throws {Error} If the JSON doesn't contain dependencies or devDependencies
 * 
 * @example
 * ```ts
 * const content = `{
 *   "dependencies": { "react": "^19.0.0" },
 *   "devDependencies": { "vitest": "^2.0.0" }
 * }`;
 * 
 * const deps = await detectDependenciesFromContent(content);
 * // Returns: [
 * //   { name: 'react', declaredRange: '^19.0.0', resolvedVersion: '^19.0.0', isDev: false, source: 'dependencies' },
 * //   { name: 'vitest', declaredRange: '^2.0.0', resolvedVersion: '^2.0.0', isDev: true, source: 'devDependencies' }
 * // ]
 * ```
 */
export async function detectDependenciesFromContent(
  packageJsonContent: string,
): Promise<DetectedDependency[]> {
  // Parse JSON content
  let manifest: RawManifest;
  try {
    manifest = JSON.parse(packageJsonContent);
  } catch (error) {
    throw new Error(
      `Invalid JSON content: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }

  // Validate that there are dependencies
  const hasDependencies = manifest.dependencies && Object.keys(manifest.dependencies).length > 0;
  const hasDevDependencies =
    manifest.devDependencies && Object.keys(manifest.devDependencies).length > 0;

  if (!hasDependencies && !hasDevDependencies) {
    throw new Error('No dependencies or devDependencies found in package.json');
  }

  const entries: DetectedDependency[] = [];

  const groups = [
    { deps: manifest.dependencies, isDev: false, source: 'dependencies' as const },
    { deps: manifest.devDependencies, isDev: true, source: 'devDependencies' as const },
  ];

  for (const group of groups) {
    for (const [name, declaredRange] of Object.entries(group.deps ?? {})) {
      // Without a lockfile, we use the declared range as the resolved version
      // This is less precise but acceptable for manual uploads
      entries.push({
        name,
        declaredRange,
        resolvedVersion: declaredRange,
        isDev: group.isDev,
        source: group.source,
      });
    }
  }

  return entries;
}
