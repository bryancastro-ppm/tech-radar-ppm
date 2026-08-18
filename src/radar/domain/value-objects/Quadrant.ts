export const QUADRANTS = [
  'frameworks-librerias',
  'gestion-de-estado',
  'testing',
  'estilos-ui',
  'build-tools',
] as const;
export type Quadrant = (typeof QUADRANTS)[number] | 'sin-categorizar';
