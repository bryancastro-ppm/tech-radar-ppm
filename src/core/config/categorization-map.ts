import type { Quadrant } from '@/radar/domain/value-objects/Quadrant';

export const categorizationMap: Record<string, Quadrant> = {
  // Frameworks y Librerías
  react: 'frameworks-librerias',
  'react-dom': 'frameworks-librerias',
  next: 'frameworks-librerias',
  'next-themes': 'frameworks-librerias',
  vue: 'frameworks-librerias',
  angular: 'frameworks-librerias',
  svelte: 'frameworks-librerias',
  '@heroui/react': 'frameworks-librerias',
  '@nextui-org/react': 'frameworks-librerias',
  'framer-motion': 'frameworks-librerias',
  axios: 'frameworks-librerias',
  lodash: 'frameworks-librerias',
  'date-fns': 'frameworks-librerias',
  dayjs: 'frameworks-librerias',
  moment: 'frameworks-librerias',

  // Gestión de Estado
  zustand: 'gestion-de-estado',
  redux: 'gestion-de-estado',
  '@reduxjs/toolkit': 'gestion-de-estado',
  'react-redux': 'gestion-de-estado',
  recoil: 'gestion-de-estado',
  jotai: 'gestion-de-estado',
  mobx: 'gestion-de-estado',
  'mobx-react': 'gestion-de-estado',
  '@tanstack/react-query': 'gestion-de-estado',
  'react-query': 'gestion-de-estado',
  swr: 'gestion-de-estado',

  // Testing
  vitest: 'testing',
  jest: 'testing',
  '@testing-library/react': 'testing',
  '@testing-library/dom': 'testing',
  '@testing-library/jest-dom': 'testing',
  '@testing-library/user-event': 'testing',
  cypress: 'testing',
  playwright: 'testing',
  '@playwright/test': 'testing',
  msw: 'testing',
  'happy-dom': 'testing',
  jsdom: 'testing',

  // Estilos y UI
  tailwindcss: 'estilos-ui',
  '@tailwindcss/postcss': 'estilos-ui',
  '@tailwindcss/typography': 'estilos-ui',
  '@tailwindcss/forms': 'estilos-ui',
  sass: 'estilos-ui',
  'styled-components': 'estilos-ui',
  '@emotion/react': 'estilos-ui',
  '@emotion/styled': 'estilos-ui',
  postcss: 'estilos-ui',
  autoprefixer: 'estilos-ui',
  'clsx': 'estilos-ui',
  'class-variance-authority': 'estilos-ui',
  'tailwind-merge': 'estilos-ui',

  // Build Tools
  vite: 'build-tools',
  '@vitejs/plugin-react': 'build-tools',
  webpack: 'build-tools',
  esbuild: 'build-tools',
  rollup: 'build-tools',
  turbo: 'build-tools',
  typescript: 'build-tools',
  eslint: 'build-tools',
  'eslint-config-next': 'build-tools',
  prettier: 'build-tools',
  tsx: 'build-tools',
  'ts-node': 'build-tools',
  zod: 'build-tools',
  '@netlify/plugin-nextjs': 'build-tools',
  '@types/node': 'build-tools',
  '@types/react': 'build-tools',
  '@types/react-dom': 'build-tools',
};

export function categorizePackage(packageName: string): Quadrant {
  return categorizationMap[packageName] || 'sin-categorizar';
}
