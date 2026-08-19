import React, { useMemo, useState } from 'react';
import { FloatingPanel } from '../../components/layout/FloatingPanel';
import { useModalStore } from '../../store/useModalStore';
import { useMapStore } from '../../store/useMapStore';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, 
  PieChart, Pie, Cell, BarChart, Bar 
} from 'recharts';
import { BiodiversityPanel } from './BiodiversityPanel';
import { FileSpreadsheet, FileText } from 'lucide-react';
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

  // Calcular datos dinámicos — camera_stations viene del backend (por ahora [])
  const { investigator, projectCameras, projectSightings, speciesData, timelineData, frequencyData } = useMemo(() => {
    if (!modalData) return {};
    
    const investigator = users.find(u => u.id === modalData.user_id);
    const projectCameras = cameraStations.filter(c => c.project_id === modalData.id);
    const cameraIds = projectCameras.map(c => c.id);
    const projectSightings = species.filter(s => cameraIds.includes(s.station_id));

    const speciesData = [];
    const frequencyData = [];
    const timelineData = [];

    return { investigator, projectCameras, projectSightings, speciesData, timelineData, frequencyData };
  }, [modalData, users, cameraStations, species]);

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
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Cámaras Activas</span>
                <span className="text-base font-black text-blue-400">{projectCameras?.length} unidades operativas</span>
              </li>
              <li className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Avistamientos Totales</span>
                <span className="text-base font-black text-[#00ff88]">{projectSightings?.length} registros IA confirmados</span>
              </li>
            </ul>
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

            {/* Gráfica de Barras Horizontales (Frecuencia %) */}
            <div className="exportable-chart-giant bg-white/5 p-2 rounded-2xl border border-white/10 flex-1 flex flex-col min-w-[300px]" data-title="Frecuencia por Animal (%)">
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

          <div className="exportable-chart-giant flex flex-col xl:flex-row gap-4 w-full" data-title="Biodiversidad">
            <BiodiversityPanel sightings={projectSightings} />
          </div>

        </div>
      </div>
    </FloatingPanel>
  );
};
