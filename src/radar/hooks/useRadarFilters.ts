'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import type { RadarFilters } from '@/radar/application/use-cases/getRadarEntries';

export function useRadarFilters(): RadarFilters {
  const searchParams = useSearchParams();

  return useMemo(() => {
    const quadrant = searchParams.get('quadrant') || undefined;
    const product = searchParams.get('product') || undefined;

    return { quadrant, product };
  }, [searchParams]);
}
