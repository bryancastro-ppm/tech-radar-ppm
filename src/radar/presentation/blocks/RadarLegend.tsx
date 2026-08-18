'use client';

import { RingLegendItem } from '../elements/RingLegendItem';
import { RINGS } from '@/radar/domain/value-objects/Ring';

const ringLabels: Record<string, string> = {
  adopt: 'Adopt - Usar en producción',
  trial: 'Trial - Probar en proyectos',
  assess: 'Assess - Evaluar potencial',
  hold: 'Hold - Evitar uso',
};

export function RadarLegend() {
  return (
    <div className="flex flex-col gap-2 p-4 bg-default-50 rounded-lg">
      <h3 className="text-sm font-semibold text-default-700 mb-2">Leyenda</h3>
      {RINGS.map((ring) => (
        <RingLegendItem key={ring} ring={ring} label={ringLabels[ring]} />
      ))}
    </div>
  );
}
