// Domain
export type { RadarEntry } from './domain/entities/RadarEntry';
export type { Product } from './domain/entities/Product';
export { PRODUCTS } from './domain/entities/Product';
export { RINGS, type Ring } from './domain/value-objects/Ring';
export { QUADRANTS, type Quadrant } from './domain/value-objects/Quadrant';
export { calculateBlipPosition, type BlipPosition } from './domain/services/calculateBlipPosition';

// Application
export type { RadarRepository } from './application/ports/RadarRepository';
export { getRadarEntries, type RadarFilters } from './application/use-cases/getRadarEntries';
export { getEntriesByProduct } from './application/use-cases/getEntriesByProduct';

// Infrastructure
export { GitRadarRepository } from './infrastructure/repositories/GitRadarRepository';
export { LocalRadarRepository } from './infrastructure/repositories/LocalRadarRepository';

// Presentation
export { RadarChart } from './presentation/RadarChart';
export { RadarLegend, RadarFilters as RadarFiltersComponent, RadarTable } from './presentation/blocks';
export { RadarPageLayout } from './presentation/layouts';
export { RingLegendItem, QuadrantTag } from './presentation/elements';

// Hooks
export { useRadarFilters } from './hooks';
