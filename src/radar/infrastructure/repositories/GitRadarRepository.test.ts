import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GitRadarRepository } from './GitRadarRepository';

const mockValidData = [
  {
    name: 'react',
    version: '19.0.0',
    quadrant: 'frameworks-librerias',
    ring: 'adopt',
    product: 'membresias-web',
    repository: 'membresias-web',
    isNew: false,
  },
];

describe('GitRadarRepository', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('fetches and parses valid radar data', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockValidData),
    });

    const repository = new GitRadarRepository();
    const entries = await repository.getAll();

    expect(entries).toHaveLength(2);
    expect(entries[0].name).toBe('react');
  });

  it('returns empty array when fetch fails', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    });

    const repository = new GitRadarRepository();
    const entries = await repository.getAll();

    expect(entries).toHaveLength(0);
  });

  it('rejects invalid data with Zod validation error', async () => {
    const invalidData = [
      {
        name: 'react',
        version: '19.0.0',
        quadrant: 'invalid-quadrant',
        ring: 'adopt',
        product: 'test',
        repository: 'test',
        isNew: false,
      },
    ];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(invalidData),
    });

    const repository = new GitRadarRepository();
    const entries = await repository.getAll();

    expect(entries).toHaveLength(0);
  });
});
