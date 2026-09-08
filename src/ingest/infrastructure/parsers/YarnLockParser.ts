/**
 * Yarn lockfile parser - NOT IMPLEMENTED YET
 * 
 * This is a stub for future implementation.
 * When yarn support is needed, implement this function to parse yarn.lock
 * and resolve package versions.
 */
export async function resolveVersionFromYarnLock(
  lockPath: string,
  packageName: string,
): Promise<string | undefined> {
  throw new Error('Yarn lockfile parsing not implemented yet');
}
