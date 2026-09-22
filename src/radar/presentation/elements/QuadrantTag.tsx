'use client';

import React, { memo } from 'react';
import type { ChipProps } from '@heroui/react';
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

const quadrantColors: Record<Quadrant, ChipProps['color']> = {
  'frameworks-librerias': 'primary',
  'gestion-de-estado': 'secondary',
  testing: 'success',
  'estilos-ui': 'warning',
  'build-tools': 'danger',
  'sin-categorizar': 'default',
};

const QuadrantTag = memo(function QuadrantTag({ quadrant, onClick, isSelected }: QuadrantTagProps) {
  return (
    <Chip
      color={quadrantColors[quadrant]}
      isSelected={isSelected}
      onClick={onClick}
      className="cursor-pointer"
    >
      {quadrantLabels[quadrant]}
    </Chip>
  );
});

export { QuadrantTag };
