import React, { useMemo, useState } from 'react';
import { FloatingPanel } from '../../components/layout/FloatingPanel';
import { useModalStore } from '../../store/useModalStore';
import { useMapStore } from '../../store/useMapStore';
import { users, species } from '../../data/mockDatabase';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, 
  PieChart, Pie, Cell, BarChart, Bar 
} from 'recharts';
import { BiodiversityPanel } from './BiodiversityPanel';

const COLORS = ['#eab308', '#f97316', '#3b82f6', '#22c55e', '#a855f7', '#ef4444', '#14b8a6'];

export const ProjectGiantModal = () => {
  const { modalData, openModal, closeModal } = useModalStore();
  const setActiveProject = useMapStore((state) => state.setActiveProject);
  const cameraStations = useMapStore((state) => state.cameraStations);
  
  const handleBack = () => {
    openModal('projectList');
  };

  const handleCloseEntirely = () => {
    setActiveProject(null);
    closeModal();
  };

  // Calcular datos dinámicos basados en la DB simulada
  const { investigator, projectCameras, projectSightings, speciesData, timelineData, frequencyData } = useMemo(() => {
    if (!modalData) return {};
    
    const investigator = users.find(u => u.id === modalData.user_id);
    const projectCameras = cameraStations.filter(c => c.project_id === modalData.id);
    const cameraIds = projectCameras.map(c => c.id);
    const projectSightings = species.filter(s => cameraIds.includes(s.station_id));

    // 1. Agrupar por especie (Pie Chart)
    const speciesCounts = {};
    projectSightings.forEach(s => {
      speciesCounts[s.common_name] = (speciesCounts[s.common_name] || 0) + 1;
    });
    const speciesData = Object.entries(speciesCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // 2. Agrupar frecuencias para el gráfico de barras (Frecuencia %)
    const totalSightings = projectSightings.length || 1;
    const frequencyData = speciesData.map(item => ({
      name: item.name,
      porcentaje: parseFloat(((item.value / totalSightings) * 100).toFixed(1))
    }));

    // 3. Agrupar línea de tiempo (por mes)
    const timelineCounts = {};
    projectSightings.forEach(s => {
      const date = new Date(s.detection_timestamp);
      // Formato 'YYYY-MM'
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      timelineCounts[monthKey] = (timelineCounts[monthKey] || 0) + 1;
    });
    
    const timelineData = Object.entries(timelineCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, avistamientos]) => ({
        month, // Podría formatearse a 'Ene', 'Feb' si es del mismo año, pero YYYY-MM es seguro
        avistamientos
      }));

    return { investigator, projectCameras, projectSightings, speciesData, timelineData, frequencyData };
  }, [modalData]);

  if (!modalData) return null;

  return (
    <FloatingPanel 
      className="w-full h-full p-3 md:p-4 bg-black/95 backdrop-blur-3xl flex flex-col rounded-3xl border border-white/10"
    >
      <div className="flex justify-between items-start border-b border-white/10 pb-3 mb-3">
        <div>
          <button 
            onClick={handleBack} 
            className="text-primary hover:text-white mb-2 font-medium text-sm flex items-center cursor-pointer transition-colors"
          >
            ← Volver a Resumen
          </button>
          <h1 className="text-2xl font-extrabold text-white">{modalData.title}</h1>
          <p className="text-base text-gray-400 mt-1 max-w-4xl">{modalData.description}</p>
        </div>
        <button onClick={handleCloseEntirely} className="text-white/40 hover:text-white p-2 bg-white/5 rounded-full cursor-pointer">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col xl:flex-row gap-4 pr-3">
          
        {/* Columna Izquierda: Detalles del Proyecto */}
        <div className="w-full xl:w-1/3 space-y-3 shrink-0 sticky top-0 h-max z-10">
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
            <h3 className="text-xl font-bold text-white mb-3">Información Clave</h3>
            <ul className="space-y-3 text-base text-gray-300">
              <li><strong className="text-white">Investigador Principal:</strong> {investigator?.full_name} ({investigator?.institucion})</li>
              <li><strong className="text-white">Cámaras Activas:</strong> {projectCameras?.length} unidades</li>
              <li><strong className="text-white">Avistamientos Totales:</strong> {projectSightings?.length} registros IA</li>
            </ul>
          </div>
          
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
            <h3 className="text-xl font-bold text-white mb-3">Objetivos del Proyecto</h3>
            <p className="text-base text-gray-300 leading-relaxed mb-4">
              {modalData.objectives}
            </p>
            <h4 className="text-lg font-bold text-white mb-2">Resultados Esperados</h4>
            <p className="text-base text-gray-300 leading-relaxed">
              {modalData.expected_results}
            </p>
          </div>
        </div>

        {/* Columnas Derecha: Gráficas */}
        <div className="w-full xl:w-2/3 flex flex-col gap-4 pb-8">
          
          {/* Fila 1: Linea de Tiempo y Frecuencia Horizontal */}
          <div className="flex flex-col xl:flex-row gap-4 w-full">
            {/* Grafica de Area */}
            <div className="bg-white/5 p-2 rounded-2xl border border-white/10 flex-1 flex flex-col min-w-[300px]">
              <h3 className="text-sm font-bold text-white mb-1">Línea de Tiempo de Detecciones</h3>
              <div className="w-full" style={{ minHeight: '220px', height: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timelineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00ff88" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#00ff88" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" stroke="#ffffff80" fontSize={9} tickLine={false} axisLine={false} />
                    <YAxis stroke="#ffffff80" fontSize={9} tickLine={false} axisLine={false} />
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" vertical={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}/>
                    <Area type="monotone" dataKey="avistamientos" stroke="#00ff88" strokeWidth={3} fillOpacity={1} fill="url(#colorUv)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfica de Barras Horizontales (Frecuencia %) */}
            <div className="bg-white/5 p-2 rounded-2xl border border-white/10 flex-1 flex flex-col min-w-[300px]">
              <h3 className="text-sm font-bold text-white mb-1">Frecuencia por Animal (%)</h3>
              <div className="w-full" style={{ height: Math.max(220, frequencyData.length * 35) }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={frequencyData} layout="vertical" margin={{ top: 0, right: 30, left: 30, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" horizontal={true} vertical={false}/>
                    <XAxis type="number" stroke="#ffffff80" fontSize={9} domain={[0, 100]} tickFormatter={(val) => `${val}%`} />
                    <YAxis dataKey="name" type="category" stroke="#ffffff" fontSize={10} width={100} tickLine={false} axisLine={false} interval={0} />
                    <Tooltip 
                      formatter={(value) => [`${value}%`, 'Frecuencia']}
                      contentStyle={{ backgroundColor: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    />
                    <Bar dataKey="porcentaje" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="flex flex-col xl:flex-row gap-4 w-full">
            <BiodiversityPanel sightings={projectSightings} />
          </div>

        </div>
      </div>
    </FloatingPanel>
  );
};
