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
  ReferenceLine,
} from 'recharts';
import { Calendar, TrendingUp, RefreshCw, AlertCircle } from 'lucide-react';
import { getRaiIndicator } from '../../services/api';

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
        minWidth: '210px',
      }}
    >
      <p className="text-white font-bold mb-2 capitalize text-sm">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="text-xs mb-0.5" style={{ color: entry.color }}>
          {entry.name}:{' '}
          <strong>{Number(entry.value).toFixed(2)}</strong>{' '}
          <span className="text-gray-500">(detec / 100 días trampa)</span>
        </p>
      ))}
      {/* Show eventos from the raw data stored in the payload */}
      {payload[0]?.payload?.eventos !== undefined && (
        <p className="text-xs text-gray-400 mt-1.5 border-t border-white/10 pt-1.5">
          Eventos independientes:{' '}
          <strong className="text-white">{payload[0].payload.eventos}</strong>
        </p>
      )}
    </div>
  );
};

// ─── KPI Card ──────────────────────────────────────────────────────────────────
const KpiCard = ({ label, value, unit, color, icon: Icon }) => (
  <div
    className="flex items-center gap-3 bg-black/30 rounded-xl border p-3 flex-1"
    style={{ borderColor: `${color}30` }}
  >
    <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
      <Icon className="w-5 h-5" style={{ color }} />
    </div>
    <div>
      <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide">{label}</p>
      <p className="text-white font-extrabold text-xl leading-tight">
        {value !== undefined && value !== null ? Number(value).toLocaleString() : '—'}
        {unit && <span className="text-xs font-normal text-gray-400 ml-1">{unit}</span>}
      </p>
    </div>
  </div>
);

// ─── Main Component ────────────────────────────────────────────────────────────
/**
 * RaiChart — Índice de Abundancia Relativa
 *
 * Props:
 *  - projectId   {string|null}
 *  - startDate   {string|null}
 *  - endDate     {string|null}
 *  - stationIds  {string[]}
 */
export const RaiChart = ({
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
      const result = await getRaiIndicator({
        project_id: projectId,
        start_date: startDate,
        end_date: endDate,
        station_ids: stationIds,
      });
      setData(result);
    } catch (err) {
      console.error('[RaiChart] fetch error:', err);
      setError(err?.response?.data?.detail || err.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, [projectId, startDate, endDate, JSON.stringify(stationIds)]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Transform for Recharts (sorted by rai_bruto desc, skip blanks optionally) ─
  const chartData = React.useMemo(() => {
    if (!data?.filas) return [];
    return [...data.filas]
      .sort((a, b) => b.rai_bruto - a.rai_bruto)
      .map((row) => ({
        especie: row.especie,
        'RAI Bruto': Number(row.rai_bruto.toFixed(2)),
        'RAI Estadístico': Number(row.rai_estadistico.toFixed(2)),
        eventos: row.eventos,
      }));
  }, [data]);

  const chartHeight = Math.max(340, (chartData.length || 1) * 38);

  // ── Mean reference line value ──────────────────────────────────────────────
  const meanBruto = React.useMemo(() => {
    if (!chartData.length) return null;
    const sum = chartData.reduce((acc, r) => acc + r['RAI Bruto'], 0);
    return Number((sum / chartData.length).toFixed(2));
  }, [chartData]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="bg-white/5 p-4 rounded-2xl border border-white/10 w-full flex flex-col gap-3 animate-pulse">
        <div className="h-4 w-56 bg-white/10 rounded" />
        <div className="h-3 w-80 bg-white/5 rounded" />
        <div className="flex gap-3">
          <div className="h-16 flex-1 bg-white/5 rounded-xl" />
          <div className="h-16 flex-1 bg-white/5 rounded-xl" />
        </div>
        <div className="bg-white/5 rounded-xl" style={{ height: 320 }} />
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="bg-white/5 p-4 rounded-2xl border border-red-500/30 w-full flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <h3 className="text-base font-bold text-white">RAI — Índice de Abundancia Relativa</h3>
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
      <div>
        <h3 className="text-base font-bold text-white">
          RAI — Índice de Abundancia Relativa
        </h3>
        <p className="text-xs text-gray-400 mt-0.5">
          Detecciones por cada 100 días‑trampa · RAI = (Ni / días trampa) × 100
        </p>
      </div>

      {/* KPI Cards */}
      <div className="flex gap-3 flex-wrap">
        <KpiCard
          label="Días Trampa Totales"
          value={data?.dias_trampa_total}
          unit="días"
          color="#3b82f6"
          icon={Calendar}
        />
        <KpiCard
          label="Promedio RAI Bruto"
          value={meanBruto}
          unit="/ 100 días"
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
            margin={{ top: 4, right: 50, left: 10, bottom: 4 }}
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
              tickFormatter={(v) => v.toFixed(0)}
              label={{
                value: 'Detec / 100 días trampa',
                position: 'insideBottomRight',
                offset: -4,
                fill: 'rgba(255,255,255,0.3)',
                fontSize: 9,
              }}
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
                <span style={{ color: name === 'RAI Bruto' ? '#93c5fd' : '#fdba74' }}>
                  {name}
                </span>
              )}
            />
            {/* Mean reference line */}
            {meanBruto !== null && (
              <ReferenceLine
                x={meanBruto}
                stroke="rgba(255,255,255,0.25)"
                strokeDasharray="4 4"
                label={{
                  value: `Media: ${meanBruto}`,
                  position: 'top',
                  fill: 'rgba(255,255,255,0.4)',
                  fontSize: 9,
                }}
              />
            )}
            <Bar
              dataKey="RAI Bruto"
              fill="#1e3a8a"
              radius={[0, 3, 3, 0]}
              barSize={10}
            />
            <Bar
              dataKey="RAI Estadístico"
              fill="#f97316"
              radius={[0, 3, 3, 0]}
              barSize={10}
            />
          </BarChart>
        </ResponsiveContainer>
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
