# 🧪 Fase 6: Seguridad, Validaciones y Calidad de Código (Clean Code)

## 🎯 Objetivo
Establecer los estándares de calidad, validación de datos, sanitización, manejo defensivo de errores y checklist de verificación antes del despliegue o entrega final.

---

## 📋 Estándares y Prácticas Obligatorias

### 6.1 Buenas Prácticas de Clean Code
- **Nombres Descriptivos:** Usar nombres explícitos para componentes, funciones y variables (ej. `fetchProjectSummaryById` en lugar de `getData`).
- **Single Responsibility Principle (SRP):**
  - Los componentes de UI solo manejan la renderización y la interacción con el usuario.
  - La lógica de negocio o derivación de datos debe residir en custom hooks o selectores.
  - La comunicación HTTP pertenece exclusivamente a los módulos en `src/services/`.
- **Manejo de Errores Defensivo:**
  - Evitar el uso de `any` o accesos inseguros como `response.data.data.items[0].name` sin verificación.
  - Utilizar encadenamiento opcional (`?.`) y valores por defecto (`|| []`).

---

### 6.2 Checklist de Seguridad
- [x] **Tokens JWT:** Guardados en almacenamiento controlado y enviados exclusivamente por la cabecera `Authorization: Bearer <token>`.
- [x] **Precedencia de Identificación:** Si hay token JWT, no enviar `X-Anon-Session-ID`; si no hay token JWT, enviar siempre `X-Anon-Session-ID`.
- [x] **Validación de Archivos:** Chequeo estricto de extensión/MIME antes de subir imágenes y videos a la IA.
- [x] **Control de Borrado:** Validación en UI del propietario (`user_id === authUser.id`) para habilitar Soft Delete.

---

### 6.3 Checklist de Verificación para el Desarrollador

#### 1. Sintaxis y Linting
Ejecutar el linter para asegurar cero advertencias o errores de sintaxis:
```bash
npm run lint
```

#### 2. Compilación de Producción
Comprobar que el bundle de la aplicación compila correctamente sin dependencias faltantes ni errores de compilación:
```bash
npm run build
```

#### 3. Flujo Funcional E2E
1. Navegación en modo incógnito: Crear estación y proyecto sin iniciar sesión (verificar header `X-Anon-Session-ID`).
2. Login/Registro: Verificar que se ejecute la petición `POST /users/me/claim` y que los recursos anónimos pasen a pertenecer al usuario.
3. Subida Multimedia: Cargar imagen o video a una estación, verificar la respuesta del modelo IA y el renderizado de cultivos/crops en la galería.
4. Asociación N:M: Vincular y desvincular estaciones a proyectos y verificar resúmenes estadísticos.
5. Soft Delete: Probar la eliminación con usuario dueño y confirmar que recursos ajenos o anónimos no permiten la acción.
