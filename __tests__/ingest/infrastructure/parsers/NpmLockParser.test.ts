import { describe, it, expect } from 'vitest';
import { resolveVersionFromNpmLock } from '@/ingest/infrastructure/parsers/NpmLockParser';
import { resolve } from 'path';

describe('NpmLockParser', () => {
  const lockPath = resolve(__dirname, '../../fixtures/sample-repo/package-lock.json');

  it('resolves version from lockfile', async () => {
    const version = await resolveVersionFromNpmLock(lockPath, 'react');
    expect(version).toBe('19.0.2');
  });

  it('resolves dev dependency version', async () => {
    const version = await resolveVersionFromNpmLock(lockPath, 'vitest');
    expect(version).toBe('2.0.5');
  });

  it('returns undefined for non-existent package', async () => {
    const version = await resolveVersionFromNpmLock(lockPath, 'non-existent-package');
    expect(version).toBeUndefined();
  });
});
