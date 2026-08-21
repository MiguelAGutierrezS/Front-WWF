import React, { useState, useMemo } from 'react';
import { FloatingPanel } from '../../components/layout/FloatingPanel';
import { useModalStore } from '../../store/useModalStore';
import { useMapStore } from '../../store/useMapStore';
import { useUserStore } from '../../store/useUserStore';
import { useProjectStore } from '../../store/useProjectStore';
import { species } from '../../data/mockDatabase';
import { ChevronDown, ChevronUp, Image as ImageIcon, MapPin, User, Activity, Camera, Eye, List as ListIcon, Link2, Unlink, Plus, Calendar, ShieldCheck } from 'lucide-react';
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
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  
  // Taxonomical Chart State ('species', 'family', 'genus')
  const [activeChart, setActiveChart] = useState('species');

  // N:M — Mock: projects this station belongs to
  const [linkedProjectIds, setLinkedProjectIds] = useState(() => {
    if (!modalData) return [];
    const parentProject = projects.find(p => p.id === modalData.project_id);
    return parentProject ? [parentProject.id] : [];
  });

  const linkedProjects = projects.filter(p => linkedProjectIds.includes(p.id));
  const availableProjects = projects.filter(p => !linkedProjectIds.includes(p.id));

  const handleAssociateProject = (projectId) => {
    setLinkedProjectIds(prev => [...prev, projectId]);
    setShowProjectDropdown(false);
  };

  const handleDisassociateProject = (projectId) => {
    setLinkedProjectIds(prev => prev.filter(id => id !== projectId));
  };

  // Calcular datos
  const { 
    project, 
    investigator, 
    stationSightings, 
    uniqueSpecies, 
    frequencyData,
    frequencyByFamily,
    frequencyByGenus 
  } = useMemo(() => {
    if (!modalData) return {};
    
    const project = projects.find(p => p.id === modalData.project_id);
    const investigator = users.find(u => u.id === project?.user_id);
    
    const stationSightings = allSpecies
      .filter(s => s.station_id === modalData.id)
      .sort((a, b) => new Date(b.detection_timestamp) - new Date(a.detection_timestamp));

    const speciesCounts = {};
    const familyCounts = {};
    const genusCounts = {};

    stationSightings.forEach(s => {
      speciesCounts[s.common_name] = (speciesCounts[s.common_name] || 0) + 1;
      familyCounts[s.family || 'Desconocido'] = (familyCounts[s.family || 'Desconocido'] || 0) + 1;
      genusCounts[s.genus || 'Desconocido'] = (genusCounts[s.genus || 'Desconocido'] || 0) + 1;
    });

    const frequencyData = Object.entries(speciesCounts)
      .map(([name, count]) => ({ name, value: count }))
      .sort((a, b) => b.value - a.value);
      
    const frequencyByFamily = Object.entries(familyCounts)
      .map(([name, count]) => ({ name, value: count }))
      .sort((a, b) => b.value - a.value);
      
    const frequencyByGenus = Object.entries(genusCounts)
      .map(([name, count]) => ({ name, value: count }))
      .sort((a, b) => b.value - a.value);

    return { 
      project, 
      investigator, 
      stationSightings, 
      uniqueSpecies: Object.keys(speciesCounts).length, 
      frequencyData,
      frequencyByFamily,
      frequencyByGenus
    };
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
            <div className={`text-black text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider ${modalData.status === 'active' ? 'bg-[#00ff88] shadow-[0_0_10px_rgba(0,255,136,0.5)]' : 'bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.5)]'}`}>
              {modalData.status === 'active' ? 'Activa' : 'Retirada'}
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
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-400" />
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Investigador</span>
              <span className="text-sm font-semibold text-white/90 truncate">{investigator?.full_name || 'No asignado'}</span>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-red-400" />
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Coordenadas</span>
              <span className="text-sm font-semibold text-white/90 font-mono truncate">
                {modalData.latitude.toFixed(4)}, {modalData.longitude.toFixed(4)}
              </span>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-yellow-400" />
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Instalada</span>
              <span className="text-sm font-semibold text-white/90 font-mono truncate">{modalData.deployment_date || 'Desconocida'}</span>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 flex items-center gap-2">
            <ShieldCheck className={`w-4 h-4 ${modalData.status === 'active' ? 'text-[#00ff88]' : 'text-red-400'}`} />
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Estado</span>
              <span className={`text-sm font-semibold truncate ${modalData.status === 'active' ? 'text-[#00ff88]' : 'text-red-400'}`}>
                {modalData.status === 'active' ? 'Operativa' : 'Desactivada'}
              </span>
            </div>
          </div>
        </div>

        {/* ACORDEON: Proyectos Asociados (N:M) */}
        <div className="border border-white/10 rounded-2xl overflow-hidden bg-black/40 shadow-inner">
          <button 
            onClick={() => setIsProjectsOpen(!isProjectsOpen)}
            className="w-full p-4 flex justify-between items-center hover:bg-white/5 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <Link2 className="w-5 h-5 text-purple-400" />
              <h3 className="text-base font-extrabold text-white group-hover:text-purple-400 transition-colors">Proyectos Asociados</h3>
              <span className="text-[10px] font-black text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">{linkedProjects.length}</span>
            </div>
            {isProjectsOpen ? <ChevronUp className="w-5 h-5 text-purple-400" /> : <ChevronDown className="w-5 h-5 text-gray-500 group-hover:text-purple-400" />}
          </button>
          
          <AnimatePresence initial={false}>
            {isProjectsOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="p-4 pt-0 border-t border-white/5 space-y-3">
                  {/* Lista de proyectos asociados */}
                  <div className="space-y-2 mt-3">
                    {linkedProjects.map(proj => (
                      <div key={proj.id} className="flex items-center justify-between bg-white/5 hover:bg-white/10 rounded-xl px-4 py-3 border border-white/5 transition-all group">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate">{proj.title}</p>
                          <p className="text-[10px] text-gray-500 truncate">{proj.description}</p>
                        </div>
                        <button 
                          type="button"
                          onClick={() => handleDisassociateProject(proj.id)}
                          className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 hover:bg-red-500/20 p-1.5 rounded-lg transition-all cursor-pointer shrink-0 ml-2"
                          title="Quitar de este proyecto"
                        >
                          <Unlink className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {linkedProjects.length === 0 && (
                      <div className="text-center py-4 text-gray-500 text-sm">Esta estación no pertenece a ningún proyecto.</div>
                    )}
                  </div>
                  
                  {/* Dropdown para asociar a otro proyecto */}
                  <div className="relative">
                    <button 
                      type="button"
                      onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                      className="w-full flex items-center justify-center gap-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 hover:border-purple-500/40 rounded-xl px-4 py-3 font-bold text-xs uppercase tracking-wider cursor-pointer transition-all hover:scale-[1.02]"
                    >
                      <Plus className="w-4 h-4" />
                      Asociar a Proyecto
                      <ChevronDown className={`w-4 h-4 transition-transform ${showProjectDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {showProjectDropdown && (
                      <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl max-h-[180px] overflow-y-auto custom-scrollbar z-50">
                        {availableProjects.length > 0 ? availableProjects.map(proj => (
                          <button
                            key={proj.id}
                            type="button"
                            onClick={() => handleAssociateProject(proj.id)}
                            className="w-full text-left px-4 py-3 hover:bg-purple-500/10 transition-colors cursor-pointer flex flex-col border-b border-white/5 last:border-0"
                          >
                            <p className="text-sm font-bold text-white">{proj.title}</p>
                            <p className="text-[10px] text-gray-500 truncate">{proj.description}</p>
                          </button>
                        )) : (
                          <div className="px-4 py-4 text-gray-500 text-sm text-center">Ya está en todos los proyectos disponibles.</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                        <h4 className="text-sm font-bold text-gray-300 flex items-center gap-2">
                          <Eye className="w-4 h-4 text-gray-500" />
                          Frecuencia
                        </h4>
                        <div className="flex bg-white/5 p-1 rounded-lg">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setActiveChart('species'); }}
                            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-colors ${activeChart === 'species' ? 'bg-[#00ff88] text-black shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                          >
                            Especies
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setActiveChart('family'); }}
                            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-colors ${activeChart === 'family' ? 'bg-[#00ff88] text-black shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                          >
                            Familia
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setActiveChart('genus'); }}
                            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-colors ${activeChart === 'genus' ? 'bg-[#00ff88] text-black shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                          >
                            Género
                          </button>
                        </div>
                      </div>
                      
                      <div className="w-full" style={{ height: Math.max(150, (activeChart === 'species' ? frequencyData : activeChart === 'family' ? frequencyByFamily : frequencyByGenus).length * 35) }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart 
                            data={activeChart === 'species' ? frequencyData : activeChart === 'family' ? frequencyByFamily : frequencyByGenus} 
                            layout="vertical" 
                            margin={{ top: 0, right: 30, left: 30, bottom: 0 }}
                          >
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
                      <thead className="bg-gradient-to-r from-[#1f2937] to-transparent text-gray-300 text-[10px] uppercase tracking-wider shadow-md table w-full table-fixed border-b border-white/10">
                        <tr>
                          <th className="px-4 py-3 font-bold w-[30%]">Especie</th>
                          <th className="px-4 py-3 font-bold w-[25%] hidden sm:table-cell">Taxonomía</th>
                          <th className="px-4 py-3 font-bold w-[20%]">Fecha</th>
                          <th className="px-4 py-3 font-bold w-[15%] text-center">Score</th>
                          <th className="px-4 py-3 font-bold text-center w-[10%]">Img</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 block max-h-[250px] overflow-y-auto custom-scrollbar w-full">
                        {stationSightings.map((det, idx) => {
                          const dateObj = new Date(det.detection_timestamp);
                          return (
                            <tr key={idx} className="hover:bg-blue-500/10 transition-colors cursor-pointer group table w-full table-fixed relative">
                              <td className="px-4 py-3 font-bold text-blue-300 group-hover:text-white transition-colors w-[30%] truncate">
                                <div className="flex items-center gap-2">
                                  {det.is_verified && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.8)] shrink-0" title="Verificado" />
                                  )}
                                  <div className="truncate">
                                    <div className="truncate">{det.common_name}</div>
                                    <div className="text-[9px] text-gray-500 font-normal italic truncate mt-0.5" title={det.scientific_name}>
                                      {det.scientific_name || 'N/A'}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-gray-400 font-medium w-[25%] hidden sm:table-cell truncate">
                                <div className="text-[10px] text-gray-300 truncate">{det.family || '-'}</div>
                                <div className="text-[9px] text-gray-500 truncate">{det.genus || '-'}</div>
                              </td>
                              <td className="px-4 py-3 text-gray-400 w-[20%] truncate">
                                <div className="text-[10px] text-gray-300 font-mono">{dateObj.toLocaleDateString()}</div>
                                <div className="text-[9px] text-gray-500 font-mono">{dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                              </td>
                              <td className="px-4 py-3 text-center w-[15%]">
                                <span className="bg-[#00ff88]/10 text-[#00ff88] px-2 py-0.5 rounded border border-[#00ff88]/20 font-bold text-[10px] shadow-[0_0_5px_rgba(0,255,136,0.1)]">
                                  {Math.round((det.confidence_score || 0) * 100)}%
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center w-[10%]">
                                {det.image_url || det.url_img ? (
                                  <a 
                                    href={det.image_url || det.url_img} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="inline-flex items-center justify-center p-1.5 text-blue-400 hover:text-white hover:bg-blue-500 rounded-lg transition-all shadow-md hover:shadow-[0_0_10px_rgba(59,130,246,0.5)] hover:scale-110"
                                    title="Ver foto original"
                                    onClick={(e) => e.stopPropagation()}
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
                            <td colSpan="5" className="px-4 py-8 text-center text-gray-500 font-semibold bg-black/20 w-full">
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
