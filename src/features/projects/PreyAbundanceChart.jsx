import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import datosPresasJaguar from '../../data/datosPresasJaguar.json';

export const PreyAbundanceChart = () => {
  // Aplicamos .reverse() para que el primer elemento (más abundante) quede arriba
  const chartData = useMemo(() => {
    return [...datosPresasJaguar].reverse();
  }, []);

  return (
    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex-1 flex flex-col w-full min-w-[300px]">
      <h3 className="text-base font-bold text-white mb-1">Abundancia de Presas (Jaguar)</h3>
      <p className="text-xs text-gray-400 mb-4">Comparativa entre eventos en bruto y eventos estadísticos (independientes).</p>
      
      <div className="w-full" style={{ height: Math.max(300, chartData.length * 35) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={chartData} 
            layout="vertical" 
            margin={{ top: 0, right: 30, left: 40, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" horizontal={true} vertical={false}/>
            <XAxis 
              type="number" 
              stroke="#ffffff80" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis 
              dataKey="presa" 
              type="category" 
              stroke="#ffffff" 
              fontSize={10} 
              width={100} 
              tickLine={false} 
              axisLine={false} 
              interval={0} 
              style={{ textTransform: 'capitalize' }}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
              itemStyle={{ color: '#fff', fontWeight: 'bold' }}
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} formatter={(value) => <span className="text-white text-xs font-medium capitalize">{value}</span>} />
            <Bar dataKey="eventos_bruto" name="Bruto" fill="#1f497d" radius={[0, 4, 4, 0]} barSize={10} animationDuration={1500} />
            <Bar dataKey="eventos_estadistico" name="Estadístico" fill="#e46c0a" radius={[0, 4, 4, 0]} barSize={10} animationDuration={1500} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
