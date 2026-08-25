import { describe, it, expect } from 'vitest';
import { getRadarEntries } from '@/radar/application/use-cases/getRadarEntries';
import type { RadarRepository } from '@/radar/application/ports/RadarRepository';
import type { RadarEntry } from '@/radar/domain/entities/RadarEntry';

const mockEntries: RadarEntry[] = [
  {
    name: 'react',
    version: '19.0.0',
    quadrant: 'frameworks-librerias',
    ring: 'adopt',
    product: 'membresias-web',
    repository: 'membresias-web',
    isNew: false,
  },
  {
    name: 'vitest',
    version: '2.0.0',
    quadrant: 'testing',
    ring: 'adopt',
    product: 'membresias-backoffice',
    repository: 'membresias-backoffice',
    isNew: false,
  },
  {
    name: 'zustand',
    version: '4.5.0',
    quadrant: 'gestion-de-estado',
    ring: 'adopt',
    product: 'membresias-web',
    repository: 'membresias-web',
    isNew: true,
  },
];

const fakeRepository: RadarRepository = {
  async getAll() {
    return mockEntries;
  },
};

describe('getRadarEntries', () => {
  it('returns all entries when no filters are provided', async () => {
    const result = await getRadarEntries(fakeRepository);

    expect(result).toHaveLength(3);
  });

  it('filters by product', async () => {
    const result = await getRadarEntries(fakeRepository, {
      product: 'membresias-web',
    });

    expect(result).toHaveLength(2);
    expect(result.every((e) => e.product === 'membresias-web')).toBe(true);
  });

  it('filters by quadrant', async () => {
    const result = await getRadarEntries(fakeRepository, {
      quadrant: 'testing',
    });

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('vitest');
  });

  it('filters by both product and quadrant', async () => {
    const result = await getRadarEntries(fakeRepository, {
      product: 'membresias-web',
      quadrant: 'frameworks-librerias',
    });

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('react');
  });

  it('returns empty array when no entries match filters', async () => {
    const result = await getRadarEntries(fakeRepository, {
      product: 'non-existent-product',
    });

    expect(result).toHaveLength(0);
  });
});
