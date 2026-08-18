import { z } from 'zod';
import type { RadarRepository } from '@/radar/application/ports/RadarRepository';
import type { RadarEntry } from '@/radar/domain/entities/RadarEntry';
import { RINGS } from '@/radar/domain/value-objects/Ring';
import { QUADRANTS } from '@/radar/domain/value-objects/Quadrant';

const RadarEntrySchema = z.object({
  name: z.string(),
  version: z.string(),
  quadrant: z.enum([...QUADRANTS, 'sin-categorizar']),
  ring: z.enum(RINGS),
  product: z.string(),
  repository: z.string(),
  isNew: z.boolean(),
});

const RAW_BASE_URL =
  process.env.RADAR_DATA_URL || 'http://localhost:3000/api/radar-data';
const PRODUCTS = ['membresias-web', 'membresias-backoffice'];

export class GitRadarRepository implements RadarRepository {
  async getAll(): Promise<RadarEntry[]> {
    const results = await Promise.all(
      PRODUCTS.map(async (product) => {
        try {
          const res = await fetch(`${RAW_BASE_URL}/${product}.json`, {
            next: { tags: ['radar-data'] },
          });

          if (!res.ok) {
            console.warn(`Failed to fetch radar data for ${product}: ${res.status}`);
            return [];
          }

          const json = await res.json();
          return z.array(RadarEntrySchema).parse(json);
        } catch (error) {
          console.warn(`Error fetching radar data for ${product}:`, error);
          return [];
        }
      }),
    );

    return results.flat();
  }
}
