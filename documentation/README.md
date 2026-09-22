# Índice de Documentación

Documentación técnica generada/actualizada para reflejar el estado actual del proyecto. Todo lo que se enlaza desde aquí y desde el `README.md` de la raíz vive en esta carpeta y está versionado en git (a diferencia de `docs/`, que está en `.gitignore` y es solo local).

| Documento | Descripción |
|---|---|
| [TECH-DOCUMENTATION.md](./TECH-DOCUMENTATION.md) | Documentación técnica completa: arquitectura (módulos `radar` e `ingest`), stack, estructura de carpetas, flujos de datos (ingesta automática, upload manual), modelo de dominio, testing, decisiones técnicas, estado actual vs. pendiente. |
| [QUICK_START.md](./QUICK_START.md) | Guía rápida (3 pasos) para probar el upload manual de `package.json`. |
| [upload-feature-usage.md](./upload-feature-usage.md) | Guía de uso detallada del upload manual (UI y API). |
| [package-upload-feature-spec.md](./package-upload-feature-spec.md) | Especificación técnica de la feature de upload. |
| [ingest-system.md](./ingest-system.md) | Detalle del sistema de ingesta automática (lockfile, categorización, GitHub Actions). |
| [example-package.json](./example-package.json) | `package.json` de ejemplo para probar `/upload`. |

Otros documentos del proyecto:

- `AGENTS.md` — reglas del proyecto para devs/agentes (raíz del repo)

**Última actualización:** Septiembre 2026
