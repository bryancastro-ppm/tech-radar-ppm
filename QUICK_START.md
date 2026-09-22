# 🚀 Quick Start: Upload Feature

## ¿Qué es esto?

Una nueva funcionalidad que permite **subir archivos package.json directamente al Tech Radar** sin necesidad de configurar GitHub Actions.

## ⚡ Uso en 3 Pasos

### 1. Inicia el servidor
```bash
npm run dev
```

### 2. Abre la página de upload
```
http://localhost:3000/upload
```

### 3. Sube tu package.json
- Arrastra tu archivo `package.json` al área de drop
- Ingresa el nombre de tu producto (ej: `mi-app`)
- Click en "Analizar Dependencias"
- ¡Listo! Tus dependencias aparecen en el radar

## 📦 Prueba con el Ejemplo

Hay un archivo de ejemplo listo para usar:

```bash
# El archivo example-package.json está en la raíz del proyecto
# Súbelo con el nombre: example-app
```

## 🎯 ¿Cuándo usar esto?

### ✅ Usa Upload Manual cuando:
- Quieres explorar dependencias rápidamente
- No tienes GitHub Actions configurado
- Estás haciendo un prototipo
- Quieres comparar proyectos

### ✅ Usa GitHub Actions cuando:
- Tu proyecto está en producción
- Quieres actualizaciones automáticas
- Necesitas versiones exactas (no rangos)
- Ya tienes CI/CD configurado

## 📊 ¿Qué hace?

1. **Detecta** todas las dependencias de tu package.json
2. **Categoriza** automáticamente en cuadrantes (Frameworks, Testing, etc.)
3. **Marca** las nuevas dependencias
4. **Genera** un archivo JSON en `radar-data/`
5. **Muestra** tu proyecto en el radar inmediatamente

## ⚠️ Limitación

Sin lockfile, las versiones mostradas son **rangos** (ej: `^19.0.0`) en lugar de versiones exactas (ej: `19.0.2`).

Esto es suficiente para exploración, pero para producción considera usar GitHub Actions.

## 🔗 Más Información

- **Guía completa**: [docs/upload-feature-usage.md](./docs/upload-feature-usage.md)
- **Especificación técnica**: [docs/package-upload-feature-spec.md](./docs/package-upload-feature-spec.md)
- **Verificación**: [VERIFICATION_CHECKLIST.md](./VERIFICATION_CHECKLIST.md)
- **Resumen de implementación**: [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)

## 🎨 Capturas

### Página de Upload
```
┌─────────────────────────────────────────┐
│  📦 Arrastra tu package.json aquí       │
│     o haz click para seleccionar        │
│                                         │
│  [Seleccionar Archivo]                  │
└─────────────────────────────────────────┘

Nombre del Producto *
┌─────────────────────────────────────────┐
│ mi-aplicacion                           │
└─────────────────────────────────────────┘

Repositorio (opcional)
┌─────────────────────────────────────────┐
│ org/mi-aplicacion                       │
└─────────────────────────────────────────┘

[Analizar Dependencias]
```

### Resultado
```
✅ Dependencias Analizadas Exitosamente

Producto: mi-aplicacion
📊 45 dependencias detectadas
🆕 12 nuevas dependencias

[Ver en el Radar]  [Subir Otro]
```

## 🐛 Problemas Comunes

### "El archivo debe ser un JSON válido"
→ Verifica que sea un package.json válido

### "No se encontraron dependencias"
→ Asegúrate de tener `dependencies` o `devDependencies`

### "Invalid product name"
→ Usa solo letras minúsculas, números y guiones

## 💡 Tips

1. **Nombres descriptivos**: Usa nombres que identifiquen tu proyecto
2. **Consistencia**: Usa el mismo nombre para actualizar
3. **Repositorio**: Incluye el repo para mejor trazabilidad
4. **Explora**: Sube varios proyectos y compáralos en el radar

## ✨ Features

- ✅ Drag & drop
- ✅ Preview del JSON
- ✅ Validación en tiempo real
- ✅ Categorización automática
- ✅ Detección de nuevas dependencias
- ✅ Tema claro/oscuro
- ✅ Responsive
- ✅ Sin configuración

## 🎯 Próximos Pasos

1. Prueba con `example-package.json`
2. Sube tu propio proyecto
3. Explora el radar con filtros
4. Compara dependencias entre proyectos
5. Considera configurar GitHub Actions para producción

---

**¿Preguntas?** Revisa la [documentación completa](./docs/upload-feature-usage.md)
