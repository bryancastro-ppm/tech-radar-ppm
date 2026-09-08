/**
 * Represents a dependency detected from package.json and its lockfile.
 * This is the pure domain entity for the dependency detection process.
 */
export interface DetectedDependency {
  /** Package name as it appears in package.json */
  readonly name: string;
  
  /** Version range declared in package.json (e.g., "^19.0.0") */
  readonly declaredRange: string;
  
  /** Actual version resolved in the lockfile (e.g., "19.0.2") */
  readonly resolvedVersion: string;
  
  /** Whether this is a development dependency */
  readonly isDev: boolean;
  
  /** Source section in package.json */
  readonly source: 'dependencies' | 'devDependencies';
}
