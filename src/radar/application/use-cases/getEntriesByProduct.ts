import type { RadarRepository } from '../ports/RadarRepository';
import type { RadarEntry } from '@/radar/domain/entities/RadarEntry';

export async function getEntriesByProduct(
  repository: RadarRepository,
  productId: string,
): Promise<RadarEntry[]> {
  const entries = await repository.getAll();
  return entries.filter((entry) => entry.product === productId);
}
