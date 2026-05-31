import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import datosAcumulacion from '../../data/datosAcumulacion.json';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#0f172a]/95 border border-white/10 p-4 rounded-xl shadow-2xl">
        <p className="text-white font-bold mb-2 border-b border-white/10 pb-2">{label}</p>
        <p className="text-green-400 font-bold mb-1">
          Acumulado: <span className="text-white">{data.acumulado_especies} especies</span>
        </p>
        <div className="mt-2 text-sm">
          <p className="text-gray-400 font-semibold mb-1">Nuevos descubrimientos:</p>
          <p className="text-white capitalize leading-relaxed max-w-[200px]">
            {data.nombres_incorporados}
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export const AccumulationCurveChart = () => {
  const chartData = datosAcumulacion.historial_acumulacion;

  return (
    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex-1 flex flex-col w-full">
      <h3 className="text-xl font-bold text-white mb-2">Curva de Acumulación de Especies</h3>
      <p className="text-sm text-gray-400 mb-6">Progresión histórica de nuevos descubrimientos de fauna.</p>
      
      <div className="w-full h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" vertical={false} />
            <XAxis 
              dataKey="fecha" 
              stroke="#ffffff80" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis 
              domain={[0, 25]} 
              stroke="#ffffff80" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              allowDataOverflow={true}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="stepAfter" 
              dataKey="acumulado_especies" 
              stroke="#22c55e" 
              strokeWidth={4} 
              dot={{ fill: '#000', stroke: '#22c55e', strokeWidth: 3, r: 5 }} 
              activeDot={{ r: 8, fill: '#22c55e', stroke: '#fff', strokeWidth: 2 }}
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
