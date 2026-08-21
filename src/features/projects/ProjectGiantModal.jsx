import React, { useMemo, useState } from 'react';
import { FloatingPanel } from '../../components/layout/FloatingPanel';
import { useModalStore } from '../../store/useModalStore';
import { useMapStore } from '../../store/useMapStore';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, 
  PieChart, Pie, Cell, BarChart, Bar 
} from 'recharts';
import { BiodiversityPanel } from './BiodiversityPanel';
import { FileSpreadsheet, FileText, Camera, Unlink, Plus, ChevronDown } from 'lucide-react';
import { jsPDF } from 'jspdf';
import domtoimage from 'dom-to-image-more';
import { 
  getDiversityIndicator, getRaiIndicator, getOcupacionIndicator, getFrequencyIndicator
} from '../../services/api';

const COLORS = ['#eab308', '#f97316', '#3b82f6', '#22c55e', '#a855f7', '#ef4444', '#14b8a6'];

export const ProjectGiantModal = () => {
  const { modalData, openModal, closeModal } = useModalStore();
  const setActiveProject = useMapStore((state) => state.setActiveProject);
  const cameraStations = useMapStore((state) => state.cameraStations);
  const users = useMapStore((state) => state.users);
  const species = useMapStore((state) => state.species);
  
  const handleBack = () => {
    openModal('projectList');
  };

  const handleCloseEntirely = () => {
    setActiveProject(null);
    closeModal();
  };

  // N:M — Mock local state for associated stations
  const [linkedStationIds, setLinkedStationIds] = useState(() => {
    if (!modalData) return [];
    return cameraStations.filter(c => c.project_id === modalData.id).map(c => c.id);
  });
  const [showStationDropdown, setShowStationDropdown] = useState(false);
  
  // Taxonomical Chart State ('species', 'family', 'genus')
  const [activeChart, setActiveChart] = useState('species');

  const linkedStations = cameraStations.filter(c => linkedStationIds.includes(c.id));
  const availableStations = cameraStations.filter(c => !linkedStationIds.includes(c.id));

  const handleAssociateStation = (stationId) => {
    setLinkedStationIds(prev => [...prev, stationId]);
    setShowStationDropdown(false);
  };

  const handleDisassociateStation = (stationId) => {
    setLinkedStationIds(prev => prev.filter(id => id !== stationId));
  };

  // Calcular datos dinámicos consolidados para el proyecto
  const { investigator, projectSightings, uniqueSpecies, frequencyData, frequencyByFamily, frequencyByGenus, timelineData } = useMemo(() => {
    if (!modalData) return { frequencyData: [], frequencyByFamily: [], frequencyByGenus: [], timelineData: [], projectSightings: [] };
    
    const investigator = users.find(u => u.id === modalData.user_id);
    const projectSightings = species.filter(s => linkedStationIds.includes(s.station_id));

    const speciesCounts = {};
    const familyCounts = {};
    const genusCounts = {};
    const monthlyCounts = {};

    projectSightings.forEach(s => {
      speciesCounts[s.common_name] = (speciesCounts[s.common_name] || 0) + 1;
      familyCounts[s.family || 'Desconocido'] = (familyCounts[s.family || 'Desconocido'] || 0) + 1;
      genusCounts[s.genus || 'Desconocido'] = (genusCounts[s.genus || 'Desconocido'] || 0) + 1;
      
      // Timeline: agrupar por mes
      const date = new Date(s.detection_timestamp);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyCounts[monthKey] = (monthlyCounts[monthKey] || 0) + 1;
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

    const timelineData = Object.entries(monthlyCounts)
      .map(([month, avistamientos]) => ({ month, avistamientos }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return { 
      investigator, 
      projectSightings,
      uniqueSpecies: Object.keys(speciesCounts).length,
      frequencyData,
      frequencyByFamily,
      frequencyByGenus,
      timelineData
    };
  }, [modalData, users, linkedStationIds, species]);

  const handleExportPDF = async () => {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: 'a4',
      hotfixes: ['px_scaling'],
    });

    const A4_WIDTH_PX = 794;
    const A4_HEIGHT_PX = 1123;
    const MARGIN = 40;
    const CONTENT_WIDTH = A4_WIDTH_PX - (MARGIN * 2);

    let currentY = MARGIN;

    pdf.setFillColor(10, 10, 10);
    pdf.rect(0, 0, A4_WIDTH_PX, A4_HEIGHT_PX, 'F');

    pdf.setFontSize(24);
    pdf.setTextColor(255, 255, 255);
    pdf.text(modalData?.title || "Reporte del Proyecto", MARGIN, currentY);
    currentY += 40;

    const charts = document.querySelectorAll('.exportable-chart-giant');
    
    for (let i = 0; i < charts.length; i++) {
      const chartElement = charts[i];
      
      if (chartElement.clientHeight < 50 || chartElement.innerText.toLowerCase().includes('error')) {
         continue; 
      }

      chartElement.scrollIntoView({ behavior: 'instant', block: 'center' });
      await new Promise(r => setTimeout(r, 150));

      const originalOverflow = chartElement.style.overflow;
      chartElement.style.overflow = 'visible';

      try {
        const dataUrl = await domtoimage.toPng(chartElement, { bgcolor: '#111827' });
        
        chartElement.style.overflow = originalOverflow;
        
        const img = new Image();
        img.src = dataUrl;
        await new Promise((resolve) => { img.onload = resolve; });
        
        const ratio = img.height / img.width;
        const imgWidth = CONTENT_WIDTH;
        const imgHeight = CONTENT_WIDTH * ratio;

        if (currentY + imgHeight > A4_HEIGHT_PX - MARGIN) {
          pdf.addPage();
          pdf.setFillColor(10, 10, 10);
          pdf.rect(0, 0, A4_WIDTH_PX, A4_HEIGHT_PX, 'F');
          currentY = MARGIN;
        }

        const title = chartElement.getAttribute('data-title');
        if (title) {
            pdf.setFontSize(16);
            pdf.setTextColor(200, 200, 200);
            pdf.text(title, MARGIN, currentY);
            currentY += 20;
        }

        pdf.addImage(dataUrl, 'PNG', MARGIN, currentY, imgWidth, imgHeight);
        currentY += imgHeight + 40;
      } catch (err) {
        console.error("Error capturando grafica", err);
        chartElement.style.overflow = originalOverflow;
      }
    }

    pdf.save(`reporte_${modalData?.title || 'proyecto'}.pdf`);
  };

  const handleExportCSV = async () => {
    if (!modalData) return;
    
    try {
      const params = { project_id: modalData.id };
      let csvParts = [];
      csvParts.push(`REPORTE DE DATOS - ${modalData.title}`);
      csvParts.push("");

      try {
        const res = await getDiversityIndicator(params);
        csvParts.push("--- INDICE DE BIODIVERSIDAD ---");
        csvParts.push("Metrica,Bruto,Estadistico");
        csvParts.push(`Riqueza Especies (S),${res?.bruto?.S || 0},${res?.estadistico?.S || 0}`);
        csvParts.push(`Shannon (H'),${res?.bruto?.shannon || 0},${res?.estadistico?.shannon || 0}`);
        csvParts.push(`Simpson (D),${res?.bruto?.simpson || 0},${res?.estadistico?.simpson || 0}`);
        csvParts.push(`Dominante,${res?.bruto?.dominante || ''},${res?.estadistico?.dominante || ''}`);
        csvParts.push("");
      } catch(e) {}

      try {
        const res = await getRaiIndicator(params);
        csvParts.push("--- TASA DE CAPTURA RELATIVA (RAI) ---");
        csvParts.push("Especie,Eventos,RAI Bruto,RAI Estadistico");
        if (res?.filas) {
          res.filas.forEach(f => {
            csvParts.push(`${f.especie},${f.eventos},${f.rai_bruto},${f.rai_estadistico}`);
          });
        }
        csvParts.push("");
      } catch(e) {}
      
      try {
        const res = await getOcupacionIndicator(params);
        csvParts.push("--- OCUPACION NAIVE ---");
        csvParts.push("Especie,Estaciones Presente,Ocupacion %");
        if (res?.filas) {
          res.filas.forEach(f => {
            csvParts.push(`${f.especie},${f.estaciones_presente},${f.ocupacion_pct}`);
          });
        }
        csvParts.push("");
      } catch(e) {}
      
      try {
        const res = await getFrequencyIndicator(params);
        csvParts.push("--- FRECUENCIA ---");
        csvParts.push("Especie,Eventos,Porcentaje");
        if (res?.filas) {
          res.filas.forEach(f => {
            csvParts.push(`${f.especie},${f.eventos},${f.porcentaje}`);
          });
        }
        csvParts.push("");
      } catch(e) {}
      
      const blob = new Blob([csvParts.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `datos_${modalData.title}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch(err) {
      console.error(err);
    }
  };

  if (!modalData) return null;

  return (
    <FloatingPanel 
      className="w-[90%] max-w-[1400px] max-h-[90vh] mx-auto mt-[5vh] p-0 bg-gradient-to-br from-[#0a0f18] to-black backdrop-blur-3xl flex flex-col rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden"
    >
      {/* Premium Header */}
      <div className="relative bg-gradient-to-r from-blue-900/20 via-[#00ff88]/5 to-transparent border-b border-white/10 p-4 sm:p-5 flex justify-between items-start shrink-0 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#00ff88]/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="relative z-10">
          <button 
            onClick={handleBack} 
            className="group flex items-center gap-2 text-blue-400 hover:text-[#00ff88] mb-2 font-bold text-xs cursor-pointer transition-colors"
          >
            <div className="bg-blue-500/10 group-hover:bg-[#00ff88]/20 p-1.5 rounded-full transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </div>
            Volver a Resumen
          </button>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-blue-500/30 tracking-widest shadow-lg">Proyecto Integral</span>
            <span className="bg-[#00ff88]/20 text-[#00ff88] text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-[#00ff88]/30 tracking-widest shadow-[0_0_10px_rgba(0,255,136,0.3)]">{modalData.status || 'En curso'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md">{modalData.title}</h1>
          <p className="text-sm text-gray-400 mt-1 max-w-4xl font-medium leading-relaxed">{modalData.description}</p>
        </div>
        
        <div className="relative z-10 flex items-center gap-3">
          <button 
            onClick={handleExportCSV} 
            className="flex items-center gap-2 bg-black/50 hover:bg-blue-500/20 text-blue-400 px-4 py-2.5 rounded-xl transition-all duration-300 font-black cursor-pointer border border-blue-500/30 text-sm hover:scale-105 shadow-lg group"
            title="Descargar Datos en CSV"
          >
            <FileSpreadsheet className="w-5 h-5 group-hover:animate-bounce" />
            Exportar CSV
          </button>
          <button 
            onClick={handleExportPDF} 
            className="flex items-center gap-2 bg-[#00ff88]/10 hover:bg-[#00ff88]/30 text-[#00ff88] px-4 py-2.5 rounded-xl transition-all duration-300 font-black cursor-pointer border border-[#00ff88]/30 text-sm hover:scale-105 shadow-[0_0_15px_rgba(0,255,136,0.2)] group"
            title="Exportar Reporte a PDF"
          >
            <FileText className="w-5 h-5 group-hover:animate-pulse" />
            Reporte PDF
          </button>
          <button onClick={handleCloseEntirely} className="text-gray-500 hover:text-red-400 ml-4 p-2.5 bg-white/5 hover:bg-red-500/10 rounded-full cursor-pointer transition-all duration-300 hover:rotate-90">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
      </div>

      <div id="giant-report-content" className="flex-1 overflow-y-auto custom-scrollbar flex flex-col xl:flex-row gap-6 p-6 sm:p-8">
          
        {/* Columna Izquierda: Detalles del Proyecto */}
        <div className="w-full xl:w-1/3 space-y-5 shrink-0">
          <div className="bg-black/40 p-6 rounded-3xl border border-white/5 shadow-inner">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Información Clave</h3>
            <ul className="space-y-4">
              <li className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Investigador Principal</span>
                <span className="text-base font-bold text-white">{investigator?.full_name} <span className="text-gray-400 font-medium">({investigator?.institucion})</span></span>
              </li>
              <li className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Estaciones Asociadas</span>
                <span className="text-base font-black text-blue-400">{linkedStations.length} unidades vinculadas</span>
              </li>
              <li className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Avistamientos Totales</span>
                <span className="text-base font-black text-[#00ff88]">{projectSightings?.length} registros IA confirmados</span>
              </li>
              <li className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Especies Únicas</span>
                <span className="text-base font-black text-yellow-400">{uniqueSpecies || 0} especies detectadas</span>
              </li>
            </ul>
          </div>

          {/* Gestión de Estaciones Asociadas (N:M) */}
          <div className="bg-black/40 p-6 rounded-3xl border border-white/5 shadow-inner">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Camera className="w-4 h-4 text-blue-400" />
                Estaciones Vinculadas
              </h3>
              <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">{linkedStations.length}</span>
            </div>
            
            {/* Lista de estaciones asociadas */}
            <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar mb-4">
              {linkedStations.length > 0 ? linkedStations.map(station => (
                <div key={station.id} className="flex items-center justify-between bg-white/5 hover:bg-white/10 rounded-xl px-4 py-3 border border-white/5 transition-all group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-2 h-2 rounded-full bg-[#00ff88] shadow-[0_0_6px_rgba(0,255,136,0.6)] shrink-0"></div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">{station.station_code}</p>
                      <p className="text-[10px] text-gray-500 truncate">{station.location_name}</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => handleDisassociateStation(station.id)}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 hover:bg-red-500/20 p-1.5 rounded-lg transition-all cursor-pointer shrink-0"
                    title="Quitar del proyecto"
                  >
                    <Unlink className="w-4 h-4" />
                  </button>
                </div>
              )) : (
                <div className="text-center py-6 text-gray-500 text-sm">
                  No hay estaciones vinculadas a este proyecto.
                </div>
              )}
            </div>

            {/* Dropdown para asociar nueva estación */}
            <div className="relative">
              <button 
                type="button"
                onClick={() => setShowStationDropdown(!showStationDropdown)}
                className="w-full flex items-center justify-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 hover:border-blue-500/40 rounded-xl px-4 py-3 font-bold text-xs uppercase tracking-wider cursor-pointer transition-all hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4" />
                Agregar Estación
                <ChevronDown className={`w-4 h-4 transition-transform ${showStationDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showStationDropdown && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl max-h-[180px] overflow-y-auto custom-scrollbar z-50">
                  {availableStations.length > 0 ? availableStations.slice(0, 20).map(station => (
                    <button
                      key={station.id}
                      type="button"
                      onClick={() => handleAssociateStation(station.id)}
                      className="w-full text-left px-4 py-3 hover:bg-[#00ff88]/10 transition-colors cursor-pointer flex items-center gap-3 border-b border-white/5 last:border-0"
                    >
                      <Camera className="w-3.5 h-3.5 text-gray-500" />
                      <div>
                        <p className="text-sm font-bold text-white">{station.station_code}</p>
                        <p className="text-[10px] text-gray-500">{station.location_name}</p>
                      </div>
                    </button>
                  )) : (
                    <div className="px-4 py-4 text-gray-500 text-sm text-center">Todas las estaciones ya están vinculadas.</div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-white/5 to-transparent p-6 rounded-3xl border border-white/5 shadow-lg">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-3">Objetivos del Proyecto</h3>
            <p className="text-sm text-gray-300 leading-relaxed mb-5">
              {modalData.objectives}
            </p>
            <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-3">Resultados Esperados</h4>
            <p className="text-sm text-gray-300 leading-relaxed">
              {modalData.expected_results}
            </p>
          </div>
        </div>

        {/* Columnas Derecha: Gráficas */}
        <div className="w-full xl:w-2/3 flex flex-col gap-3 pb-8">
          
          {/* Fila 1: Linea de Tiempo y Frecuencia Horizontal */}
          <div className="flex flex-col xl:flex-row gap-3 w-full">
            {/* Grafica de Area */}
            <div className="exportable-chart-giant bg-white/5 p-2 rounded-2xl border border-white/10 flex-1 flex flex-col min-w-[300px]" data-title="Línea de Tiempo de Detecciones">
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
                    <XAxis dataKey="month" stroke="#ffffff80" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#ffffff80" fontSize={10} tickLine={false} axisLine={false} />
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" vertical={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}/>
                    <Area type="monotone" dataKey="avistamientos" stroke="#00ff88" strokeWidth={3} fillOpacity={1} fill="url(#colorUv)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Dashboard Taxonómico (Frecuencia) */}
            <div className="exportable-chart-giant bg-white/5 p-4 rounded-2xl border border-white/10 flex-1 flex flex-col min-w-[300px]" data-title="Dashboard Taxonómico">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h3 className="text-sm font-bold text-white mb-1">Frecuencia Taxonómica</h3>
                <div className="flex bg-white/10 p-1 rounded-lg shrink-0">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setActiveChart('species'); }}
                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-colors ${activeChart === 'species' ? 'bg-[#3b82f6] text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                  >
                    Especies
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setActiveChart('family'); }}
                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-colors ${activeChart === 'family' ? 'bg-[#3b82f6] text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                  >
                    Familia
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setActiveChart('genus'); }}
                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-colors ${activeChart === 'genus' ? 'bg-[#3b82f6] text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                  >
                    Género
                  </button>
                </div>
              </div>
              <div className="w-full" style={{ height: Math.max(220, (activeChart === 'species' ? (frequencyData || []) : activeChart === 'family' ? (frequencyByFamily || []) : (frequencyByGenus || [])).length * 35) }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={activeChart === 'species' ? frequencyData : activeChart === 'family' ? frequencyByFamily : frequencyByGenus} 
                    layout="vertical" 
                    margin={{ top: 0, right: 30, left: 30, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" horizontal={true} vertical={false}/>
                    <XAxis type="number" stroke="#ffffff80" fontSize={10} allowDecimals={false} />
                    <YAxis dataKey="name" type="category" stroke="#ffffff" fontSize={11} width={100} tickLine={false} axisLine={false} interval={0} fontWeight={600} />
                    <Tooltip 
                      formatter={(value) => [`${value} avistamientos`, 'Total']}
                      contentStyle={{ backgroundColor: 'rgba(15,23,42,0.95)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '12px' }}
                      itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="exportable-chart-giant flex flex-col xl:flex-row gap-4 w-full" data-title="Biodiversidad">
            <BiodiversityPanel sightings={projectSightings} />
          </div>

        </div>
      </div>
    </FloatingPanel>
  );
};
