import { categorizePackage } from '@/core/config/categorization-map';
import type { DetectedDependency } from '@/ingest/domain/DetectedDependency';
import type { RadarEntry } from '@/radar/domain/entities/RadarEntry';

/**
 * Converts detected dependencies to radar entries.
 * Maps each dependency to the radar entry format with categorization.
 * All dependencies are marked as 'adopt' ring by default (as per specification).
 * 
 * @param dependencies - Array of detected dependencies
 * @param product - Product name (e.g., 'membresias-web')
 * @param repository - Repository name (e.g., 'membresias-web')
 * @returns Array of radar entries without the isNew flag (to be added later)
 * 
 * @example
 * ```ts
 * const entries = toRadarEntries(
 *   [{ name: 'react', declaredRange: '^19.0.0', resolvedVersion: '19.0.2', isDev: false, source: 'dependencies' }],
 *   'membresias-web',
 *   'membresias-web'
 * );
 * // Returns: [
 * //   { name: 'react', version: '19.0.2', quadrant: 'frameworks-librerias', ring: 'adopt', product: 'membresias-web', repository: 'membresias-web' }
 * // ]
 * ```
 */
export function toRadarEntries(
  dependencies: DetectedDependency[],
  product: string,
  repository: string,
): Omit<RadarEntry, 'isNew'>[] {
  return dependencies.map((dep) => ({
    name: dep.name,
    version: dep.resolvedVersion,
    quadrant: categorizePackage(dep.name),
    ring: 'adopt', // All dependencies are considered approved (per specification)
    product,
    repository,
  }));
}
