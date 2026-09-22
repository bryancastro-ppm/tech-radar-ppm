'use client';

import React, { memo } from 'react';
import { Badge as HeroUIBadge } from '@heroui/react';
import type { BadgeProps as HeroUIBadgeProps } from '@heroui/react';
import { badgeStyles } from './style';

export type BadgeProps = HeroUIBadgeProps;

const Badge = memo(function Badge({ className, ...props }: BadgeProps) {
  return <HeroUIBadge className={`${badgeStyles.base} ${className || ''}`} {...props} />;
});

export { Badge };
