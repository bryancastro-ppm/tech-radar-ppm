# Guía de Uso: Subir package.json al Tech Radar

## 🎯 Descripción

La funcionalidad de upload permite agregar dependencias al Tech Radar de forma manual, sin necesidad de configurar GitHub Actions. Simplemente sube tu archivo `package.json` y el sistema detectará automáticamente todas las dependencias.

## 🚀 Cómo Usar

### Opción 1: Interfaz Web

1. **Accede a la página de upload**
   - Navega a `/upload` en el Tech Radar
   - O haz click en el botón "📦 Subir package.json" en el header

2. **Sube tu archivo**
   - Arrastra tu `package.json` al área de drop
   - O haz click para seleccionar el archivo

3. **Completa la información**
   - **Nombre del Producto** (requerido): Identificador único para tu proyecto
     - Ejemplo: `mi-aplicacion`, `todo-app`, `membresias-web`
     - Solo letras minúsculas, números y guiones
   - **Repositorio** (opcional): Nombre del repositorio en GitHub
     - Ejemplo: `org/mi-aplicacion`
     - Si no se proporciona, se usa el nombre del producto

4. **Analiza las dependencias**
   - Haz click en "Analizar Dependencias"
   - Espera a que el sistema procese el archivo

5. **Revisa los resultados**
   - Verás un resumen de las dependencias detectadas
   - Número total de dependencias
   - Número de nuevas dependencias (si es una actualización)
   - Haz click en "Ver en el Radar" para visualizar tu proyecto

### Opción 2: API Endpoint

También puedes usar el endpoint directamente:

```bash
curl -X POST http://localhost:3000/api/upload-package \
  -F "file=@package.json" \
  -F "productName=mi-app" \
  -F "repository=org/mi-app"
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "product": "mi-app",
  "dependenciesDetected": 15,
  "newDependencies": 3,
  "filePath": "radar-data/mi-app.json"
}
```

**Respuesta con error:**
```json
{
  "success": false,
  "error": "Invalid product name",
  "details": "Product name must contain only lowercase letters, numbers, and hyphens"
}
```

## 📋 Ejemplo Práctico

Un archivo `example-package.json` está incluido en el repositorio para pruebas:

```bash
# Desde la raíz del proyecto
# Navega a http://localhost:3000/upload
# Sube el archivo example-package.json
# Nombre del producto: example-app
# Repositorio: (dejar vacío o poner tu org/example-app)
```

## ⚠️ Limitaciones Conocidas

### Sin Lockfile
Al subir solo el `package.json` (sin lockfile), las versiones mostradas serán los rangos declarados en lugar de versiones exactas:

- ✅ **Con lockfile** (GitHub Actions): `react@19.0.2` (versión exacta)
- ⚠️ **Sin lockfile** (Upload manual): `react@^19.0.0` (rango declarado)

**Impacto**: Menos precisión en las versiones, pero suficiente para:
- Exploración rápida de dependencias
- Proyectos one-off o prototipos
- Casos donde GitHub Actions no es viable

**Recomendación**: Para producción, usa GitHub Actions con lockfile.

## 🔒 Validaciones

El sistema valida automáticamente:

- ✅ **Formato de archivo**: Debe ser JSON válido
- ✅ **Tamaño máximo**: 1MB
- ✅ **Contenido**: Debe tener `dependencies` o `devDependencies`
- ✅ **Nombre de producto**: Solo minúsculas, números y guiones
- ✅ **Longitud**: Nombre de producto no vacío

## 📊 Categorización Automática

Las dependencias se categorizan automáticamente en cuadrantes:

| Cuadrante | Ejemplos |
|-----------|----------|
| **Frameworks y Librerías** | react, next, vue, angular |
| **Gestión de Estado** | zustand, redux, react-query |
| **Testing** | vitest, jest, testing-library |
| **Estilos y UI** | tailwindcss, styled-components |
| **Build Tools** | typescript, eslint, vite |
| **Sin Categorizar** | Paquetes no reconocidos |

Si un paquete aparece como "Sin Categorizar", puedes agregarlo al mapa de categorización en:
`src/core/config/categorization-map.ts`

## 🔄 Actualización de Productos Existentes

Si subes un `package.json` para un producto que ya existe:

1. El archivo anterior se sobrescribe
2. Se detectan las nuevas dependencias
3. Las dependencias que ya existían mantienen su flag `isNew: false`
4. Solo las dependencias nuevas se marcan con `isNew: true`

## 🎨 Flujo Completo

```
Usuario sube package.json
         ↓
Validación de archivo y datos
         ↓
Detección de dependencias
         ↓
Categorización automática
         ↓
Comparación con datos previos
         ↓
Marcado de nuevas dependencias
         ↓
Escritura a radar-data/
         ↓
Revalidación de cache
         ↓
Producto visible en el radar
```

## 🐛 Solución de Problemas

### Error: "El archivo debe ser un JSON válido"
- **Causa**: El archivo no es JSON válido o está corrupto
- **Solución**: Verifica que el archivo sea un `package.json` válido

### Error: "No se encontraron dependencias"
- **Causa**: El package.json no tiene `dependencies` ni `devDependencies`
- **Solución**: Agrega al menos una dependencia al archivo

### Error: "Invalid product name"
- **Causa**: El nombre contiene caracteres no permitidos
- **Solución**: Usa solo letras minúsculas, números y guiones
- **Ejemplos válidos**: `mi-app`, `todo-app`, `app123`
- **Ejemplos inválidos**: `Mi App`, `mi_app`, `mi.app`

### Error: "File too large"
- **Causa**: El archivo supera 1MB
- **Solución**: Reduce el tamaño del archivo (un package.json típico es < 10KB)

## 📚 Comparación: Upload vs GitHub Actions

| Característica | Upload Manual | GitHub Actions |
|----------------|---------------|----------------|
| **Configuración** | ✅ Ninguna | ⚠️ Requiere workflow |
| **Precisión de versiones** | ⚠️ Rangos | ✅ Exactas |
| **Automatización** | ❌ Manual | ✅ Automática |
| **Lockfile** | ❌ No requerido | ✅ Incluido |
| **Velocidad** | ✅ Inmediato | ⚠️ Depende de CI |
| **Uso ideal** | Exploración, prototipos | Producción, CI/CD |

## 🔗 Enlaces Relacionados

- [Especificación completa](./package-upload-feature-spec.md)
- [Sistema de ingestión](./ingest-system.md)
- [Configuración de GitHub Actions](../AGENTS.md#dependency-ingestion)

## 💡 Tips

1. **Nombres descriptivos**: Usa nombres que identifiquen claramente tu proyecto
2. **Consistencia**: Usa el mismo nombre si actualizas el proyecto
3. **Repositorio**: Incluye el nombre del repositorio para mejor trazabilidad
4. **Categorización**: Revisa las dependencias "Sin Categorizar" y agrégalas al mapa

## 🎯 Casos de Uso

### Caso 1: Exploración Rápida
"Quiero ver qué dependencias usa un proyecto sin configurar CI/CD"
- ✅ Usa upload manual
- Sube el package.json
- Visualiza en el radar

### Caso 2: Proyecto en Producción
"Quiero trackear dependencias de mi app en producción"
- ✅ Usa GitHub Actions
- Configura el workflow
- Actualizaciones automáticas

### Caso 3: Comparar Proyectos
"Quiero comparar dependencias entre varios proyectos"
- ✅ Sube múltiples package.json con nombres diferentes
- Usa el filtro de productos en el radar
- Compara visualmente

### Caso 4: Prototipo Rápido
"Estoy haciendo un POC y quiero documentar las dependencias"
- ✅ Usa upload manual
- No requiere repositorio
- Documentación instantánea
