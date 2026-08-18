# PoC — Tech Radar de Herramientas Frontend
## Documento de implementación técnica

---

## 1. Objetivo

Construir una prueba de concepto funcional que:

- Escanee automáticamente las dependencias de los repos de **membresías-web** y **membresías-backoffice**.
- Clasifique esas dependencias por cuadrante (tipo de herramienta), tomando por ahora **todas como aprobadas** (ring `adopt`).
- Se actualice automáticamente cuando cambien las dependencias de un repo.
- Visualice el resultado siguiendo el formato del Tech Radar de ThoughtWorks (anillos + cuadrantes).
- Quede **arquitectónicamente lista** para escalar a más repos, agregar clasificación real (Trial/Assess/Hold) y un flujo de apelación, sin reescribir lo ya construido.

Este documento no incluye estimaciones de tiempo; define arquitectura, stack y estructura de implementación.

---

## 2. Stack tecnológico

| Capa | Tecnología | Motivo |
|---|---|---|
| Framework | **Next.js 15 (App Router)** | Server Components, ISR/revalidación on-demand nativa, sin necesidad de un backend separado para el MVP |
| UI Library | **HeroUI 2.6.14** | Ya es el estándar del chapter (design system compartido) |
| Lenguaje | **TypeScript ^5** | Tipado estricto en dominio y contratos |
| Estilos | **Tailwind CSS 3.4.17** | Requisito de HeroUI y estándar del chapter |
| Validación de datos | **Zod** | Validar el JSON que llega de la ingesta antes de que toque el dominio (los datos externos nunca son confiables) |
| Testing | **Vitest + Testing Library** | Mismo framework que usa el chapter en la librería de componentes |
| Lint/Format | **ESLint (eslint-config-next) + Prettier** | Consistencia de código |
| Scripts de ingesta | **tsx** (ejecutar TypeScript directo en el workflow) | Evita duplicar tipos entre la app y el script de escaneo |
| Automatización | **GitHub Actions** (o Azure Pipelines si los repos están en Bitbucket — ver §11) | Trigger en cambios de `package.json` / lockfile |

No se introduce base de datos en esta fase (ver §6 para el porqué) ni librerías de estado global (Zustand/Redux): el filtrado se resuelve con Server Components + `searchParams`, que es el patrón recomendado por Next.js para este caso.

---

## 3. Principios de arquitectura aplicados

Se combina **Clean Architecture** (separación por capas, regla de dependencia hacia adentro) con las convenciones de nomenclatura ya usadas en el chapter (`base` / `elements` / `blocks` / `layouts`), para que cualquier dev del equipo reconozca la estructura.

**Regla de dependencia:** el dominio no conoce Next.js, HeroUI ni fetch. Todo lo externo (fetch de datos, HTTP, framework) vive en `infrastructure/` y se conecta al dominio a través de interfaces (`ports`). Esto es lo que permite después cambiar "leer un JSON de un repo" por "leer de una base de datos" sin tocar reglas de negocio ni UI.

| Capa | Responsabilidad | Puede importar de |
|---|---|---|
| `domain/` | Entidades y reglas puras (qué es un `RadarEntry`, qué es un `Ring`) | Nada externo |
| `application/` | Casos de uso + interfaces (`ports`) que la infraestructura implementa | `domain/` |
| `infrastructure/` | Adaptadores concretos: fetch a GitHub, parseo, mapeo a entidades | `domain/`, `application/ports` |
| `presentation/` | Server/Client Components, hooks de UI | `application/` (casos de uso), nunca al revés |

---

## 4. Estructura de carpetas

```
src/
├── app/                              # Next.js App Router — solo rutas, sin lógica de negocio
│   ├── layout.tsx
│   ├── page.tsx                      # Server Component: renderiza el radar
│   ├── globals.css
│   └── api/
│       ├── ingest/route.ts           # Recibe el JSON generado por cada repo
│       └── revalidate/route.ts       # Invalida la caché ISR tras una ingesta
│
├── base/                             # Átomos — wrappers finos sobre HeroUI
│   ├── Badge/
│   │   ├── Badge.tsx
│   │   ├── index.ts
│   │   └── style.ts
│   └── Chip/
│       └── ...
│
├── radar/                            # Módulo de feature (el único por ahora)
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── RadarEntry.ts
│   │   │   └── Product.ts
│   │   └── value-objects/
│   │       ├── Ring.ts
│   │       └── Quadrant.ts
│   │
│   ├── application/
│   │   ├── ports/
│   │   │   └── RadarRepository.ts    # interfaz — el dominio no sabe de dónde vienen los datos
│   │   └── use-cases/
│   │       ├── getRadarEntries.ts
│   │       └── getEntriesByProduct.ts
│   │
│   ├── infrastructure/
│   │   └── repositories/
│   │       └── GitRadarRepository.ts # implementa RadarRepository leyendo de radar-data
│   │
│   ├── presentation/
│   │   ├── elements/                 # moléculas: RingLegendItem, QuadrantTag
│   │   ├── blocks/                   # organismos: RadarFilters, RadarLegend
│   │   ├── layouts/                  # RadarPageLayout
│   │   └── RadarChart.tsx            # Client Component — visualización SVG
│   │
│   ├── hooks/
│   │   └── useRadarFilters.ts        # deriva filtros desde searchParams
│   │
│   └── index.ts                      # barrel export del módulo
│
├── core/
│   ├── config/
│   │   ├── env.ts                    # validación de env vars con Zod
│   │   └── categorization-map.ts     # mapa estático: paquete → cuadrante
│   └── provider/
│       └── HeroUIProvider.tsx
│
└── shared/
    └── types/
        └── result.ts                 # tipo Result<T, E> para manejo de errores explícito

scripts/
└── ingest/
    ├── scanDependencies.ts           # parsea package.json + lockfile del repo
    └── categorize.ts                 # aplica categorization-map.ts

radar-data/                           # repo separado (ver §5) — solo contiene JSON versionado
├── membresias-web.json
└── membresias-backoffice.json
```

### Reglas de la estructura (heredadas del estándar del chapter, aplicadas aquí)

- `base/` nunca importa de `radar/`.
- `hooks/` nunca importa de `presentation/`.
- Solo `infrastructure/` puede hacer `fetch` o hablar con servicios externos.
- Cada módulo de feature expone su superficie pública únicamente a través de su `index.ts`.

---

## 5. Flujo de datos (ingesta automática)

```
membresias-web (repo)          membresias-backoffice (repo)
      │ push a main                    │ push a main
      │ (cambia package.json/lock)     │
      ▼                                 ▼
 [GitHub Action: radar-scan.yml]  [GitHub Action: radar-scan.yml]
      │                                 │
      │  scripts/ingest/scanDependencies.ts + categorize.ts
      │  → genera <producto>.json
      ▼                                 ▼
        commit + push a → radar-data (repo)
                    │
                    │ push en radar-data dispara:
                    ▼
        [GitHub Action en radar-data]
                    │
                    │  POST /api/revalidate?tag=radar-data
                    ▼
        [App Next.js — invalida caché ISR]
                    │
                    ▼
   Próxima visita: Server Component vuelve a
   pedir los JSON de radar-data (fetch con tag)
   → GitRadarRepository → use-cases → UI
```

**Por qué un repo `radar-data` separado y no una base de datos:**
- Cero infraestructura nueva que mantener en el MVP.
- El historial de commits **es** un audit log gratuito de cómo cambió el stack en el tiempo — un beneficio colateral útil para el chapter.
- Agregar un repo nuevo a futuro = agregar el workflow reusable en ese repo, sin tocar la app Next.js.
- Migrar a una base de datos real después es un cambio aislado a `infrastructure/repositories/` (se agrega `PrismaRadarRepository` implementando el mismo `RadarRepository`), sin tocar dominio, casos de uso ni UI.

### Workflow reusable en cada repo de producto

```yaml
# .github/workflows/radar-scan.yml (en membresias-web y membresias-backoffice)
name: Radar Scan
on:
  push:
    branches: [main]
    paths:
      - 'package.json'
      - 'package-lock.json'
jobs:
  scan:
    uses: <org>/radar-ingestor/.github/workflows/scan-and-push.yml@main
    with:
      product-name: membresias-web
    secrets:
      RADAR_DATA_PUSH_TOKEN: ${{ secrets.RADAR_DATA_PUSH_TOKEN }}
```

Centralizar la lógica del script en un repo `radar-ingestor` reusable evita duplicar código de escaneo en cada repo de producto que se sume a futuro.

---

## 6. Modelo de dominio

```ts
// src/radar/domain/value-objects/Ring.ts
export const RINGS = ['adopt', 'trial', 'assess', 'hold'] as const;
export type Ring = (typeof RINGS)[number];

// src/radar/domain/value-objects/Quadrant.ts
export const QUADRANTS = [
  'frameworks-librerias',
  'gestion-de-estado',
  'testing',
  'estilos-ui',
  'build-tools',
] as const;
export type Quadrant = (typeof QUADRANTS)[number] | 'sin-categorizar';

// src/radar/domain/entities/RadarEntry.ts
export interface RadarEntry {
  readonly name: string;
  readonly version: string;
  readonly quadrant: Quadrant;
  readonly ring: Ring;              // hoy siempre 'adopt', el tipo ya soporta el resto
  readonly product: string;         // 'membresias-web' | 'membresias-backoffice' | ...
  readonly repository: string;
  readonly isNew: boolean;          // calculado al comparar con la ingesta anterior
}
```

`sin-categorizar` es intencional: cualquier paquete que no esté en `categorization-map.ts` cae ahí en vez de romper el build. Ese cuadrante se convierte, sin ningún cambio de arquitectura, en la cola de revisión cuando el chapter decida clasificar de verdad (§10).

---

## 7. Puerto y caso de uso (independientes de Next.js)

```ts
// src/radar/application/ports/RadarRepository.ts
import type { RadarEntry } from '@/radar/domain/entities/RadarEntry';

export interface RadarRepository {
  getAll(): Promise<RadarEntry[]>;
}
```

```ts
// src/radar/application/use-cases/getRadarEntries.ts
import type { RadarRepository } from '../ports/RadarRepository';
import type { RadarEntry } from '@/radar/domain/entities/RadarEntry';

interface Filters {
  quadrant?: string;
  product?: string;
}

export async function getRadarEntries(
  repository: RadarRepository,
  filters: Filters = {},
): Promise<RadarEntry[]> {
  const entries = await repository.getAll();

  return entries.filter((entry) => {
    if (filters.quadrant && entry.quadrant !== filters.quadrant) return false;
    if (filters.product && entry.product !== filters.product) return false;
    return true;
  });
}
```

Este caso de uso se testea con Vitest sin levantar Next.js ni hacer fetch real — se le inyecta un `RadarRepository` falso.

---

## 8. Adaptador de infraestructura

```ts
// src/radar/infrastructure/repositories/GitRadarRepository.ts
import { z } from 'zod';
import type { RadarRepository } from '@/radar/application/ports/RadarRepository';
import type { RadarEntry } from '@/radar/domain/entities/RadarEntry';

const RadarEntrySchema = z.object({
  name: z.string(),
  version: z.string(),
  quadrant: z.string(),
  ring: z.enum(['adopt', 'trial', 'assess', 'hold']),
  product: z.string(),
  repository: z.string(),
  isNew: z.boolean(),
});

const RAW_BASE_URL = 'https://raw.githubusercontent.com/<org>/radar-data/main';
const PRODUCTS = ['membresias-web', 'membresias-backoffice'];

export class GitRadarRepository implements RadarRepository {
  async getAll(): Promise<RadarEntry[]> {
    const results = await Promise.all(
      PRODUCTS.map(async (product) => {
        const res = await fetch(`${RAW_BASE_URL}/${product}.json`, {
          next: { tags: ['radar-data'] }, // habilita revalidación on-demand
        });
        const json = await res.json();
        return z.array(RadarEntrySchema).parse(json);
      }),
    );

    return results.flat();
  }
}
```

Toda la validación de datos externos ocurre acá, con Zod. Si `radar-data` tiene un JSON malformado, falla en este punto con un error claro — nunca llega roto a la UI.

---

## 9. Endpoint de revalidación

```ts
// src/app/api/revalidate/route.ts
import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const secret = request.headers.get('x-radar-secret');

  if (secret !== process.env.RADAR_REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }

  revalidateTag('radar-data');
  return NextResponse.json({ revalidated: true });
}
```

Este endpoint es el único punto de entrada "de escritura conceptual" en la app; está protegido por un secreto compartido con el workflow de `radar-data`, nunca por autenticación de usuario (no aplica en un webhook de CI).

---

## 10. Visualización (HeroUI + SVG)

Se construye un `RadarChart` propio en vez de embeber la herramienta open source de ThoughtWorks (`build-your-own-radar`), por dos razones: consistencia con el design system de HeroUI, y control total para features futuras (drill-down, apelaciones) sin pelear contra una librería externa pensada para uso standalone.

El posicionamiento de cada blip es una función **pura**, testeable sin renderizar nada:

```ts
// src/radar/domain/services/calculateBlipPosition.ts
import type { Ring, Quadrant } from '../value-objects';

const RING_RADIUS: Record<Ring, number> = {
  adopt: 0.25,
  trial: 0.5,
  assess: 0.75,
  hold: 0.95,
};

const QUADRANT_ANGLE_START: Record<Quadrant, number> = {
  'frameworks-librerias': 0,
  'gestion-de-estado': 90,
  testing: 180,
  'estilos-ui': 270,
  'build-tools': 315, // ejemplo — ajustar según cantidad final de cuadrantes
  'sin-categorizar': 0,
};

export function calculateBlipPosition(
  ring: Ring,
  quadrant: Quadrant,
  indexInQuadrant: number,
  totalInQuadrant: number,
) {
  const baseAngle = QUADRANT_ANGLE_START[quadrant];
  const jitter = (indexInQuadrant / Math.max(totalInQuadrant, 1)) * 80;
  const angle = ((baseAngle + jitter) * Math.PI) / 180;
  const radius = RING_RADIUS[ring];

  return {
    x: 50 + radius * 45 * Math.cos(angle),
    y: 50 + radius * 45 * Math.sin(angle),
  };
}
```

```tsx
// src/radar/presentation/RadarChart.tsx
'use client';

import type { RadarEntry } from '@/radar/domain/entities/RadarEntry';
import { calculateBlipPosition } from '@/radar/domain/services/calculateBlipPosition';

interface RadarChartProps {
  entries: RadarEntry[];
}

export function RadarChart({ entries }: RadarChartProps) {
  return (
    <svg viewBox="0 0 100 100" role="img" aria-label="Tech Radar frontend">
      {[0.25, 0.5, 0.75, 1].map((r) => (
        <circle key={r} cx={50} cy={50} r={r * 45} className="fill-none stroke-default-200" />
      ))}
      {entries.map((entry, i) => {
        const sameQuadrant = entries.filter((e) => e.quadrant === entry.quadrant);
        const { x, y } = calculateBlipPosition(
          entry.ring,
          entry.quadrant,
          sameQuadrant.indexOf(entry),
          sameQuadrant.length,
        );
        return (
          <circle
            key={`${entry.repository}-${entry.name}-${i}`}
            cx={x}
            cy={y}
            r={1.2}
            className="fill-primary"
          >
            <title>{`${entry.name} v${entry.version} — ${entry.product}`}</title>
          </circle>
        );
      })}
    </svg>
  );
}
```

Componentes de apoyo (`RadarLegend`, `RadarFilters`, `QuadrantTag`) van en `presentation/blocks/` y `presentation/elements/` usando primitivas de HeroUI (`Chip`, `Select`, `Tooltip`) envueltas en `base/` para mantener un único punto de personalización visual.

---

## 11. Filtros sin estado global

La página raíz es un Server Component que lee `searchParams` directamente — no hace falta Zustand/Context para esto, y el filtro queda en la URL (compartible, bookmarkeable):

```tsx
// src/app/page.tsx
import { GitRadarRepository } from '@/radar/infrastructure/repositories/GitRadarRepository';
import { getRadarEntries } from '@/radar/application/use-cases/getRadarEntries';
import { RadarChart } from '@/radar/presentation/RadarChart';
import { RadarFilters } from '@/radar/presentation/blocks/RadarFilters';

interface PageProps {
  searchParams: { quadrant?: string; product?: string };
}

export default async function RadarPage({ searchParams }: PageProps) {
  const repository = new GitRadarRepository();
  const entries = await getRadarEntries(repository, searchParams);

  return (
    <main className="p-8">
      <RadarFilters />
      <RadarChart entries={entries} />
    </main>
  );
}
```

`RadarFilters` es el único Client Component del árbol de filtrado; usa `useRouter().push()` de HeroUI + Next.js para actualizar `searchParams` al seleccionar un cuadrante o producto.

---

## 12. Testing

| Qué testear | Cómo | Ejemplo |
|---|---|---|
| `calculateBlipPosition` | Vitest, función pura | input conocido → coordenadas esperadas |
| `getRadarEntries` (caso de uso) | Vitest, con `RadarRepository` fake inyectado | filtra correctamente por producto/cuadrante |
| `GitRadarRepository` | Vitest + mock de `fetch` | rechaza JSON que no matchea el schema Zod |
| Componentes en `base/` | Testing Library, render test | renderiza con las props mínimas |
| `RadarFilters` | Testing Library, interacción | seleccionar un chip actualiza la URL |

```ts
// ejemplo: src/radar/application/use-cases/getRadarEntries.test.ts
import { describe, it, expect } from 'vitest';
import { getRadarEntries } from './getRadarEntries';
import type { RadarRepository } from '../ports/RadarRepository';

const fakeRepository: RadarRepository = {
  async getAll() {
    return [
      { name: 'react', version: '19.0.0', quadrant: 'frameworks-librerias', ring: 'adopt', product: 'membresias-web', repository: 'membresias-web', isNew: false },
      { name: 'vitest', version: '2.0.0', quadrant: 'testing', ring: 'adopt', product: 'membresias-backoffice', repository: 'membresias-backoffice', isNew: false },
    ];
  },
};

describe('getRadarEntries', () => {
  it('filtra por producto', async () => {
    const result = await getRadarEntries(fakeRepository, { product: 'membresias-web' });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('react');
  });
});
```

---

## 13. Calidad de código y CI

Pipeline mínimo (adaptar a GitHub Actions o Azure Pipelines según dónde vivan los repos — ver decisión pendiente en §15):

```
install → typecheck (tsc --noEmit) → lint (eslint) → test (vitest) → build (next build)
```

Reglas no negociables, heredadas del estándar del chapter:
- Sin `any` implícito — `strict: true` en `tsconfig.json`.
- Sin lógica de negocio dentro de JSX — vive en `domain/` o `application/`.
- Solo clases de Tailwind — sin estilos inline.
- Ningún PR se mergea sin tests para el código nuevo en `domain/` y `application/`.

---

## 14. Seguridad

- `RADAR_REVALIDATE_SECRET` y `RADAR_DATA_PUSH_TOKEN` viven como secrets del repo/organización — nunca en código ni en `.env` commiteado.
- Todo dato que entra desde `radar-data` se valida con Zod antes de tocar el dominio (evita que un JSON corrupto tumbe el render).
- `npm audit` como paso del pipeline de `radar-ingestor` (el script que sí toca dependencias de terceros para parsearlas).
- El endpoint `/api/revalidate` no expone ni acepta ningún dato de negocio — solo dispara una invalidación de caché.

---

## 15. Extensibilidad a futuro (por qué esta arquitectura la soporta sin refactor)

| Necesidad futura | Cómo se resuelve con esta base |
|---|---|
| Agregar un repo nuevo | Agregar el workflow reusable al repo — cero cambios en la app Next.js |
| Clasificación real (Trial/Assess/Hold) | El campo `ring` ya existe en el dominio; se agrega una UI de edición que escribe a `radar-data` vía un nuevo caso de uso, sin tocar lo existente |
| Flujo de apelación por equipo | Nueva entidad `AppealRequest` + caso de uso `submitAppeal`, en un módulo nuevo `appeals/` que reutiliza `RadarEntry` sin modificarlo |
| Migrar de JSON en git a base de datos | Se implementa `PrismaRadarRepository` (mismo `RadarRepository`) y se cambia una línea de instanciación — dominio, casos de uso y UI no se tocan |
| Sumar stacks no-Node (otros lenguajes) | `scripts/ingest/` se extiende con un parser nuevo; el contrato de salida (`RadarEntry[]`) no cambia |

Esto es, en la práctica, la aplicación directa del principio de inversión de dependencias: todo lo que va a cambiar (fuente de datos, reglas de clasificación) está detrás de una interfaz; todo lo que no cambia (entidades, reglas de filtrado) está aislado de esas decisiones.

---

## 16. Decisiones pendientes para el TL

Estas quedan fuera del alcance de este documento porque dependen de infraestructura de la org, no de arquitectura de la app:

- ¿Dónde se despliega la app — Vercel (ISR on-demand nativa) o infraestructura Azure del chapter?
- ¿Los repos de producto están en GitHub o Bitbucket? Define si el workflow es GitHub Actions o Azure Pipelines.
- ¿`radar-data` es un repo nuevo dedicado, o una carpeta dentro de un repo ya existente del chapter?

---

## 17. Checklist antes de cada PR

- [ ] Tipos explícitos en toda entidad, puerto y caso de uso — sin `any`.
- [ ] Ninguna lógica de negocio dentro de un componente — vive en `domain/` o `application/`.
- [ ] Todo dato externo pasa por validación Zod antes de entrar al dominio.
- [ ] Tests para el caso de uso o función pura agregada.
- [ ] `base/` no importa de `radar/`; `hooks/` no importa de `presentation/`.
- [ ] Solo clases Tailwind, sin estilos inline.
- [ ] `index.ts` del módulo actualizado si se agregó una exportación pública.
