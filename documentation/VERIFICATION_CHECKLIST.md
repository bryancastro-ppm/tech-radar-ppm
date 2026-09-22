# ✅ Checklist de Verificación: Upload Feature

## Pre-requisitos

- [ ] Node.js instalado (v18+)
- [ ] Dependencias instaladas (`npm install`)
- [ ] Servidor de desarrollo corriendo (`npm run dev`)

## Verificación de Código

### TypeScript
```bash
npm run typecheck
```
- [ ] Sin errores de tipo
- [ ] Compilación exitosa

### Linting
```bash
npm run lint
```
- [ ] Sin errores críticos
- [ ] Warnings aceptables (solo en stubs)

### Tests
```bash
npm run test:run
```
- [ ] Todos los tests pasan (10/10)
- [ ] Sin errores en consola

## Verificación de Funcionalidad

### 1. Página de Upload

#### Acceso
- [ ] Navegar a `http://localhost:3000/upload`
- [ ] Página carga sin errores
- [ ] Header muestra "Subir Dependencias al Tech Radar"

#### UI Elements
- [ ] Área de drag & drop visible
- [ ] Input "Nombre del Producto" presente
- [ ] Input "Repositorio" presente
- [ ] Botón "Analizar Dependencias" presente
- [ ] Botón "Limpiar" presente

#### Tema
- [ ] Toggle de tema funciona
- [ ] Modo claro se ve bien
- [ ] Modo oscuro se ve bien

### 2. Upload de Archivo

#### Drag & Drop
- [ ] Arrastrar archivo JSON al área
- [ ] Área cambia de color al arrastrar
- [ ] Archivo se acepta al soltar
- [ ] Preview del JSON aparece
- [ ] Nombre del archivo se muestra

#### Click to Upload
- [ ] Click en área abre selector de archivos
- [ ] Seleccionar archivo funciona
- [ ] Preview aparece correctamente

#### Validaciones de Archivo
- [ ] Archivo no-JSON muestra error
- [ ] Archivo > 1MB muestra error
- [ ] JSON inválido muestra error
- [ ] JSON sin dependencias muestra error

### 3. Formulario

#### Nombre de Producto
- [ ] Input acepta texto
- [ ] Auto-formatea a lowercase
- [ ] Reemplaza espacios con guiones
- [ ] Remueve caracteres especiales
- [ ] Muestra descripción de formato

#### Repositorio
- [ ] Input acepta texto
- [ ] Es opcional
- [ ] Muestra descripción

#### Validación
- [ ] Botón deshabilitado sin archivo
- [ ] Botón deshabilitado sin nombre
- [ ] Botón habilitado con ambos
- [ ] Errores se muestran claramente

### 4. Procesamiento

#### Submit
- [ ] Click en "Analizar Dependencias"
- [ ] Botón muestra "Procesando..."
- [ ] Spinner visible
- [ ] Formulario deshabilitado durante proceso

#### Success
- [ ] Resultado se muestra correctamente
- [ ] Número de dependencias correcto
- [ ] Número de nuevas dependencias correcto
- [ ] Ruta del archivo se muestra
- [ ] Botón "Ver en el Radar" presente
- [ ] Botón "Subir Otro" presente

#### Error Handling
- [ ] Errores se muestran claramente
- [ ] Mensaje de error descriptivo
- [ ] Formulario se puede reintentar

### 5. Navegación

#### Header
- [ ] Botón "📦 Subir package.json" visible en home
- [ ] Click lleva a `/upload`
- [ ] Logo clickeable lleva a home

#### Post-Upload
- [ ] Click en "Ver en el Radar" funciona
- [ ] Redirige a `/?product=<nombre>`
- [ ] Producto se muestra en el radar
- [ ] Dependencias visibles

#### Upload Another
- [ ] Click en "Subir Otro" funciona
- [ ] Formulario se resetea
- [ ] Puede subir nuevo archivo

### 6. Casos de Prueba

#### Caso 1: example-package.json
```bash
# Archivo: example-package.json (en raíz del proyecto)
# Nombre: example-app
# Repositorio: (vacío)
```
- [ ] Upload exitoso
- [ ] 15 dependencias detectadas
- [ ] Archivo generado: `radar-data/example-app.json`
- [ ] Producto visible en radar

#### Caso 2: Producto Nuevo
```bash
# Crear nuevo package.json con tus dependencias
# Nombre: test-app
# Repositorio: org/test-app
```
- [ ] Upload exitoso
- [ ] Todas dependencias marcadas como nuevas
- [ ] Archivo generado correctamente

#### Caso 3: Actualización
```bash
# Subir mismo producto dos veces
# Primera vez: todas nuevas
# Segunda vez: solo nuevas dependencias marcadas
```
- [ ] Primera subida: todas isNew: true
- [ ] Segunda subida: existentes isNew: false
- [ ] Nuevas dependencias isNew: true

#### Caso 4: Validaciones
```bash
# Probar diferentes errores
```
- [ ] Archivo .txt rechazado
- [ ] JSON inválido rechazado
- [ ] JSON sin deps rechazado
- [ ] Nombre con espacios auto-formateado
- [ ] Nombre con mayúsculas auto-formateado

### 7. API Endpoint

#### Direct API Call
```bash
curl -X POST http://localhost:3000/api/upload-package \
  -F "file=@example-package.json" \
  -F "productName=api-test" \
  -F "repository=org/api-test"
```
- [ ] Response 200 OK
- [ ] JSON válido retornado
- [ ] success: true
- [ ] dependenciesDetected correcto
- [ ] filePath correcto

#### Error Cases
```bash
# Sin archivo
curl -X POST http://localhost:3000/api/upload-package \
  -F "productName=test"
```
- [ ] Response 400
- [ ] Error: "No file provided"

```bash
# Sin nombre
curl -X POST http://localhost:3000/api/upload-package \
  -F "file=@example-package.json"
```
- [ ] Response 400
- [ ] Error: "Product name is required"

### 8. Integración con Radar

#### Visualización
- [ ] Producto aparece en lista de productos
- [ ] Filtro por producto funciona
- [ ] Dependencias en cuadrantes correctos
- [ ] Nuevas dependencias marcadas visualmente

#### Categorización
- [ ] React en "Frameworks y Librerías"
- [ ] Zustand en "Gestión de Estado"
- [ ] Vitest en "Testing"
- [ ] Tailwind en "Estilos y UI"
- [ ] TypeScript en "Build Tools"

#### Cache Revalidation
- [ ] Producto visible inmediatamente
- [ ] No requiere refresh manual
- [ ] Lista de productos actualizada

### 9. Archivos Generados

#### radar-data/
```bash
ls -la radar-data/
```
- [ ] Archivo `<product-name>.json` existe
- [ ] JSON válido
- [ ] Formato correcto (array de RadarEntry)
- [ ] Campos requeridos presentes

#### Contenido del JSON
```bash
cat radar-data/example-app.json
```
- [ ] name presente
- [ ] version presente (rango)
- [ ] quadrant presente
- [ ] ring: "adopt"
- [ ] product correcto
- [ ] repository correcto
- [ ] isNew presente (boolean)

### 10. Documentación

#### README.md
- [ ] Sección de upload presente
- [ ] Instrucciones claras
- [ ] Links funcionan

#### docs/upload-feature-usage.md
- [ ] Guía completa
- [ ] Ejemplos claros
- [ ] Troubleshooting útil

#### docs/package-upload-feature-spec.md
- [ ] Especificación completa
- [ ] Arquitectura documentada
- [ ] Mockups presentes

#### AGENTS.md
- [ ] Data flow actualizado
- [ ] Upload manual documentado
- [ ] Limitaciones claras

### 11. Performance

#### Tiempo de Carga
- [ ] Página `/upload` carga < 2s
- [ ] Upload procesa < 5s
- [ ] Navegación fluida

#### Responsiveness
- [ ] Mobile (< 768px) funciona
- [ ] Tablet (768-1024px) funciona
- [ ] Desktop (> 1024px) funciona

### 12. Accesibilidad

#### Keyboard Navigation
- [ ] Tab navega entre campos
- [ ] Enter submite formulario
- [ ] Escape cierra modales (si hay)

#### Screen Readers
- [ ] Labels presentes
- [ ] ARIA attributes correctos
- [ ] Errores anunciados

#### Contraste
- [ ] Texto legible en modo claro
- [ ] Texto legible en modo oscuro
- [ ] Botones distinguibles

## Verificación Final

### Checklist de Deployment
- [ ] `npm run build` exitoso
- [ ] `npm run typecheck` sin errores
- [ ] `npm run lint` sin errores críticos
- [ ] `npm run test:run` todos pasan
- [ ] Documentación completa
- [ ] Example files incluidos

### Seguridad
- [ ] Validación de input implementada
- [ ] Sanitización de nombres
- [ ] Límite de tamaño de archivo
- [ ] No hay path traversal
- [ ] Errores no exponen información sensible

### UX
- [ ] Flujo intuitivo
- [ ] Errores claros
- [ ] Loading states
- [ ] Success feedback
- [ ] Navegación lógica

## Problemas Conocidos

### Warnings Aceptables
- [ ] ESLint warnings en YarnLockParser.ts (stub)
- [ ] ESLint warnings en PnpmLockParser.ts (stub)
- [ ] ESLint warnings en scanDependencies.ts (legacy)

### Hydration Warning
- [ ] Warning de hydration en theme toggle (esperado, no afecta funcionalidad)

## Notas

### Para Producción
- [ ] Considerar rate limiting
- [ ] Considerar autenticación
- [ ] Configurar CORS si es necesario
- [ ] Monitoreo de errores
- [ ] Analytics de uso

### Mejoras Futuras
- [ ] Soporte para lockfile
- [ ] Historial de uploads
- [ ] Bulk upload
- [ ] Exportar resultados

---

## ✅ Verificación Completa

Fecha: _______________
Verificado por: _______________

- [ ] Todas las verificaciones pasadas
- [ ] Listo para usar en desarrollo
- [ ] Listo para deployment (con consideraciones de seguridad)

**Firma**: _______________
