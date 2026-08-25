import { Suspense } from 'react';
import { LocalRadarRepository } from '@/radar/infrastructure/repositories/LocalRadarRepository';
import { getRadarEntries } from '@/radar/application/use-cases/getRadarEntries';
import { RadarChart } from '@/radar/presentation/RadarChart';
import { RadarFilters } from '@/radar/presentation/blocks/RadarFilters';
import { RadarLegend } from '@/radar/presentation/blocks/RadarLegend';
import { RadarTable } from '@/radar/presentation/blocks/RadarTable';
import { RadarPageLayout } from '@/radar/presentation/layouts/RadarPageLayout';

interface PageProps {
  searchParams: Promise<{ quadrant?: string; product?: string }>;
}

function FiltersSkeleton() {
  return (
    <div className="bg-card border border-border rounded-lg p-4 animate-pulse">
      <div className="flex gap-4">
        <div className="h-14 w-48 rounded-lg bg-muted" />
        <div className="h-14 w-48 rounded-lg bg-muted" />
      </div>
    </div>
  );
}

export default async function RadarPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const repository = new LocalRadarRepository();
  const entries = await getRadarEntries(repository, params);

  return (
    <RadarPageLayout sidebar={<RadarLegend />}>
      <Suspense fallback={<FiltersSkeleton />}>
        <RadarFilters />
      </Suspense>

      <RadarChart entries={entries} />

      <RadarTable entries={entries} />
    </RadarPageLayout>
  );
}
