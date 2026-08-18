import { z } from 'zod';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
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

const PRODUCTS = ['membresias-web', 'membresias-backoffice'];

export class LocalRadarRepository implements RadarRepository {
  private readonly basePath: string;

  constructor(basePath?: string) {
    this.basePath = basePath || join(process.cwd(), 'radar-data');
  }

  async getAll(): Promise<RadarEntry[]> {
    const results = PRODUCTS.map((product) => {
      try {
        const filePath = join(this.basePath, `${product}.json`);

        if (!existsSync(filePath)) {
          console.warn(`Radar data file not found: ${filePath}`);
          return [];
        }

        const content = readFileSync(filePath, 'utf-8');
        const json = JSON.parse(content);
        return z.array(RadarEntrySchema).parse(json);
      } catch (error) {
        console.warn(`Error reading radar data for ${product}:`, error);
        return [];
      }
    });

    return results.flat();
  }
}
