import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Moon, Sun, Sunrise, RefreshCw, AlertCircle } from 'lucide-react';
import { getActivityWeckelIndicator } from '../../services/api';

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
  return (
    <div style={{ backgroundColor: 'rgba(5,10,25,0.97)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '10px 14px', minWidth: '200px' }}>
      <p className="text-white font-bold mb-2 capitalize text-sm">{label}</p>
      {payload.map(e => (
        <p key={e.name} className="text-xs mb-0.5" style={{ color: e.color }}>
          {e.name}: <strong>{e.value}%</strong>
        </p>
      ))}
    </div>
  );
};

export const ActivityWeckelChart = ({ projectId = null, startDate = null, endDate = null, stationIds = [] }) => {
  const params = { project_id: projectId, start_date: startDate, end_date: endDate, station_ids: stationIds };
  const { data, loading, error, retry } = useIndicator(getActivityWeckelIndicator, params);

  const chartData = useMemo(() => {
    if (!data?.filas) return [];
    return [...data.filas]
      .sort((a, b) => b.n - a.n)
      .map(row => ({
        especie: row.especie,
        Nocturno: row.pct_nocturno,
        Diurno: row.pct_diurno,
        Crepuscular: row.pct_crepuscular,
        n: row.n,
      }));
  }, [data]);

  const chartHeight = Math.max(320, (chartData.length || 1) * 36);

  if (loading) return (
    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 w-full animate-pulse flex flex-col gap-3">
      <div className="h-4 w-64 bg-white/10 rounded" /><div className="h-3 w-80 bg-white/5 rounded" />
      <div className="bg-white/5 rounded-xl" style={{ height: 320 }} />
    </div>
  );
  if (error) return (
    <div className="bg-white/5 p-4 rounded-2xl border border-red-500/30 w-full flex flex-col gap-3">
      <div className="flex items-center gap-2"><AlertCircle className="w-5 h-5 text-red-400" /><h3 className="text-base font-bold text-white">Patrón de Actividad (Weckel)</h3></div>
      <p className="text-red-400 text-sm">{error}</p>
      <button onClick={retry} className="flex items-center gap-2 self-start px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-semibold cursor-pointer"><RefreshCw className="w-4 h-4" />Reintentar</button>
    </div>
  );

  return (
    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 w-full flex flex-col gap-4">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-base font-bold text-white">Patrón de Actividad (Método Weckel)</h3>
          <p className="text-xs text-gray-400 mt-0.5">Distribución porcentual de detecciones por período del día</p>
        </div>
        <div className="flex gap-4 text-xs shrink-0">
          <div className="flex items-center gap-1.5"><Moon className="w-3.5 h-3.5 text-indigo-400" /><span className="text-gray-400">Nocturno</span></div>
          <div className="flex items-center gap-1.5"><Sun className="w-3.5 h-3.5 text-yellow-400" /><span className="text-gray-400">Diurno</span></div>
          <div className="flex items-center gap-1.5"><Sunrise className="w-3.5 h-3.5 text-orange-400" /><span className="text-gray-400">Crepuscular</span></div>
        </div>
      </div>

      <div style={{ width: '100%', height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 40, left: 10, bottom: 4 }} barGap={1} barCategoryGap="28%">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} vertical={true} />
            <XAxis type="number" domain={[0, 100]} stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
            <YAxis dataKey="especie" type="category" stroke="rgba(255,255,255,0.7)" fontSize={10} width={130} tickLine={false} axisLine={false} interval={0} style={{ textTransform: 'capitalize' }} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <Legend wrapperStyle={{ paddingTop: '16px', fontSize: '11px' }} />
            <Bar dataKey="Nocturno" stackId="a" fill="#3730a3" radius={[0, 0, 0, 0]} barSize={12} />
            <Bar dataKey="Diurno" stackId="a" fill="#eab308" radius={[0, 0, 0, 0]} barSize={12} />
            <Bar dataKey="Crepuscular" stackId="a" fill="#f97316" radius={[0, 3, 3, 0]} barSize={12} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[10px] text-gray-500 text-right">{stationIds.length > 0 ? `${stationIds.length} estación(es)` : 'Global'}</p>
    </div>
  );
};
