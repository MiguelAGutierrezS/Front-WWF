import React, { useState, useMemo } from 'react';
import { FloatingPanel } from '../../components/layout/FloatingPanel';
import { useModalStore } from '../../store/useModalStore';
import { useMapStore } from '../../store/useMapStore';
import { useUserStore } from '../../store/useUserStore';
import { useProjectStore } from '../../store/useProjectStore';
import { species } from '../../data/mockDatabase';
import { ChevronDown, ChevronUp, Image as ImageIcon, MapPin, User, Activity, Camera, Eye, List as ListIcon } from 'lucide-react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from 'recharts';
import { AnimatePresence, motion } from 'framer-motion';

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
      {/* Custom Header */}
      <div className="bg-gradient-to-r from-[#00ff88]/10 to-transparent border-b border-white/10 p-5 flex justify-between items-start relative overflow-hidden">
        <div className="absolute -right-10 -top-10 bg-[#00ff88]/20 w-32 h-32 blur-3xl rounded-full pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-[#00ff88] text-black text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider shadow-[0_0_10px_rgba(0,255,136,0.5)]">
              Activa
            </div>
            <p className="text-[#00ff88] font-bold tracking-widest text-[10px] uppercase">
              {project?.title || 'Proyecto Desconocido'}
            </p>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Camera className="w-6 h-6 text-white/80" />
            {modalData.station_code}
          </h2>
          <p className="text-sm text-gray-400 mt-1">{modalData.camera_brand} / {modalData.camera_model}</p>
        </div>
        <button 
          onClick={closeModal}
          className="relative z-10 text-white/50 hover:text-red-400 transition-all bg-white/5 hover:bg-white/10 p-2 rounded-full cursor-pointer shadow-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>

      <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
        
        {/* Info badges */}
        <div className="flex flex-wrap gap-2">
          <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 flex items-center gap-2 grow">
            <User className="w-4 h-4 text-blue-400" />
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Investigador</span>
              <span className="text-sm font-semibold text-white/90 truncate">{investigator?.full_name || 'No asignado'}</span>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 flex items-center gap-2 grow">
            <MapPin className="w-4 h-4 text-red-400" />
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Coordenadas</span>
              <span className="text-sm font-semibold text-white/90 font-mono">
                {modalData.latitude.toFixed(4)}, {modalData.longitude.toFixed(4)}
              </span>
            </div>
          </div>
        </div>

        {/* ACORDEON 1: Información General */}
        <div className="border border-white/10 rounded-2xl overflow-hidden bg-black/40 shadow-inner">
          <button 
            onClick={() => setIsInfoOpen(!isInfoOpen)}
            className="w-full p-4 flex justify-between items-center hover:bg-white/5 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#00ff88]" />
              <h3 className="text-base font-extrabold text-white group-hover:text-[#00ff88] transition-colors">Resumen de Actividad</h3>
            </div>
            {isInfoOpen ? <ChevronUp className="w-5 h-5 text-[#00ff88]" /> : <ChevronDown className="w-5 h-5 text-gray-500 group-hover:text-[#00ff88]" />}
          </button>
          
          <AnimatePresence initial={false}>
            {isInfoOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} // Smooth spring-like ease
                className="overflow-hidden"
              >
                <div className="p-4 pt-0 border-t border-white/5">
                  <div className="grid grid-cols-3 gap-3 mb-4 mt-2">
                    <div className="bg-gradient-to-br from-white/10 to-transparent border border-white/10 rounded-xl p-3 text-center flex flex-col justify-center shadow-lg">
                      <h4 className="text-gray-400 text-[10px] font-bold uppercase mb-1 tracking-wider">Cámaras</h4>
                      <p className="text-2xl font-black text-white">1</p>
                    </div>
                    <div className="bg-gradient-to-br from-[#00ff88]/20 to-transparent border border-[#00ff88]/20 rounded-xl p-3 text-center flex flex-col justify-center shadow-[0_0_15px_rgba(0,255,136,0.1)]">
                      <h4 className="text-[#00ff88] text-[10px] font-bold uppercase mb-1 tracking-wider">Avistamientos</h4>
                      <p className="text-2xl font-black text-[#00ff88]">{stationSightings.length}</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500/20 to-transparent border border-blue-500/20 rounded-xl p-3 text-center flex flex-col justify-center shadow-lg">
                      <h4 className="text-blue-400 text-[10px] font-bold uppercase mb-1 tracking-wider">Especies</h4>
                      <p className="text-2xl font-black text-blue-400">{uniqueSpecies}</p>
                    </div>
                  </div>

                  {frequencyData.length > 0 && (
                    <div className="bg-black/50 p-4 rounded-xl border border-white/5">
                      <h4 className="text-sm font-bold text-gray-300 mb-4 flex items-center gap-2">
                        <Eye className="w-4 h-4 text-gray-500" />
                        Frecuencia de Especies
                      </h4>
                      <div className="w-full" style={{ height: Math.max(150, frequencyData.length * 35) }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={frequencyData} layout="vertical" margin={{ top: 0, right: 30, left: 30, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" horizontal={true} vertical={false}/>
                            <XAxis type="number" stroke="#ffffff80" fontSize={10} allowDecimals={false} />
                            <YAxis dataKey="name" type="category" stroke="#ffffff" fontSize={11} width={90} tickLine={false} axisLine={false} interval={0} fontWeight={600} />
                            <Tooltip 
                              formatter={(value) => [`${value} avistamientos`, 'Total']}
                              contentStyle={{ backgroundColor: 'rgba(15,23,42,0.95)', border: '1px solid rgba(0,255,136,0.3)', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
                              itemStyle={{ color: '#00ff88', fontWeight: 'bold' }}
                            />
                            <Bar dataKey="value" fill="#00ff88" radius={[0, 6, 6, 0]} barSize={16} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ACORDEON 2: Registros de Avistamiento */}
        <div className="border border-white/10 rounded-2xl overflow-hidden bg-black/40 shadow-inner">
          <button 
            onClick={() => setIsTableOpen(!isTableOpen)}
            className="w-full p-4 flex justify-between items-center hover:bg-white/5 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <ListIcon className="w-5 h-5 text-blue-400" />
              <h3 className="text-base font-extrabold text-white group-hover:text-blue-400 transition-colors">Registros de Fauna</h3>
            </div>
            {isTableOpen ? <ChevronUp className="w-5 h-5 text-blue-400" /> : <ChevronDown className="w-5 h-5 text-gray-500 group-hover:text-blue-400" />}
          </button>
          
          <AnimatePresence initial={false}>
            {isTableOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="p-4 pt-4 border-t border-white/5">
                  <div className="bg-black/60 rounded-xl border border-white/10 overflow-hidden shadow-lg">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#1f2937] text-gray-300 text-[10px] uppercase tracking-wider shadow-md table w-full table-fixed">
                        <tr>
                          <th className="px-4 py-3 font-bold w-[30%]">Animal</th>
                          <th className="px-4 py-3 font-bold w-[25%]">Fecha</th>
                          <th className="px-4 py-3 font-bold w-[25%]">Hora</th>
                          <th className="px-4 py-3 font-bold text-center w-[20%]">Img</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 block max-h-[250px] overflow-y-auto custom-scrollbar w-full">
                        {stationSightings.map((d, i) => {
                          const dateObj = new Date(d.detection_timestamp);
                          return (
                            <tr key={i} className="hover:bg-white/10 transition-colors cursor-pointer group table w-full table-fixed">
                              <td className="px-4 py-3 font-bold text-blue-300 group-hover:text-white transition-colors w-[30%] truncate">{d.common_name}</td>
                              <td className="px-4 py-3 text-gray-400 font-mono w-[25%] truncate">{dateObj.toLocaleDateString()}</td>
                              <td className="px-4 py-3 text-gray-400 font-mono w-[25%] truncate">
                                {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="px-4 py-3 text-center w-[20%]">
                                {d.image_url || d.url_img ? (
                                  <a 
                                    href={d.image_url || d.url_img} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="inline-flex items-center justify-center p-1.5 text-blue-400 hover:text-white hover:bg-blue-500 rounded-lg transition-colors shadow-md"
                                    title="Ver imagen capturada"
                                  >
                                    <ImageIcon className="w-4 h-4" />
                                  </a>
                                ) : (
                                  <span className="text-gray-600 text-xs italic">-</span>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                        {stationSightings.length === 0 && (
                          <tr className="table w-full table-fixed">
                            <td colSpan="4" className="px-4 py-8 text-center text-gray-500 font-semibold bg-black/20 w-full">
                              No hay detecciones recientes.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </FloatingPanel>
  );
};
