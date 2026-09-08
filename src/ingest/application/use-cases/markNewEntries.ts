import type { RadarEntry } from '@/radar/domain/entities/RadarEntry';

/**
 * Marks entries as new by comparing against previous radar data.
 * An entry is considered "new" if it wasn't present in the previous scan.
 * 
 * @param current - Current radar entries (without isNew flag)
 * @param previous - Previous radar entries from last scan
 * @returns Current entries with isNew flag added
 * 
 * @example
 * ```ts
 * const current = [
 *   { name: 'react', version: '19.0.2', quadrant: 'frameworks-librerias', ring: 'adopt', product: 'web', repository: 'web' },
 *   { name: 'zustand', version: '4.5.0', quadrant: 'gestion-de-estado', ring: 'adopt', product: 'web', repository: 'web' }
 * ];
 * const previous = [
 *   { name: 'react', version: '19.0.0', quadrant: 'frameworks-librerias', ring: 'adopt', product: 'web', repository: 'web', isNew: false }
 * ];
 * 
 * const result = markNewEntries(current, previous);
 * // Returns: [
 * //   { name: 'react', ..., isNew: false },  // existed before
 * //   { name: 'zustand', ..., isNew: true }  // new dependency
 * // ]
 * ```
 */
export function markNewEntries(
  current: Omit<RadarEntry, 'isNew'>[],
  previous: RadarEntry[],
): RadarEntry[] {
  // Create a set of previous entries using repository:name as key
  // This ensures we detect new packages per repository
  const previousKeys = new Set(
    previous.map((e) => `${e.repository}:${e.name}`)
  );

  return current.map((entry) => ({
    ...entry,
    isNew: !previousKeys.has(`${entry.repository}:${entry.name}`),
  }));
}
