import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { MapPin, RefreshCw, AlertCircle } from 'lucide-react';
import { getOcupacionIndicator } from '../../services/api';

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

const getColor = (pct) => {
  if (pct >= 75) return '#22c55e';
  if (pct >= 50) return '#eab308';
  return '#ef4444';
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  return (
    <div style={{ backgroundColor: 'rgba(5,10,25,0.97)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '10px 14px', minWidth: '200px' }}>
      <p className="text-white font-bold mb-1 capitalize text-sm">{label}</p>
      <p className="text-xs" style={{ color: getColor(row?.ocupacion_pct) }}>
        Ocupación: <strong>{row?.ocupacion_pct}%</strong>
      </p>
      <p className="text-xs text-gray-400 mt-0.5">
        Estaciones: <strong className="text-white">{row?.estaciones_presente}</strong>
      </p>
    </div>
  );
};

export const OcupacionChart = ({ projectId = null, startDate = null, endDate = null, stationIds = [] }) => {
  const params = { project_id: projectId, start_date: startDate, end_date: endDate, station_ids: stationIds };
  const { data, loading, error, retry } = useIndicator(getOcupacionIndicator, params);

  const chartData = useMemo(() => {
    if (!data?.filas) return [];
    return [...data.filas]
      .sort((a, b) => b.ocupacion_pct - a.ocupacion_pct)
      .map(row => ({ ...row }));
  }, [data]);

  const chartHeight = Math.max(300, (chartData.length || 1) * 36);

  if (loading) return (
    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 w-full animate-pulse flex flex-col gap-3">
      <div className="h-4 w-56 bg-white/10 rounded" /><div className="bg-white/5 rounded-xl" style={{ height: 300 }} />
    </div>
  );
  if (error) return (
    <div className="bg-white/5 p-4 rounded-2xl border border-red-500/30 w-full flex flex-col gap-3">
      <div className="flex items-center gap-2"><AlertCircle className="w-5 h-5 text-red-400" /><h3 className="text-base font-bold text-white">Tasa de Ocupación</h3></div>
      <p className="text-red-400 text-sm">{error}</p>
      <button onClick={retry} className="flex items-center gap-2 self-start px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-semibold cursor-pointer"><RefreshCw className="w-4 h-4" />Reintentar</button>
    </div>
  );

  return (
    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 w-full flex flex-col gap-4">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-base font-bold text-white">Tasa de Ocupación por Estación</h3>
          <p className="text-xs text-gray-400 mt-0.5">% de estaciones donde cada especie fue detectada</p>
        </div>
        <div className="flex items-center gap-2 bg-black/30 rounded-xl border border-white/10 px-3 py-2 shrink-0">
          <MapPin className="w-4 h-4 text-blue-400" />
          <div>
            <p className="text-[10px] text-gray-400 font-semibold uppercase">Total estaciones</p>
            <p className="text-white font-extrabold text-lg leading-tight">{data?.total_estaciones ?? '—'}</p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-[11px]">
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-green-500" /><span className="text-gray-400">≥75%</span></div>
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-yellow-500" /><span className="text-gray-400">50–74%</span></div>
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500" /><span className="text-gray-400">&lt;50%</span></div>
      </div>

      <div style={{ width: '100%', height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 50, left: 10, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
            <YAxis dataKey="especie" type="category" stroke="rgba(255,255,255,0.7)" fontSize={10} width={130} tickLine={false} axisLine={false} interval={0} style={{ textTransform: 'capitalize' }} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <Bar dataKey="ocupacion_pct" name="Ocupación" radius={[0, 4, 4, 0]} barSize={14}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={getColor(entry.ocupacion_pct)} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[10px] text-gray-500 text-right">{stationIds.length > 0 ? `${stationIds.length} estación(es)` : 'Global'}</p>
    </div>
  );
};
