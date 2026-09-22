# Tech Radar - Frontend Tools

Tech Radar para herramientas Frontend utilizadas por el chapter de Membresías. Construido con Clean Architecture y Next.js.

## 🎯 Características

- 📊 **Visualización interactiva** de dependencias en formato radar
- 🔄 **Detección automática** de dependencias desde repositorios
- 📦 **Upload manual** de package.json sin configuración
- 🏷️ **Categorización automática** en cuadrantes
- 🆕 **Marcado de nuevas dependencias**
- 🌓 **Tema claro/oscuro**
- 📱 **Diseño responsive**

## 🚀 Inicio Rápido

### Instalación

Requiere Node 20 (pinneado en `.nvmrc`).

```bash
npm install
```

### Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### Build para Producción

```bash
npm run build
npm start
```

## 📦 Agregar Dependencias al Radar

Hay dos formas de agregar dependencias al Tech Radar:

### Opción 1: Upload Manual (Recomendado para Exploración)

La forma más rápida de agregar dependencias:

1. Ve a [http://localhost:3000/upload](http://localhost:3000/upload)
2. Sube tu archivo `package.json`
3. Ingresa el nombre de tu producto
4. ¡Listo! Tus dependencias aparecerán en el radar

**Ventajas:**
- ✅ Sin configuración
- ✅ Resultados inmediatos
- ✅ Ideal para exploración y prototipos

**Limitación:**
- ⚠️ Muestra rangos de versiones (ej: `^19.0.0`) en lugar de versiones exactas

Ver [guía de uso detallada](./documentation/upload-feature-usage.md).

### Opción 2: GitHub Actions (Recomendado para Producción)

Para actualizaciones automáticas cuando cambien tus dependencias:

1. Agrega este workflow a tu repositorio en `.github/workflows/radar-scan.yml`:

```yaml
name: Radar Scan
on:
  push:
    branches: [main]
    paths: ['package.json', 'package-lock.json']
jobs:
  scan:
    uses: <org>/tech-radar/.github/workflows/scan-dependencies.yml@main
    with:
      product-name: mi-producto
    secrets:
      RADAR_DATA_PUSH_TOKEN: ${{ secrets.RADAR_DATA_PUSH_TOKEN }}
```

2. Configura el secret `RADAR_DATA_PUSH_TOKEN` en tu repositorio

**Ventajas:**
- ✅ Actualizaciones automáticas
- ✅ Versiones exactas desde lockfile
- ✅ Integración con CI/CD

Ver [documentación de GitHub Actions](./documentation/ingest-system.md#github-actions).

## 🏗️ Arquitectura

Este proyecto sigue **Clean Architecture** con las siguientes capas:

```
src/
├── domain/           # Entidades y lógica de negocio pura
├── application/      # Casos de uso y puertos (interfaces)
├── infrastructure/   # Adaptadores (repositorios, servicios externos)
└── presentation/     # Componentes UI (React/Next.js)
```

### Reglas de Arquitectura

- ✅ Domain no puede importar de otras capas
- ✅ Application solo puede importar de domain
- ✅ Infrastructure implementa puertos definidos en application
- ✅ Presentation usa casos de uso, nunca infrastructure directamente

## 📁 Estructura de Componentes

Siguiendo las convenciones del chapter:

```
presentation/
├── base/      # Componentes atómicos (wrappers sobre HeroUI)
├── elements/  # Moléculas
├── blocks/    # Organismos
└── layouts/   # Layouts de página
```

## 🧪 Testing

```bash
# Tests en modo watch
npm run test

# Tests una sola vez
npm run test:run

# Type checking
npm run typecheck

# Linting
npm run lint
```

## 📚 Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia servidor de desarrollo |
| `npm run build` | Build para producción |
| `npm start` | Inicia servidor de producción |
| `npm run test` | Tests en modo watch |
| `npm run test:run` | Tests una sola vez |
| `npm run typecheck` | Verificación de tipos TypeScript |
| `npm run lint` | Linting con ESLint |
| `npm run format` | Formatea `src/**/*.{ts,tsx}` con Prettier |
| `npm run test:coverage` | Tests con reporte de cobertura |
| `npm run ingest` | Detectar e ingerir dependencias (lockfile de un repo → `radar-data/<producto>.json`) |

## 🎨 Categorización de Dependencias

Las dependencias se categorizan automáticamente en:

- **Frameworks y Librerías**: React, Next.js, Vue, etc.
- **Gestión de Estado**: Zustand, Redux, React Query, etc.
- **Testing**: Vitest, Jest, Testing Library, etc.
- **Estilos y UI**: Tailwind, PostCSS, styled-components, etc.
- **Build Tools**: TypeScript, ESLint, Vite, etc.
- **Sin Categorizar**: Paquetes no reconocidos

Para agregar nuevas categorizaciones, edita `src/core/config/categorization-map.ts`.

## 📖 Documentación

- [Documentación Técnica Completa](./documentation/TECH-DOCUMENTATION.md) — arquitectura, stack, flujos de datos, modelo de dominio, estado actual
- [Índice de Documentación](./documentation/README.md)
- [Quick Start de Upload Manual](./documentation/QUICK_START.md)
- [Especificación de Upload Feature](./documentation/package-upload-feature-spec.md)
- [Guía de Uso de Upload](./documentation/upload-feature-usage.md)
- [Sistema de Ingestión](./documentation/ingest-system.md)
- [Reglas del Proyecto](./AGENTS.md)

## 🔧 Tecnologías

- **Framework**: Next.js 16 (App Router)
- **UI Library**: HeroUI (NextUI fork)
- **Styling**: Tailwind CSS
- **Testing**: Vitest + Testing Library
- **Type Checking**: TypeScript
- **Linting**: ESLint

## 🤝 Contribuir

1. Sigue la arquitectura limpia existente
2. Agrega tests para nuevas funcionalidades
3. Ejecuta `npm run typecheck` y `npm run lint` antes de commit
4. Documenta cambios significativos en `AGENTS.md`

## 📝 Ejemplo de Uso

Un archivo de ejemplo está incluido en [`documentation/example-package.json`](./documentation/example-package.json) para pruebas:

```bash
# Navega a http://localhost:3000/upload
# Sube documentation/example-package.json
# Nombre del producto: example-app
# ¡Explora las dependencias en el radar!
```

## 🐛 Solución de Problemas

Ver [guía de solución de problemas](./documentation/upload-feature-usage.md#-solución-de-problemas).

## 📄 Licencia

Este proyecto es parte del chapter Frontend de Membresías.

---

**Tech Radar** - Visualiza y gestiona las dependencias de tu stack Frontend
