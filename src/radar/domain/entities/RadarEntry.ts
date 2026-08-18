import type { Ring } from '../value-objects/Ring';
import type { Quadrant } from '../value-objects/Quadrant';

export interface RadarEntry {
  readonly name: string;
  readonly version: string;
  readonly quadrant: Quadrant;
  readonly ring: Ring;
  readonly product: string;
  readonly repository: string;
  readonly isNew: boolean;
}
