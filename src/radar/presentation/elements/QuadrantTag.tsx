'use client';

import React, { memo } from 'react';
import { Chip } from '@/base/Chip';
import type { Quadrant } from '@/radar/domain/value-objects/Quadrant';

interface QuadrantTagProps {
  quadrant: Quadrant;
  onClick?: () => void;
  isSelected?: boolean;
}

const quadrantLabels: Record<Quadrant, string> = {
  'frameworks-librerias': 'Frameworks y Librerías',
  'gestion-de-estado': 'Gestión de Estado',
  testing: 'Testing',
  'estilos-ui': 'Estilos y UI',
  'build-tools': 'Build Tools',
  'sin-categorizar': 'Sin Categorizar',
};

const QuadrantTag = memo(function QuadrantTag({ quadrant, onClick, isSelected }: QuadrantTagProps) {
  return (
    <Chip
      quadrant={quadrant}
      isSelected={isSelected}
      onClick={onClick}
      className="cursor-pointer"
    >
      {quadrantLabels[quadrant]}
    </Chip>
  );
});

export { QuadrantTag };
