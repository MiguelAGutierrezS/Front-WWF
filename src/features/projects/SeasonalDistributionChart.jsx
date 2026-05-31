import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import datosEstacionales from '../../data/datosEstacionales.json';

export const SeasonalDistributionChart = ({ defaultSpecies }) => {
  const [selectedSpecies, setSelectedSpecies] = useState(defaultSpecies || datosEstacionales[0].especie);

  const chartData = useMemo(() => {
    const data = datosEstacionales.find(d => d.especie === selectedSpecies);
    if (!data) return [];
    return [
      { mes: 'Ene', avistamientos: data.Ene },
      { mes: 'Feb', avistamientos: data.Feb },
      { mes: 'Mar', avistamientos: data.Mar },
      { mes: 'Abr', avistamientos: data.Abr }
    ];
  }, [selectedSpecies]);

  const maxValue = useMemo(() => {
    if (chartData.length === 0) return 10;
    const max = Math.max(...chartData.map(d => d.avistamientos));
    return max < 5 ? 5 : Math.ceil(max * 1.1);
  }, [chartData]);

  return (
    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex-1 flex flex-col w-full">
      <h3 className="text-base font-bold text-white mb-3">Distribución Estacional: <span className="text-primary capitalize">{selectedSpecies}</span></h3>
      
      <div className="flex flex-col md:flex-row gap-4 h-[320px]">
        {/* Sidebar */}
        <div className="w-full md:w-1/4 flex flex-col border border-white/10 rounded-xl overflow-hidden bg-black/40 shrink-0">
          <div className="p-2 bg-white/5 border-b border-white/10 font-bold text-xs text-gray-300">
            ESPECIES ({datosEstacionales.length})
          </div>
          <div className="overflow-y-auto custom-scrollbar flex-1">
            {datosEstacionales.map((item) => (
              <button
                key={item.especie}
                onClick={() => setSelectedSpecies(item.especie)}
                className={`w-full text-left px-3 py-2 text-xs capitalize transition-colors border-b border-white/5 last:border-0 cursor-pointer ${
                  selectedSpecies === item.especie 
                    ? 'bg-blue-500/20 text-blue-400 font-bold border-l-4 border-l-blue-500' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white border-l-4 border-l-transparent'
                }`}
              >
                {item.especie}
              </button>
            ))}
          </div>
        </div>

        {/* Chart Area */}
        <div className="w-full h-full relative bg-black/20 rounded-xl border border-white/10 p-3 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" vertical={false} />
              <XAxis dataKey="mes" stroke="#ffffff80" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis 
                domain={[0, maxValue]} 
                stroke="#ffffff80" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                allowDataOverflow={true}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                labelStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                itemStyle={{ color: '#fff' }}
                formatter={(value) => [`${value} avistamientos`, 'Registros']}
              />
              <Line 
                type="monotone" 
                dataKey="avistamientos" 
                stroke="#3b82f6" 
                strokeWidth={4} 
                dot={{ fill: '#000', stroke: '#3b82f6', strokeWidth: 3, r: 6 }} 
                activeDot={{ r: 8, fill: '#3b82f6' }}
                animationDuration={1000}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
