'use client';

import React, { memo } from 'react';
import type { Ring } from '@/radar/domain/value-objects/Ring';

interface RingLegendItemProps {
  ring: Ring;
  label: string;
}

const ringColors: Record<Ring, string> = {
  adopt: 'bg-ring-adopt',
  trial: 'bg-ring-trial',
  assess: 'bg-ring-assess',
  hold: 'bg-ring-hold',
};

const RingLegendItem = memo(function RingLegendItem({ ring, label }: RingLegendItemProps) {
  return (
    <div className="flex items-center gap-2">
      <span className={`w-3 h-3 rounded-full ${ringColors[ring]}`} />
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
});

export { RingLegendItem };
