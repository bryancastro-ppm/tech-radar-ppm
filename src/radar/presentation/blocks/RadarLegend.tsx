'use client';

import React, { memo } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/react';
import { RingLegendItem } from '../elements/RingLegendItem';
import { RINGS } from '@/radar/domain/value-objects/Ring';
import type { Quadrant } from '@/radar/domain/value-objects/Quadrant';

const ringLabels: Record<string, string> = {
  adopt: 'Adopt - Usar en producción',
  trial: 'Trial - Probar en proyectos',
  assess: 'Assess - Evaluar potencial',
  hold: 'Hold - Evitar uso',
};

const quadrantLabels: Record<Quadrant, string> = {
  'frameworks-librerias': 'Frameworks y Librerías',
  'gestion-de-estado': 'Gestión de Estado',
  testing: 'Testing',
  'estilos-ui': 'Estilos y UI',
  'build-tools': 'Build Tools',
  'sin-categorizar': 'Sin Categorizar',
};

const quadrantColors: Record<Quadrant, string> = {
  'frameworks-librerias': 'bg-quadrant-frameworks',
  'gestion-de-estado': 'bg-quadrant-state',
  testing: 'bg-quadrant-testing',
  'estilos-ui': 'bg-quadrant-styles',
  'build-tools': 'bg-quadrant-build',
  'sin-categorizar': 'bg-quadrant-uncategorized',
};

const RadarLegend = memo(function RadarLegend() {
  return (
    <div className="space-y-4">
      <Card className="bg-card border border-border shadow-sm">
        <CardHeader className="pb-2">
          <h3 className="text-sm font-semibold text-card-foreground">Rings</h3>
        </CardHeader>
        <CardBody className="pt-0">
          <div className="flex flex-col gap-2">
            {RINGS.map((ring) => (
              <RingLegendItem key={ring} ring={ring} label={ringLabels[ring]} />
            ))}
          </div>
        </CardBody>
      </Card>

      <Card className="bg-card border border-border shadow-sm">
        <CardHeader className="pb-2">
          <h3 className="text-sm font-semibold text-card-foreground">Cuadrantes</h3>
        </CardHeader>
        <CardBody className="pt-0">
          <div className="flex flex-col gap-2">
            {(Object.keys(quadrantLabels) as Quadrant[]).map((quadrant) => (
              <div key={quadrant} className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-sm ${quadrantColors[quadrant]}`} />
                <span className="text-sm text-muted-foreground">{quadrantLabels[quadrant]}</span>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
});

export { RadarLegend };
