/**
 * pnpm lockfile parser - NOT IMPLEMENTED YET
 * 
 * This is a stub for future implementation.
 * When pnpm support is needed, implement this function to parse pnpm-lock.yaml
 * and resolve package versions.
 */
export async function resolveVersionFromPnpmLock(
  lockPath: string,
  packageName: string,
): Promise<string | undefined> {
  throw new Error('pnpm lockfile parsing not implemented yet');
}
