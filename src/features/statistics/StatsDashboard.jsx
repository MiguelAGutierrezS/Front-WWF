import React from 'react';
import { FloatingPanel } from '../../components/layout/FloatingPanel';
import { useModalStore } from '../../store/useModalStore';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const data = [
  { name: 'Jaguar', count: 45 },
  { name: 'Tapir', count: 120 },
  { name: 'Puma', count: 25 },
  { name: 'Ocelot', count: 80 },
];

export const StatsDashboard = () => {
  const { closeModal } = useModalStore();

  return (
    <FloatingPanel 
      title="Global Statistics" 
      onClose={closeModal}
      className="h-full w-full"
    >
      <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
        
        <div className="grid grid-cols-2 gap-4">
           <div className="bg-white/5 p-4 rounded-xl border border-white/5">
              <p className="text-gray-400 text-xs">Total Cameras</p>
              <h4 className="text-2xl font-bold text-white">124</h4>
           </div>
           <div className="bg-white/5 p-4 rounded-xl border border-white/5">
              <p className="text-gray-400 text-xs">Total Detections</p>
              <h4 className="text-2xl font-bold text-primary">5,430</h4>
           </div>
        </div>

        <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex-1" style={{ minHeight: '300px' }}>
          <h4 className="text-sm font-medium text-white/80 mb-4">Species Detection Frequency</h4>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" vertical={false} />
                <XAxis dataKey="name" stroke="#ffffff80" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff80" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                />
                <Bar dataKey="count" fill="#00ff88" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <button className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border border-white/10 mt-auto">
          Export Report (PDF)
        </button>

      </div>
    </FloatingPanel>
  );
};
