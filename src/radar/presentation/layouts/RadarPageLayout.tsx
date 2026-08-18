import type { ReactNode } from 'react';

interface RadarPageLayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
}

export function RadarPageLayout({ children, sidebar }: RadarPageLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-default-200 bg-default-50">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-default-900">Tech Radar</h1>
          <p className="text-sm text-default-500">
            Herramientas Frontend - Membresías
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">{children}</div>
          {sidebar && (
            <aside className="w-full lg:w-64 shrink-0">{sidebar}</aside>
          )}
        </div>
      </main>

      <footer className="border-t border-default-200 bg-default-50 mt-auto">
        <div className="container mx-auto px-4 py-4 text-center text-sm text-default-500">
          Tech Radar - Chapter Frontend
        </div>
      </footer>
    </div>
  );
}
