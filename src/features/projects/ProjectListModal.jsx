import React from 'react';
import { FloatingPanel } from '../../components/layout/FloatingPanel';
import { useModalStore } from '../../store/useModalStore';
import { useMapStore } from '../../store/useMapStore';
import { Button } from '../../components/ui/Button';
import { AnimatePresence, motion } from 'framer-motion';
import { Camera, LayoutDashboard, ChevronRight, ChevronLeft, Map as MapIcon } from 'lucide-react';

export const ProjectListModal = () => {
  const { openModal, closeModal } = useModalStore();
  const setActiveProject = useMapStore((state) => state.setActiveProject);
  const activeProjectId = useMapStore((state) => state.activeProjectId);
  const cameraStations = useMapStore((state) => state.cameraStations);
  const projects = useMapStore((state) => state.projects);
  const users = useMapStore((state) => state.users);
  const species = useMapStore((state) => state.species);

  const handleSelectProject = (id) => {
    setActiveProject(activeProjectId === id ? null : id);
  };

  const handleViewMore = (proj) => {
    openModal('projectGiant', proj);
  };

  return (
    <FloatingPanel 
      className={`transition-all duration-300 p-4 ${activeProjectId ? 'w-[500px]' : 'w-[400px]'}`}
    >
      {!activeProjectId && (
        <div className="-mt-4 -mx-4 mb-2 p-5 bg-gradient-to-r from-black/80 to-black/40 border-b border-white/10 shrink-0 flex justify-between items-start rounded-t-2xl">
          <div>
            <h3 className="text-base font-black text-[#00ff88] uppercase tracking-widest flex items-center gap-2">
              <MapIcon className="w-5 h-5" />
              Tus Proyectos
            </h3>
            <p className="text-xs text-gray-400 mt-1 font-medium">
              Selecciona un proyecto para explorar sus cámaras.
            </p>
          </div>
          <button 
            onClick={closeModal}
            className="text-white/40 hover:text-red-400 bg-white/5 hover:bg-red-500/10 p-2 rounded-full transition-colors cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
      )}

      <div className="space-y-4 max-h-[55vh] overflow-y-auto custom-scrollbar pr-2 flex-1">
        {projects.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-8">No hay proyectos registrados.</p>
        )}

        {projects.map((proj) => {
          const isActive = activeProjectId === proj.id;
          if (activeProjectId && !isActive) return null;

          // Calcular datos en vivo de la base de datos
          const projectCameras = cameraStations.filter(c => c.project_id === proj.id);
          const cameraIds = projectCameras.map(c => c.id);
          const projectSightings = species.filter(s => cameraIds.includes(s.station_id));
          const investigator = users.find(u => u.id === proj.user_id);

          return (
            <div 
              key={proj.id}
              onClick={() => !isActive && handleSelectProject(proj.id)}
              className={`p-4 rounded-xl border transition-all duration-300 ${
                isActive 
                  ? 'bg-black/40 border-white/20 cursor-default shadow-lg' 
                  : 'bg-white/5 border-white/10 hover:bg-[#1a1a1a] hover:scale-[1.02] cursor-pointer'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${isActive ? 'bg-[#00ff88]/20 text-[#00ff88]' : 'bg-white/5 text-gray-400'}`}>
                  <LayoutDashboard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className={`font-extrabold transition-all duration-300 ${isActive ? 'text-xl text-[#00ff88]' : 'text-lg text-white'}`}>{proj.title}</h4>
                  {!isActive && (
                    <div className="text-xs font-bold text-gray-400 flex items-center gap-1 mt-1">
                      <Camera className="w-3 h-3" />
                      {projectCameras.length} cámaras
                    </div>
                  )}
                </div>
              </div>
              
              <p className={`text-gray-400 transition-all duration-300 ${isActive ? 'text-sm mt-3 mb-4' : 'text-xs line-clamp-2'}`}>{proj.description}</p>
              
              <AnimatePresence initial={false}>
                {isActive && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="pt-2 border-t border-white/10 mt-2">
                      <div className="grid grid-cols-2 gap-2 mb-5">
                        <div className="bg-black/40 rounded-xl p-3 border border-white/5 shadow-inner">
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Cámaras Instaladas</p>
                          <p className="text-xl font-black text-white">{projectCameras.length}</p>
                        </div>
                        <div className="bg-black/40 rounded-xl p-3 border border-white/5 shadow-inner">
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Estado</p>
                          <p className="text-sm font-bold text-blue-400">{proj.status}</p>
                        </div>
                        <div className="col-span-2 bg-black/40 rounded-xl p-3 border border-white/5 shadow-inner">
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Investigador Principal</p>
                          <p className="text-sm font-bold text-white/90">{investigator?.full_name || 'No asignado'}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <Button variant="secondary" onClick={(e) => { e.stopPropagation(); handleSelectProject(proj.id); }} className="flex-1 cursor-pointer py-3 text-sm font-bold bg-white/5 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] flex justify-center items-center gap-2">
                          <ChevronLeft className="w-4 h-4" />
                          Atrás
                        </Button>
                        <Button variant="primary" onClick={(e) => { e.stopPropagation(); handleViewMore(proj); }} className="flex-[2] cursor-pointer py-3 bg-[#00ff88] hover:bg-green-400 text-black text-sm font-extrabold shadow-[0_0_15px_rgba(0,255,136,0.3)] transition-all duration-300 hover:scale-[1.02] flex justify-center items-center gap-2">
                          Panel Completo
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </FloatingPanel>
  );
};
