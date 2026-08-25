'use client';

import type { ReactNode } from 'react';
import { ThemeToggle } from '../elements/ThemeToggle';

interface RadarPageLayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
}

export function RadarPageLayout({ children, sidebar }: RadarPageLayoutProps) {
  return (
    <div className="min-h-screen bg-background transition-colors duration-200">
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-card-foreground tracking-tight">
                Tech Radar
              </h1>
              <p className="text-sm text-muted-foreground">
                Herramientas Frontend - Membresías
              </p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-8">{children}</div>
          {sidebar && (
            <aside className="w-full lg:w-72 shrink-0">{sidebar}</aside>
          )}
        </div>
      </main>

      <footer className="border-t border-border bg-card/50 mt-auto">
        <div className="container mx-auto px-4 py-4 text-center text-sm text-muted-foreground">
          Tech Radar - Chapter Frontend
        </div>
      </footer>
    </div>
  );
}
