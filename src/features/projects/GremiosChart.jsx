import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Leaf, RefreshCw, AlertCircle } from 'lucide-react';
import { getGremiosIndicator } from '../../services/api';

const GUILD_COLORS = {
  'Herbivoro':          '#22c55e',
  'Omnivoro':           '#f97316',
  'Desconocido':        '#6b7280',
  'Insectivoro':        '#eab308',
  'Frugivoro/Folivoro': '#3b82f6',
  'Carnivoro':          '#ef4444',
  'Frugivoro/Omnivoro': '#a855f7',
};
const FALLBACK_COLORS = ['#14b8a6', '#ec4899', '#84cc16', '#06b6d4', '#f43f5e'];

const getGuildColor = (name, idx) => GUILD_COLORS[name] || FALLBACK_COLORS[idx % FALLBACK_COLORS.length];

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

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div style={{ backgroundColor: 'rgba(5,10,25,0.97)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '10px 14px' }}>
      <p className="text-white font-bold text-sm mb-1">{d.name}</p>
      <p className="text-xs" style={{ color: d.payload.fill }}>
        Eventos: <strong>{d.value.toLocaleString()}</strong>
      </p>
      <p className="text-xs text-gray-400">{d.payload.pct}%</p>
    </div>
  );
};

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, pct }) => {
  if (pct < 5) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight="bold">
      {pct}%
    </text>
  );
};

export const GremiosChart = ({ projectId = null, startDate = null, endDate = null, stationIds = [] }) => {
  const params = { project_id: projectId, start_date: startDate, end_date: endDate, station_ids: stationIds };
  const { data, loading, error, retry } = useIndicator(getGremiosIndicator, params);

  const pieData = useMemo(() => {
    if (!data?.filas) return [];
    return data.filas.map((row, i) => ({
      name: row.gremio,
      value: row.eventos,
      pct: row.pct,
      fill: getGuildColor(row.gremio, i),
    }));
  }, [data]);

  if (loading) return (
    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 w-full animate-pulse flex flex-col gap-3">
      <div className="h-4 w-56 bg-white/10 rounded" />
      <div className="flex gap-4"><div className="bg-white/5 rounded-full" style={{ width: 220, height: 220 }} /><div className="flex-1 space-y-2">{[1,2,3,4].map(i=><div key={i} className="h-8 bg-white/5 rounded-xl"/>)}</div></div>
    </div>
  );
  if (error) return (
    <div className="bg-white/5 p-4 rounded-2xl border border-red-500/30 w-full flex flex-col gap-3">
      <div className="flex items-center gap-2"><AlertCircle className="w-5 h-5 text-red-400" /><h3 className="text-base font-bold text-white">Gremios Tróficos</h3></div>
      <p className="text-red-400 text-sm">{error}</p>
      <button onClick={retry} className="flex items-center gap-2 self-start px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-semibold cursor-pointer"><RefreshCw className="w-4 h-4" />Reintentar</button>
    </div>
  );

  return (
    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 w-full flex flex-col gap-4">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-base font-bold text-white">Agrupación por Gremios Tróficos</h3>
          <p className="text-xs text-gray-400 mt-0.5">Distribución de eventos por categoría alimentaria</p>
        </div>
        <div className="bg-black/30 rounded-xl border border-white/10 px-3 py-2 shrink-0">
          <p className="text-[10px] text-gray-400 font-semibold uppercase">Total eventos</p>
          <p className="text-white font-extrabold text-lg leading-tight">{data?.total_eventos?.toLocaleString() ?? '—'}</p>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-4 items-center">
        {/* Donut chart */}
        <div style={{ width: '100%', maxWidth: 280, height: 260 }} className="shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%" cy="50%"
                innerRadius="50%" outerRadius="78%"
                dataKey="value"
                labelLine={false}
                label={renderCustomLabel}
                paddingAngle={2}
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} stroke="rgba(0,0,0,0.3)" strokeWidth={1} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Guild list */}
        <div className="flex flex-col gap-2 flex-1 w-full">
          {pieData.map((entry) => (
            <div key={entry.name} className="flex items-center justify-between bg-black/20 rounded-xl px-3 py-2 border border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: entry.fill }} />
                <span className="text-sm text-white font-medium">{entry.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400">{entry.value.toLocaleString()} eventos</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${entry.fill}25`, color: entry.fill }}>
                  {entry.pct}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className="text-[10px] text-gray-500 text-right">{stationIds.length > 0 ? `${stationIds.length} estación(es)` : 'Global'}</p>
    </div>
  );
};
