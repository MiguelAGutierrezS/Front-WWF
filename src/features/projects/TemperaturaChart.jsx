import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ErrorBar } from 'recharts';
import { Thermometer, RefreshCw, AlertCircle } from 'lucide-react';
import { getTemperaturaIndicator } from '../../services/api';

const useIndicator = (fetcher, params) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const key = JSON.stringify(params);
  const fetchData = useCallback(async () => {
    setLoading(true); setError(null);
    try { setData(await fetcher(params)); }
    catch (e) { setError(e?.response?.data?.detail || e.message || 'Error'); }
    finally { setLoading(false); }
  }, [key]);
  useEffect(() => { fetchData(); }, [fetchData]);
  return { data, loading, error, retry: fetchData };
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div style={{ backgroundColor: 'rgba(5,10,25,0.97)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '10px 14px', minWidth: '220px' }}>
      <p className="text-white font-bold mb-2 capitalize text-sm">{label}</p>
      <p className="text-xs text-blue-400">Mín: <strong>{d?.temp_min}°C</strong></p>
      <p className="text-xs text-orange-400">Promedio: <strong>{d?.temp_promedio}°C</strong></p>
      <p className="text-xs text-red-400">Máx: <strong>{d?.temp_max}°C</strong></p>
      <p className="text-xs text-gray-400 mt-1">n = {d?.n} detecciones</p>
    </div>
  );
};

export const TemperaturaChart = ({ projectId = null, startDate = null, endDate = null, stationIds = [] }) => {
  const params = { project_id: projectId, start_date: startDate, end_date: endDate, station_ids: stationIds };
  const { data, loading, error, retry } = useIndicator(getTemperaturaIndicator, params);

  const chartData = useMemo(() => {
    if (!data?.filas) return [];
    return [...data.filas]
      .filter(r => r.especie !== 'blank')
      .sort((a, b) => b.temp_promedio - a.temp_promedio)
      .map(row => ({
        especie: row.especie,
        // For the "range" bar: we render from temp_min to temp_max
        // Using a stacked approach: bottom invisible + visible range
        rangoBase: row.temp_min,
        rangoAltura: Number((row.temp_max - row.temp_min).toFixed(1)),
        temp_promedio: row.temp_promedio,
        temp_min: row.temp_min,
        temp_max: row.temp_max,
        n: row.n,
      }));
  }, [data]);

  const globalMin = useMemo(() => chartData.length ? Math.min(...chartData.map(d => d.temp_min)) - 1 : 0, [chartData]);
  const globalMax = useMemo(() => chartData.length ? Math.max(...chartData.map(d => d.temp_max)) + 1 : 40, [chartData]);
  const chartHeight = Math.max(320, (chartData.length || 1) * 36);

  if (loading) return (
    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 w-full animate-pulse flex flex-col gap-3">
      <div className="h-4 w-64 bg-white/10 rounded" /><div className="bg-white/5 rounded-xl" style={{ height: 320 }} />
    </div>
  );
  if (error) return (
    <div className="bg-white/5 p-4 rounded-2xl border border-red-500/30 w-full flex flex-col gap-3">
      <div className="flex items-center gap-2"><AlertCircle className="w-5 h-5 text-red-400" /><h3 className="text-base font-bold text-white">Temperatura vs Detecciones</h3></div>
      <p className="text-red-400 text-sm">{error}</p>
      <button onClick={retry} className="flex items-center gap-2 self-start px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-semibold cursor-pointer"><RefreshCw className="w-4 h-4" />Reintentar</button>
    </div>
  );

  return (
    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 w-full flex flex-col gap-4">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-base font-bold text-white">Análisis de Temperatura vs Detecciones</h3>
          <p className="text-xs text-gray-400 mt-0.5">Rango de temperatura durante las detecciones por especie (mín – promedio – máx)</p>
        </div>
        <div className="flex gap-4 text-[11px] shrink-0">
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-400" /><span className="text-gray-400">Rango (mín-máx)</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-orange-400" /><span className="text-gray-400">Promedio</span></div>
        </div>
      </div>

      <div style={{ width: '100%', height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} layout="vertical" margin={{ top: 4, right: 50, left: 10, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
            <XAxis type="number" domain={[globalMin, globalMax]} stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => `${v}°`} />
            <YAxis dataKey="especie" type="category" stroke="rgba(255,255,255,0.7)" fontSize={10} width={130} tickLine={false} axisLine={false} interval={0} style={{ textTransform: 'capitalize' }} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            {/* Invisible base bar */}
            <Bar dataKey="rangoBase" stackId="temp" fill="transparent" barSize={10} />
            {/* Visible range bar */}
            <Bar dataKey="rangoAltura" stackId="temp" fill="#3b82f6" fillOpacity={0.55} radius={[0, 3, 3, 0]} barSize={10} name="Rango" />
            {/* Average line as a scatter-like bar */}
            <Bar dataKey="temp_promedio" stackId="avg" fill="transparent" barSize={0}
              label={({ x, y, width, height, value }) => (
                <circle cx={x + value - globalMin} cy={y + height / 2 - 5} r={4} fill="#f97316" />
              )}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[10px] text-gray-500 text-right">{stationIds.length > 0 ? `${stationIds.length} estación(es)` : 'Global'}</p>
    </div>
  );
};
