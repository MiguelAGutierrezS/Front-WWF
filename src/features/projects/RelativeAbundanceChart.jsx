import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import datosRAI from '../../data/datosRAI.json';

export const RelativeAbundanceChart = () => {
  const chartData = useMemo(() => {
    const { dias_trampa_total } = datosRAI.parametros_globales;
    return datosRAI.datos.map(d => ({
      especie: d.especie,
      'RAI Bruto': Number(((d.ni / dias_trampa_total) * 100).toFixed(2)),
      'RAI Estadístico': Number(((d.eventos / dias_trampa_total) * 100).toFixed(2))
    }));
  }, []);

  return (
    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex-1 flex flex-col w-full">
      <h3 className="text-xl font-bold text-white mb-2">Índice de Abundancia Relativa (RAI)</h3>
      <p className="text-sm text-gray-400 mb-6">Comparación entre RAI Bruto y RAI Estadístico basado en {datosRAI.parametros_globales.dias_trampa_total} días trampa.</p>
      
      <div className="w-full" style={{ height: Math.max(500, chartData.length * 45) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={chartData} 
            layout="vertical" 
            margin={{ top: 0, right: 30, left: 40, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" horizontal={true} vertical={false}/>
            <XAxis type="number" stroke="#ffffff80" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis 
              dataKey="especie" 
              type="category" 
              stroke="#ffffff" 
              fontSize={14} 
              width={100} 
              tickLine={false} 
              axisLine={false} 
              interval={0} 
              style={{ textTransform: 'capitalize' }}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
              itemStyle={{ color: '#fff', fontWeight: 'bold' }}
              formatter={(value) => [`${value}`, '']}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar dataKey="RAI Bruto" fill="#1e3a8a" radius={[0, 4, 4, 0]} barSize={12} />
            <Bar dataKey="RAI Estadístico" fill="#f97316" radius={[0, 4, 4, 0]} barSize={12} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
