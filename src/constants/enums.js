/**
 * Enums y constantes estandarizadas del sistema INNOVAHACK.
 * Alineadas 1:1 con app.core.enums del backend BACKWWF.
 */

export const CameraStationStatus = Object.freeze({
  ACTIVE: 'active',
  MAINTENANCE: 'maintenance',
  RETRIEVED: 'retrieved',
});

export const CameraStationStatusLabels = Object.freeze({
  [CameraStationStatus.ACTIVE]: 'Activa',
  [CameraStationStatus.MAINTENANCE]: 'Mantenimiento',
  [CameraStationStatus.RETRIEVED]: 'Retirada',
});

export const ProjectStatus = Object.freeze({
  PUBLIC: 'public',
  PRIVATE: 'private',
});

export const ProjectStatusLabels = Object.freeze({
  [ProjectStatus.PUBLIC]: 'Público (Compartir datos anonimizados)',
  [ProjectStatus.PRIVATE]: 'Privado (Solo investigadores autorizados)',
});

export const MediaType = Object.freeze({
  VIDEO: 'video',
  IMAGE: 'image',
});

export const MediaTypeLabels = Object.freeze({
  [MediaType.VIDEO]: 'Video',
  [MediaType.IMAGE]: 'Imagen',
});

export const ResponseStatus = Object.freeze({
  SUCCESS: 'success',
  ERROR: 'error',
});

export const UserGender = Object.freeze({
  MALE: 'M',
  FEMALE: 'F',
});

export const UserGenderLabels = Object.freeze({
  [UserGender.MALE]: 'Masculino',
  [UserGender.FEMALE]: 'Femenino',
});

export const DetectionCategory = Object.freeze({
  ANIMAL: 'animal',
  PERSON: 'person',
  VEHICLE: 'vehicle',
  UNKNOWN: 'unknown',
});

export const EnvironmentMode = Object.freeze({
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
});
