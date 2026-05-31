import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import datosOcupacion from '../../data/datosOcupacion.json';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#0f172a]/95 border border-white/10 p-4 rounded-xl shadow-2xl">
        <p className="text-white font-bold mb-2 border-b border-white/10 pb-2 capitalize">{data.especie}</p>
        <p className="text-[#115f75] font-bold mb-1">
          Ocupación Psi (ψ): <span className="text-white">{data.ocupacion_psi}</span>
        </p>
        <div className="mt-2 text-sm">
          <p className="text-gray-400 font-semibold mb-1">Análisis:</p>
          <p className="text-white leading-relaxed max-w-[200px]">
            {data.interpretacion} (Detectado en {data.estaciones} estaciones)
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export const HabitatOccupancyChart = () => {
  // Sort the data by occupancy descending for better visualization
  const sortedData = [...datosOcupacion].sort((a, b) => b.ocupacion_psi - a.ocupacion_psi);

  return (
    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex-1 flex flex-col w-full min-w-[300px]">
      <h3 className="text-xl font-bold text-white mb-2">Ocupación del Hábitat (ψ)</h3>
      <p className="text-sm text-gray-400 mb-6">Proporción del área de estudio ocupada por cada especie.</p>
      
      <div className="w-full" style={{ height: Math.max(500, sortedData.length * 35) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={sortedData} 
            layout="vertical" 
            margin={{ top: 0, right: 30, left: 40, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" horizontal={true} vertical={false}/>
            <XAxis 
              type="number" 
              domain={[0, 1]} 
              stroke="#ffffff80" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(val) => val.toFixed(1)}
            />
            <YAxis 
              dataKey="especie" 
              type="category" 
              stroke="#ffffff" 
              fontSize={14} 
              width={110} 
              tickLine={false} 
              axisLine={false} 
              interval={0} 
              style={{ textTransform: 'capitalize' }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} formatter={() => <span className="text-white font-medium">Ocupación (Psi)</span>} />
            <Bar 
              dataKey="ocupacion_psi" 
              fill="#115f75" 
              barSize={10} 
              radius={[0, 4, 4, 0]} 
              animationDuration={1500}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
