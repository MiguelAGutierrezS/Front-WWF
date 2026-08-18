# 🔒 Fase 5: Borrado Seguro (Soft Delete) y Reclamo de Datos Anónimos

## 🎯 Objetivo
Implementar las reglas de control de propiedad y eliminación suave (Soft Delete) para estaciones y proyectos, así como el disparador automático de reclamación de datos anónimos al iniciar sesión o registrarse.

---

## 📋 Tareas Detalladas para el Desarrollador

### 5.1 Reglas de Propiedad en la Interfaz (Ownership Enforcement)
Las operaciones de eliminación (`DELETE /camera-stations/{id}` y `DELETE /projects/{id}`) requieren token JWT activo y exigen que el usuario autenticado sea el verdadero dueño del recurso.

#### Lógica de Evaluación de Propiedad en Componentes:
```javascript
const isOwner = useMemo(() => {
  if (!isAuthenticated || !authUser || !recurso) return false;
  // Si el recurso no tiene user_id (es anónimo aún no reclamado), nadie puede borrarlo directamente
  if (!recurso.user_id) return false;
  return recurso.user_id === authUser.id;
}, [isAuthenticated, authUser, recurso]);
```

#### Comportamiento del Botón "Eliminar":
1. **Si `isOwner === true`:** El botón "Eliminar" se muestra visible y habilitado.
2. **Si `isOwner === false`:**
   - Si el recurso pertenece a otro usuario: Ocultar la opción de eliminar.
   - Si el recurso es anónimo (`user_id === null`): Mostrar el botón deshabilitado con un tooltip/mensaje explicativo:
     > *"Este elemento es anónimo. Inicia sesión y reclaámalo en tu cuenta para poder eliminarlo."*

---

### 5.2 Modal de Confirmación para Soft Delete
Antes de enviar la solicitud `DELETE`, desplegar un modal de confirmación:
- Mensaje: *"¿Estás seguro de que deseas eliminar este [proyecto/estación]? Esta acción marcará el elemento como inactivo."*
- Botones: `"Cancelar"` y `"Eliminar (Confirmar)"`.
- Al confirmar, ejecutar el método correspondiente de servicio (`projectService.deleteProject(id)` o `cameraStationService.deleteStation(id)`).
- Al recibir éxito, retirar el elemento de la lista activa visualizada.

---

### 5.3 Flujo de Reclamación Automática post Login / Registro
Modificar el flujo de autenticación en `src/pages/AuthLayout.jsx` y `useAuthStore.js`:

1. Al completar un `POST /auth/login` o `POST /auth/register` exitoso:
2. Extraer el `anon_session_id` guardado en `localStorage`.
3. Disparar inmediatamente `userService.claimAnonSession(anonSessionId)`.
4. El backend reasignará todas las estaciones y proyectos del `anon_session_id` hacia el `user_id` autenticado e invalidará esa sesión anónima.
5. Al finalizar el claim con éxito, llamar a `clearAnonSessionId()` para que en el futuro se genere una nueva sesión limpia si el usuario llega a cerrar sesión.
6. Cargar el historial actualizado del usuario mediante `userService.getUserHistory()`.

```javascript
// Fragmento conceptual en AuthLayout.jsx / useAuthStore
const handleLoginSuccess = async (loginResponse) => {
  const { user, tokens } = loginResponse.data;
  
  // 1. Guardar sesión
  setSession(user, tokens);
  
  // 2. Reclamar datos anónimos automáticamente si existen
  const currentAnonId = localStorage.getItem('wwf_anon_session_id');
  if (currentAnonId) {
    try {
      await userService.claimAnonSession(currentAnonId);
      clearAnonSessionId(); // Invalidate local anon ID after successful claim
    } catch (claimErr) {
      console.warn('No se pudieron reclamar datos anónimos o no existían recursos:', claimErr);
    }
  }
  
  // 3. Redirigir a la vista principal
  navigate('/');
};
```

---

## 🔍 Reglas de Calidad y Clean Code
- **Cero Borrado Físico en Cliente:** Recordar que el backend realiza Soft Delete (`is_deleted = true`). La UI simplemente debe filtrar y no mostrar aquellos ítems devueltos o marcados con `is_deleted === true`.
- **Manejo de Respuestas HTTP 403 Forbidden:** Si por alguna razón la petición DELETE falla con `403`, mostrar una notificación flotante de error indicando al usuario que no tiene permisos de propietario sobre ese recurso.
