import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, AlertCircle, Layers, Crown, BarChart2, Infinity } from 'lucide-react';
import { getDiversityIndicator } from '../../services/api';

// ─── Metric definitions ────────────────────────────────────────────────────────
const METRICS = [
  {
    key: 'S',
    label: 'Riqueza de Especies',
    subLabel: 'S',
    icon: Layers,
    color: '#3b82f6',
    format: (v) => v,
    description: 'Número total de especies detectadas',
  },
  {
    key: 'shannon',
    label: 'Diversidad Shannon',
    subLabel: "H'",
    icon: BarChart2,
    color: '#22c55e',
    format: (v) => Number(v).toFixed(3),
    description: 'Mide incertidumbre al elegir un individuo al azar',
  },
  {
    key: 'simpson',
    label: 'Dominancia Simpson',
    subLabel: 'D',
    icon: Infinity,
    color: '#a855f7',
    format: (v) => Number(v).toFixed(3),
    description: 'Probabilidad de que dos individuos sean de la misma especie',
  },
  {
    key: 'dominante',
    label: 'Especie Dominante',
    subLabel: '—',
    icon: Crown,
    color: '#f59e0b',
    format: (v) => v,
    description: 'Especie con mayor número de individuos registrados',
  },
];

// ─── Single metric comparison row ─────────────────────────────────────────────
const MetricRow = ({ metric, bruto, estadistico }) => {
  const Icon = metric.icon;
  const brutoVal = bruto?.[metric.key];
  const estaVal = estadistico?.[metric.key];
  const isText = metric.key === 'dominante';

  return (
    <div
      className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-2xl border p-3 transition-all duration-200 hover:scale-[1.01]"
      style={{
        backgroundColor: `${metric.color}08`,
        borderColor: `${metric.color}20`,
      }}
    >
      {/* Bruto value */}
      <div className="text-center">
        <p
          className={`font-extrabold leading-tight ${isText ? 'text-base capitalize' : 'text-2xl'}`}
          style={{ color: metric.color }}
        >
          {brutoVal !== undefined && brutoVal !== null ? metric.format(brutoVal) : '—'}
        </p>
        <p className="text-[10px] text-gray-500 mt-0.5 font-semibold uppercase tracking-wide">
          Bruto
        </p>
      </div>

      {/* Center label */}
      <div className="flex flex-col items-center gap-1 px-2">
        <div
          className="p-2 rounded-xl"
          style={{ backgroundColor: `${metric.color}15` }}
        >
          <Icon className="w-4 h-4" style={{ color: metric.color }} />
        </div>
        <span
          className="text-[11px] font-black tracking-wider"
          style={{ color: metric.color }}
        >
          {metric.subLabel}
        </span>
        <p className="text-[9px] text-gray-500 text-center leading-tight max-w-[80px] hidden xl:block">
          {metric.label}
        </p>
      </div>

      {/* Estadístico value */}
      <div className="text-center">
        <p
          className={`font-extrabold leading-tight ${isText ? 'text-base capitalize' : 'text-2xl'}`}
          style={{ color: metric.color }}
        >
          {estaVal !== undefined && estaVal !== null ? metric.format(estaVal) : '—'}
        </p>
        <p className="text-[10px] text-gray-500 mt-0.5 font-semibold uppercase tracking-wide">
          Estadístico
        </p>
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
/**
 * DiversityChart
 *
 * Props:
 *  - projectId   {string|null}
 *  - startDate   {string|null}
 *  - endDate     {string|null}
 *  - stationIds  {string[]}
 */
export const DiversityChart = ({
  projectId = null,
  startDate = null,
  endDate = null,
  stationIds = [],
}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getDiversityIndicator({
        project_id: projectId,
        start_date: startDate,
        end_date: endDate,
        station_ids: stationIds,
      });
      setData(result);
    } catch (err) {
      console.error('[DiversityChart] fetch error:', err);
      setError(err?.response?.data?.detail || err.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, [projectId, startDate, endDate, JSON.stringify(stationIds)]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="bg-white/5 p-4 rounded-2xl border border-white/10 w-full flex flex-col gap-3 animate-pulse">
        <div className="h-4 w-48 bg-white/10 rounded" />
        <div className="h-3 w-72 bg-white/5 rounded" />
        <div className="grid grid-cols-1 gap-3 mt-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-white/5 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="bg-white/5 p-4 rounded-2xl border border-red-500/30 w-full flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <h3 className="text-base font-bold text-white">Índice de Biodiversidad</h3>
        </div>
        <p className="text-red-400 text-sm">{error}</p>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 self-start px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all text-sm font-semibold cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          Reintentar
        </button>
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 w-full flex flex-col gap-4">

      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-base font-bold text-white">Índice de Biodiversidad</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Comparación de métricas ecológicas entre registros brutos y eventos estadísticos independientes
          </p>
        </div>
        <div className="flex gap-4 text-xs shrink-0">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-white/30" />
            <span className="text-gray-400 font-semibold">Bruto</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-white/60" />
            <span className="text-gray-400 font-semibold">Estadístico</span>
          </div>
        </div>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[1fr_auto_1fr] gap-3 px-1">
        <div className="text-center">
          <span className="text-[11px] font-bold text-white/50 uppercase tracking-widest">
            ← Bruto
          </span>
        </div>
        <div className="w-[88px]" />
        <div className="text-center">
          <span className="text-[11px] font-bold text-white/50 uppercase tracking-widest">
            Estadístico →
          </span>
        </div>
      </div>

      {/* Metric rows */}
      <div className="flex flex-col gap-2">
        {METRICS.map((metric) => (
          <MetricRow
            key={metric.key}
            metric={metric}
            bruto={data?.bruto}
            estadistico={data?.estadistico}
          />
        ))}
      </div>

      {/* Footer */}
      <p className="text-[10px] text-gray-500 text-right">
        {stationIds.length > 0
          ? `Filtrado por ${stationIds.length} estación(es)`
          : 'Datos globales — sin filtro de estación'}
      </p>
    </div>
  );
};
