'use client';

import React, { memo } from 'react';
import { Badge as HeroUIBadge } from '@heroui/react';
import type { BadgeProps as HeroUIBadgeProps } from '@heroui/react';
import type { Ring } from '@/radar/domain/value-objects/Ring';
import { badgeStyles } from './style';

export interface BadgeProps extends Omit<HeroUIBadgeProps, 'color'> {
  ring?: Ring;
}

const colorMap: Record<Ring, HeroUIBadgeProps['color']> = {
  adopt: 'success',
  trial: 'primary',
  assess: 'warning',
  hold: 'danger',
};

const Badge = memo(function Badge({ ring = 'adopt', className, ...props }: BadgeProps) {
  return (
    <HeroUIBadge
      color={colorMap[ring]}
      className={`${badgeStyles.base} ${className || ''}`}
      {...props}
    />
  );
});

export { Badge };
