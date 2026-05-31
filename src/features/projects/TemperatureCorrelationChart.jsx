import React from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import datosTemperatura from '../../data/datosTemperatura.json';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#0f172a]/95 border border-white/10 p-3 rounded-xl shadow-2xl min-w-[200px]">
        <p className="text-white font-bold mb-1 border-b border-white/10 pb-1 text-xs">
          {data.fecha}
        </p>
        <div className="flex flex-col gap-1 text-xs">
          <p className="text-gray-300">
            Temperatura: <span className="text-[#0ea5e9] font-bold">{data.temp_media} °C</span>
          </p>
          <p className="text-gray-300">
            Detecciones: <span className="text-white font-bold">{data.detecciones_totales}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export const TemperatureCorrelationChart = () => {
  return (
    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex-1 flex flex-col w-full min-w-[300px]">
      <h3 className="text-base font-bold text-white mb-1">Temperatura vs Actividad</h3>
      <p className="text-xs text-gray-400 mb-4">Correlación entre la temperatura media diaria y la frecuencia de apariciones.</p>
      
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" />
            <XAxis 
              type="number" 
              dataKey="temp_media" 
              name="Temperatura" 
              unit="°C" 
              domain={['dataMin - 1', 'dataMax + 1']}
              stroke="#ffffff80" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(val) => `${val}°C`}
            />
            <YAxis 
              type="number" 
              dataKey="detecciones_totales" 
              name="Detecciones" 
              domain={[0, 30]}
              stroke="#ffffff80" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.2)' }} />
            <Scatter name="Actividad" data={datosTemperatura} fill="#0ea5e9">
              {datosTemperatura.map((entry, index) => (
                <Cell key={`cell-${index}`} fill="#0ea5e9" />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
