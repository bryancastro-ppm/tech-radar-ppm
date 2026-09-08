import { readFile } from 'node:fs/promises';

/**
 * Raw structure of package.json - only the fields we care about
 */
export interface RawManifest {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

/**
 * Reads and parses a package.json file.
 * 
 * @param path - Absolute path to package.json
 * @returns Parsed manifest with dependencies
 * 
 * @throws {Error} If the file doesn't exist or contains invalid JSON
 */
export async function readPackageJson(path: string): Promise<RawManifest> {
  const content = await readFile(path, 'utf-8');
  return JSON.parse(content);
}
