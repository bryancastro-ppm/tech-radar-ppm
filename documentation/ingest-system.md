# Sistema de Ingesta de Dependencias

## Resumen

El sistema de ingesta de dependencias detecta, parsea y normaliza automáticamente las dependencias de los repositorios, dejándolas disponibles para el Tech Radar. Esta implementación sigue los principios de Clean Architecture y está diseñada para ser extensible y mantenible.

## Arquitectura

El sistema se organiza en tres capas principales:

### Domain Layer (`src/ingest/domain/`)
- **DetectedDependency**: Entidad de dominio pura que representa una dependencia con su rango declarado y su versión resuelta

### Application Layer (`src/ingest/application/use-cases/`)
- **detectDependencies**: Orquesta el proceso de detección
- **toRadarEntries**: Convierte las dependencias detectadas en entradas del radar
- **markNewEntries**: Marca dependencias nuevas comparando con escaneos anteriores

### Infrastructure Layer (`src/ingest/infrastructure/`)
- **Parsers**: Leen y parsean lockfiles (npm, yarn, pnpm)
- **PackageJsonReader**: Lee manifiestos package.json
- **Output**: Escribe datos del radar y obtiene entradas previas

## Qué se Detecta

El sistema detecta **solo dependencias directas** (tanto `dependencies` como `devDependencies` del package.json). Las dependencias transitivas se excluyen intencionalmente para evitar ruido.

### Resolución de Versiones

- **Rango Declarado**: El rango de versión del package.json (ej: `^19.0.0`)
- **Versión Resuelta**: La versión realmente instalada según el lockfile (ej: `19.0.2`)
- El radar muestra la **versión resuelta**, ya que es la que corre en producción

## Package Managers Soportados

Actualmente soportados:
- ✅ **npm** (lockfileVersion 3, npm >= 7)

Planeados (stubs ya creados):
- ⏳ **yarn** (aún no implementado)
- ⏳ **pnpm** (aún no implementado)

## Uso

### Desarrollo Local

Escanear el repositorio actual:

```bash
PRODUCT_NAME=tech-radar GITHUB_REPOSITORY=tech-radar npm run ingest
```

Escanear un repositorio diferente:

```bash
REPO_PATH=/path/to/repo PRODUCT_NAME=my-product GITHUB_REPOSITORY=my-repo npm run ingest
```

### Variables de Entorno

- `REPO_PATH`: Ruta al repositorio a escanear (default: directorio actual)
- `PRODUCT_NAME`: Nombre del producto (requerido)
- `GITHUB_REPOSITORY`: Nombre del repositorio de GitHub (requerido)
- `OUTPUT_DIR`: Directorio de salida para los datos del radar (default: `./radar-data`)

### GitHub Actions

El sistema incluye dos workflows:

#### 1. Workflow Reusable (`scan-dependencies.yml`)

Puede llamarse desde repositorios de producto para escanear y publicar dependencias automáticamente:

```yaml
# En el repo del producto: .github/workflows/radar-scan.yml
name: Radar Scan
on:
  push:
    branches: [main]
    paths: ['package.json', 'package-lock.json']
jobs:
  scan:
    uses: <org>/tech-radar/.github/workflows/scan-dependencies.yml@main
    with:
      product-name: membresias-web
    secrets:
      RADAR_DATA_PUSH_TOKEN: ${{ secrets.RADAR_DATA_PUSH_TOKEN }}
```

#### 2. Workflow de Auto-Escaneo (`scan-self.yml`)

Escanea automáticamente el propio repositorio tech-radar cuando cambian sus dependencias.

## Categorización

Las dependencias se categorizan automáticamente en cuadrantes usando el mapa de categorización en `src/core/config/categorization-map.ts`.

### Cuadrantes

- `frameworks-librerias`: React, Next.js, Vue, etc.
- `gestion-de-estado`: Zustand, Redux, React Query, etc.
- `testing`: Vitest, Jest, Testing Library, etc.
- `estilos-ui`: Tailwind, PostCSS, styled-components, etc.
- `build-tools`: TypeScript, ESLint, Vite, etc.
- `sin-categorizar`: Sin categorizar (necesita clasificación manual)

### Agregar Nuevas Categorías

Editar `src/core/config/categorization-map.ts`:

```typescript
export const categorizationMap: Record<string, Quadrant> = {
  'my-new-package': 'frameworks-librerias',
  // ...
};
```

El CLI advertirá sobre dependencias sin categorizar después de cada escaneo.

## Detección de Dependencias Nuevas

El sistema rastrea qué dependencias son nuevas comparando contra el escaneo anterior:

1. Primer escaneo: todas las dependencias se marcan como `isNew: true`
2. Escaneos siguientes: solo los paquetes recién agregados se marcan como `isNew: true`
3. Actualizaciones de versión: el mismo paquete con distinta versión NO se marca como nuevo

## Manejo de Errores

| Escenario | Comportamiento |
|----------|----------|
| Falta el lockfile | El job falla explícitamente con un mensaje de error |
| Lockfile no soportado (yarn/pnpm) | Lanza `UnsupportedLockfileError` |
| Paquete en package.json pero no en el lockfile | Usa el rango declarado como fallback + warning |
| Sin cambios en las dependencias | Omite el commit de git (no-op) |

## Testing

Ejecutar los tests:

```bash
npm run test:run -- __tests__/ingest
```

La cobertura de tests incluye:
- Detección de lockfile
- Resolución de versiones desde el lockfile de npm
- Detección de dependencias con fixtures
- Conversión a radar entries
- Lógica de marcado de nuevas entradas

### Fixtures de Test

Ubicados en `__tests__/ingest/fixtures/sample-repo/`:
- `package.json`: Manifiesto de ejemplo
- `package-lock.json`: Lockfile de ejemplo (npm v3)

## Estructura de Archivos

```
src/ingest/
├── domain/
│   └── DetectedDependency.ts          # Entidad de dominio
├── application/
│   └── use-cases/
│       ├── detectDependencies.ts      # Lógica principal de detección
│       ├── toRadarEntries.ts          # Conversión al formato del radar
│       └── markNewEntries.ts          # Detección de dependencias nuevas
├── infrastructure/
│   ├── parsers/
│   │   ├── LockfileDetector.ts        # Detecta el tipo de lockfile
│   │   ├── NpmLockParser.ts           # Parser de lockfile de npm
│   │   ├── YarnLockParser.ts          # Stub para yarn
│   │   └── PnpmLockParser.ts          # Stub para pnpm
│   ├── PackageJsonReader.ts           # Lee el package.json
│   └── output/
│       ├── writeRadarJson.ts          # Escribe los datos del radar
│       └── fetchPreviousEntries.ts    # Obtiene el escaneo anterior
└── index.ts                            # Entry point del CLI
```

## Formato de Salida

Los archivos generados se guardan en `radar-data/<product>.json`:

```json
[
  {
    "name": "react",
    "version": "19.0.2",
    "quadrant": "frameworks-librerias",
    "ring": "adopt",
    "product": "membresias-web",
    "repository": "membresias-web",
    "isNew": false
  }
]
```

## Mejoras Futuras

- [ ] Implementar parser de lockfile de yarn
- [ ] Implementar parser de lockfile de pnpm
- [ ] Soporte para monorepos (detectar múltiples archivos package.json)
- [ ] Asignación configurable de ring (actualmente todas las dependencias son "adopt")
- [ ] Notificaciones de cambios de dependencias (Slack, email, etc.)
- [ ] Historial de versiones de dependencias a lo largo del tiempo

## Solución de Problemas

### "Lockfile de tipo 'unknown' no soportado todavía"

El repositorio no tiene un archivo package-lock.json. Puedes:
1. Ejecutar `npm install` para generar uno
2. Si el repo usa yarn/pnpm (aún no soportado)

### "Package not found in lockfile"

Un paquete está declarado en package.json pero no resuelto en el lockfile. Esto puede pasar por:
- Overrides de npm
- Peer dependencies
- Lockfile corrupto

Solución: ejecutar `npm install` para regenerar el lockfile.

### Dependencias sin categorizar

El CLI listará los paquetes que necesitan categorización. Agrégalos a `src/core/config/categorization-map.ts`.

## Documentación Relacionada

- [TECH-DOCUMENTATION.md](./TECH-DOCUMENTATION.md) - Documentación técnica completa (arquitectura, flujo de datos, modelo de dominio)
- [AGENTS.md](../AGENTS.md) - Reglas y convenciones del proyecto
</content>
