# 📷 Fase 3: Estaciones de Cámara y Relación N:M con Proyectos

## 🎯 Objetivo
Actualizar la interfaz de usuario para el registro completo de estaciones (campos opcionales y lógica condicional de retiro) e implementar la gestión visual de la relación Muchos a Muchos (N:M) entre Proyectos y Estaciones.

---

## 📋 Tareas Detalladas para el Desarrollador

### 3.1 Formulario Completo de Registro de Estaciones (`CreateStationModal.jsx`)
Actualizar `src/features/cameras/CreateStationModal.jsx` para dar soporte a todos los campos requeridos por el backend:

#### Campos Obligatorios:
- `station_code` (String): Código único de la cámara trampa (ej. "CAM-01").
- `location_name` (String): Nombre de la ubicación (ej. "Quebrada La Vieja").

#### Campos Opcionales y Condicionales:
- `camera_brand` (String, opcional). 
- `camera_model` (String, opcional).
- `serial_number` (String, opcional).
- `days_active` (Number, opcional): Días transcurridos en campo.
- `deployment_date` (Date string YYYY-MM-DD, opcional): Fecha de instalación.
- `status` (Select: `"active"` | `"retrieved"`, por defecto `"active"`).
- `retrieval_date` (Date string YYYY-MM-DD, condicional): **Solo visible y habilitado si `status === "retrieved"`**.

```javascript
// Ejemplo de lógica condicional en React
const [status, setStatus] = useState('active');
const [retrievalDate, setRetrievalDate] = useState('');

// En el JSX:
<select value={status} onChange={(e) => setStatus(e.target.value)}>
  <option value="active">Activa</option>
  <option value="retrieved">Retirada</option>
</select>

{status === 'retrieved' && (
  <input
    type="date"
    value={retrievalDate}
    onChange={(e) => setRetrievalDate(e.target.value)}
    required={status === 'retrieved'}
  />
)}
```

---

### 3.2 Gestión de Relación N:M en Vistas y Modales

#### A. Desde la Vista / Modal del Proyecto (`ProjectGiantModal.jsx` / `ProjectModal.jsx`)
- **Visualización:** Listar las estaciones de cámara asociadas actualmente al proyecto (obtenidas desde `GET /projects/{id}`).
- **Acción Asociar Estación:** Proporcionar un selector dropdown o autocompletado con la lista de estaciones disponibles en el sistema. Al seleccionar una, ejecutar `projectService.associateStation(projectId, stationId)`.
- **Acción Quitar del Proyecto:** En cada item de la lista de estaciones vinculadas, incluir el botón "Quitar del proyecto". Al hacer clic, disparar `projectService.disassociateStation(projectId, stationId)`.
  > **Nota de negocio:** Quitar una estación de un proyecto solo elimina la relación intermedia N:M; la estación de cámara NO se elimina del sistema.

#### B. Desde la Vista / Modal de la Estación (`CameraDataModal.jsx`)
- Muestra a qué proyectos pertenece la estación.
- Permitir asociar la estación actual a otros proyectos seleccionables mediante la llamada `projectService.associateStation(selectedProjectId, stationId)`.

---

## 🔍 Reglas de Calidad y Clean Code
- **Validación Formato Fechas:** Asegurar que las fechas se envíen en formato ISO corto `YYYY-MM-DD`.
- **Feedback UI Inmediato:** Actualizar el estado local del componente o invalidar la tienda de Zustand inmediatamente tras asociar/desasociar estaciones para mantener la interfaz reactiva.
