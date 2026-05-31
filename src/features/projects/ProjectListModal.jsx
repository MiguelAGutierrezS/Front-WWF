import React from 'react';
import { FloatingPanel } from '../../components/layout/FloatingPanel';
import { useModalStore } from '../../store/useModalStore';
import { useMapStore } from '../../store/useMapStore';
import { Button } from '../../components/ui/Button';
import { projects, users, camera_stations, species } from '../../data/mockDatabase';

export const ProjectListModal = () => {
  const { openModal } = useModalStore();
  const setActiveProject = useMapStore((state) => state.setActiveProject);
  const activeProjectId = useMapStore((state) => state.activeProjectId);

  const handleSelectProject = (id) => {
    setActiveProject(activeProjectId === id ? null : id);
  };

  const handleViewMore = (proj) => {
    openModal('projectGiant', proj);
  };

  return (
    <FloatingPanel 
      className={`transition-all duration-300 p-6 ${activeProjectId ? 'w-[600px]' : 'w-[500px]'}`}
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
        {!activeProjectId && (
          <p className="text-lg text-gray-300 font-medium sticky top-0 bg-[#0f172a] z-10 py-3">
            Selecciona un proyecto para localizar sus cámaras trampa:
          </p>
        )}

        {projects.map((proj) => {
          const isActive = activeProjectId === proj.id;
          if (activeProjectId && !isActive) return null; // Oculta los demás si hay uno seleccionado

          // Calcular datos en vivo de la base de datos
          const projectCameras = camera_stations.filter(c => c.project_id === proj.id);
          const cameraIds = projectCameras.map(c => c.id);
          const projectSightings = species.filter(s => cameraIds.includes(s.station_id));
          const investigator = users.find(u => u.id === proj.user_id);

          return (
            <div 
              key={proj.id}
              onClick={() => !isActive && handleSelectProject(proj.id)}
              className={`p-4 rounded-xl border transition-all duration-300 ${
                isActive 
                  ? 'bg-white/10 border-white/40 cursor-default scale-[1.02] shadow-lg' 
                  : 'bg-white/5 border-white/10 hover:bg-[#1a1a1a] hover:scale-[1.02] cursor-pointer'
              }`}
            >
              <h4 className={`${isActive ? 'text-2xl' : 'text-xl'} font-bold text-white mb-2 transition-all duration-300`}>{proj.title}</h4>
              <p className={`${isActive ? 'text-lg' : 'text-base'} text-gray-300 mb-2 transition-all duration-300`}>{proj.description}</p>
              
              {!isActive && (
                <div className="text-sm text-primary font-semibold">
                  {projectCameras.length} cámaras • {projectSightings.length} detecciones
                </div>
              )}

              {isActive && (
                <div className="mt-6 animate-in fade-in duration-300">
                  <h5 className="font-bold text-white/90 mb-3 text-xl">Puntos Relevantes:</h5>
                  <ul className="list-disc pl-6 space-y-3 text-lg text-gray-400 mb-8">
                    <li><strong className="text-white/80">Cámaras Instaladas:</strong> {projectCameras.length} unidades</li>
                    <li><strong className="text-white/80">Avistamientos Registrados:</strong> {projectSightings.length} animales</li>
                    <li><strong className="text-white/80">Investigador Principal:</strong> {investigator?.full_name}</li>
                  </ul>
                  
                  <div className="flex gap-4 mb-8">
                    <Button variant="secondary" onClick={() => handleSelectProject(proj.id)} className="flex-1 cursor-pointer py-3 text-lg transition-all duration-300 hover:scale-105 hover:bg-white/10">
                      Atrás
                    </Button>
                    <Button variant="primary" onClick={() => handleViewMore(proj)} className="flex-1 cursor-pointer py-3 bg-white hover:bg-gray-200 text-black text-lg font-bold shadow-lg transition-all duration-300 hover:scale-105">
                      Ver reporte completo
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </FloatingPanel>
  );
};
