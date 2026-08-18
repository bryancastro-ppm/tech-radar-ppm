'use client';

import React, { memo } from 'react';
import type { Ring } from '@/radar/domain/value-objects/Ring';

interface RingLegendItemProps {
  ring: Ring;
  label: string;
}

const ringColors: Record<Ring, string> = {
  adopt: 'bg-success-500',
  trial: 'bg-primary-500',
  assess: 'bg-warning-500',
  hold: 'bg-danger-500',
};

const RingLegendItem = memo(function RingLegendItem({ ring, label }: RingLegendItemProps) {
  return (
    <div className="flex items-center gap-2">
      <span className={`w-3 h-3 rounded-full ${ringColors[ring]}`} />
      <span className="text-sm text-default-600 capitalize">{label}</span>
    </div>
  );
});

export { RingLegendItem };
