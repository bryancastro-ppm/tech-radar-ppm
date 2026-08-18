import type { RadarRepository } from '../ports/RadarRepository';
import type { RadarEntry } from '@/radar/domain/entities/RadarEntry';

export interface RadarFilters {
  quadrant?: string;
  product?: string;
}

export async function getRadarEntries(
  repository: RadarRepository,
  filters: RadarFilters = {},
): Promise<RadarEntry[]> {
  const entries = await repository.getAll();

  return entries.filter((entry) => {
    if (filters.quadrant && entry.quadrant !== filters.quadrant) return false;
    if (filters.product && entry.product !== filters.product) return false;
    return true;
  });
}
