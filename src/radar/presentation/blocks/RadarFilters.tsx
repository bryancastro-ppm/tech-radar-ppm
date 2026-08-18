'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { Select, SelectItem } from '@heroui/react';
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

export function RadarFilters() {
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

  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <Select
        label="Cuadrante"
        placeholder="Todos los cuadrantes"
        selectedKeys={currentQuadrant ? [currentQuadrant] : []}
        onSelectionChange={(keys) => {
          const value = Array.from(keys)[0] as string;
          updateFilter('quadrant', value || '');
        }}
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
        onSelectionChange={(keys) => {
          const value = Array.from(keys)[0] as string;
          updateFilter('product', value || '');
        }}
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
          onClick={() => router.push('/')}
          className="self-end px-4 py-2 text-sm text-primary hover:text-primary-600 transition-colors"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
