import axios from 'axios';
import { getAnonSessionId } from '../utils/session';
import { ResponseStatus } from '../constants/enums';

// Base URL — change this if the backend is deployed elsewhere
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
    if (response.data && response.data.status === ResponseStatus.SUCCESS) {
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

// ────────────────────────────────────────────────────────────
// Reports › Indicators
// ────────────────────────────────────────────────────────────

/**
 * GET /reports/indicators/frequency
 *
 * @param {object} params
 * @param {string|null} params.project_id
 * @param {string|null} params.start_date   ISO datetime string
 * @param {string|null} params.end_date     ISO datetime string
 * @param {string[]}    params.station_ids  array of UUID strings
 */
export const getFrequencyIndicator = async ({
  project_id,
  start_date,
  end_date,
  station_ids = [],
} = {}) => {
  // Build query string manually for repeated station_ids params
  const queryParts = [];

  if (project_id) queryParts.push(`project_id=${project_id}`);
  if (start_date) queryParts.push(`start_date=${encodeURIComponent(start_date)}`);
  if (end_date) queryParts.push(`end_date=${encodeURIComponent(end_date)}`);
  station_ids.forEach(id => queryParts.push(`station_ids=${id}`));

  const qs = queryParts.length ? `?${queryParts.join('&')}` : '';
  const { data } = await apiClient.get(`/reports/indicators/frequency${qs}`);
  return data;
};

/**
 * GET /reports/indicators/diversity
 *
 * @param {object} params
 * @param {string|null} params.project_id
 * @param {string|null} params.start_date
 * @param {string|null} params.end_date
 * @param {string[]}    params.station_ids
 *
 * Response shape:
 * {
 *   bruto:       { S, shannon, simpson, dominante },
 *   estadistico: { S, shannon, simpson, dominante }
 * }
 */
export const getDiversityIndicator = async ({
  project_id,
  start_date,
  end_date,
  station_ids = [],
} = {}) => {
  const queryParts = [];

  if (project_id) queryParts.push(`project_id=${project_id}`);
  if (start_date) queryParts.push(`start_date=${encodeURIComponent(start_date)}`);
  if (end_date) queryParts.push(`end_date=${encodeURIComponent(end_date)}`);
  station_ids.forEach(id => queryParts.push(`station_ids=${id}`));

  const qs = queryParts.length ? `?${queryParts.join('&')}` : '';
  const { data } = await apiClient.get(`/reports/indicators/diversity${qs}`);
  return data;
};

/**
 * GET /reports/indicators/rai
 *
 * @param {object} params
 * @param {string|null} params.project_id
 * @param {string|null} params.start_date
 * @param {string|null} params.end_date
 * @param {string[]}    params.station_ids
 *
 * Response shape:
 * {
 *   dias_trampa_total: number,
 *   filas: [{ especie, rai_bruto, rai_estadistico, eventos }]
 * }
 */
export const getRaiIndicator = async ({
  project_id,
  start_date,
  end_date,
  station_ids = [],
} = {}) => {
  const queryParts = [];

  if (project_id) queryParts.push(`project_id=${project_id}`);
  if (start_date) queryParts.push(`start_date=${encodeURIComponent(start_date)}`);
  if (end_date) queryParts.push(`end_date=${encodeURIComponent(end_date)}`);
  station_ids.forEach(id => queryParts.push(`station_ids=${id}`));

  const qs = queryParts.length ? `?${queryParts.join('&')}` : '';
  const { data } = await apiClient.get(`/reports/indicators/rai${qs}`);
  return data;
};

// ── Shared query-string builder ───────────────────────────────────────────────
const buildQs = ({ project_id, start_date, end_date, station_ids = [] }) => {
  const parts = [];
  if (project_id) parts.push(`project_id=${project_id}`);
  if (start_date) parts.push(`start_date=${encodeURIComponent(start_date)}`);
  if (end_date) parts.push(`end_date=${encodeURIComponent(end_date)}`);
  station_ids.forEach(id => parts.push(`station_ids=${id}`));
  return parts.length ? `?${parts.join('&')}` : '';
};

/** GET /reports/indicators/rai-monthly
 *  Response: { meses:[1..12], filas:[{especie, m1..m12, total}], totales:{m1..m12} }
 */
export const getRaiMonthlyIndicator = async (params = {}) => {
  const { data } = await apiClient.get(`/reports/indicators/rai-monthly${buildQs(params)}`);
  return data;
};

/** GET /reports/indicators/activity-weckel
 *  Response: { filas:[{especie, n, pct_nocturno, pct_diurno, pct_crepuscular}] }
 */
export const getActivityWeckelIndicator = async (params = {}) => {
  const { data } = await apiClient.get(`/reports/indicators/activity-weckel${buildQs(params)}`);
  return data;
};

/** GET /reports/indicators/ocupacion
 *  Response: { total_estaciones, filas:[{especie, estaciones_presente, ocupacion_pct}] }
 */
export const getOcupacionIndicator = async (params = {}) => {
  const { data } = await apiClient.get(`/reports/indicators/ocupacion${buildQs(params)}`);
  return data;
};

/** GET /reports/indicators/temperatura
 *  Response: { filas:[{especie, n, temp_min, temp_max, temp_promedio}] }
 */
export const getTemperaturaIndicator = async (params = {}) => {
  const { data } = await apiClient.get(`/reports/indicators/temperatura${buildQs(params)}`);
  return data;
};

/** GET /reports/indicators/eventos-independientes
 *  Response: { total_eventos, filas:[{especie, bruto, independientes, desglose_camaras}] }
 */
export const getEventosIndependientesIndicator = async (params = {}) => {
  const { data } = await apiClient.get(`/reports/indicators/eventos-independientes${buildQs(params)}`);
  return data;
};

/** GET /reports/indicators/mapa-calor
 *  Response: { dias:[...], matriz:[{hora, Lunes, Martes, ...}] }
 */
export const getMapaCalorIndicator = async (params = {}) => {
  const { data } = await apiClient.get(`/reports/indicators/mapa-calor${buildQs(params)}`);
  return data;
};

/** GET /reports/indicators/gremios
 *  Response: { total_eventos, filas:[{gremio, eventos, pct}] }
 */
export const getGremiosIndicator = async (params = {}) => {
  const { data } = await apiClient.get(`/reports/indicators/gremios${buildQs(params)}`);
  return data;
};

/** GET /camera-stations/
 *  Response: Array of station objects
 */
export const getCameraStations = async ({ skip = 0, limit = 100 } = {}) => {
  const { data } = await apiClient.get(`/camera-stations/?skip=${skip}&limit=${limit}`);
  return data;
};

/** GET /projects/
 *  Response: Array of project objects
 */
export const getProjects = async ({ skip = 0, limit = 100 } = {}) => {
  const { data } = await apiClient.get(`/projects/?skip=${skip}&limit=${limit}`);
  return data;
};

/** GET /users/
 *  Response: Array of user objects
 */
export const getUsers = async ({ skip = 0, limit = 100 } = {}) => {
  const { data } = await apiClient.get(`/users/?skip=${skip}&limit=${limit}`);
  return data;
};

/** GET /species/
 *  Response: Array of species detection objects
 */
export const getSpecies = async ({ skip = 0, limit = 1000 } = {}) => {
  const { data } = await apiClient.get(`/species/?skip=${skip}&limit=${limit}`);
  return data;
};
