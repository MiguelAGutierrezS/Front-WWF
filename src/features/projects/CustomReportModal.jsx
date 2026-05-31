import React, { useMemo } from 'react';
import { FloatingPanel } from '../../components/layout/FloatingPanel';
import { useModalStore } from '../../store/useModalStore';
import { useMapStore } from '../../store/useMapStore';
import { users, projects, species } from '../../data/mockDatabase';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, 
  PieChart, Pie, Cell, BarChart, Bar 
} from 'recharts';
import { Users, Camera, Activity } from 'lucide-react';
import { DiversityChart } from './DiversityChart';
import { RaiMonthlyChart } from './RaiMonthlyChart';
import { RaiChart } from './RaiChart';
import { ActivityWeckelChart } from './ActivityWeckelChart';
import { OcupacionChart } from './OcupacionChart';
import { TemperaturaChart } from './TemperaturaChart';
import { EventosIndependientesChart } from './EventosIndependientesChart';
import { MapaCalorChart } from './MapaCalorChart';
import { GremiosChart } from './GremiosChart';
import { FrequencyChart } from './FrequencyChart';

const COLORS = ['#eab308', '#f97316', '#3b82f6', '#22c55e', '#a855f7', '#ef4444', '#14b8a6'];

export const CustomReportModal = () => {
  const { openModal, closeModal } = useModalStore();
  const { selectedCameraIds, reportFilters, clearSelection, cameraStations } = useMapStore();

  const handleCloseEntirely = () => {
    clearSelection();
    closeModal();
  };

  // Calcular datos dinámicos basados en la selección arbitraria de cámaras
  const { 
    selectedCameras, 
    capturedSightings, 
    speciesData, 
    timelineData, 
    frequencyData,
    creditedInvestigators 
  } = useMemo(() => {
    if (!selectedCameraIds || selectedCameraIds.length === 0) return {};
    
    const selectedCameras = cameraStations.filter(c => selectedCameraIds.includes(c.id));
    let capturedSightings = species.filter(s => selectedCameraIds.includes(s.station_id));

    // APLICAR FILTROS
    if (reportFilters) {
      // Filtrar por especies excluidas
      if (reportFilters.excludedSpecies?.length > 0) {
        capturedSightings = capturedSightings.filter(s => !reportFilters.excludedSpecies.includes(s.common_name));
      }
      
      // Filtrar por fechas
      if (reportFilters.startDate) {
        const start = new Date(reportFilters.startDate);
        capturedSightings = capturedSightings.filter(s => new Date(s.detection_timestamp) >= start);
      }
      if (reportFilters.endDate) {
        const end = new Date(reportFilters.endDate);
        capturedSightings = capturedSightings.filter(s => new Date(s.detection_timestamp) <= end);
      }
      
      // Filtrar por Periodo
      if (reportFilters.activePeriods && reportFilters.activePeriods.length > 0) {
        capturedSightings = capturedSightings.filter(s => reportFilters.activePeriods.includes(s.periodo));
      }
      
      // Filtrar por Temperatura
      if (reportFilters.tempMin !== '' && reportFilters.tempMin !== null) {
        capturedSightings = capturedSightings.filter(s => s.temperatura >= Number(reportFilters.tempMin));
      }
      if (reportFilters.tempMax !== '' && reportFilters.tempMax !== null) {
        capturedSightings = capturedSightings.filter(s => s.temperatura <= Number(reportFilters.tempMax));
      }
    }

    // Determinar qué proyectos y qué usuarios están implicados (Créditos)
    const involvedProjectIds = [...new Set(selectedCameras.map(c => c.project_id))];
    const selectedProjects = projects.filter(p => involvedProjectIds.includes(p.id));
    const uniqueUsers = [...new Set(selectedProjects.map(p => p.user_id))];
    const creditedInvestigators = users.filter(u => uniqueUsers.includes(u.id));

    // 1. Agrupar por especie (Pie Chart)
    const speciesCounts = {};
    capturedSightings.forEach(s => {
      speciesCounts[s.common_name] = (speciesCounts[s.common_name] || 0) + 1;
    });
    const speciesData = Object.entries(speciesCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // 2. Agrupar frecuencias para el gráfico de barras (Frecuencia %)
    const totalSightings = capturedSightings.length || 1;
    const frequencyData = speciesData.map(item => ({
      name: item.name,
      porcentaje: parseFloat(((item.value / totalSightings) * 100).toFixed(1))
    }));

    // 3. Agrupar línea de tiempo (por mes)
    const timelineCounts = {};
    capturedSightings.forEach(s => {
      const date = new Date(s.detection_timestamp);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      timelineCounts[monthKey] = (timelineCounts[monthKey] || 0) + 1;
    });
    
    const timelineData = Object.entries(timelineCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, avistamientos]) => ({
        month, 
        avistamientos
      }));

    return { 
      selectedCameras, 
      capturedSightings, 
      speciesData, 
      timelineData, 
      frequencyData,
      creditedInvestigators
    };
  }, [selectedCameraIds, reportFilters, cameraStations, species, users, projects]);

  if (!selectedCameraIds || selectedCameraIds.length === 0) return null;

  return (
    <FloatingPanel 
      className="w-full h-full p-4 md:p-6 bg-black/95 backdrop-blur-3xl flex flex-col rounded-3xl border border-white/10"
    >
      <div className="flex justify-between items-start border-b border-white/10 pb-4 mb-4">
        <div>
          <p className="text-primary font-bold tracking-widest text-xs mb-1 uppercase">
            Reporte Generado por Usuario
          </p>
          <h1 className="text-3xl font-extrabold text-white">Análisis de Área Seleccionada</h1>
          <p className="text-lg text-gray-400 mt-2 max-w-4xl">
            Este reporte unifica los datos de {selectedCameras?.length} estaciones capturadas en tu selección geográfica.
          </p>
        </div>
        <button onClick={handleCloseEntirely} className="text-white/40 hover:text-white p-2 bg-white/5 rounded-full cursor-pointer">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col xl:flex-row gap-6 pr-4">
        {/* Columna Izquierda: Detalles e Investigadores */}
        <div className="w-full xl:w-1/3 space-y-4 shrink-0 sticky top-0 h-max z-10">
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4">Resumen del Área</h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-black/40 p-3 rounded-xl border border-white/5">
                <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold">Estaciones Capturadas</p>
                  <p className="text-xl font-bold text-white">{selectedCameras?.length}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-black/40 p-3 rounded-xl border border-white/5">
                <div className="p-2 bg-green-500/20 rounded-lg text-green-400">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold">Avistamientos Totales</p>
                  <p className="text-xl font-bold text-white">{capturedSightings?.length}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-900/40 to-black p-4 rounded-2xl border border-purple-500/30">
            <div className="flex items-center gap-3 mb-3">
              <Users className="w-5 h-5 text-purple-400" />
              <h3 className="text-xl font-bold text-white">Créditos de Investigación</h3>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Los datos geoespaciales de este reporte fueron posibles gracias a las estaciones desplegadas por los siguientes investigadores e instituciones:
            </p>
            
            <div className="space-y-3">
              {creditedInvestigators?.map(inv => (
                <div key={inv.id} className="bg-white/5 p-3 rounded-xl border border-white/10 flex items-center justify-between hover:bg-white/10 transition-colors">
                  <div>
                    <p className="font-bold text-white text-base">{inv.full_name}</p>
                    <p className="text-purple-300 text-xs">{inv.institucion}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Columnas Derecha: Gráficas */}
        <div className="w-full xl:w-2/3 flex flex-col gap-4 pb-8">
          
          {/* Fila 1: Índice de Biodiversidad / Diversidad (real backend) */}
          {reportFilters?.activeCharts?.includes('biodiversity') && (
            <DiversityChart
              stationIds={selectedCameraIds}
              startDate={reportFilters?.startDate || null}
              endDate={reportFilters?.endDate || null}
              projectId={null}
            />
          )}

          {/* RAI Mensual */}
          {reportFilters?.activeCharts?.includes('seasonal') && (
            <RaiMonthlyChart
              stationIds={selectedCameraIds}
              startDate={reportFilters?.startDate || null}
              endDate={reportFilters?.endDate || null}
              projectId={null}
            />
          )}

          {/* RAI Global */}
          {reportFilters?.activeCharts?.includes('rai') && (
            <RaiChart
              stationIds={selectedCameraIds}
              startDate={reportFilters?.startDate || null}
              endDate={reportFilters?.endDate || null}
              projectId={null}
            />
          )}

          {/* Patrón de Actividad Weckel */}
          {reportFilters?.activeCharts?.includes('activity') && (
            <ActivityWeckelChart
              stationIds={selectedCameraIds}
              startDate={reportFilters?.startDate || null}
              endDate={reportFilters?.endDate || null}
              projectId={null}
            />
          )}

          {/* Ocupación */}
          {reportFilters?.activeCharts?.includes('occupancy') && (
            <OcupacionChart
              stationIds={selectedCameraIds}
              startDate={reportFilters?.startDate || null}
              endDate={reportFilters?.endDate || null}
              projectId={null}
            />
          )}

          {/* Temperatura */}
          {reportFilters?.activeCharts?.includes('temperature') && (
            <TemperaturaChart
              stationIds={selectedCameraIds}
              startDate={reportFilters?.startDate || null}
              endDate={reportFilters?.endDate || null}
              projectId={null}
            />
          )}

          {/* Eventos Independientes */}
          {reportFilters?.activeCharts?.includes('prey') && (
            <EventosIndependientesChart
              stationIds={selectedCameraIds}
              startDate={reportFilters?.startDate || null}
              endDate={reportFilters?.endDate || null}
              projectId={null}
            />
          )}

          {/* Mapa de Calor */}
          {reportFilters?.activeCharts?.includes('mapaCalor') && (
            <MapaCalorChart
              stationIds={selectedCameraIds}
              startDate={reportFilters?.startDate || null}
              endDate={reportFilters?.endDate || null}
              projectId={null}
            />
          )}

          {/* Gremios Tróficos */}
          {reportFilters?.activeCharts?.includes('trophic') && (
            <GremiosChart
              stationIds={selectedCameraIds}
              startDate={reportFilters?.startDate || null}
              endDate={reportFilters?.endDate || null}
              projectId={null}
            />
          )}
          
          {/* Fila 3: Línea de Tiempo */}
          {reportFilters?.activeCharts?.includes('timeline') && (
            <div className="bg-white/5 p-2 rounded-2xl border border-white/10 w-full flex flex-col" style={{ minHeight: '260px' }}>
              <h3 className="text-xs font-bold text-white mb-1">Línea de Tiempo de Detecciones</h3>
              <div className="w-full flex-1" style={{ minHeight: '220px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timelineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00ff88" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#00ff88" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" stroke="#ffffff80" fontSize={8} tickLine={false} axisLine={false} />
                    <YAxis stroke="#ffffff80" fontSize={8} tickLine={false} axisLine={false} />
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" vertical={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}/>
                    <Area type="monotone" dataKey="avistamientos" stroke="#00ff88" strokeWidth={3} fillOpacity={1} fill="url(#colorUv)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Fila 4: Frecuencia de Avistamiento por Especie (real backend) */}
          {reportFilters?.activeCharts?.includes('frequency') && (
            <FrequencyChart
              stationIds={selectedCameraIds}
              startDate={reportFilters?.startDate || null}
              endDate={reportFilters?.endDate || null}
              projectId={null}
            />
          )}

        </div>
      </div>
    </FloatingPanel>
  );
};
