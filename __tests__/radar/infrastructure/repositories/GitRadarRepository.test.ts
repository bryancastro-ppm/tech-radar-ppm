import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GitRadarRepository } from '@/radar/infrastructure/repositories/GitRadarRepository';

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

// Mock the getProductIds function
vi.mock('@/radar/infrastructure/utils/getAvailableProducts', () => ({
  getProductIds: vi.fn(() => ['membresias-web', 'membresias-backoffice', 'todo-app', 'tech-radar']),
  getAvailableProducts: vi.fn(() => [
    { id: 'membresias-web', name: 'Membresías Web', repository: 'membresias-web' },
    { id: 'membresias-backoffice', name: 'Membresías Backoffice', repository: 'membresias-backoffice' },
    { id: 'todo-app', name: 'Todo App', repository: 'todo-app' },
    { id: 'tech-radar', name: 'Tech Radar', repository: 'tech-radar' },
  ]),
}));

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

    // Should fetch data for all 4 mocked products
    expect(entries).toHaveLength(4);
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
