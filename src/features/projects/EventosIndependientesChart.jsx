import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Hash, RefreshCw, AlertCircle } from 'lucide-react';
import { getEventosIndependientesIndicator } from '../../services/api';

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
  const cameras = d?.desglose_camaras || {};
  const cameraCount = Object.keys(cameras).length;
  return (
    <div style={{ backgroundColor: 'rgba(5,10,25,0.97)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '10px 14px', minWidth: '220px' }}>
      <p className="text-white font-bold mb-2 capitalize text-sm">{label}</p>
      {payload.map(e => (
        <p key={e.name} className="text-xs mb-0.5" style={{ color: e.color }}>
          {e.name}: <strong>{e.value.toLocaleString()}</strong>
        </p>
      ))}
      {cameraCount > 0 && (
        <p className="text-xs text-gray-400 mt-1.5 border-t border-white/10 pt-1.5">
          Detectado en <strong className="text-white">{cameraCount}</strong> cámara(s)
        </p>
      )}
    </div>
  );
};

export const EventosIndependientesChart = ({ projectId = null, startDate = null, endDate = null, stationIds = [] }) => {
  const params = { project_id: projectId, start_date: startDate, end_date: endDate, station_ids: stationIds };
  const { data, loading, error, retry } = useIndicator(getEventosIndependientesIndicator, params);

  const chartData = useMemo(() => {
    if (!data?.filas) return [];
    return [...data.filas]
      .sort((a, b) => b.bruto - a.bruto)
      .map(row => ({
        especie: row.especie,
        Bruto: row.bruto,
        Independientes: row.independientes,
        desglose_camaras: row.desglose_camaras,
      }));
  }, [data]);

  const eficiencia = useMemo(() => {
    if (!data?.filas?.length) return null;
    const totalB = data.filas.reduce((s, r) => s + r.bruto, 0);
    const totalI = data.filas.reduce((s, r) => s + r.independientes, 0);
    return totalB > 0 ? Number(((totalI / totalB) * 100).toFixed(1)) : null;
  }, [data]);

  const chartHeight = Math.max(320, (chartData.length || 1) * 36);

  if (loading) return (
    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 w-full animate-pulse flex flex-col gap-3">
      <div className="h-4 w-64 bg-white/10 rounded" /><div className="bg-white/5 rounded-xl" style={{ height: 320 }} />
    </div>
  );
  if (error) return (
    <div className="bg-white/5 p-4 rounded-2xl border border-red-500/30 w-full flex flex-col gap-3">
      <div className="flex items-center gap-2"><AlertCircle className="w-5 h-5 text-red-400" /><h3 className="text-base font-bold text-white">Eventos Independientes</h3></div>
      <p className="text-red-400 text-sm">{error}</p>
      <button onClick={retry} className="flex items-center gap-2 self-start px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-semibold cursor-pointer"><RefreshCw className="w-4 h-4" />Reintentar</button>
    </div>
  );

  return (
    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 w-full flex flex-col gap-4">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-base font-bold text-white">Conteo de Eventos Independientes</h3>
          <p className="text-xs text-gray-400 mt-0.5">Registros brutos vs eventos estadísticamente independientes (intervalo mínimo 30 min)</p>
        </div>
        <div className="flex gap-3 shrink-0">
          <div className="bg-black/30 rounded-xl border border-white/10 px-3 py-2">
            <p className="text-[10px] text-gray-400 font-semibold uppercase">Total eventos</p>
            <p className="text-white font-extrabold text-lg leading-tight">{data?.total_eventos?.toLocaleString() ?? '—'}</p>
          </div>
          {eficiencia !== null && (
            <div className="bg-black/30 rounded-xl border border-white/10 px-3 py-2">
              <p className="text-[10px] text-gray-400 font-semibold uppercase">Tasa independencia</p>
              <p className="text-white font-extrabold text-lg leading-tight">{eficiencia}%</p>
            </div>
          )}
        </div>
      </div>

      <div style={{ width: '100%', height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 40, left: 10, bottom: 4 }} barGap={2} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
            <XAxis type="number" stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => v.toLocaleString()} />
            <YAxis dataKey="especie" type="category" stroke="rgba(255,255,255,0.7)" fontSize={10} width={130} tickLine={false} axisLine={false} interval={0} style={{ textTransform: 'capitalize' }} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <Legend wrapperStyle={{ paddingTop: '16px', fontSize: '11px' }} formatter={name => <span style={{ color: name === 'Bruto' ? '#93c5fd' : '#86efac' }}>{name}</span>} />
            <Bar dataKey="Bruto" fill="#1e3a8a" radius={[0, 3, 3, 0]} barSize={10} />
            <Bar dataKey="Independientes" fill="#15803d" radius={[0, 3, 3, 0]} barSize={10} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[10px] text-gray-500 text-right">{stationIds.length > 0 ? `${stationIds.length} estación(es)` : 'Global'}</p>
    </div>
  );
};
