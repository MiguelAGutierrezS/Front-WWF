# 🤖 Fase 4: Subida Multimedia e Inteligencia Artificial

## 🎯 Objetivo
Habilitar la subida de archivos multimedia de **imagen** y **video** asociados a una estación de cámara, gestionar los estados de procesamiento e IA, mostrar la galería de detecciones recibidas (usando las URLs completas del backend) y presentar los dashboards de resumen estadístico taxonómico.

---

## 📋 Tareas Detalladas para el Desarrollador

### 4.1 Componente de Subida `UploadWidget.jsx`
Actualizar `src/features/upload/UploadWidget.jsx` para soportar la subida de archivos vía `multipart/form-data`:

- **Tipos de archivo permitidos (attribute `accept`):**
  - Imágenes: `.jpg`, `.jpeg`, `.png`.
  - Videos: `.mp4`, `.avi`, `.mov`.
- **Flujo de envío:**
  1. El usuario selecciona el archivo y especifica la estación de destino (`stationId`).
  2. Activar indicador de carga visual (Spinner / Progress bar) con mensaje: *"Enviando y analizando contenido con modelo de IA..."*.
  3. Ejecutar `cameraStationService.uploadMediaFile(stationId, file)`.
  4. Al recibir respuesta exitosa (`201 Created`), desactivar loader y renderizar los resultados.

```javascript
// Fragmento conceptual de subida en React
const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Validaciones en cliente
  const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4', 'video/x-msvideo', 'video/quicktime'];
  if (!allowedTypes.includes(file.type)) {
    alert('Formato de archivo no soportado. Formatos válidos: JPG, PNG, MP4, AVI, MOV.');
    return;
  }

  setUploading(true);
  try {
    const result = await cameraStationService.uploadMediaFile(selectedStationId, file);
    setDetectionsResult(result.detections);
    toast.success(`Procesado exitosamente: ${result.detections_count} detecciones encontradas.`);
  } catch (error) {
    toast.error('Error al procesar el archivo con la IA.');
  } finally {
    setUploading(false);
  }
};
```

---

### 4.2 Galería de Capturas de Detección por IA
- **Visualización de Detecciones:** Al finalizar la subida o al consultar detecciones de una estación (`GET /species/`), renderizar una galería de tarjetas por cada elemento en `detections`.
- **Estructura de la Tarjeta de Detección:**
  - Imagen del Crop: Usar directamente la propiedad `url_img` retornado por la API (las URLs vienen completas desde el backend, ej. `http://.../crops/crop_101.jpg`).
  - Nombre común y científico: `common_name` (*`scientific_name`*).
  - Taxonomía: Familia (`family`) y Género (`genus`).
  - Score de Confianza: `confidence_score` presentado como porcentaje (ej. `94%`).
  - Badge de verificación: Indicador de si ha sido verificado por biólogo humano (`is_verified`).

---

### 4.3 Dashboards y Resúmenes Estadísticos Taxonómicos
Integrar dos niveles de reportes agregados:

#### Level 1: Resumen por Estación (`GET /camera-stations/{id}/summary`)
- Métricas mostradas: `distinct_species_count`, `total_detections_count`.
- Gráficos/Tablas:
  - Frecuencia por especie (`frequency_by_species`).
  - Frecuencia por familia (`frequency_by_family`).
  - Frecuencia por género (`frequency_by_genus`).

#### Level 2: Resumen Agregado por Proyecto (`GET /projects/{id}/summary`)
- Métricas agregadas de **todas las estaciones vinculadas**:
  - `total_associated_stations`, `distinct_species_count`, `total_detections_count`.
  - Desglose consolidado por Especie, Familia y Género.

---

## 🔍 Reglas de Calidad y Clean Code
- **Cero Construcción de URLs Relativas para Imágenes:** No anteponer `VITE_MEDIA_BASE_URL` o dominios locales hardcodeados a `url_img`. La API backend devuelve URLs absolutas válidas.
- **Manejo de Errores de Carga de Imagen:** Incluir un manejador `onError` en las etiquetas `<img>` para mostrar una imagen de fallback si un crop no está disponible.
