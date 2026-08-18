# 📖 Guía de Implementación Frontend - Backend (WWF)

Esta carpeta contiene la documentación detallada por fases para el desarrollo e integración del sistema frontend (**Front-WWF**) con el backend estandarizado del sistema de Monitoreo de Fauna Silvestre WWF.

El objetivo de esta guía es proporcionar a los desarrolladores especificaciones técnicas paso a paso, fragmentos de código, patrones de diseño (*Clean Code*) y reglas de negocio para asegurar una implementación rápida, robusta y libre de errores.

---

## 🛠️ Estructura del Plan por Fases

1. [Fase 1: Infraestructura de Red, Interceptores y Sesiones](file:///c:/Proyectos/hackaton/wwf/Front-WWF/docs/implementacion/fase1_infraestructura_sesion.md)
   - Configuración de Axios `apiClient`.
   - Gestión de `X-Anon-Session-ID` y Tokens JWT (`access_token` y `refresh_token`).
   - Interceptores de petición/respuesta y renovación silenciosa de tokens (rotación).
   - Estado global en `useAuthStore`.

2. [Fase 2: Servicios de API y Estandarización de Modelos](file:///c:/Proyectos/hackaton/wwf/Front-WWF/docs/implementacion/fase2_servicios_api.md)
   - `authService.js` (Login, Registro, Refresh, Perfil).
   - `userService.js` (Reclamo anónimo, Historial).
   - `cameraStationService.js` (CRUD, Archivos multimedia, Resumen).
   - `projectService.js` (CRUD, Relación N:M Estaciones, Resumen Agregado).
   - `speciesService.js` (Detecciones, Dataset Enriquecido, Verificación).

3. [Fase 3: Estaciones de Cámara y Relación N:M con Proyectos](file:///c:/Proyectos/hackaton/wwf/Front-WWF/docs/implementacion/fase3_estaciones_proyectos.md)
   - Formularios de creación/edición con campos obligatorios y opcionales.
   - Estado condicional `retrieved` y fecha de retiro `retrieval_date`.
   - Vistas y modales para asociación y desasociación N:M de proyectos y estaciones.

4. [Fase 4: Subida Multimedia e Inteligencia Artificial](file:///c:/Proyectos/hackaton/wwf/Front-WWF/docs/implementacion/fase4_subida_ia.md)
   - Componente `UploadWidget` con soporte para Video (`.mp4`, `.avi`, `.mov`) e Imagen (`.jpg`, `.png`).
   - Feedback visual y manejo de estados durante la clasificación por IA.
   - Galería de capturas por detección con URLs completas.
   - Resúmenes estadísticos agregados (nivel estación y proyecto).

5. [Fase 5: Borrado Seguro (Soft Delete) y Reclamo de Datos Anónimos](file:///c:/Proyectos/hackaton/wwf/Front-WWF/docs/implementacion/fase5_soft_delete_reclamacion.md)
   - Comprobación de propiedad `recurso.user_id === authUser.id`.
   - Reglas de visibilidad en UI para eliminación.
   - Reclamo automático de datos anónimos tras Login/Registro (`POST /users/me/claim`).

6. [Fase 6: Seguridad, Validaciones y Calidad de Código](file:///c:/Proyectos/hackaton/wwf/Front-WWF/docs/implementacion/fase6_seguridad_calidad.md)
   - Principios de Clean Code y estandarización.
   - Manejo de excepciones, mensajes Toast y Error Boundaries.
   - Plan de verificación y checklist de entrega.

---

## 💎 Principios de Clean Code y Buenas Prácticas Requeridos

- **Desacoplamiento Estricto:** Los componentes de React no deben realizar peticiones HTTP directamente utilizando `fetch` o `axios`. Toda llamada a API debe pasar por el archivo de servicio correspondiente (`src/services/*`) y consumirse a través de los custom hooks o tiendas de Zustand (`src/store/*`).
- **Manejo de Errores Unificado:** Toda respuesta del backend viene encapsulada en la estructura `{ status: "success"|"error", data: ..., message: "..." }`. Los interceptores deben desempaquetar la carga útil (`data`) y propagar errores claros en `message`.
- **Inmutabilidad y Estado Predecible:** Utilizar patrones inmutables en los stores de Zustand al actualizar arrays u objetos.
- **Tipado Explícito JSDoc:** Documentar los parámetros y tipos de retorno de todas las funciones de los servicios para evitar errores de autocompletado y de referencia.
