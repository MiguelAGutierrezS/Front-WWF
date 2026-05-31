import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import datosGremios from '../../data/datosGremios.json';

const COLORS = ['#1e3a8a', '#f97316', '#22c55e', '#38bdf8']; // Azul oscuro, Naranja, Verde, Celeste

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
  const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontWeight="bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export const TrophicGuildChart = () => {
  return (
    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex-1 flex flex-col w-full min-w-[300px]">
      <h3 className="text-xl font-bold text-white mb-2 text-center">S (especies)</h3>
      <p className="text-sm text-gray-400 mb-4 text-center">Proporción de especies por Gremio Trófico</p>
      
      <div className="w-full h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={datosGremios}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={120}
              dataKey="s_especies"
              nameKey="gremio"
            >
              {datosGremios.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
              itemStyle={{ color: '#fff', fontWeight: 'bold' }}
              formatter={(value, name) => [`${value} especies`, name.charAt(0).toUpperCase() + name.slice(1)]}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }} 
              formatter={(value) => <span className="capitalize text-white font-medium">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
