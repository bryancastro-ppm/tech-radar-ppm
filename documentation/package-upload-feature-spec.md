# Especificación: UI para Subir package.json al Tech Radar

## 1. Resumen Ejecutivo

Implementar una interfaz web que permita a los usuarios subir archivos `package.json` directamente al Tech Radar, detectar sus dependencias automáticamente, y agregarlas al radar-data sin necesidad de configurar GitHub Actions ni usar APIs externas.

## 2. Objetivos

- ✅ Permitir subida manual de `package.json` desde el navegador
- ✅ Detectar dependencias usando el sistema de ingestión existente
- ✅ Generar y guardar archivos JSON en `radar-data/`
- ✅ Revalidar el cache de Next.js automáticamente
- ✅ Proporcionar feedback visual del proceso
- ✅ Mantener la arquitectura limpia existente
- ✅ No depender de APIs externas

## 3. Arquitectura

### 3.1 Componentes Nuevos

```
src/
├── app/
│   ├── upload/
│   │   └── page.tsx                          # Nueva página de upload
│   └── api/
│       └── upload-package/
│           └── route.ts                      # API endpoint para procesar upload
├── ingest/
│   └── application/
│       └── use-cases/
│           └── detectDependenciesFromContent.ts  # Nueva: detectar sin filesystem
└── radar/
    └── presentation/
        └── blocks/
            ├── PackageUploadForm.tsx         # Formulario de upload
            └── UploadResultDisplay.tsx       # Mostrar resultados
```

### 3.2 Flujo de Datos

```
1. Usuario sube package.json en /upload
   ↓
2. Frontend envía archivo + metadata a /api/upload-package
   ↓
3. Backend detecta dependencias usando sistema de ingestión
   ↓
4. Backend genera radar entries y escribe a radar-data/
   ↓
5. Backend revalida cache de Next.js
   ↓
6. Frontend muestra resultados y redirige al radar
```

## 4. Especificación Técnica

### 4.1 Nueva Página: `/upload`

**Ubicación**: `src/app/upload/page.tsx`

**Funcionalidad**:
- Formulario para subir `package.json`
- Campos de entrada:
  - **Archivo**: Input tipo file (accept=".json")
  - **Nombre del Producto**: Input de texto (requerido)
  - **Repositorio**: Input de texto (opcional, default: mismo que producto)
- Validación client-side:
  - Archivo debe ser JSON válido
  - Debe contener `dependencies` o `devDependencies`
  - Nombre de producto no vacío
- Estados de UI:
  - Idle: Formulario vacío
  - Uploading: Spinner + mensaje "Procesando..."
  - Success: Mensaje de éxito + link al radar
  - Error: Mensaje de error con detalles

**Diseño**:
- Usar componentes base existentes (HeroUI)
- Seguir convenciones del proyecto (blocks, elements)
- Responsive y accesible
- Tema claro/oscuro compatible

### 4.2 API Endpoint: `/api/upload-package`

**Ubicación**: `src/app/api/upload-package/route.ts`

**Método**: `POST`

**Request Body** (multipart/form-data):
```typescript
{
  file: File,              // package.json file
  productName: string,     // e.g., "my-app"
  repository?: string      // e.g., "org/my-app" (optional)
}
```

**Response** (JSON):
```typescript
// Success
{
  success: true,
  product: string,
  dependenciesDetected: number,
  newDependencies: number,
  filePath: string  // e.g., "radar-data/my-app.json"
}

// Error
{
  success: false,
  error: string,
  details?: string
}
```

**Lógica**:
1. Validar que el archivo sea JSON válido
2. Parsear contenido del package.json
3. Llamar a `detectDependenciesFromContent()` (nueva función)
4. Convertir a radar entries usando `toRadarEntries()`
5. Marcar nuevas entradas usando `markNewEntries()`
6. Escribir a `radar-data/<productName>.json` usando `writeRadarJson()`
7. Revalidar cache llamando internamente a la lógica de `/api/revalidate`
8. Retornar resultados

**Manejo de Errores**:
- JSON inválido → 400 Bad Request
- Sin dependencias → 400 Bad Request
- Error de escritura → 500 Internal Server Error
- Producto duplicado → Sobrescribir con confirmación

### 4.3 Nueva Use Case: `detectDependenciesFromContent`

**Ubicación**: `src/ingest/application/use-cases/detectDependenciesFromContent.ts`

**Firma**:
```typescript
export async function detectDependenciesFromContent(
  packageJsonContent: string
): Promise<DetectedDependency[]>
```

**Funcionalidad**:
- Parsear el contenido del package.json (string)
- Extraer `dependencies` y `devDependencies`
- **IMPORTANTE**: Sin lockfile, usar `declaredRange` como `resolvedVersion`
- Retornar array de `DetectedDependency`

**Diferencias con `detectDependencies`**:
- No requiere filesystem (trabaja con strings)
- No lee lockfile (usa declared range como fallback)
- Más simple, menos preciso (pero suficiente para upload manual)

**Ejemplo**:
```typescript
const content = `{
  "dependencies": {
    "react": "^19.0.0",
    "next": "^15.0.0"
  }
}`;

const deps = await detectDependenciesFromContent(content);
// Returns:
// [
//   { name: 'react', declaredRange: '^19.0.0', resolvedVersion: '^19.0.0', isDev: false, source: 'dependencies' },
//   { name: 'next', declaredRange: '^15.0.0', resolvedVersion: '^15.0.0', isDev: false, source: 'dependencies' }
// ]
```

### 4.4 Componente: `PackageUploadForm`

**Ubicación**: `src/radar/presentation/blocks/PackageUploadForm.tsx`

**Props**:
```typescript
interface PackageUploadFormProps {
  onSuccess?: (result: UploadResult) => void;
  onError?: (error: string) => void;
}
```

**Estado Interno**:
```typescript
{
  file: File | null,
  productName: string,
  repository: string,
  isUploading: boolean,
  error: string | null,
  result: UploadResult | null
}
```

**Funcionalidad**:
- Drag & drop para archivo
- Preview del contenido del JSON
- Validación en tiempo real
- Submit con loading state
- Manejo de errores

**Componentes Base a Usar**:
- `Input` de HeroUI para texto
- `Button` de HeroUI para submit
- Custom file input con drag & drop
- `Card` para layout

### 4.5 Componente: `UploadResultDisplay`

**Ubicación**: `src/radar/presentation/blocks/UploadResultDisplay.tsx`

**Props**:
```typescript
interface UploadResultDisplayProps {
  result: {
    product: string;
    dependenciesDetected: number;
    newDependencies: number;
    filePath: string;
  };
}
```

**Funcionalidad**:
- Mostrar resumen de dependencias detectadas
- Lista de nuevas dependencias (si las hay)
- Botón para ver el radar actualizado
- Opción para subir otro package.json

## 5. Flujo de Usuario

### 5.1 Happy Path

1. Usuario navega a `/upload`
2. Arrastra `package.json` al área de drop
3. Ingresa nombre del producto: "my-awesome-app"
4. (Opcional) Ingresa repositorio: "myorg/my-awesome-app"
5. Click en "Analizar Dependencias"
6. Ve spinner con mensaje "Detectando dependencias..."
7. Ve resultado:
   - ✅ 45 dependencias detectadas
   - 🆕 12 nuevas dependencias
   - Archivo generado: `radar-data/my-awesome-app.json`
8. Click en "Ver en el Radar"
9. Redirige a `/?product=my-awesome-app`

### 5.2 Error Paths

**Archivo inválido**:
- Usuario sube archivo que no es JSON
- Ve error: "El archivo debe ser un JSON válido"

**Sin dependencias**:
- Usuario sube package.json vacío
- Ve error: "No se encontraron dependencias en el archivo"

**Nombre duplicado**:
- Usuario sube producto que ya existe
- Ve warning: "El producto 'X' ya existe. ¿Deseas sobrescribirlo?"
- Opciones: Cancelar / Sobrescribir

## 6. Consideraciones de Seguridad

### 6.1 Validaciones

- ✅ Validar tamaño máximo de archivo (1MB)
- ✅ Validar que sea JSON válido
- ✅ Sanitizar nombre de producto (solo alfanuméricos, guiones)
- ✅ Prevenir path traversal en nombres de archivo
- ✅ Rate limiting en el endpoint (max 10 uploads/minuto por IP)

### 6.2 Permisos

- ✅ Endpoint público (no requiere autenticación en v1)
- ⚠️ Considerar autenticación en v2 si hay abuso

## 7. Limitaciones Conocidas

### 7.1 Sin Lockfile

**Problema**: Al subir solo `package.json`, no tenemos lockfile para resolver versiones exactas.

**Solución**: Usar `declaredRange` como `resolvedVersion`.

**Impacto**:
- Versiones mostradas serán rangos (e.g., `^19.0.0`) en lugar de exactas (e.g., `19.0.2`)
- Menos preciso que el sistema de GitHub Actions
- Suficiente para casos de uso manual/exploración

**Mejora Futura**: Permitir subir también lockfile (opcional).

### 7.2 Sin Validación de Repositorio

**Problema**: El usuario puede ingresar cualquier nombre de repositorio.

**Solución**: Validación básica de formato (opcional/nombre).

**Mejora Futura**: Validar contra GitHub API (requiere autenticación).

## 8. Testing

### 8.1 Unit Tests

**Archivo**: `__tests__/ingest/application/use-cases/detectDependenciesFromContent.test.ts`

```typescript
describe('detectDependenciesFromContent', () => {
  it('should detect dependencies from valid package.json', async () => {
    const content = JSON.stringify({
      dependencies: { react: '^19.0.0' },
      devDependencies: { vitest: '^2.0.0' }
    });
    
    const result = await detectDependenciesFromContent(content);
    
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      name: 'react',
      declaredRange: '^19.0.0',
      resolvedVersion: '^19.0.0',
      isDev: false
    });
  });

  it('should throw on invalid JSON', async () => {
    await expect(
      detectDependenciesFromContent('invalid json')
    ).rejects.toThrow();
  });

  it('should return empty array for package.json without dependencies', async () => {
    const content = JSON.stringify({ name: 'test' });
    const result = await detectDependenciesFromContent(content);
    expect(result).toHaveLength(0);
  });
});
```

### 8.2 Integration Tests

**Archivo**: `__tests__/app/api/upload-package/route.test.ts`

- Test upload exitoso
- Test validación de archivo
- Test escritura a radar-data
- Test revalidación de cache

### 8.3 E2E Tests (Opcional)

- Test flujo completo de upload
- Test navegación post-upload
- Test manejo de errores

## 9. UI/UX Mockup

### 9.1 Página de Upload

```
┌─────────────────────────────────────────────────────┐
│  Tech Radar - Subir Dependencias                   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │  📦 Arrastra tu package.json aquí             │ │
│  │     o haz click para seleccionar              │ │
│  │                                               │ │
│  │  [Seleccionar Archivo]                        │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  Nombre del Producto *                             │
│  ┌───────────────────────────────────────────────┐ │
│  │ my-awesome-app                                │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  Repositorio (opcional)                            │
│  ┌───────────────────────────────────────────────┐ │
│  │ myorg/my-awesome-app                          │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  [Analizar Dependencias]                           │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 9.2 Resultado Exitoso

```
┌─────────────────────────────────────────────────────┐
│  ✅ Dependencias Analizadas Exitosamente            │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Producto: my-awesome-app                          │
│  📊 45 dependencias detectadas                     │
│  🆕 12 nuevas dependencias                         │
│                                                     │
│  Nuevas dependencias:                              │
│  • react (^19.0.0) - Frameworks y Librerías       │
│  • zustand (^4.5.0) - Gestión de Estado           │
│  • vitest (^2.0.0) - Testing                      │
│  ... y 9 más                                       │
│                                                     │
│  [Ver en el Radar]  [Subir Otro]                  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## 10. Implementación por Fases

### Fase 1: MVP (Funcionalidad Básica)
- ✅ API endpoint `/api/upload-package`
- ✅ Use case `detectDependenciesFromContent`
- ✅ Página `/upload` con formulario básico
- ✅ Escritura a `radar-data/`
- ✅ Revalidación de cache

**Estimación**: 1 sesión de desarrollo

### Fase 2: UI Mejorada
- ✅ Drag & drop para archivos
- ✅ Preview del JSON
- ✅ Validación en tiempo real
- ✅ Mejor feedback visual
- ✅ Componente `UploadResultDisplay`

**Estimación**: 1 sesión de desarrollo

### Fase 3: Features Avanzadas (Opcional)
- ⏳ Soporte para lockfile (upload opcional)
- ⏳ Historial de uploads
- ⏳ Validación de repositorio con GitHub API
- ⏳ Autenticación
- ⏳ Bulk upload (múltiples productos)

**Estimación**: 2-3 sesiones de desarrollo

## 11. Archivos a Crear/Modificar

### Nuevos Archivos

1. `src/app/upload/page.tsx` - Página de upload
2. `src/app/api/upload-package/route.ts` - API endpoint
3. `src/ingest/application/use-cases/detectDependenciesFromContent.ts` - Use case
4. `src/radar/presentation/blocks/PackageUploadForm.tsx` - Formulario
5. `src/radar/presentation/blocks/UploadResultDisplay.tsx` - Resultados
6. `__tests__/ingest/application/use-cases/detectDependenciesFromContent.test.ts` - Tests
7. `__tests__/app/api/upload-package/route.test.ts` - Tests

### Archivos a Modificar

1. `src/radar/presentation/layouts/RadarPageLayout.tsx` - Agregar link a /upload en navbar
2. `AGENTS.md` - Documentar nueva funcionalidad
3. `docs/ingest-system.md` - Actualizar con método de upload manual

## 12. Configuración Requerida

### Variables de Entorno

No se requieren nuevas variables de entorno (usa las existentes).

### Permisos de Filesystem

El proceso de Next.js debe tener permisos de escritura en `radar-data/`.

## 13. Monitoreo y Logs

### Logs a Implementar

```typescript
// En /api/upload-package
console.log(`[Upload] Processing package.json for product: ${productName}`);
console.log(`[Upload] Detected ${deps.length} dependencies`);
console.log(`[Upload] Marked ${newCount} as new`);
console.log(`[Upload] Written to ${filePath}`);
console.log(`[Upload] Cache revalidated`);
```

### Métricas a Trackear (Futuro)

- Número de uploads por día
- Productos más subidos
- Errores más comunes
- Tiempo promedio de procesamiento

## 14. Documentación para Usuarios

### README a Actualizar

Agregar sección en README principal:

```markdown
## Subir Dependencias Manualmente

Si no quieres configurar GitHub Actions, puedes subir tu `package.json` directamente:

1. Ve a `/upload` en el Tech Radar
2. Sube tu archivo `package.json`
3. Ingresa el nombre de tu producto
4. ¡Listo! Tus dependencias aparecerán en el radar

**Nota**: Sin lockfile, las versiones mostradas serán rangos (e.g., `^19.0.0`) 
en lugar de versiones exactas. Para mayor precisión, usa GitHub Actions.
```

## 15. Alternativas Consideradas

### Opción 1: Usar GitHub API (Descartada)
- **Pros**: Acceso a lockfile, más preciso
- **Contras**: Requiere autenticación, API externa, más complejo
- **Razón de descarte**: Requisito de "sin APIs externas"

### Opción 2: Subir Lockfile También (Futura)
- **Pros**: Versiones exactas
- **Contras**: UX más compleja (dos archivos)
- **Decisión**: Implementar en Fase 3

### Opción 3: CLI Local (Descartada)
- **Pros**: Más control
- **Contras**: Requiere instalación, no es web
- **Razón de descarte**: Requisito de "UI web"

## 16. Preguntas Abiertas

1. ¿Debe haber autenticación desde v1 o es público?
   - **Recomendación**: Público en v1, autenticación en v2 si hay abuso

2. ¿Qué hacer con productos duplicados?
   - **Recomendación**: Sobrescribir con confirmación

3. ¿Debe guardarse historial de uploads?
   - **Recomendación**: No en v1, considerar en v3

4. ¿Debe notificarse al equipo cuando se sube un producto?
   - **Recomendación**: No en v1, considerar integración Slack en v3

## 17. Criterios de Aceptación

### Must Have (v1)
- ✅ Usuario puede subir package.json desde /upload
- ✅ Sistema detecta dependencias correctamente
- ✅ Archivo JSON se genera en radar-data/
- ✅ Cache se revalida automáticamente
- ✅ Producto aparece en el radar inmediatamente
- ✅ Errores se manejan gracefully
- ✅ UI es responsive y accesible

### Nice to Have (v2)
- ⏳ Drag & drop funcional
- ⏳ Preview del JSON
- ⏳ Lista de nuevas dependencias en resultado
- ⏳ Link directo al radar filtrado

### Future (v3)
- ⏳ Soporte para lockfile
- ⏳ Autenticación
- ⏳ Historial de uploads
- ⏳ Notificaciones

## 18. Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Abuso (spam uploads) | Media | Alto | Rate limiting + autenticación en v2 |
| Archivos maliciosos | Baja | Medio | Validación estricta de JSON, límite de tamaño |
| Sobrescritura accidental | Media | Medio | Confirmación antes de sobrescribir |
| Versiones imprecisas | Alta | Bajo | Documentar limitación, ofrecer GitHub Actions |

## 19. Conclusión

Esta especificación define una solución simple y efectiva para permitir uploads manuales de `package.json` al Tech Radar, reutilizando la infraestructura existente de ingestión y manteniendo la arquitectura limpia del proyecto.

La implementación por fases permite entregar valor rápidamente (MVP en 1 sesión) mientras se mantiene la puerta abierta para mejoras futuras.
