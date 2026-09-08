import { writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { existsSync } from 'node:fs';
import type { RadarEntry } from '@/radar/domain/entities/RadarEntry';

/**
 * Writes radar entries to a JSON file in the output directory.
 * Creates the output directory if it doesn't exist.
 * 
 * @param product - Product name (used as filename: <product>.json)
 * @param entries - Array of radar entries to write
 * @param outputDir - Output directory path (defaults to ./radar-data)
 * 
 * @example
 * ```ts
 * await writeRadarJson('membresias-web', entries);
 * // Writes to: ./radar-data/membresias-web.json
 * ```
 */
export async function writeRadarJson(
  product: string,
  entries: RadarEntry[],
  outputDir: string = './radar-data',
): Promise<void> {
  const outputPath = join(outputDir, `${product}.json`);
  
  // Ensure output directory exists
  if (!existsSync(dirname(outputPath))) {
    await mkdir(dirname(outputPath), { recursive: true });
  }
  
  // Sort entries by name for consistent output
  const sortedEntries = [...entries].sort((a, b) => a.name.localeCompare(b.name));
  
  await writeFile(outputPath, JSON.stringify(sortedEntries, null, 2));
}
