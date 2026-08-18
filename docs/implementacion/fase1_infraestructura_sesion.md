# 🔌 Fase 1: Infraestructura de Red, Interceptores y Gestión de Sesiones

## 🎯 Objetivo
Configurar la capa de comunicación HTTP centralizada utilizando Axios (`src/services/api.js`), garantizando la inyección automática de la cabecera `X-Anon-Session-ID` para usuarios anónimos, la inclusión del token JWT en el header `Authorization: Bearer <access_token>` para usuarios autenticados, y la renovación silenciosa de tokens vía `refresh_token` en caso de recibir respuestas `401 Unauthorized`.

---

## 📋 Tareas Detalladas para el Desarrollador

### 1.1 Gestión del Identificador Anónimo (`X-Anon-Session-ID`)
- Crear un módulo utilitario `src/utils/session.js` para administrar el `anon_session_id`.
- Si no existe la clave `wwf_anon_session_id` en `localStorage`, se debe generar un UUID v4 usando `crypto.randomUUID()` y guardarlo inmediatamente.
- Proporcionar métodos: `getAnonSessionId()`, `setAnonSessionId(uuid)`, `clearAnonSessionId()`.

```javascript
// src/utils/session.js
export const getAnonSessionId = () => {
  let anonId = localStorage.getItem('wwf_anon_session_id');
  if (!anonId) {
    anonId = crypto.randomUUID();
    localStorage.setItem('wwf_anon_session_id', anonId);
  }
  return anonId;
};

export const clearAnonSessionId = () => {
  localStorage.removeItem('wwf_anon_session_id');
};
```

---

### 1.2 Configuración del Cliente `apiClient` e Interceptores de Axios
Modificar `src/services/api.js` aplicando la siguiente arquitectura de interceptores:

#### Interceptor de Solicitudes (Request Interceptor)
1. Leer los tokens almacenados en `localStorage` o desde la tienda `useAuthStore`.
2. Si existe `access_token`, asignar `config.headers.Authorization = 'Bearer ' + accessToken`.
3. Si **NO** existe `access_token`, asignar `config.headers['X-Anon-Session-ID'] = getAnonSessionId()`.

#### Interceptor de Respuestas (Response Interceptor)
1. **Verificar cabeceras entrantes:** Si el backend envía la cabecera `x-anon-session-id`, actualizar el valor almacenado localmente.
2. **Desempaquetado estandarizado:** Si la respuesta tiene la propiedad `status === 'success'`, devolver directamente `response.data.data` (o mantener la respuesta completa si se requiere el `message`).
3. **Manejo de Errores y Renovación Silenciosa (Token Refresh Loop Avoidance):**
   - Si el servidor responde con `401 Unauthorized` y no ha sido un intento previo de refresco:
     - Extraer `refresh_token` del storage.
     - Si no hay `refresh_token`, forzar `logout` limpiando la sesión.
     - Si existe, llamar a `POST /auth/refresh` enviando `{ refresh_token }`.
     - Actualizar `access_token` y `refresh_token` nuevos devueltos por la API.
     - Reintentar la petición original que había fallado.

```javascript
// Ejemplo conceptual para src/services/api.js
import axios from 'axios';
import { getAnonSessionId } from '../utils/session';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://206.81.8.110:8001';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('wwf_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    config.headers['X-Anon-Session-ID'] = getAnonSessionId();
  }
  return config;
}, (error) => Promise.reject(error));

apiClient.interceptors.response.use(
  (response) => {
    // Si viene anon session id retornado en las cabeceras
    const newAnonId = response.headers['x-anon-session-id'];
    if (newAnonId) {
      localStorage.setItem('wwf_anon_session_id', newAnonId);
    }

    // Desempaquetar respuesta unificada
    if (response.data && response.data.status === 'success') {
      return response.data;
    }
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('wwf_refresh_token');
        if (!refreshToken) throw new Error('No refresh token available');

        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        if (data.status === 'success') {
          const { access_token, refresh_token: newRefresh } = data.data;
          localStorage.setItem('wwf_access_token', access_token);
          localStorage.setItem('wwf_refresh_token', newRefresh);
          
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshErr) {
        localStorage.removeItem('wwf_access_token');
        localStorage.removeItem('wwf_refresh_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error.response?.data || error);
  }
);
```

---

### 1.3 Estado Global de Autenticación (`useAuthStore.js`)
Actualizar `src/store/useAuthStore.js` para mantener sincrónico el estado con `localStorage`:

- **Propiedades de Estado:**
  - `user`: Datos del perfil del usuario (o `null`).
  - `isAuthenticated`: Booleano indicando si existe sesión activa.
  - `accessToken`: String del token JWT de acceso.
  - `refreshToken`: String del token JWT de refresco.
- **Acciones:**
  - `setSession(user, tokens)`: Almacena en estado y `localStorage` los tokens y usuario.
  - `clearSession()`: Limpia el estado, elimina tokens de `localStorage` y reinicia el `anon_session_id`.

---

## 🔍 Reglas de Calidad y Clean Code
- **Cero Hardcoding:** No escribir URLs completas en los interceptores, usar `BASE_URL` o `import.meta.env.VITE_API_URL`.
- **Manejo Seguro de Excepciones:** No dejar bloques `catch` vacíos. En caso de fallar el refresco de token, forzar un redireccionamiento limpio a `/login`.
