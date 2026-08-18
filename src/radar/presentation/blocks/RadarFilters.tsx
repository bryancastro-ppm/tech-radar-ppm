'use client';

import React, { memo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectItem } from '@heroui/react';
import type { SharedSelection } from '@heroui/react';
import { QUADRANTS, type Quadrant } from '@/radar/domain/value-objects/Quadrant';
import { PRODUCTS } from '@/radar/domain/entities/Product';

const quadrantLabels: Record<Quadrant, string> = {
  'frameworks-librerias': 'Frameworks y Librerías',
  'gestion-de-estado': 'Gestión de Estado',
  testing: 'Testing',
  'estilos-ui': 'Estilos y UI',
  'build-tools': 'Build Tools',
  'sin-categorizar': 'Sin Categorizar',
};

const RadarFilters = memo(function RadarFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentQuadrant = searchParams.get('quadrant') || '';
  const currentProduct = searchParams.get('product') || '';

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  const handleQuadrantChange = useCallback(
    (keys: SharedSelection) => {
      if (keys === 'all') return;
      const value = Array.from(keys)[0] as string;
      updateFilter('quadrant', value || '');
    },
    [updateFilter],
  );

  const handleProductChange = useCallback(
    (keys: SharedSelection) => {
      if (keys === 'all') return;
      const value = Array.from(keys)[0] as string;
      updateFilter('product', value || '');
    },
    [updateFilter],
  );

  const handleClearFilters = useCallback(() => {
    router.push('/');
  }, [router]);

  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <Select
        label="Cuadrante"
        placeholder="Todos los cuadrantes"
        selectedKeys={currentQuadrant ? [currentQuadrant] : []}
        onSelectionChange={handleQuadrantChange}
        className="max-w-xs"
      >
        {[...QUADRANTS, 'sin-categorizar' as const].map((quadrant) => (
          <SelectItem key={quadrant}>
            {quadrantLabels[quadrant]}
          </SelectItem>
        ))}
      </Select>

      <Select
        label="Producto"
        placeholder="Todos los productos"
        selectedKeys={currentProduct ? [currentProduct] : []}
        onSelectionChange={handleProductChange}
        className="max-w-xs"
      >
        {PRODUCTS.map((product) => (
          <SelectItem key={product.id}>
            {product.name}
          </SelectItem>
        ))}
      </Select>

      {(currentQuadrant || currentProduct) && (
        <button
          onClick={handleClearFilters}
          className="self-end px-4 py-2 text-sm text-primary hover:text-primary-600 transition-colors"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
});

export { RadarFilters };
