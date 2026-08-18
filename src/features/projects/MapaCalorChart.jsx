import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { getMapaCalorIndicator } from '../../services/api';

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

// Generate a color from transparent → deep teal → bright green based on 0-max scale
const heatColor = (value, max) => {
  if (max === 0) return 'rgba(255,255,255,0.03)';
  const ratio = value / max;
  if (ratio === 0) return 'rgba(255,255,255,0.03)';
  // Interpolate: dark navy → teal → bright green
  const r = Math.round(0 + ratio * 0);
  const g = Math.round(100 + ratio * 155);
  const b = Math.round(180 - ratio * 44);
  return `rgba(${r},${g},${b},${0.2 + ratio * 0.8})`;
};

export const MapaCalorChart = ({ projectId = null, startDate = null, endDate = null, stationIds = [] }) => {
  const params = { project_id: projectId, start_date: startDate, end_date: endDate, station_ids: stationIds };
  const { data, loading, error, retry } = useIndicator(getMapaCalorIndicator, params);

  const { matriz, dias, maxVal } = useMemo(() => {
    if (!data?.matriz || !data?.dias) return { matriz: [], dias: [], maxVal: 1 };
    const allVals = data.matriz.flatMap(row => data.dias.map(d => row[d] || 0));
    return { matriz: data.matriz, dias: data.dias, maxVal: Math.max(...allVals, 1) };
  }, [data]);

  const formatHour = (h) => {
    const ampm = h < 12 ? 'am' : 'pm';
    const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${display}${ampm}`;
  };

  if (loading) return (
    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 w-full animate-pulse flex flex-col gap-3">
      <div className="h-4 w-64 bg-white/10 rounded" /><div className="bg-white/5 rounded-xl" style={{ height: 400 }} />
    </div>
  );
  if (error) return (
    <div className="bg-white/5 p-4 rounded-2xl border border-red-500/30 w-full flex flex-col gap-3">
      <div className="flex items-center gap-2"><AlertCircle className="w-5 h-5 text-red-400" /><h3 className="text-base font-bold text-white">Mapa de Calor de Actividad</h3></div>
      <p className="text-red-400 text-sm">{error}</p>
      <button onClick={retry} className="flex items-center gap-2 self-start px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-semibold cursor-pointer"><RefreshCw className="w-4 h-4" />Reintentar</button>
    </div>
  );

  return (
    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 w-full flex flex-col gap-4">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-base font-bold text-white">Mapa de Calor — Actividad Horaria</h3>
          <p className="text-xs text-gray-400 mt-0.5">Intensidad de detecciones por hora del día y día de la semana</p>
        </div>
        {/* Gradient legend */}
        <div className="flex items-center gap-2 text-xs text-gray-400 shrink-0">
          <span>Bajo</span>
          <div className="w-24 h-3 rounded-full" style={{ background: 'linear-gradient(to right, rgba(0,100,180,0.2), rgba(0,200,136,1))' }} />
          <span>Alto</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div style={{ minWidth: 480 }}>
          {/* Day headers */}
          <div className="flex mb-1" style={{ paddingLeft: 42 }}>
            {dias.map(dia => (
              <div key={dia} className="flex-1 text-center text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                {dia.slice(0, 3)}
              </div>
            ))}
          </div>

          {/* Grid rows */}
          {matriz.map(row => (
            <div key={row.hora} className="flex items-center mb-0.5">
              {/* Hour label */}
              <div className="text-[9px] text-gray-500 w-10 text-right pr-2 shrink-0 font-medium">
                {formatHour(row.hora)}
              </div>
              {/* Cells */}
              {dias.map(dia => {
                const val = row[dia] || 0;
                return (
                  <div
                    key={dia}
                    className="flex-1 mx-0.5 rounded flex items-center justify-center transition-transform hover:scale-110 hover:z-10 relative cursor-default group"
                    style={{ height: 18, backgroundColor: heatColor(val, maxVal) }}
                    title={`${dia} ${formatHour(row.hora)}: ${val} detecciones`}
                  >
                    {val > 0 && (
                      <span className="text-[8px] text-white/70 font-bold hidden group-hover:block absolute whitespace-nowrap bg-black/80 px-1 rounded -top-5 z-20">
                        {val}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <p className="text-[10px] text-gray-500 text-right">{stationIds.length > 0 ? `${stationIds.length} estación(es)` : 'Global'}</p>
    </div>
  );
};
