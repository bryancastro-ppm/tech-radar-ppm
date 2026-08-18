import type { RadarEntry } from '@/radar/domain/entities/RadarEntry';

export interface RadarRepository {
  getAll(): Promise<RadarEntry[]>;
}
