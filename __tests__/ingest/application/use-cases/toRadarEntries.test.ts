import { describe, it, expect } from 'vitest';
import { toRadarEntries } from '@/ingest/application/use-cases/toRadarEntries';
import type { DetectedDependency } from '@/ingest/domain/DetectedDependency';

describe('toRadarEntries', () => {
  it('converts detected dependencies to radar entries', () => {
    const dependencies: DetectedDependency[] = [
      {
        name: 'react',
        declaredRange: '^19.0.0',
        resolvedVersion: '19.0.2',
        isDev: false,
        source: 'dependencies',
      },
      {
        name: 'vitest',
        declaredRange: '^2.0.0',
        resolvedVersion: '2.0.5',
        isDev: true,
        source: 'devDependencies',
      },
    ];

    const result = toRadarEntries(dependencies, 'test-product', 'test-repo');

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      name: 'react',
      version: '19.0.2',
      quadrant: 'frameworks-librerias',
      ring: 'adopt',
      product: 'test-product',
      repository: 'test-repo',
    });
    expect(result[1]).toEqual({
      name: 'vitest',
      version: '2.0.5',
      quadrant: 'testing',
      ring: 'adopt',
      product: 'test-product',
      repository: 'test-repo',
    });
  });

  it('categorizes unknown packages as sin-categorizar', () => {
    const dependencies: DetectedDependency[] = [
      {
        name: 'unknown-package',
        declaredRange: '^1.0.0',
        resolvedVersion: '1.0.0',
        isDev: false,
        source: 'dependencies',
      },
    ];

    const result = toRadarEntries(dependencies, 'test-product', 'test-repo');

    expect(result[0].quadrant).toBe('sin-categorizar');
  });
});
