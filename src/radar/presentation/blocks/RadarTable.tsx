'use client';

import React, { memo } from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Card,
  CardBody,
  CardHeader,
} from '@heroui/react';
import type { RadarEntry } from '@/radar/domain/entities/RadarEntry';
import type { Ring } from '@/radar/domain/value-objects/Ring';
import type { Quadrant } from '@/radar/domain/value-objects/Quadrant';

interface RadarTableProps {
  entries: RadarEntry[];
}

const ringColors: Record<Ring, 'success' | 'primary' | 'warning' | 'danger'> = {
  adopt: 'success',
  trial: 'primary',
  assess: 'warning',
  hold: 'danger',
};

const quadrantLabels: Record<Quadrant, string> = {
  'frameworks-librerias': 'Frameworks y Librerías',
  'gestion-de-estado': 'Gestión de Estado',
  testing: 'Testing',
  'estilos-ui': 'Estilos y UI',
  'build-tools': 'Build Tools',
  'sin-categorizar': 'Sin Categorizar',
};

const RadarTable = memo(function RadarTable({ entries }: RadarTableProps) {
  return (
    <Card className="bg-card border border-border shadow-sm">
      <CardHeader className="pb-0">
        <h2 className="text-xl font-semibold text-card-foreground">
          Lista de Dependencias ({entries.length})
        </h2>
      </CardHeader>
      <CardBody>
        <Table
          aria-label="Tabla de dependencias del Tech Radar"
          classNames={{
            wrapper: 'bg-transparent shadow-none p-0',
            th: 'bg-muted text-muted-foreground',
            td: 'text-card-foreground',
          }}
        >
          <TableHeader>
            <TableColumn>NOMBRE</TableColumn>
            <TableColumn>VERSION</TableColumn>
            <TableColumn>CUADRANTE</TableColumn>
            <TableColumn>RING</TableColumn>
            <TableColumn>PRODUCTO</TableColumn>
          </TableHeader>
          <TableBody emptyContent="No hay dependencias para mostrar">
            {entries.map((entry, index) => (
              <TableRow key={`${entry.repository}-${entry.name}-${index}`}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-card-foreground">{entry.name}</span>
                    {entry.isNew && (
                      <Chip size="sm" color="success" variant="flat">
                        Nuevo
                      </Chip>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <code className="text-sm font-mono bg-muted text-card-foreground px-2 py-1 rounded">
                    {entry.version}
                  </code>
                </TableCell>
                <TableCell className="text-muted-foreground">{quadrantLabels[entry.quadrant]}</TableCell>
                <TableCell>
                  <Chip color={ringColors[entry.ring]} variant="flat" size="sm">
                    {entry.ring.toUpperCase()}
                  </Chip>
                </TableCell>
                <TableCell className="text-muted-foreground">{entry.product}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  );
});

export { RadarTable };
