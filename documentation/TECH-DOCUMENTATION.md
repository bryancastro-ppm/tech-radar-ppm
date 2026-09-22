# Tech Radar Frontend - Documentación Técnica
## Anexo de la Épica CHAPDEVFNT

---

## Resumen Ejecutivo

El **Tech Radar de Herramientas Frontend** es una aplicación web que automatiza la visualización y gestión del stack tecnológico del chapter de Membresías. Inspirado en el modelo de ThoughtWorks, clasifica dependencias en cuadrantes (tipo de herramienta) y anillos (nivel de adopción), facilitando la toma de decisiones técnicas y la estandarización.

### Estado Actual del Proyecto
**Fase:** Ingesta automática + upload manual en producción  
**Fecha:** Septiembre 2026  
**Productos integrados:** descubiertos dinámicamente desde `radar-data/*.json` (actualmente: mi-app, tech-radar, todo-app)  
**Cobertura de tests:** ver `npm run test:coverage`  

### Valor Entregado
- ✅ Visibilidad completa del stack tecnológico de los productos integrados
- ✅ Ingesta automática vía GitHub Actions (`scan-dependencies.yml`) con versiones resueltas de lockfile
- ✅ Upload manual sin CI (`/upload`) para casos sin lockfile
- ✅ Descubrimiento dinámico de productos (agregar un producto = agregar un JSON, sin tocar código)
- ✅ Arquitectura extensible lista para escalar a más productos
- ✅ Base técnica para implementar flujos de gobernanza (Trial/Assess/Hold)

---

## Arquitectura Técnica

### Stack Tecnológico

| Capa | Tecnología | Versión | Justificación |
|------|-----------|---------|---------------|
| **Framework** | Next.js | 16.3.1 | Server Components, ISR on-demand, App Router |
| **UI Library** | HeroUI | 2.6.14 | Estándar del chapter, design system compartido |
| **Lenguaje** | TypeScript | 5.x | Tipado estricto, mejor DX |
| **Estilos** | Tailwind CSS | 3.4.17 | Requisito de HeroUI, utility-first |
| **Validación** | Zod | 4.4.3 | Schema validation de datos externos |
| **Testing** | Vitest | 4.1.11 | Fast, compatible con Vite/Next.js |
| **Runtime** | Node.js | 20 LTS | Estabilidad, soporte a largo plazo |
| **CI/CD** | GitHub Actions | - | Integración nativa con GitHub |

### Principios Arquitectónicos

#### 1. Clean Architecture
Separación estricta en 4 capas con regla de dependencia unidireccional:

```
┌─────────────────────────────────────────────┐
│           Presentation Layer                │
│  (React/Next.js Components, Hooks)          │
│  - RadarChart, RadarFilters, RadarTable     │
└────────────────┬────────────────────────────┘
                 │ uses
┌────────────────▼────────────────────────────┐
│          Application Layer                  │
│  (Use Cases, Ports/Interfaces)              │
│  - getRadarEntries, RadarRepository port    │
└────────────────┬────────────────────────────┘
                 │ uses
┌────────────────▼────────────────────────────┐
│            Domain Layer                     │
│  (Entities, Value Objects, Pure Logic)      │
│  - RadarEntry, Ring, Quadrant               │
│  - calculateBlipPosition (pure function)    │
└─────────────────────────────────────────────┘
                 ▲
                 │ implements
┌────────────────┴────────────────────────────┐
│        Infrastructure Layer                 │
│  (Repositories, External Adapters)          │
│  - LocalRadarRepository (usada por app/page.tsx) │
│  - GitRadarRepository (implementada, no cableada todavía) │
└─────────────────────────────────────────────┘
```

Existe un segundo módulo independiente, `src/ingest`, con la misma regla de capas pero sin `presentation` (produce datos, no los renderiza): `domain` (`DetectedDependency`), `application/use-cases` (`detectDependencies`, `detectDependenciesFromContent`, `toRadarEntries`, `markNewEntries`), `infrastructure` (parsers de lockfile, lector de `package.json`, escritura de JSON). Ambos flujos de datos (ver más abajo) convergen en los mismos casos de uso de `src/ingest/application`.

**Reglas de dependencia:**
- ❌ Domain NO puede importar de ninguna otra capa
- ✅ Application solo importa de Domain
- ✅ Infrastructure implementa ports de Application
- ✅ Presentation usa casos de uso de Application

#### 2. Inversión de Dependencias
Los casos de uso dependen de abstracciones (ports), no de implementaciones concretas:

```typescript
// ✅ CORRECTO: Application define la interfaz
// src/radar/application/ports/RadarRepository.ts
export interface RadarRepository {
  getAll(): Promise<RadarEntry[]>;
}

// ✅ Infrastructure implementa la interfaz
// src/radar/infrastructure/repositories/GitRadarRepository.ts
export class GitRadarRepository implements RadarRepository {
  async getAll(): Promise<RadarEntry[]> {
    // Implementación específica (fetch a GitHub)
  }
}

// ✅ Caso de uso recibe la abstracción
// src/radar/application/use-cases/getRadarEntries.ts
export async function getRadarEntries(
  repository: RadarRepository, // ← Abstracción, no implementación
  filters: Filters
): Promise<RadarEntry[]> {
  const entries = await repository.getAll();
  // Lógica de filtrado...
}
```

**Beneficio:** Cambiar de JSON en GitHub a base de datos requiere solo crear `PrismaRadarRepository` implementando `RadarRepository`, sin tocar domain, application ni presentation.

#### 3. Server Components First
Aprovecha Server Components de Next.js para reducir JavaScript en cliente:

- **Server Components:** `page.tsx`, `RadarTable`, `RadarLegend` (no necesitan interactividad)
- **Client Components:** `RadarChart`, `RadarFilters`, `ThemeToggle` (requieren estado/eventos)

**Beneficio:** Menor bundle size, mejor performance, SEO mejorado.

---

## Estructura de Carpetas

```
tech-radar/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout con providers
│   │   ├── page.tsx                  # Página principal (Server Component, usa LocalRadarRepository)
│   │   ├── globals.css               # Estilos globales
│   │   ├── upload/page.tsx           # Página de upload manual de package.json
│   │   └── api/
│   │       ├── revalidate/route.ts        # Endpoint de revalidación ISR (x-radar-secret)
│   │       ├── radar-data/[product]/route.ts  # API para JSON (fallback de GitRadarRepository)
│   │       ├── products/route.ts          # Lista de productos disponibles
│   │       └── upload-package/route.ts    # Recibe package.json, corre pipeline de ingest
│   │
│   ├── radar/                        # Feature module (Clean Architecture)
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   ├── RadarEntry.ts     # Entidad principal
│   │   │   │   └── Product.ts        # Entidad de producto
│   │   │   ├── value-objects/
│   │   │   │   ├── Ring.ts           # Adopt | Trial | Assess | Hold
│   │   │   │   └── Quadrant.ts       # frameworks-librerias | gestion-de-estado | testing | estilos-ui | build-tools | sin-categorizar
│   │   │   └── services/
│   │   │       └── calculateBlipPosition.ts  # Lógica pura de posicionamiento
│   │   │
│   │   ├── application/
│   │   │   ├── ports/
│   │   │   │   └── RadarRepository.ts  # Interfaz de repositorio
│   │   │   └── use-cases/
│   │   │       ├── getRadarEntries.ts  # Caso de uso principal
│   │   │       └── getEntriesByProduct.ts
│   │   │
│   │   ├── infrastructure/
│   │   │   ├── repositories/
│   │   │   │   ├── GitRadarRepository.ts      # Fetch HTTP a RADAR_DATA_URL (implementada, no usada aún)
│   │   │   │   └── LocalRadarRepository.ts    # Lectura de radar-data/*.json en disco (la usada en prod)
│   │   │   └── utils/
│   │   │       └── getAvailableProducts.ts    # Descubre productos escaneando radar-data/
│   │   │
│   │   ├── presentation/
│   │   │   ├── elements/              # Moléculas
│   │   │   │   ├── QuadrantTag.tsx
│   │   │   │   ├── RingLegendItem.tsx
│   │   │   │   └── ThemeToggle.tsx
│   │   │   ├── blocks/                # Organismos
│   │   │   │   ├── RadarFilters.tsx
│   │   │   │   ├── RadarLegend.tsx
│   │   │   │   ├── RadarTable.tsx
│   │   │   │   ├── PackageUploadForm.tsx   # Formulario de /upload
│   │   │   │   └── UploadResultDisplay.tsx # Resultado del upload
│   │   │   ├── layouts/
│   │   │   │   └── RadarPageLayout.tsx
│   │   │   └── RadarChart.tsx         # Visualización SVG (Client Component)
│   │   │
│   │   ├── hooks/
│   │   │   └── useRadarFilters.ts     # Hook para leer searchParams
│   │   │
│   │   └── index.ts                   # Barrel export del módulo
│   │
│   ├── ingest/                        # Feature module (Clean Architecture, sin presentation)
│   │   ├── domain/
│   │   │   └── DetectedDependency.ts
│   │   ├── application/use-cases/
│   │   │   ├── detectDependencies.ts            # Vía lockfile (npm/yarn/pnpm), versiones exactas
│   │   │   ├── detectDependenciesFromContent.ts # Vía package.json crudo (upload), versiones declaradas
│   │   │   ├── toRadarEntries.ts                # Categoriza y mapea a RadarEntry
│   │   │   └── markNewEntries.ts                # Diff contra JSON previo
│   │   ├── infrastructure/
│   │   │   ├── PackageJsonReader.ts
│   │   │   ├── parsers/
│   │   │   │   ├── LockfileDetector.ts
│   │   │   │   ├── NpmLockParser.ts
│   │   │   │   ├── PnpmLockParser.ts
│   │   │   │   └── YarnLockParser.ts
│   │   │   └── output/
│   │   │       ├── fetchPreviousEntries.ts
│   │   │       └── writeRadarJson.ts
│   │   ├── index.ts                   # Entry point de `npm run ingest`
│   │   └── README.md
│   │
│   ├── base/                          # Componentes atómicos (wrappers HeroUI)
│   │   ├── Badge/
│   │   └── Chip/
│   │
│   ├── core/
│   │   ├── config/
│   │   │   ├── env.ts                 # Validación de env vars con Zod
│   │   │   └── categorization-map.ts  # Mapa paquete → cuadrante (85 entradas)
│   │   └── provider/
│   │       └── HeroUIProvider.tsx     # Provider de HeroUI + next-themes
│   │
│   └── shared/
│       └── types/
│           └── result.ts              # Tipo Result<T, E> (error handling)
│
├── scripts/
│   └── ingest/                        # Legacy, superseded by src/ingest (npm run scan)
│       ├── scanDependencies.ts
│       └── categorize.ts
│
├── radar-data/                        # JSON versionado, en ESTE repo (no uno separado)
│   ├── mi-app.json
│   ├── tech-radar.json
│   └── todo-app.json
│
├── .github/
│   └── workflows/
│       ├── ci.yml                     # Pipeline de calidad (typecheck, lint, test, build)
│       ├── scan-dependencies.yml      # Workflow reusable, llamado por repos de producto
│       ├── scan-self.yml              # Mismo pipeline aplicado al propio package.json de este repo
│       └── radar-scan.yml             # Legacy/inactivo: variante que publicaba a un repo radar-data separado
│
├── docs/                               # Notas/specs locales, en .gitignore (no versionado)
│   └── EPIC-TECH-RADAR.md             # Documento de la épica
│
├── documentation/                     # Documentación técnica versionada (esta carpeta)
│   ├── README.md                      # Índice de documentación
│   ├── TECH-DOCUMENTATION.md          # Este documento
│   ├── QUICK_START.md                 # Guía rápida del upload manual
│   ├── upload-feature-usage.md        # Guía de uso del upload manual
│   ├── package-upload-feature-spec.md # Spec de la feature de upload
│   ├── ingest-system.md               # Detalle del sistema de ingesta
│   └── example-package.json           # package.json de ejemplo para /upload
│
├── public/                            # Assets estáticos
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── tailwind.config.ts
├── next.config.ts
└── AGENTS.md                          # Documentación para agentes/devs
```

---

## Flujo de Datos (Data Flow)

### 1. Ingesta Automática (Automatic Ingestion)

```
┌─────────────────────────────────────────────────────────────────┐
│  Producto (ej. todo-app)                                        │
│  Developer hace commit a main modificando package.json          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ push event
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  GitHub Actions (en repo del producto)                          │
│  Workflow: .github/workflows/scan-dependencies.yml               │
│  Trigger: on push to main, paths: [package.json, package-lock]  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ workflow_call
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Workflow Reusable (tech-radar/.github/workflows/scan-dependencies.yml) │
│  1. Checkout producto                                           │
│  2. Checkout tech-radar (contiene el ingest system)              │
│  3. npm ci (instala deps del ingestor)                          │
│  4. npm run ingest (src/ingest/index.ts)                        │
│     - Lee package.json del producto                             │
│     - Resuelve versiones exactas desde lockfile (npm/yarn/pnpm)  │
│     - Clasifica por cuadrante (categorization-map.ts)           │
│     - Detecta nuevas dependencias (diff contra JSON previo)     │
│     - Escribe radar-data/<producto>.json EN ESTE REPO           │
│  5. git commit + push a tech-radar (main)                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ push a main (mismo repo, ya no uno separado)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Cache invalidation                                              │
│  POST /api/revalidate                                            │
│  Header: x-radar-secret: <RADAR_REVALIDATE_SECRET>              │
│  - Valida secret                                                 │
│  - Llama revalidateTag('radar-data')                             │
│  - Invalida caché ISR de Next.js                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ next visit
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Server Component (app/page.tsx)                                 │
│  - LocalRadarRepository.getAll()                                 │
│    - getAvailableProducts() escanea radar-data/*.json en disco   │
│    - Lee y valida cada JSON con Zod                               │
│    - Retorna RadarEntry[]                                        │
│  - getRadarEntries(repository, filters)                          │
│    - Filtra por producto/cuadrante                                │
│  - Renderiza RadarChart + RadarTable                              │
└─────────────────────────────────────────────────────────────────┘
```

`scan-self.yml` corre el mismo pipeline sobre el `package.json` de este propio repo. `GitRadarRepository` (fetch HTTP a `RADAR_DATA_URL`) está implementada como alternativa a `LocalRadarRepository`, pero ningún page/route la usa hoy — solo entra en juego si el radar se despliega separado de sus datos. `radar-scan.yml` es una variante legacy que publicaba a un repo `radar-data` separado; ya no está activa.

### 1b. Ingesta Manual (Upload Flow)

```
Usuario en /upload sube un package.json
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  POST /api/upload-package (src/app/api/upload-package/route.ts)  │
│  1. Valida tamaño (<1MB) y nombre de producto                    │
│  2. detectDependenciesFromContent()                               │
│     - Lee dependencies/devDependencies del package.json crudo     │
│     - Sin lockfile → versión mostrada es el rango declarado       │
│       (ej. ^19.0.0, no la versión resuelta)                       │
│  3. toRadarEntries() → categoriza                                 │
│  4. markNewEntries() → diff contra JSON previo                    │
│  5. writeRadarJson() → radar-data/<producto>.json                 │
│  6. revalidateTag('radar-data') directo (sin webhook)             │
└─────────────────────────────────────────────────────────────────┘
```

Comparte el mismo pipeline de `toRadarEntries` / `markNewEntries` / `writeRadarJson` que el flujo automático; solo cambia cómo se detectan las dependencias.

**Tiempo total (flujo automático):** ~3-5 minutos desde commit hasta visualización actualizada. **Flujo manual:** instantáneo (sin CI).

### 2. Visualización (Rendering Flow)

```
Usuario visita https://tech-radar.app/?product=todo-app&quadrant=testing
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Server Component: app/page.tsx                                 │
│  - Lee searchParams: { product, quadrant }                      │
│  - Instancia LocalRadarRepository                                │
│  - Llama getRadarEntries(repository, { product, quadrant })     │
│    ├─ repository.getAll() → lee JSON de radar-data/ en disco   │
│    └─ Filtra entries según searchParams                         │
│  - Renderiza HTML con datos filtrados                           │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTML + hydration
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Client Components                                              │
│  - RadarChart: Renderiza SVG interactivo                        │
│    - calculateBlipPosition() para cada entry                    │
│    - Tooltips al hover                                          │
│  - RadarFilters: Dropdowns/chips para filtrar                   │
│    - useRouter().push() actualiza searchParams                  │
│  - ThemeToggle: Cambia tema claro/oscuro                        │
└─────────────────────────────────────────────────────────────────┘
```

**Performance:**
- First Contentful Paint (FCP): <1.5s
- Time to Interactive (TTI): <2.5s
- Filtrado: <500ms (re-render client-side)

---

## Decisiones Técnicas Clave

### 1. ¿Por qué JSON en Git en vez de Base de Datos?

**Decisión:** Usar carpeta `radar-data/` con JSON versionado en Git (dentro de este mismo repo).

**Razones:**
- ✅ **Cero infraestructura nueva:** No requiere provisionar/mantener DB, backups, etc.
- ✅ **Audit log gratuito:** Historial de commits = historial de cambios en el stack
- ✅ **Simplicidad en MVP:** Menos moving parts, más rápido de implementar
- ✅ **Escalabilidad validada:** GitHub maneja repos con miles de archivos JSON sin problemas
- ✅ **Migración futura fácil:** Cambiar a DB = crear `PrismaRadarRepository`, sin tocar domain/application

**Trade-offs:**
- ❌ No soporta queries complejas (ej: "dependencias agregadas en últimos 30 días")
- ❌ No soporta concurrencia (dos productos actualizando simultáneamente pueden generar conflicto)
- ⚠️ Escalabilidad limitada a ~100 productos (después, considerar DB)

**Cuándo migrar a DB:**
- Cuando se necesiten queries complejas (analytics, trends)
- Cuando haya >50 productos (conflictos de merge frecuentes)
- Cuando se implemente flujo de apelación (requiere estado transaccional)

### 2. ¿Por qué Clean Architecture para un MVP?

**Decisión:** Implementar Clean Architecture desde el inicio.

**Razones:**
- ✅ **Extensibilidad garantizada:** El roadmap incluye flujos de aprobación, apelaciones, multi-lenguaje
- ✅ **Testabilidad:** Domain y application layers son 100% testeables sin mocks complejos
- ✅ **Onboarding:** Estructura clara facilita que nuevos devs entiendan el código
- ✅ **Estándar del chapter:** Alineado con prácticas de arquitectura del equipo

**Trade-offs:**
- ❌ Más boilerplate inicial (ports, use cases, etc.)
- ❌ Curva de aprendizaje para devs no familiarizados con Clean Arch

**Validación:** El PoC demostró que agregar `LocalRadarRepository` (para dev local) requirió solo crear una clase, sin tocar casos de uso ni UI.

### 3. ¿Por qué Next.js 15 App Router en vez de Pages Router?

**Decisión:** Usar App Router con Server Components.

**Razones:**
- ✅ **Server Components:** Reduce bundle size (leyenda, tabla, filtros son server-side)
- ✅ **ISR on-demand:** `revalidateTag` permite actualización selectiva sin rebuild completo
- ✅ **Streaming:** Suspense boundaries para loading states (futuro)
- ✅ **Futuro-proof:** Pages Router está en mantenimiento, App Router es el futuro de Next.js

**Trade-offs:**
- ❌ Curva de aprendizaje (paradigma diferente a Pages Router)
- ❌ Algunos bugs/limitaciones en versiones early (mitigado usando 15.x estable)

### 4. ¿Por qué HeroUI en vez de shadcn/ui o MUI?

**Decisión:** Usar HeroUI 2.6.14.

**Razones:**
- ✅ **Estándar del chapter:** Ya usado en librería de componentes compartida
- ✅ **Design system consistente:** Garantiza coherencia visual entre productos
- ✅ **Tailwind-first:** Integración nativa con Tailwind (ya usado en el chapter)
- ✅ **Accesibilidad:** Componentes con ARIA labels out-of-the-box

**Trade-offs:**
- ❌ Menos popular que shadcn/ui (menos recursos/ejemplos online)
- ❌ Documentación a veces desactualizada

### 5. ¿Por qué Vitest en vez de Jest?

**Decisión:** Usar Vitest para testing.

**Razones:**
- ✅ **Performance:** 10-20x más rápido que Jest (especialmente en watch mode)
- ✅ **Compatibilidad con Vite:** Next.js 15 usa Turbopack (basado en Vite internamente)
- ✅ **ESM nativo:** No requiere transformaciones para módulos ES
- ✅ **Estándar del chapter:** Ya usado en librería de componentes

**Trade-offs:**
- ❌ Ecosistema más pequeño que Jest (menos plugins)
- ✅ API compatible con Jest (migración fácil si es necesario)

---

## Modelo de Dominio

### Entidades

#### RadarEntry
Representa una dependencia catalogada en el radar.

```typescript
export interface RadarEntry {
  readonly name: string;           // Nombre del paquete (ej: "react")
  readonly version: string;         // Versión instalada (ej: "19.0.0")
  readonly quadrant: Quadrant;      // Tipo de herramienta
  readonly ring: Ring;              // Nivel de adopción
  readonly product: string;         // Producto que la usa (ej: "membresias-web")
  readonly repository: string;      // Repo de origen
  readonly isNew: boolean;          // ¿Es nueva desde último scan?
}
```

**Invariantes:**
- `name` no puede estar vacío
- `version` debe ser semver válido (no validado en MVP, futuro)
- `quadrant` debe ser uno de los valores de `QUADRANTS`
- `ring` debe ser uno de los valores de `RINGS`

#### Product
Representa un producto del chapter.

```typescript
export interface Product {
  readonly id: string;              // Identificador único (ej: "todo-app")
  readonly name: string;            // Nombre display (ej: "Todo App")
  readonly repository: string;      // URL del repo
}

// @deprecated PRODUCTS: Product[] = [] — se mantiene vacío por compatibilidad.
// La lista real viene de getAvailableProducts(), que escanea radar-data/*.json.
```

### Value Objects

#### Ring
Nivel de adopción de una tecnología según ThoughtWorks Radar.

```typescript
export const RINGS = ['adopt', 'trial', 'assess', 'hold'] as const;
export type Ring = (typeof RINGS)[number];
```

**Semántica:**
- **Adopt:** Tecnología aprobada y recomendada para uso en producción
- **Trial:** Tecnología en evaluación, usar en proyectos no críticos
- **Assess:** Tecnología a investigar, no usar en producción aún
- **Hold:** Tecnología desaprobada, migrar a alternativas

**Estado en MVP:** Todas las dependencias se marcan como `adopt` (clasificación real en fase 2).

#### Quadrant
Tipo de herramienta (categoría funcional).

```typescript
export const QUADRANTS = [
  'frameworks-librerias',
  'gestion-de-estado',
  'testing',
  'estilos-ui',
  'build-tools',
] as const;
export type Quadrant = (typeof QUADRANTS)[number] | 'sin-categorizar';
```

**Semántica:**
- **frameworks-librerias:** React, Next.js, Vue, Angular, etc.
- **gestion-de-estado:** Redux, Zustand, Jotai, Context API, etc.
- **testing:** Vitest, Jest, Testing Library, Playwright, etc.
- **estilos-ui:** Tailwind, HeroUI, Styled Components, CSS Modules, etc.
- **build-tools:** Webpack, Vite, Turbopack, esbuild, etc.
- **sin-categorizar:** Fallback para paquetes no mapeados

### Domain Services

#### calculateBlipPosition
Función pura que calcula coordenadas (x, y) de un blip en el radar SVG.

```typescript
export interface BlipPosition {
  x: number;  // Coordenada X en viewBox 100x100
  y: number;  // Coordenada Y en viewBox 100x100
}

export function calculateBlipPosition(
  ring: Ring,
  quadrant: Quadrant,
  indexInQuadrant: number,
  totalInQuadrant: number
): BlipPosition;
```

**Algoritmo:**
1. Determinar radio base según ring (Adopt: 0.25, Trial: 0.5, Assess: 0.75, Hold: 0.95)
2. Determinar ángulo base según cuadrante (0°, 72°, 144°, 216°, 288°)
3. Aplicar jitter basado en `indexInQuadrant` para evitar overlapping
4. Convertir coordenadas polares (radio, ángulo) a cartesianas (x, y)

**Testabilidad:** 100% testeable sin renderizar SVG (función pura).

---

## Testing Strategy

### Cobertura Objetivo

| Capa | Cobertura | Herramientas | Prioridad |
|------|-----------|--------------|-----------|
| Domain | >90% | Vitest | 🔴 Crítica |
| Application | >85% | Vitest + Fake Repos | 🔴 Crítica |
| Infrastructure | >70% | Vitest + Mocks | 🟡 Media |
| Presentation | >60% | Testing Library | 🟢 Baja (MVP) |

### Tipos de Tests

#### 1. Unit Tests (Domain Layer)
**Objetivo:** Validar lógica pura sin dependencias externas.

**Ejemplo:**
```typescript
// src/radar/domain/services/calculateBlipPosition.test.ts
describe('calculateBlipPosition', () => {
  it('posiciona blip en centro del ring Adopt', () => {
    const { x, y } = calculateBlipPosition('adopt', 'frameworks-librerias', 0, 1);
    expect(x).toBeCloseTo(50 + 0.25 * 45, 1); // Radio 0.25, ángulo 0°
    expect(y).toBeCloseTo(50, 1);
  });

  it('aplica jitter para evitar overlapping', () => {
    const pos1 = calculateBlipPosition('adopt', 'testing', 0, 5);
    const pos2 = calculateBlipPosition('adopt', 'testing', 1, 5);
    expect(pos1).not.toEqual(pos2); // Posiciones diferentes
  });
});
```

#### 2. Integration Tests (Application Layer)
**Objetivo:** Validar casos de uso con fake repositories.

**Ejemplo:**
```typescript
// src/radar/application/use-cases/getRadarEntries.test.ts
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

  it('filtra por cuadrante', async () => {
    const result = await getRadarEntries(fakeRepository, { quadrant: 'testing' });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('vitest');
  });
});
```

#### 3. Contract Tests (Infrastructure Layer)
**Objetivo:** Validar que adaptadores cumplen contratos de ports.

**Ejemplo:**
```typescript
// src/radar/infrastructure/repositories/GitRadarRepository.test.ts
describe('GitRadarRepository', () => {
  it('valida schema con Zod', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => [{ name: 'react', version: '19.0.0', /* ... */ }],
    });

    const repo = new GitRadarRepository();
    const entries = await repo.getAll();
    expect(entries).toHaveLength(1);
  });

  it('lanza error si JSON es inválido', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => [{ name: 'react' }], // Falta version
    });

    const repo = new GitRadarRepository();
    await expect(repo.getAll()).rejects.toThrow(); // Zod validation error
  });
});
```

#### 4. Component Tests (Presentation Layer)
**Objetivo:** Validar renderizado y comportamiento de componentes.

**Ejemplo:**
```typescript
// src/radar/presentation/blocks/RadarFilters.test.tsx
describe('RadarFilters', () => {
  it('renderiza dropdown de productos', () => {
    render(<RadarFilters />);
    expect(screen.getByLabelText('Producto')).toBeInTheDocument();
  });

  it('actualiza URL al seleccionar producto', async () => {
    const mockPush = vi.fn();
    vi.mock('next/navigation', () => ({ useRouter: () => ({ push: mockPush }) }));

    render(<RadarFilters />);
    await userEvent.selectOptions(screen.getByLabelText('Producto'), 'membresias-web');
    expect(mockPush).toHaveBeenCalledWith('/?product=membresias-web');
  });
});
```

### CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run typecheck   # ← Falla si hay errores de TypeScript
      - run: npm run lint        # ← Falla si hay errores de ESLint
      - run: npm run test:run    # ← Falla si tests no pasan
      - run: npm run build       # ← Falla si Next.js no compila
```

**Tiempo promedio:** 3-4 minutos.

---

## Estado Actual vs. Pendiente

### ✅ Implementado

#### Ingesta Automática
- [x] `src/ingest` (Clean Architecture), reemplaza el script legacy `scanDependencies.ts`
- [x] Resolución de versiones exactas desde lockfile (npm/yarn/pnpm)
- [x] Clasificación automática por cuadrante (85 paquetes mapeados en `categorization-map.ts`)
- [x] Detección de dependencias nuevas (diff contra JSON previo)
- [x] Workflow reusable de GitHub Actions (`scan-dependencies.yml`, `scan-self.yml`)
- [x] Generación de JSON versionado en `radar-data/` (dentro de este repo)

#### Upload Manual
- [x] Página `/upload` + `POST /api/upload-package`
- [x] Detección desde `package.json` crudo sin lockfile (`detectDependenciesFromContent`)
- [x] Revalidación de caché inmediata, sin webhook

#### Descubrimiento Dinámico de Productos
- [x] `getAvailableProducts()` escanea `radar-data/*.json`, sin listas hardcodeadas
- [x] `GET /api/products` expone la lista actual

#### Visualización
- [x] Radar SVG interactivo con anillos y cuadrantes
- [x] Filtros por producto y cuadrante
- [x] Vista de tabla complementaria
- [x] Leyenda explicativa
- [x] Tema claro/oscuro
- [x] Tooltips con info de dependencias

#### Arquitectura
- [x] Clean Architecture en dos módulos independientes (`radar`, `ingest`)
- [x] Ports & Adapters (`RadarRepository`, con `LocalRadarRepository` cableada y `GitRadarRepository` lista sin usar)
- [x] Testing con Vitest
- [x] CI/CD con GitHub Actions
- [x] Validación de datos con Zod
- [x] TypeScript strict mode

#### Calidad
- [x] ESLint configurado (eslint-config-next)
- [x] Prettier configurado
- [x] No `any` implícitos
- [x] Documentación en AGENTS.md

### ⏳ Pendiente (Fuera del MVP)

#### Clasificación Manual de Rings
- [ ] UI para editar ring de una dependencia (Adopt → Trial/Assess/Hold)
- [ ] Persistencia de clasificaciones (requiere DB o JSON extendido)
- [ ] Historial de cambios de clasificación
- [ ] Notificaciones a equipos cuando su dep cambia de ring

#### Flujo de Apelación
- [ ] Formulario para solicitar cambio de clasificación
- [ ] Entidad `AppealRequest` en domain
- [ ] Workflow de aprobación (Tech Leads revisan)
- [ ] Integración con Jira/Azure DevOps para tracking

#### Analytics y Reportes
- [ ] Dashboard de tendencias (dependencias más usadas, cambios en el tiempo)
- [ ] Detección de dependencias obsoletas (comparar con npm registry)
- [ ] Alertas automáticas (nueva dep sin categorizar, vulnerabilidad crítica)
- [ ] Exportación de reportes (PDF, CSV)

#### Escalabilidad
- [ ] Soporte para monorepos (workspaces de npm/yarn)
- [ ] Soporte para otros lenguajes (Python, .NET, Java)
- [ ] Migración a base de datos (cuando >50 productos)
- [ ] Cache distribuido (Redis) para mejorar performance

#### UX Avanzado
- [ ] Búsqueda por nombre de dependencia
- [ ] Comparación side-by-side de productos
- [ ] Vista de timeline (cambios en el tiempo)
- [ ] Exportación del radar a imagen (PNG/SVG)
- [ ] Animaciones de transición entre filtros

---

## Riesgos y Limitaciones Conocidas

### Riesgos Técnicos

#### 1. Escalabilidad de JSON en Git
**Riesgo:** Con >100 productos, conflictos de merge en `radar-data` pueden ser frecuentes.  
**Mitigación actual:** Workflow usa `git pull --rebase` antes de push.  
**Mitigación futura:** Migrar a base de datos cuando se alcancen 50 productos.  
**Probabilidad:** Media | **Impacto:** Alto

#### 2. Performance del Radar con Muchas Dependencias
**Riesgo:** Radar con >500 blips puede tener overlapping excesivo y ser difícil de navegar.  
**Mitigación actual:** Jitter aplicado para distribuir blips.  
**Mitigación futura:** Implementar zoom/pan, clustering de blips cercanos.  
**Probabilidad:** Baja | **Impacto:** Medio

#### 3. Categorización Automática Incompleta
**Riesgo:** ~15-20% de dependencias caen en "sin-categorizar".  
**Mitigación actual:** Mapa de categorización cubre 75 paquetes comunes.  
**Mitigación futura:** Expandir mapa iterativamente con feedback del chapter, considerar categorización por IA.  
**Probabilidad:** Alta | **Impacto:** Bajo

#### 4. Dependencia de GitHub Actions
**Riesgo:** Si GitHub Actions tiene downtime, ingesta se detiene.  
**Mitigación actual:** Ninguna (aceptable para MVP).  
**Mitigación futura:** Implementar fallback manual (script ejecutable localmente).  
**Probabilidad:** Baja | **Impacto:** Medio

### Limitaciones Conocidas

#### 1. Solo Productos Node.js
**Limitación:** Solo soporta `package.json` (npm/yarn/pnpm).  
**Impacto:** Productos en Python, .NET, Java no se pueden integrar.  
**Roadmap:** Fase 3 (multi-lenguaje).

#### 2. No Detecta Dependencias No Usadas
**Limitación:** Escanea `package.json`, no analiza código real.  
**Impacto:** Dependencias instaladas pero no importadas aparecen en el radar.  
**Roadmap:** Fase 4 (análisis estático de código).

#### 3. No Hay Control de Acceso
**Limitación:** Radar es público (o requiere VPN/auth de infraestructura).  
**Impacto:** Cualquiera con acceso al dominio puede ver el stack tecnológico.  
**Roadmap:** Fase 2 (autenticación con Azure AD).

#### 4. Revalidación Requiere Webhook
**Limitación:** Si webhook falla, radar no se actualiza automáticamente.  
**Impacto:** Usuarios ven datos desactualizados hasta próxima revalidación manual.  
**Roadmap:** Implementar revalidación periódica (cron) como fallback.

---

## Próximos Pasos Sugeridos

### Fase 1: Estabilización del MVP (1-2 sprints)
1. **Validar en producción**
   - Deploy a ambiente de staging
   - Configurar secrets (`RADAR_REVALIDATE_SECRET`)
   - Integrar workflows en repos reales de productos
   - Validar flujo end-to-end con commits reales

2. **Expandir categorización**
   - Recopilar feedback del chapter sobre dependencias sin categorizar
   - Agregar 50+ paquetes al `categorization-map.ts`
   - Objetivo: <10% en "sin-categorizar"

3. **Mejorar UX**
   - Agregar contador de resultados filtrados
   - Mejorar algoritmo de jitter para evitar overlapping
   - Agregar búsqueda por nombre de dependencia
   - Validar accesibilidad (WCAG AA)

### Fase 2: Clasificación Manual y Gobernanza (2-3 sprints)
1. **Implementar edición de rings**
   - UI para cambiar ring de una dependencia (Adopt → Trial/Assess/Hold)
   - Persistencia en `radar-data` (extender JSON con campo `manualRing`)
   - Historial de cambios (git log + UI de timeline)

2. **Flujo de apelación**
   - Formulario para solicitar cambio de clasificación
   - Entidad `AppealRequest` en domain
   - Workflow de aprobación (Tech Leads revisan y aprueban/rechazan)
   - Integración con Jira/Azure DevOps para tracking

3. **Autenticación y autorización**
   - Integración con Azure AD (SSO)
   - Roles: Viewer (todos), Editor (Tech Leads), Admin (chapter lead)
   - Permisos: Viewer solo lectura, Editor puede apelar, Admin puede clasificar

### Fase 3: Escalabilidad y Analytics (3-4 sprints)
1. **Migración a base de datos**
   - Implementar `PrismaRadarRepository` (PostgreSQL)
   - Migrar datos de `radar-data` a DB
   - Mantener `radar-data` como backup/audit log

2. **Soporte multi-lenguaje**
   - Parser para `requirements.txt` (Python)
   - Parser para `packages.config` / `.csproj` (.NET)
   - Parser para `pom.xml` / `build.gradle` (Java)

3. **Dashboard de analytics**
   - Tendencias: dependencias más usadas, cambios en el tiempo
   - Detección de obsolescencia (comparar con npm registry)
   - Alertas automáticas (nueva dep sin categorizar, vulnerabilidad crítica)

### Fase 4: Optimización y Features Avanzados (4+ sprints)
1. **Performance**
   - Implementar cache distribuido (Redis)
   - Optimizar queries (índices en DB)
   - Lazy loading de blips en radar (solo renderizar visibles)

2. **UX avanzado**
   - Zoom/pan del radar
   - Comparación side-by-side de productos
   - Exportación a imagen (PNG/SVG)
   - Animaciones de transición

3. **Integraciones**
   - Webhooks para notificaciones (Slack, Teams)
   - API pública para consumo por otras herramientas
   - Integración con SonarQube (análisis de calidad)

---

## Glosario

| Término | Definición |
|---------|-----------|
| **Blip** | Punto en el radar que representa una dependencia |
| **Clean Architecture** | Patrón arquitectónico que separa lógica de negocio de detalles de implementación |
| **Cuadrante** | Categoría funcional de una herramienta (frameworks, testing, estilos, etc.) |
| **ISR** | Incremental Static Regeneration - estrategia de Next.js para revalidar páginas estáticas on-demand |
| **Port** | Interfaz que define un contrato entre capas (ej: `RadarRepository`) |
| **Radar** | Visualización circular con anillos y cuadrantes que muestra el stack tecnológico |
| **Ring** | Nivel de adopción de una tecnología (Adopt, Trial, Assess, Hold) |
| **Server Component** | Componente de React que se renderiza solo en servidor (no envía JS al cliente) |
| **Use Case** | Función que implementa un caso de uso de negocio (ej: `getRadarEntries`) |

---

## Referencias

### Documentación Técnica
- [Next.js 16 Documentation](https://nextjs.org/docs)
- [HeroUI Documentation](https://heroui.com/docs)
- [Clean Architecture (Robert C. Martin)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [ThoughtWorks Tech Radar](https://www.thoughtworks.com/radar)
- Ver también: `documentation/ingest-system.md` (detalle del sistema de ingesta) y `documentation/upload-feature-usage.md` (detalle del upload manual)

### Repositorios
- **tech-radar:** Aplicación Next.js (este proyecto), incluye `radar-data/` con el JSON versionado (ya no un repo separado)
- Productos integrados: descubiertos dinámicamente desde `radar-data/*.json`

### Contactos
- **Tech Lead:** [Nombre del Tech Lead]
- **Chapter Lead:** [Nombre del Chapter Lead]
- **Equipo de desarrollo:** [Nombres del equipo]

---

**Última actualización:** Septiembre 2026  
**Versión del documento:** 2.0  
**Estado del proyecto:** Ingesta automática + upload manual en producción ✅
