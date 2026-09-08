import { describe, it, expect } from 'vitest';
import { detectLockfileType } from '@/ingest/infrastructure/parsers/LockfileDetector';
import { resolve } from 'path';

describe('LockfileDetector', () => {
  it('detects npm lockfile', () => {
    const repoPath = resolve(__dirname, '../../fixtures/sample-repo');
    const result = detectLockfileType(repoPath);
    expect(result).toBe('npm');
  });

  it('returns unknown when no lockfile exists', () => {
    const repoPath = resolve(__dirname, '../../fixtures/non-existent');
    const result = detectLockfileType(repoPath);
    expect(result).toBe('unknown');
  });
});
