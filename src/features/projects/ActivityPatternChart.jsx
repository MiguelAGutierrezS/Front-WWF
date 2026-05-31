import React, { useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import datosActividad from '../../data/datosActividad.json';

const COLORS = [
  '#3b82f6', '#f97316', '#22c55e', '#a855f7', '#ef4444', 
  '#eab308', '#06b6d4', '#ec4899', '#8b5cf6', '#14b8a6'
];

export const ActivityPatternChart = () => {
  // Extract all available species from the first object (excluding 'hora')
  const allSpecies = Object.keys(datosActividad[0]).filter(key => key !== 'hora').sort();
  
  const [activeSpecies, setActiveSpecies] = useState(['ocelote', 'jochi calucha']);

  const toggleSpecies = (species) => {
    setActiveSpecies(prev => 
      prev.includes(species) 
        ? prev.filter(s => s !== species)
        : [...prev, species]
    );
  };

  return (
    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex-1 flex flex-col w-full mt-6">
      <h3 className="text-xl font-bold text-white mb-4">Patrón de Actividad Diaria (Ciclo Circadiano)</h3>
      <p className="text-sm text-gray-400 mb-6">Analiza los periodos de actividad relativa a lo largo de 24 horas.</p>
      
      <div className="flex flex-col md:flex-row gap-6 h-[450px]">
        {/* Sidebar de Filtros */}
        <div className="w-full md:w-1/4 flex flex-col border border-white/10 rounded-xl overflow-hidden bg-black/40 shrink-0">
          <div className="p-3 bg-white/5 border-b border-white/10 font-bold text-sm text-gray-300">
            ESPECIES ({allSpecies.length})
          </div>
          <div className="overflow-y-auto custom-scrollbar flex-1 p-2 space-y-1">
            {allSpecies.map((species) => {
              const isActive = activeSpecies.includes(species);
              return (
                <label 
                  key={species} 
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                    isActive ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5'
                  }`}
                >
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={isActive}
                    onChange={() => toggleSpecies(species)}
                  />
                  <div className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
                    isActive ? 'bg-white border-white' : 'border-gray-500'
                  }`}>
                    {isActive && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="4"><path d="M20 6L9 17l-5-5"/></svg>}
                  </div>
                  <span className="capitalize text-sm truncate">{species}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Área del Gráfico */}
        <div className="w-full h-full relative bg-black/20 rounded-xl border border-white/10 p-4 flex-1">
          {activeSpecies.length === 0 ? (
            <div className="flex h-full items-center justify-center text-gray-500">
              Selecciona al menos una especie del panel izquierdo para visualizar su patrón.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={datosActividad} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" vertical={false} />
                <XAxis 
                  dataKey="hora" 
                  stroke="#ffffff80" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  domain={[0, 'auto']} 
                  stroke="#ffffff80" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ fontWeight: 'bold' }}
                  formatter={(value, name) => [`${value}%`, name.charAt(0).toUpperCase() + name.slice(1)]}
                  labelStyle={{ color: '#fff', marginBottom: '8px' }}
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                
                {activeSpecies.map((species, index) => (
                  <Line 
                    key={species}
                    type="monotone" 
                    dataKey={species} 
                    name={species}
                    stroke={COLORS[index % COLORS.length]} 
                    strokeWidth={3} 
                    dot={false}
                    activeDot={{ r: 6 }}
                    animationDuration={1000}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};
