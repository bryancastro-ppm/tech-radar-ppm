'use client';

import React, { memo } from 'react';
import { Chip as HeroUIChip } from '@heroui/react';
import type { ChipProps as HeroUIChipProps } from '@heroui/react';
import { chipStyles } from './style';

export interface ChipProps extends HeroUIChipProps {
  isSelected?: boolean;
}

const Chip = memo(function Chip({ isSelected = false, className, variant, ...props }: ChipProps) {
  return (
    <HeroUIChip
      variant={variant ?? (isSelected ? 'solid' : 'flat')}
      className={`${chipStyles.base} ${isSelected ? chipStyles.selected : ''} ${className || ''}`}
      {...props}
    />
  );
});

export { Chip };
