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

export default async function RadarPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const repository = new LocalRadarRepository();
  const entries = await getRadarEntries(repository, params);

  return (
    <RadarPageLayout sidebar={<RadarLegend />}>
      <Suspense fallback={<div>Cargando filtros...</div>}>
        <RadarFilters />
      </Suspense>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Visualización del Radar</h2>
        <RadarChart entries={entries} />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">
          Lista de Dependencias ({entries.length})
        </h2>
        <RadarTable entries={entries} />
      </div>
    </RadarPageLayout>
  );
}
