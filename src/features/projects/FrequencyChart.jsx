import React, { useState, useEffect, useCallback } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Activity, TrendingUp, RefreshCw, AlertCircle } from 'lucide-react';
import { getFrequencyIndicator } from '../../services/api';

// ─── Custom Tooltip ────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        backgroundColor: 'rgba(5, 10, 25, 0.97)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '12px',
        padding: '10px 14px',
        minWidth: '200px',
      }}
    >
      <p className="text-white font-bold mb-2 capitalize text-sm">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="text-xs" style={{ color: entry.color }}>
          {entry.name}: <strong>{entry.value.toLocaleString()}</strong>
          {entry.dataKey === 'bruto_pct' || entry.dataKey === 'estad_pct'
            ? '%'
            : ' detecciones'}
        </p>
      ))}
    </div>
  );
};

// ─── KPI Card ──────────────────────────────────────────────────────────────────
const KpiCard = ({ label, value, color, icon: Icon }) => (
  <div
    className="flex items-center gap-3 bg-black/30 rounded-xl border p-3 flex-1"
    style={{ borderColor: `${color}30` }}
  >
    <div
      className="p-2 rounded-lg"
      style={{ backgroundColor: `${color}20` }}
    >
      <Icon className="w-5 h-5" style={{ color }} />
    </div>
    <div>
      <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide">{label}</p>
      <p className="text-white font-extrabold text-xl leading-tight">
        {value?.toLocaleString() ?? '—'}
      </p>
    </div>
  </div>
);

// ─── View Toggle ───────────────────────────────────────────────────────────────
const VIEWS = [
  { id: 'absolute', label: 'Conteo Absoluto' },
  { id: 'percent', label: 'Porcentaje (%)' },
];

// ─── Main Component ────────────────────────────────────────────────────────────
/**
 * FrequencyChart
 *
 * Props:
 *  - projectId   {string|null}   Optional project UUID
 *  - startDate   {string|null}   ISO date string (from reportFilters)
 *  - endDate     {string|null}   ISO date string
 *  - stationIds  {string[]}      List of camera-station UUIDs
 */
export const FrequencyChart = ({
  projectId = null,
  startDate = null,
  endDate = null,
  stationIds = [],
}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('absolute'); // 'absolute' | 'percent'

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getFrequencyIndicator({
        project_id: projectId,
        start_date: startDate,
        end_date: endDate,
        station_ids: stationIds,
      });
      setData(result);
    } catch (err) {
      console.error('[FrequencyChart] fetch error:', err);
      setError(err?.response?.data?.detail || err.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, [projectId, startDate, endDate, JSON.stringify(stationIds)]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Transform API data for Recharts ────────────────────────────────────────
  const chartData = React.useMemo(() => {
    if (!data?.filas) return [];
    // Sort by bruto_ni descending, show top items cleanly
    return [...data.filas]
      .sort((a, b) => b.bruto_ni - a.bruto_ni)
      .map((row) => ({
        especie: row.especie,
        'Dato Bruto': view === 'absolute' ? row.bruto_ni : row.bruto_pct,
        'Dato Estadístico': view === 'absolute' ? row.estad_eventos : row.estad_pct,
      }));
  }, [data, view]);

  const chartHeight = Math.max(320, (chartData.length || 1) * 36);
  const xDomain = view === 'percent' ? [0, 'dataMax'] : undefined;
  const xFormatter = view === 'percent' ? (v) => `${v}%` : (v) => v.toLocaleString();

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="bg-white/5 p-4 rounded-2xl border border-white/10 w-full flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
          <h3 className="text-base font-bold text-white">
            Frecuencia de Detecciones por Especie
          </h3>
        </div>
        <div className="flex-1 flex flex-col gap-3 animate-pulse">
          <div className="flex gap-3">
            <div className="h-16 flex-1 bg-white/5 rounded-xl" />
            <div className="h-16 flex-1 bg-white/5 rounded-xl" />
          </div>
          <div className="h-64 bg-white/5 rounded-xl" />
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="bg-white/5 p-4 rounded-2xl border border-red-500/30 w-full flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <h3 className="text-base font-bold text-white">
            Frecuencia de Detecciones por Especie
          </h3>
        </div>
        <p className="text-red-400 text-sm mb-4">{error}</p>
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
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-base font-bold text-white">
            Frecuencia de Avistamiento × Especie
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Comparación entre registros brutos e independientes (eventos estadísticos)
          </p>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-black/40 rounded-lg p-1 border border-white/10 shrink-0">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                view === v.id
                  ? 'bg-white text-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="flex gap-3 flex-wrap">
        <KpiCard
          label="Total Detecciones Brutas"
          value={data?.total_bruto}
          color="#1e3a8a"
          icon={Activity}
        />
        <KpiCard
          label="Total Eventos Estadísticos"
          value={data?.total_eventos}
          color="#f97316"
          icon={TrendingUp}
        />
      </div>

      {/* Chart */}
      <div style={{ width: '100%', height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 4, right: 40, left: 10, bottom: 4 }}
            barGap={2}
            barCategoryGap="30%"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.06)"
              horizontal={false}
              vertical={true}
            />
            <XAxis
              type="number"
              stroke="rgba(255,255,255,0.4)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={xFormatter}
              domain={xDomain}
            />
            <YAxis
              dataKey="especie"
              type="category"
              stroke="rgba(255,255,255,0.7)"
              fontSize={10}
              width={130}
              tickLine={false}
              axisLine={false}
              interval={0}
              style={{ textTransform: 'capitalize' }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <Legend
              wrapperStyle={{ paddingTop: '16px', fontSize: '11px', color: '#9ca3af' }}
              formatter={(name) => (
                <span style={{ color: name === 'Dato Bruto' ? '#93c5fd' : '#fdba74' }}>
                  {name}
                </span>
              )}
            />
            <Bar
              dataKey="Dato Bruto"
              fill="#1e3a8a"
              radius={[0, 3, 3, 0]}
              barSize={10}
            />
            <Bar
              dataKey="Dato Estadístico"
              fill="#f97316"
              radius={[0, 3, 3, 0]}
              barSize={10}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Footer note */}
      <p className="text-[10px] text-gray-500 text-right">
        {stationIds.length > 0
          ? `Filtrado por ${stationIds.length} estación(es)`
          : 'Datos globales — sin filtro de estación'}
      </p>
    </div>
  );
};
