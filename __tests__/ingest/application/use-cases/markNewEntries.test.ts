import { describe, it, expect } from 'vitest';
import { markNewEntries } from '@/ingest/application/use-cases/markNewEntries';
import type { RadarEntry } from '@/radar/domain/entities/RadarEntry';

describe('markNewEntries', () => {
  it('marks all entries as new on first scan', () => {
    const current: Omit<RadarEntry, 'isNew'>[] = [
      {
        name: 'react',
        version: '19.0.2',
        quadrant: 'frameworks-librerias',
        ring: 'adopt',
        product: 'test-product',
        repository: 'test-repo',
      },
    ];

    const result = markNewEntries(current, []);

    expect(result).toHaveLength(1);
    expect(result[0].isNew).toBe(true);
  });

  it('marks only new packages as new', () => {
    const current: Omit<RadarEntry, 'isNew'>[] = [
      {
        name: 'react',
        version: '19.0.2',
        quadrant: 'frameworks-librerias',
        ring: 'adopt',
        product: 'test-product',
        repository: 'test-repo',
      },
      {
        name: 'zustand',
        version: '4.5.0',
        quadrant: 'gestion-de-estado',
        ring: 'adopt',
        product: 'test-product',
        repository: 'test-repo',
      },
    ];

    const previous: RadarEntry[] = [
      {
        name: 'react',
        version: '19.0.0',
        quadrant: 'frameworks-librerias',
        ring: 'adopt',
        product: 'test-product',
        repository: 'test-repo',
        isNew: false,
      },
    ];

    const result = markNewEntries(current, previous);

    expect(result).toHaveLength(2);
    expect(result.find((e) => e.name === 'react')?.isNew).toBe(false);
    expect(result.find((e) => e.name === 'zustand')?.isNew).toBe(true);
  });

  it('handles version updates (same package, different version)', () => {
    const current: Omit<RadarEntry, 'isNew'>[] = [
      {
        name: 'react',
        version: '19.0.2',
        quadrant: 'frameworks-librerias',
        ring: 'adopt',
        product: 'test-product',
        repository: 'test-repo',
      },
    ];

    const previous: RadarEntry[] = [
      {
        name: 'react',
        version: '19.0.0',
        quadrant: 'frameworks-librerias',
        ring: 'adopt',
        product: 'test-product',
        repository: 'test-repo',
        isNew: false,
      },
    ];

    const result = markNewEntries(current, previous);

    // Version update should not be marked as new (same package)
    expect(result[0].isNew).toBe(false);
  });
});
