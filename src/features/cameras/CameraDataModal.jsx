import React, { useState, useMemo } from 'react';
import { FloatingPanel } from '../../components/layout/FloatingPanel';
import { useModalStore } from '../../store/useModalStore';
import { useMapStore } from '../../store/useMapStore';
import { useUserStore } from '../../store/useUserStore';
import { useProjectStore } from '../../store/useProjectStore';
import { species } from '../../data/mockDatabase';
import { ChevronDown, ChevronUp, Image as ImageIcon } from 'lucide-react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from 'recharts';

export const CameraDataModal = () => {
  const { modalData, closeModal } = useModalStore();
  const users = useUserStore(state => state.users);
  const projects = useProjectStore(state => state.projects);
  const mapSpecies = useMapStore(state => state.species);
  const allSpecies = (mapSpecies && mapSpecies.length > 0) ? mapSpecies : species;

  const [isInfoOpen, setIsInfoOpen] = useState(true);
  const [isTableOpen, setIsTableOpen] = useState(false);

  // Calcular datos
  const { project, investigator, stationSightings, uniqueSpecies, frequencyData } = useMemo(() => {
    if (!modalData) return {};
    
    const project = projects.find(p => p.id === modalData.project_id);
    const investigator = users.find(u => u.id === project?.user_id);
    
    const stationSightings = allSpecies
      .filter(s => s.station_id === modalData.id)
      .sort((a, b) => new Date(b.detection_timestamp) - new Date(a.detection_timestamp));

    const speciesCounts = {};
    stationSightings.forEach(s => {
      speciesCounts[s.common_name] = (speciesCounts[s.common_name] || 0) + 1;
    });

    const frequencyData = Object.entries(speciesCounts)
      .map(([name, count]) => ({ name, value: count }))
      .sort((a, b) => b.value - a.value);

    return { project, investigator, stationSightings, uniqueSpecies: Object.keys(speciesCounts).length, frequencyData };
  }, [modalData, users, projects, allSpecies]);

  if (!modalData) return null;

  return (
    <FloatingPanel 
      title={null} 
      className="w-[550px] p-0 overflow-hidden" 
    >
      {/* Custom Header (Resaltado Gris Oscuro) */}
      <div className="bg-[#1f2937] border-b border-white/10 p-3 flex justify-between items-center relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-600/20 to-transparent pointer-events-none"></div>
        <div className="relative z-10">
          <p className="text-primary font-bold tracking-widest text-[10px] mb-1 uppercase">
            {project?.title || 'Proyecto Desconocido'}
          </p>
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            Estación: {modalData.station_code} ({modalData.camera_brand})
          </h2>
        </div>
        <button 
          onClick={closeModal}
          className="relative z-10 text-white/50 hover:text-white transition-all bg-black/20 hover:bg-black/40 p-2 rounded-full cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>

      <div className="p-3 space-y-3 max-h-[80vh] overflow-y-auto custom-scrollbar">
        
        {/* Subtitulo Investigador */}
        <div className="bg-black/40 border border-white/5 rounded-lg p-2 flex justify-between items-center">
          <p className="text-sm text-white/90">
            <span className="font-semibold text-primary">Inv:</span> {investigator?.full_name || 'No asignado'}
          </p>
          <p className="text-gray-400 text-[10px]">
            {modalData.latitude.toFixed(4)}, {modalData.longitude.toFixed(4)}
          </p>
        </div>

        {/* ACORDEON 1: Información General */}
        <div className="border border-white/10 rounded-xl overflow-hidden bg-black/20">
          <button 
            onClick={() => setIsInfoOpen(!isInfoOpen)}
            className="w-full p-2 flex justify-between items-center hover:bg-white/5 transition-colors cursor-pointer"
          >
            <h3 className="text-base font-bold text-white">Información General</h3>
            {isInfoOpen ? <ChevronUp className="w-4 h-4 text-white/50" /> : <ChevronDown className="w-4 h-4 text-white/50" />}
          </button>
          
          {isInfoOpen && (
            <div className="p-2 border-t border-white/10 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-white/5 border border-white/5 rounded-xl p-2 text-center flex flex-col justify-center">
                  <h4 className="text-gray-400 text-xs mb-1">Cámaras</h4>
                  <p className="text-xl font-extrabold text-white">1</p>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-xl p-2 text-center flex flex-col justify-center">
                  <h4 className="text-gray-400 text-xs mb-1">Avistamientos</h4>
                  <p className="text-xl font-extrabold text-white">{stationSightings.length}</p>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-xl p-2 text-center flex flex-col justify-center">
                  <h4 className="text-gray-400 text-xs mb-1">Especies</h4>
                  <p className="text-xl font-extrabold text-primary">{uniqueSpecies}</p>
                </div>
              </div>

              {frequencyData.length > 0 && (
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <h4 className="text-sm font-bold text-white mb-2">Frecuencia (Esta cámara)</h4>
                  <div className="w-full" style={{ height: Math.max(150, frequencyData.length * 30) }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={frequencyData} layout="vertical" margin={{ top: 0, right: 30, left: 30, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" horizontal={true} vertical={false}/>
                        <XAxis type="number" stroke="#ffffff80" fontSize={10} allowDecimals={false} />
                        <YAxis dataKey="name" type="category" stroke="#ffffff" fontSize={10} width={80} tickLine={false} axisLine={false} interval={0} />
                        <Tooltip 
                          formatter={(value) => [`${value} avistamientos`, 'Total']}
                          contentStyle={{ backgroundColor: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        />
                        <Bar dataKey="value" fill="#00ff88" radius={[0, 4, 4, 0]} barSize={12} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ACORDEON 2: Registros de Avistamiento */}
        <div className="border border-white/10 rounded-xl overflow-hidden bg-black/20">
          <button 
            onClick={() => setIsTableOpen(!isTableOpen)}
            className="w-full p-2 flex justify-between items-center hover:bg-white/5 transition-colors cursor-pointer"
          >
            <h3 className="text-base font-bold text-white">Registros</h3>
            {isTableOpen ? <ChevronUp className="w-4 h-4 text-white/50" /> : <ChevronDown className="w-4 h-4 text-white/50" />}
          </button>
          
          {isTableOpen && (
            <div className="p-2 border-t border-white/10 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="bg-black/40 rounded-xl border border-white/5 overflow-hidden">
                <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#1f2937] text-white text-xs sticky top-0 z-10 shadow-md">
                      <tr>
                        <th className="px-2 py-2">Animal</th>
                        <th className="px-2 py-2">Fecha</th>
                        <th className="px-2 py-2">Hora</th>
                        <th className="px-2 py-2 text-center">Img</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {stationSightings.map((d, i) => {
                        const dateObj = new Date(d.detection_timestamp);
                        return (
                          <tr key={i} className="hover:bg-white/10 transition-colors cursor-pointer group">
                            <td className="px-2 py-2 font-bold text-primary group-hover:text-green-400 transition-colors">{d.common_name}</td>
                            <td className="px-2 py-2 text-gray-300">{dateObj.toLocaleDateString()}</td>
                            <td className="px-2 py-2 text-gray-300">
                              {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="px-2 py-2 text-center">
                              {d.image_url || d.url_img ? (
                                <a 
                                  href={d.image_url || d.url_img} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="inline-flex items-center justify-center p-1 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-full transition-colors"
                                  title="Ver imagen capturada"
                                >
                                  <ImageIcon className="w-4 h-4" />
                                </a>
                              ) : (
                                <span className="text-gray-500 text-xs italic">-</span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                      {stationSightings.length === 0 && (
                        <tr>
                          <td colSpan="4" className="px-2 py-2 text-center text-gray-400">No hay detecciones recientes.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </FloatingPanel>
  );
};
