import React, { useMemo } from 'react';
import { FloatingPanel } from '../../components/layout/FloatingPanel';
import { useModalStore } from '../../store/useModalStore';
import { useMapStore } from '../../store/useMapStore';
import { users, projects, camera_stations, species } from '../../data/mockDatabase';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, 
  PieChart, Pie, Cell, BarChart, Bar 
} from 'recharts';
import { Users, Camera, Activity } from 'lucide-react';
import { BiodiversityPanel } from './BiodiversityPanel';
import { SeasonalDistributionChart } from './SeasonalDistributionChart';
import { RelativeAbundanceChart } from './RelativeAbundanceChart';
import { AccumulationCurveChart } from './AccumulationCurveChart';
import { TrophicGuildChart } from './TrophicGuildChart';
import { ActivityPatternChart } from './ActivityPatternChart';
import { HabitatOccupancyChart } from './HabitatOccupancyChart';
import { TemperatureCorrelationChart } from './TemperatureCorrelationChart';
import { PreyAbundanceChart } from './PreyAbundanceChart';

const COLORS = ['#eab308', '#f97316', '#3b82f6', '#22c55e', '#a855f7', '#ef4444', '#14b8a6'];

export const CustomReportModal = () => {
  const { openModal, closeModal } = useModalStore();
  const { selectedCameraIds, reportFilters, clearSelection } = useMapStore();

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
    
    const selectedCameras = camera_stations.filter(c => selectedCameraIds.includes(c.id));
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
    const involvedProjects = projects.filter(p => involvedProjectIds.includes(p.id));
    const involvedUserIds = [...new Set(involvedProjects.map(p => p.user_id))];
    const creditedInvestigators = users.filter(u => involvedUserIds.includes(u.id));

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
  }, [selectedCameraIds, reportFilters]);

  if (!selectedCameraIds || selectedCameraIds.length === 0) return null;

  return (
    <FloatingPanel 
      className="w-full h-full p-6 md:p-8 bg-black/95 backdrop-blur-3xl flex flex-col rounded-3xl border border-white/10"
    >
      <div className="flex justify-between items-start border-b border-white/10 pb-6 mb-6">
        <div>
          <p className="text-primary font-bold tracking-widest text-sm mb-1 uppercase">
            Reporte Generado por Usuario
          </p>
          <h1 className="text-4xl font-extrabold text-white">Análisis de Área Seleccionada</h1>
          <p className="text-xl text-gray-400 mt-2 max-w-4xl">
            Este reporte unifica los datos de {selectedCameras?.length} estaciones capturadas en tu selección geográfica.
          </p>
        </div>
        <button onClick={handleCloseEntirely} className="text-white/40 hover:text-white p-2 bg-white/5 rounded-full cursor-pointer">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col xl:flex-row gap-8 pr-4">
        {/* Columna Izquierda: Detalles e Investigadores */}
        <div className="w-full xl:w-1/3 space-y-6 shrink-0">
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
            <h3 className="text-2xl font-bold text-white mb-6">Resumen del Área</h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-black/40 p-4 rounded-xl border border-white/5">
                <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-400 font-semibold">Estaciones Capturadas</p>
                  <p className="text-2xl font-bold text-white">{selectedCameras?.length}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-black/40 p-4 rounded-xl border border-white/5">
                <div className="p-3 bg-green-500/20 rounded-lg text-green-400">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-400 font-semibold">Avistamientos Totales</p>
                  <p className="text-2xl font-bold text-white">{capturedSightings?.length}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-900/40 to-black p-6 rounded-2xl border border-purple-500/30">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-purple-400" />
              <h3 className="text-2xl font-bold text-white">Créditos de Investigación</h3>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              Los datos geoespaciales de este reporte fueron posibles gracias a las estaciones desplegadas por los siguientes investigadores e instituciones:
            </p>
            
            <div className="space-y-4">
              {creditedInvestigators?.map(inv => (
                <div key={inv.id} className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center justify-between hover:bg-white/10 transition-colors">
                  <div>
                    <p className="font-bold text-white text-lg">{inv.full_name}</p>
                    <p className="text-purple-300 text-sm">{inv.institucion}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Columnas Derecha: Gráficas */}
        <div className="w-full xl:w-2/3 flex flex-col gap-6 pb-12">
          
          {/* Fila 1: Índice de Biodiversidad (Full Width Top) */}
          {reportFilters?.activeCharts?.includes('biodiversity') && (
            <div className="w-full">
              <BiodiversityPanel sightings={capturedSightings} />
            </div>
          )}

          {/* Fila 2: Distribución Estacional (Full Width) */}
          {reportFilters?.activeCharts?.includes('seasonal') && (
            <div className="w-full">
              <SeasonalDistributionChart defaultSpecies="taitetu" />
            </div>
          )}

          {/* Fila 2.5: Abundancia Relativa RAI (Full Width) */}
          {reportFilters?.activeCharts?.includes('rai') && (
            <div className="w-full">
              <RelativeAbundanceChart />
            </div>
          )}

          {/* Fila 2.75: Curva de Acumulación (Full Width) */}
          {reportFilters?.activeCharts?.includes('accumulation') && (
            <div className="w-full">
              <AccumulationCurveChart />
            </div>
          )}

          {/* Fila 2.80: Patrón de Actividad (Full Width) */}
          {reportFilters?.activeCharts?.includes('activity') && (
            <div className="w-full">
              <ActivityPatternChart />
            </div>
          )}

          {/* Fila 2.82: Ocupación del Hábitat (Full Width) */}
          {reportFilters?.activeCharts?.includes('occupancy') && (
            <div className="w-full">
              <HabitatOccupancyChart />
            </div>
          )}

          {/* Fila 2.84: Temperatura vs Actividad (Full Width) */}
          {reportFilters?.activeCharts?.includes('temperature') && (
            <div className="w-full">
              <TemperatureCorrelationChart />
            </div>
          )}

          {/* Fila 2.85: Abundancia de Presas (Full Width) */}
          {reportFilters?.activeCharts?.includes('prey') && (
            <div className="w-full">
              <PreyAbundanceChart />
            </div>
          )}

          {/* Fila 2.85: Gremios Tróficos (Full Width) */}
          {reportFilters?.activeCharts?.includes('trophic') && (
            <div className="w-full">
              <TrophicGuildChart />
            </div>
          )}
          
          {/* Fila 3: Linea de Tiempo y Frecuencia Horizontal */}
          <div className="flex flex-col xl:flex-row gap-6 w-full">
            {/* Grafica de Area */}
            {reportFilters?.activeCharts?.includes('timeline') && (
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex-1 flex flex-col min-w-[300px]">
              <h3 className="text-xl font-bold text-white mb-4">Línea de Tiempo de Detecciones</h3>
              <div className="w-full" style={{ minHeight: '300px', height: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timelineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00ff88" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#00ff88" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" stroke="#ffffff80" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#ffffff80" fontSize={12} tickLine={false} axisLine={false} />
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" vertical={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}/>
                    <Area type="monotone" dataKey="avistamientos" stroke="#00ff88" strokeWidth={3} fillOpacity={1} fill="url(#colorUv)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            )}

            {/* Gráfica de Barras Horizontales (Frecuencia %) */}
            {reportFilters?.activeCharts?.includes('frequency') && (
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex-1 flex flex-col min-w-[300px]">
              <h3 className="text-xl font-bold text-white mb-4">Frecuencia por Animal (%)</h3>
              <div className="w-full" style={{ height: Math.max(300, frequencyData?.length * 45) }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={frequencyData} layout="vertical" margin={{ top: 0, right: 30, left: 30, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" horizontal={true} vertical={false}/>
                    <XAxis type="number" stroke="#ffffff80" fontSize={12} domain={[0, 100]} tickFormatter={(val) => `${val}%`} />
                    <YAxis dataKey="name" type="category" stroke="#ffffff" fontSize={14} width={120} tickLine={false} axisLine={false} interval={0} />
                    <Tooltip 
                      formatter={(value) => [`${value}%`, 'Frecuencia']}
                      contentStyle={{ backgroundColor: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    />
                    <Bar dataKey="porcentaje" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            )}
          </div>

          {/* Fila 4: Gráfica de Pie */}
          <div className="flex flex-col xl:flex-row gap-6 w-full">
            {reportFilters?.activeCharts?.includes('pie') && (
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 min-h-[350px] flex flex-col shrink-0 flex-1 w-full">
              <h3 className="text-xl font-bold text-white mb-2">Composición del Total de Detecciones</h3>
              <div className="flex-1 flex w-full relative">
              <div className="w-1/2 relative">
                <ResponsiveContainer width="100%" height="100%" className="absolute inset-0">
                  <PieChart>
                    <Pie
                      data={speciesData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {speciesData?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-1/2 flex flex-col justify-center space-y-3 overflow-y-auto custom-scrollbar pr-2">
                 {speciesData?.map((item, idx) => (
                   <div key={idx} className="flex items-center gap-3">
                     <div className="w-4 h-4 rounded-sm shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                     <span className="text-lg font-medium text-white truncate">{item.name}</span>
                     <span className="text-lg text-gray-400 ml-auto whitespace-nowrap">{item.value} registros</span>
                   </div>
                 ))}
              </div>
            </div>
          </div>
          )}
          </div>

        </div>
      </div>
    </FloatingPanel>
  );
};
