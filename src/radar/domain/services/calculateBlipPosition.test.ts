import { describe, it, expect } from 'vitest';
import { calculateBlipPosition } from './calculateBlipPosition';

describe('calculateBlipPosition', () => {
  it('returns coordinates within the radar bounds', () => {
    const position = calculateBlipPosition('adopt', 'frameworks-librerias', 0, 1);

    expect(position.x).toBeGreaterThanOrEqual(0);
    expect(position.x).toBeLessThanOrEqual(100);
    expect(position.y).toBeGreaterThanOrEqual(0);
    expect(position.y).toBeLessThanOrEqual(100);
  });

  it('places adopt ring closer to center than hold ring', () => {
    const adoptPosition = calculateBlipPosition('adopt', 'testing', 0, 1);
    const holdPosition = calculateBlipPosition('hold', 'testing', 0, 1);

    const adoptDistance = Math.sqrt(
      Math.pow(adoptPosition.x - 50, 2) + Math.pow(adoptPosition.y - 50, 2),
    );
    const holdDistance = Math.sqrt(
      Math.pow(holdPosition.x - 50, 2) + Math.pow(holdPosition.y - 50, 2),
    );

    expect(adoptDistance).toBeLessThan(holdDistance);
  });

  it('distributes multiple entries within the same quadrant', () => {
    const positions = [
      calculateBlipPosition('adopt', 'frameworks-librerias', 0, 3),
      calculateBlipPosition('adopt', 'frameworks-librerias', 1, 3),
      calculateBlipPosition('adopt', 'frameworks-librerias', 2, 3),
    ];

    const uniquePositions = new Set(positions.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`));
    expect(uniquePositions.size).toBe(3);
  });

  it('places single entry at base angle without jitter', () => {
    const position = calculateBlipPosition('adopt', 'frameworks-librerias', 0, 1);

    expect(position.x).toBeCloseTo(50 + 0.25 * 45, 1);
    expect(position.y).toBeCloseTo(50, 1);
  });
});
