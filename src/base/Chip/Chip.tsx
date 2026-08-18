'use client';

import { Chip as HeroUIChip } from '@heroui/react';
import type { ChipProps as HeroUIChipProps } from '@heroui/react';
import type { Quadrant } from '@/radar/domain/value-objects/Quadrant';
import { chipStyles } from './style';

export interface ChipProps extends Omit<HeroUIChipProps, 'color'> {
  quadrant?: Quadrant;
  isSelected?: boolean;
}

const colorMap: Record<Quadrant, HeroUIChipProps['color']> = {
  'frameworks-librerias': 'primary',
  'gestion-de-estado': 'secondary',
  testing: 'success',
  'estilos-ui': 'warning',
  'build-tools': 'danger',
  'sin-categorizar': 'default',
};

export function Chip({
  quadrant,
  isSelected = false,
  className,
  ...props
}: ChipProps) {
  return (
    <HeroUIChip
      color={quadrant ? colorMap[quadrant] : 'default'}
      variant={isSelected ? 'solid' : 'flat'}
      className={`${chipStyles.base} ${isSelected ? chipStyles.selected : ''} ${className || ''}`}
      {...props}
    />
  );
}
