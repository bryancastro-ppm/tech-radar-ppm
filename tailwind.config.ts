import type { Config } from 'tailwindcss';
import { heroui } from '@heroui/react';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--background) / <alpha-value>)',
        foreground: 'rgb(var(--foreground) / <alpha-value>)',
        card: 'rgb(var(--card) / <alpha-value>)',
        'card-foreground': 'rgb(var(--card-foreground) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        'muted-foreground': 'rgb(var(--muted-foreground) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
        ring: {
          adopt: 'rgb(var(--ring-adopt) / <alpha-value>)',
          trial: 'rgb(var(--ring-trial) / <alpha-value>)',
          assess: 'rgb(var(--ring-assess) / <alpha-value>)',
          hold: 'rgb(var(--ring-hold) / <alpha-value>)',
        },
        quadrant: {
          frameworks: 'rgb(var(--quadrant-frameworks) / <alpha-value>)',
          state: 'rgb(var(--quadrant-state) / <alpha-value>)',
          testing: 'rgb(var(--quadrant-testing) / <alpha-value>)',
          styles: 'rgb(var(--quadrant-styles) / <alpha-value>)',
          build: 'rgb(var(--quadrant-build) / <alpha-value>)',
          uncategorized: 'rgb(var(--quadrant-uncategorized) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['var(--font-fira-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-fira-code)', 'ui-monospace', 'monospace'],
      },
    },
  },
  darkMode: 'class',
  plugins: [
    heroui({
      themes: {
        light: {
          colors: {
            background: '#ffffff',
            foreground: '#0f172a',
            primary: {
              50: '#eff6ff',
              100: '#dbeafe',
              200: '#bfdbfe',
              300: '#93c5fd',
              400: '#60a5fa',
              500: '#3b82f6',
              600: '#2563eb',
              700: '#1d4ed8',
              800: '#1e40af',
              900: '#1e3a8a',
              DEFAULT: '#3b82f6',
              foreground: '#ffffff',
            },
            default: {
              50: '#f8fafc',
              100: '#f1f5f9',
              200: '#e2e8f0',
              300: '#cbd5e1',
              400: '#94a3b8',
              500: '#64748b',
              600: '#475569',
              700: '#334155',
              800: '#1e293b',
              900: '#0f172a',
              DEFAULT: '#64748b',
              foreground: '#0f172a',
            },
          },
        },
        dark: {
          colors: {
            background: '#0f172a',
            foreground: '#f1f5f9',
            primary: {
              50: '#1e3a8a',
              100: '#1e40af',
              200: '#1d4ed8',
              300: '#2563eb',
              400: '#3b82f6',
              500: '#60a5fa',
              600: '#93c5fd',
              700: '#bfdbfe',
              800: '#dbeafe',
              900: '#eff6ff',
              DEFAULT: '#3b82f6',
              foreground: '#ffffff',
            },
            default: {
              50: '#0f172a',
              100: '#1e293b',
              200: '#334155',
              300: '#475569',
              400: '#64748b',
              500: '#94a3b8',
              600: '#cbd5e1',
              700: '#e2e8f0',
              800: '#f1f5f9',
              900: '#f8fafc',
              DEFAULT: '#94a3b8',
              foreground: '#f1f5f9',
            },
          },
        },
      },
    }),
  ],
};

export default config;
