# 🛠️ Fase 2: Estandarización de Servicios de API

## 🎯 Objetivo
Crear y refactorizar la capa de servicios en `src/services/` para que utilicen el cliente unificado `apiClient` (`axios`), eliminando llamadas desactualizadas con `fetch` y cabeceras obsoletas como `x-user-id`.

---

## 📋 Módulos de Servicio A Implementar

### 2.1 `authService.js` (`src/services/authService.js`)
Administra los endpoints de registro, autenticación y perfil de usuario:

- `register(userData)`: `POST /auth/register`
  - Recibe: `{ full_name, email, password, institucion, sexo }`.
  - Retorna: `{ user, tokens: { access_token, refresh_token, token_type } }`.
- `login(credentials)`: `POST /auth/login`
  - Recibe: `{ email, password }`.
  - Retorna: `{ user, tokens: { access_token, refresh_token, token_type } }`.
- `refreshToken(refreshTokenStr)`: `POST /auth/refresh`
  - Recibe: `{ refresh_token }`.
  - Retorna: `{ access_token, refresh_token, token_type }`.
- `getMe()`: `GET /auth/me`
  - Header: `Authorization: Bearer <access_token>` (inyectado por el interceptor).
  - Retorna: Datos del perfil del usuario autenticado.

---

### 2.2 `userService.js` (`src/services/userService.js`)
Administra reclamaciones de sesión anónima e historial:

- `claimAnonSession(anonSessionId)`: `POST /users/me/claim`
  - Recibe: `{ anon_session_id: string }`.
  - Retorna: Resumen de recursos vinculados `{ claimed_projects_count, claimed_stations_count, ... }`.
- `getUserHistory()`: `GET /users/me/history`
  - Retorna: `{ projects: [...], camera_stations: [...] }`.
- `getAllUsers()`: `GET /users/`
  - Retorna: Lista de usuarios registrados.

---

### 2.3 `cameraStationService.js` (`src/services/cameraStationService.js`)
Administra estaciones de cámaras trampa, carga de archivos y resúmenes:

- `createStation(stationData)`: `POST /camera-stations/`
  - Recibe: Objeto con datos de la estación (incluyendo opcionales como `days_active`, `deployment_date`, `retrieval_date`, `status`).
- `getStations(skip = 0, limit = 100)`: `GET /camera-stations/?skip=...&limit=...`
- `getStationById(id)`: `GET /camera-stations/{id}`
- `updateStation(id, stationData)`: `PATCH /camera-stations/{id}`
- `deleteStation(id)`: `DELETE /camera-stations/{id}` *(Soft delete, requiere auth)*
- `uploadMediaFile(stationId, file)`: `POST /camera-stations/{stationId}/files`
  - Content-Type: `multipart/form-data`.
  - Envía: `FormData` con la clave `'file'`.
  - Retorna: `{ media_file_id, station_id, file_type, file_url, detections_count, detections: [...] }`.
- `getStationSummary(stationId)`: `GET /camera-stations/{stationId}/summary`
  - Retorna: Métricas taxonómicas por especie, familia y género.

---

### 2.4 `projectService.js` (`src/services/projectService.js`)
Administra proyectos, relación N:M con estaciones y resumen agregado:

- `createProject(projectData)`: `POST /projects/`
  - Recibe: `{ title, description, objectives, expected_results, status, colaborators }`.
- `getProjects(skip = 0, limit = 100)`: `GET /projects/?skip=...&limit=...`
- `getProjectById(id)`: `GET /projects/{id}`
- `updateProject(id, projectData)`: `PATCH /projects/{id}`
- `deleteProject(id)`: `DELETE /projects/{id}` *(Soft delete, requiere auth)*
- `associateStation(projectId, stationId)`: `POST /projects/{projectId}/stations`
  - Body: `{ station_id: string }`.
- `disassociateStation(projectId, stationId)`: `DELETE /projects/{projectId}/stations/{stationId}`
- `getProjectSummary(projectId)`: `GET /projects/{projectId}/summary`
  - Retorna: Métricas agregadas de todas las estaciones vinculadas al proyecto.

---

### 2.5 `speciesService.js` (`src/services/speciesService.js`)
Administra detecciones, dataset de biodiversidad y validaciones:

- `getSpecies(skip = 0, limit = 100)`: `GET /species/`
- `getSpeciesData()`: `GET /species/data`
- `getSpeciesById(id)`: `GET /species/{id}`
- `verifySpecies(id, verifiedStatus)`: `POST /species/{id}/verify`
  - Body: `{ verified: boolean }`.

---

## 🔍 Reglas de Calidad y Clean Code
- **Sintaxis Consistente:** Exportar cada objeto de servicio como exportación nombrada o métodos estáticos de un objeto (ej. `export const authService = { ... }`).
- **Manejo de Respuestas:** No parsear manualmente `response.json()`. Axios parsea JSON automáticamente.
- **Asincronía Limpia:** Usar `async/await` en todos los métodos de servicio.
