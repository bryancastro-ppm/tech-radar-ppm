import type { Ring } from '../value-objects/Ring';
import type { Quadrant } from '../value-objects/Quadrant';

const RING_RADIUS: Record<Ring, number> = {
  adopt: 0.25,
  trial: 0.5,
  assess: 0.75,
  hold: 0.95,
};

const QUADRANT_ANGLE_START: Record<Quadrant, number> = {
  'frameworks-librerias': 0,
  'gestion-de-estado': 72,
  testing: 144,
  'estilos-ui': 216,
  'build-tools': 288,
  'sin-categorizar': 0,
};

export interface BlipPosition {
  x: number;
  y: number;
}

export function calculateBlipPosition(
  ring: Ring,
  quadrant: Quadrant,
  indexInQuadrant: number,
  totalInQuadrant: number,
): BlipPosition {
  const baseAngle = QUADRANT_ANGLE_START[quadrant];
  const quadrantSpan = 60;
  const jitter =
    totalInQuadrant > 1
      ? (indexInQuadrant / (totalInQuadrant - 1)) * quadrantSpan - quadrantSpan / 2
      : 0;
  const angle = ((baseAngle + jitter) * Math.PI) / 180;
  const radius = RING_RADIUS[ring];

  return {
    x: 50 + radius * 45 * Math.cos(angle),
    y: 50 + radius * 45 * Math.sin(angle),
  };
}
