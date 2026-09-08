import { describe, it, expect } from 'vitest';
import { detectDependencies, UnsupportedLockfileError } from '@/ingest/application/use-cases/detectDependencies';
import { resolve } from 'path';

describe('detectDependencies', () => {
  it('detects dependencies and devDependencies with resolved versions', async () => {
    const repoPath = resolve(__dirname, '../../fixtures/sample-repo');
    const result = await detectDependencies(repoPath);

    expect(result).toHaveLength(4);

    // Check production dependency
    const react = result.find((d) => d.name === 'react');
    expect(react).toEqual({
      name: 'react',
      declaredRange: '^19.0.0',
      resolvedVersion: '19.0.2',
      isDev: false,
      source: 'dependencies',
    });

    // Check dev dependency
    const vitest = result.find((d) => d.name === 'vitest');
    expect(vitest).toEqual({
      name: 'vitest',
      declaredRange: '^2.0.0',
      resolvedVersion: '2.0.5',
      isDev: true,
      source: 'devDependencies',
    });
  });

  it('throws UnsupportedLockfileError for non-npm lockfiles', async () => {
    const repoPath = resolve(__dirname, '../../fixtures/non-existent');
    await expect(detectDependencies(repoPath)).rejects.toThrow(UnsupportedLockfileError);
  });
});
