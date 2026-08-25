'use client';

import React, { memo, useState, useMemo, useCallback } from 'react';
import { Tooltip, Card, CardBody } from '@heroui/react';
import type { RadarEntry } from '@/radar/domain/entities/RadarEntry';
import { calculateBlipPosition } from '@/radar/domain/services/calculateBlipPosition';
import { RINGS, type Ring } from '@/radar/domain/value-objects/Ring';
import type { Quadrant } from '@/radar/domain/value-objects/Quadrant';

interface RadarChartProps {
  entries: RadarEntry[];
}

const ringLabels: Record<Ring, string> = {
  adopt: 'ADOPT',
  trial: 'TRIAL',
  assess: 'ASSESS',
  hold: 'HOLD',
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
  'frameworks-librerias': '#3b82f6',
  'gestion-de-estado': '#8b5cf6',
  testing: '#22c55e',
  'estilos-ui': '#ec4899',
  'build-tools': '#f97316',
  'sin-categorizar': '#6b7280',
};

const ringRadii = [0.25, 0.5, 0.75, 1];
const quadrantAngles = [0, 72, 144, 216, 288];

const RadarChart = memo(function RadarChart({ entries }: RadarChartProps) {
  const [hoveredEntry, setHoveredEntry] = useState<RadarEntry | null>(null);

  const groupedByQuadrant = useMemo(() => {
    return entries.reduce(
      (acc, entry) => {
        if (!acc[entry.quadrant]) {
          acc[entry.quadrant] = [];
        }
        acc[entry.quadrant].push(entry);
        return acc;
      },
      {} as Record<Quadrant, RadarEntry[]>,
    );
  }, [entries]);

  const handleMouseEnter = useCallback((entry: RadarEntry) => {
    setHoveredEntry(entry);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredEntry(null);
  }, []);

  return (
    <Card className="bg-card border border-border shadow-sm">
      <CardBody className="p-6">
        <div className="relative w-full max-w-2xl mx-auto">
          <svg viewBox="0 0 100 100" role="img" aria-label="Tech Radar frontend" className="w-full h-auto">
            {ringRadii.map((r, index) => (
              <g key={r}>
                <circle
                  cx={50}
                  cy={50}
                  r={r * 45}
                  className="fill-none stroke-border"
                  strokeWidth={0.3}
                />
                <text
                  x={50}
                  y={50 - r * 45 + 3}
                  textAnchor="middle"
                  className="fill-muted-foreground"
                  fontSize={2}
                >
                  {ringLabels[RINGS[index]]}
                </text>
              </g>
            ))}

            {quadrantAngles.map((angle) => {
              // Round to avoid floating point precision differences between server/client
              const x2 = Math.round((50 + 45 * Math.cos((angle * Math.PI) / 180)) * 1000) / 1000;
              const y2 = Math.round((50 + 45 * Math.sin((angle * Math.PI) / 180)) * 1000) / 1000;
              return (
                <line
                  key={angle}
                  x1={50}
                  y1={50}
                  x2={x2}
                  y2={y2}
                  className="stroke-border"
                  strokeWidth={0.2}
                />
              );
            })}

            {entries.map((entry, i) => {
              const sameQuadrant = groupedByQuadrant[entry.quadrant] || [];
              const indexInQuadrant = sameQuadrant.indexOf(entry);
              const { x, y } = calculateBlipPosition(
                entry.ring,
                entry.quadrant,
                indexInQuadrant,
                sameQuadrant.length,
              );

              return (
                <Tooltip
                  key={`${entry.repository}-${entry.name}-${i}`}
                  content={
                    <div className="p-2">
                      <p className="font-semibold text-foreground">{entry.name}</p>
                      <p className="text-xs text-muted-foreground">v{entry.version}</p>
                      <p className="text-xs text-foreground">{quadrantLabels[entry.quadrant]}</p>
                      <p className="text-xs text-muted-foreground">{entry.product}</p>
                    </div>
                  }
                >
                  <circle
                    cx={x}
                    cy={y}
                    r={1.2}
                    fill={quadrantColors[entry.quadrant]}
                    className="cursor-pointer hover:opacity-80 transition-opacity duration-150"
                    onMouseEnter={() => handleMouseEnter(entry)}
                    onMouseLeave={handleMouseLeave}
                  />
                </Tooltip>
              );
            })}
          </svg>

          {hoveredEntry && (
            <div className="absolute bottom-4 left-4 bg-card p-3 rounded-lg shadow-lg border border-border">
              <p className="font-semibold text-card-foreground">{hoveredEntry.name}</p>
              <p className="text-sm text-muted-foreground">v{hoveredEntry.version}</p>
              <p className="text-sm text-card-foreground">{quadrantLabels[hoveredEntry.quadrant]}</p>
              <p className="text-sm text-muted-foreground">{hoveredEntry.product}</p>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
});

export { RadarChart };
