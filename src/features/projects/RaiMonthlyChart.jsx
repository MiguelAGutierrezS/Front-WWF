import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { CalendarDays, TrendingUp, RefreshCw, AlertCircle } from 'lucide-react';
import { getRaiMonthlyIndicator } from '../../services/api';

const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const SPECIES_COLORS = [
  '#00ff88', '#3b82f6', '#f97316', '#a855f7', '#eab308',
  '#ef4444', '#14b8a6', '#ec4899', '#84cc16', '#06b6d4',
  '#f43f5e', '#8b5cf6', '#10b981', '#f59e0b',
];

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

const Shell = ({ title, subtitle, loading, error, retry, children }) => {
  if (loading) return (
    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 w-full animate-pulse flex flex-col gap-3">
      <div className="h-4 w-56 bg-white/10 rounded" />
      <div className="h-3 w-80 bg-white/5 rounded" />
      <div className="h-64 bg-white/5 rounded-xl mt-2" />
    </div>
  );
  if (error) return (
    <div className="bg-white/5 p-4 rounded-2xl border border-red-500/30 w-full flex flex-col gap-3">
      <div className="flex items-center gap-2"><AlertCircle className="w-5 h-5 text-red-400" /><h3 className="text-base font-bold text-white">{title}</h3></div>
      <p className="text-red-400 text-sm">{error}</p>
      <button onClick={retry} className="flex items-center gap-2 self-start px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-semibold cursor-pointer">
        <RefreshCw className="w-4 h-4" />Reintentar
      </button>
    </div>
  );
  return (
    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 w-full flex flex-col gap-4">
      <div><h3 className="text-base font-bold text-white">{title}</h3>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
};

export const RaiMonthlyChart = ({ projectId = null, startDate = null, endDate = null, stationIds = [] }) => {
  const params = { project_id: projectId, start_date: startDate, end_date: endDate, station_ids: stationIds };
  const { data, loading, error, retry } = useIndicator(getRaiMonthlyIndicator, params);
  const [mode, setMode] = useState('totales'); // 'totales' | 'species'
  const [selectedSpecies, setSelectedSpecies] = useState(null);

  const totalesData = useMemo(() => {
    if (!data?.totales) return [];
    return Object.entries(data.totales).map(([key, val], i) => ({
      mes: MONTH_NAMES[i],
      total: val,
    }));
  }, [data]);

  const speciesList = useMemo(() => data?.filas?.map(f => f.especie) || [], [data]);

  const speciesData = useMemo(() => {
    if (!data?.filas || !selectedSpecies) return [];
    const row = data.filas.find(f => f.especie === selectedSpecies);
    if (!row) return [];
    return MONTH_NAMES.map((mes, i) => ({ mes, eventos: row[`m${i + 1}`] || 0 }));
  }, [data, selectedSpecies]);

  const bestMonth = useMemo(() => {
    if (!totalesData.length) return null;
    return totalesData.reduce((a, b) => (b.total > a.total ? b : a));
  }, [totalesData]);

  return (
    <Shell title="RAI Mensual — Distribución por Mes" subtitle="Eventos estadísticos independientes agrupados por mes calendario"
      loading={loading} error={error} retry={retry}>
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-1 bg-black/40 rounded-lg p-1 border border-white/10">
          {[{ id: 'totales', label: 'Totales' }, { id: 'species', label: 'Por especie' }].map(v => (
            <button key={v.id} onClick={() => setMode(v.id)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${mode === v.id ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}>
              {v.label}
            </button>
          ))}
        </div>
        {mode === 'species' && (
          <select
            value={selectedSpecies || ''}
            onChange={e => setSelectedSpecies(e.target.value)}
            className="bg-black/60 text-white border border-white/10 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-primary capitalize"
          >
            <option value="">— Seleccionar especie —</option>
            {speciesList.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        )}
        {bestMonth && mode === 'totales' && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <TrendingUp className="w-3.5 h-3.5 text-primary" />
            <span>Mes pico: <strong className="text-white">{bestMonth.mes}</strong> ({bestMonth.total} eventos)</span>
          </div>
        )}
      </div>

      {/* Chart */}
      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          {mode === 'totales' ? (
            <BarChart data={totalesData} margin={{ top: 4, right: 20, left: -10, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="mes" stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(5,10,25,0.97)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px' }}
                cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="total" name="Eventos" fill="#00ff88" radius={[4, 4, 0, 0]} barSize={28} />
            </BarChart>
          ) : (
            <LineChart data={speciesData} margin={{ top: 4, right: 20, left: -10, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="mes" stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(5,10,25,0.97)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px' }} />
              <Line type="monotone" dataKey="eventos" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: '#3b82f6', r: 4 }} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
      <p className="text-[10px] text-gray-500 text-right">{stationIds.length > 0 ? `${stationIds.length} estación(es)` : 'Global'}</p>
    </Shell>
  );
};
