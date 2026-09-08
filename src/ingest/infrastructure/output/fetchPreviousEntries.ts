import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import type { RadarEntry } from '@/radar/domain/entities/RadarEntry';

/**
 * Fetches previous radar entries from the output directory.
 * Returns an empty array if the file doesn't exist (first scan).
 * 
 * @param product - Product name (used to locate <product>.json)
 * @param outputDir - Output directory path (defaults to ./radar-data)
 * @returns Array of previous radar entries, or empty array if none exist
 * 
 * @example
 * ```ts
 * const previous = await fetchPreviousEntries('membresias-web');
 * // Returns entries from ./radar-data/membresias-web.json or []
 * ```
 */
export async function fetchPreviousEntries(
  product: string,
  outputDir: string = './radar-data',
): Promise<RadarEntry[]> {
  const filePath = join(outputDir, `${product}.json`);
  
  if (!existsSync(filePath)) {
    return [];
  }
  
  try {
    const content = await readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.warn(`⚠️  Failed to read previous entries from ${filePath}:`, error);
    return [];
  }
}
