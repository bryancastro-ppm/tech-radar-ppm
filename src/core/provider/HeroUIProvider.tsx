'use client';

import { HeroUIProvider as Provider } from '@heroui/react';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

interface HeroUIProviderProps {
  children: ReactNode;
}

export function HeroUIProvider({ children }: HeroUIProviderProps) {
  const router = useRouter();

  return (
    <Provider navigate={router.push}>
      {children}
    </Provider>
  );
}
