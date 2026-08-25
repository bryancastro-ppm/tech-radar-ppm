'use client';

import { HeroUIProvider as Provider } from '@heroui/react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

interface HeroUIProviderProps {
  children: ReactNode;
}

export function HeroUIProvider({ children }: HeroUIProviderProps) {
  const router = useRouter();

  return (
    <Provider navigate={router.push}>
      <NextThemesProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </NextThemesProvider>
    </Provider>
  );
}
