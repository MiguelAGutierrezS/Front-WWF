import React, { useMemo } from 'react';
import { FloatingPanel } from '../../components/layout/FloatingPanel';
import { useModalStore } from '../../store/useModalStore';
import { useMapStore } from '../../store/useMapStore';

import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { Users, Camera, Activity, Download, FileSpreadsheet, FileText } from 'lucide-react';
import html2canvas from 'html2canvas';
import domtoimage from 'dom-to-image-more';
import { jsPDF } from 'jspdf';
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

import {
  getDiversityIndicator, getRaiMonthlyIndicator, getRaiIndicator,
  getActivityWeckelIndicator, getOcupacionIndicator, getTemperaturaIndicator,
  getEventosIndependientesIndicator, getMapaCalorIndicator, getGremiosIndicator,
  getFrequencyIndicator
} from '../../services/api';

const COLORS = ['#eab308', '#f97316', '#3b82f6', '#22c55e', '#a855f7', '#ef4444', '#14b8a6'];

export const CustomReportModal = () => {
  const { openModal, closeModal } = useModalStore();
  const { selectedCameraIds, reportFilters, clearSelection, cameraStations, users, projects, species } = useMapStore();

  const handleCloseEntirely = () => {
    clearSelection();
    closeModal();
  };

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
    pdf.text("Reporte de Avistamientos Analizados", MARGIN, currentY);
    currentY += 40;

    const charts = document.querySelectorAll('.exportable-chart');

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
        const dataUrl = await domtoimage.toPng(
          chartElement,
          {
            bgcolor: '#111827',
            width: chartElement.offsetWidth * 2,
            height: chartElement.offsetHeight * 2,
            style: {
              transform: 'scale(2)',
              transformOrigin: 'top left',
              width: `${chartElement.offsetWidth}px`,
              height: `${chartElement.offsetHeight}px`,
              border: 'none',
              outline: 'none',
              boxShadow: 'none'
            }
          });

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

    pdf.save('reporte_estructurado.pdf');
  };

  const handleExportCSV = async () => {
    if (!selectedCameraIds || selectedCameraIds.length === 0) return;

    try {
      const active = reportFilters?.activeCharts || [];
      const params = {
        start_date: reportFilters?.startDate || null,
        end_date: reportFilters?.endDate || null,
        station_ids: selectedCameraIds
      };

      let csvParts = [];
      csvParts.push("REPORTE DE DATOS - WWF");
      csvParts.push(`Camaras Seleccionadas: ${selectedCameraIds.length}`);
      csvParts.push("");

      if (active.includes('biodiversity')) {
        try {
          const res = await getDiversityIndicator(params);
          csvParts.push("--- INDICE DE BIODIVERSIDAD ---");
          csvParts.push("Metrica,Bruto,Estadistico");
          csvParts.push(`Riqueza Especies (S),${res?.bruto?.S || 0},${res?.estadistico?.S || 0}`);
          csvParts.push(`Shannon (H'),${res?.bruto?.shannon || 0},${res?.estadistico?.shannon || 0}`);
          csvParts.push(`Simpson (D),${res?.bruto?.simpson || 0},${res?.estadistico?.simpson || 0}`);
          csvParts.push(`Dominante,${res?.bruto?.dominante || ''},${res?.estadistico?.dominante || ''}`);
          csvParts.push("");
        } catch (e) { }
      }

      if (active.includes('rai')) {
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
        } catch (e) { }
      }

      if (active.includes('occupancy')) {
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
        } catch (e) { }
      }

      if (active.includes('frequency')) {
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
        } catch (e) { }
      }

      const blob = new Blob([csvParts.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'datos_reportes_wwf.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
    }
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
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 px-4 py-2 rounded-xl transition-colors font-bold cursor-pointer border border-blue-500/30"
            title="Descargar Datos en CSV"
          >
            <FileSpreadsheet className="w-5 h-5" />
            CSV
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 bg-green-500/20 hover:bg-green-500/40 text-green-400 px-4 py-2 rounded-xl transition-colors font-bold cursor-pointer border border-green-500/30"
            title="Exportar Reporte a PDF"
          >
            <FileText className="w-5 h-5" />
            PDF
          </button>
          <button onClick={handleCloseEntirely} className="text-white/40 hover:text-white p-2 bg-white/5 rounded-full cursor-pointer transition-colors">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </button>
        </div>
      </div>

      <div id="report-content" className="flex-1 overflow-y-auto custom-scrollbar flex flex-col xl:flex-row gap-6 pr-4 pb-10 bg-black/40 rounded-xl p-4">
        {/* Columna Izquierda: Detalles e Investigadores */}
        <div className="w-full xl:w-1/3 space-y-4 shrink-0 sticky top-0 h-max z-10">
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
            <h3 className="text-xl leading-normal font-bold text-white mb-4">Resumen del Área</h3>

            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-black/40 p-3 rounded-xl border border-white/5">
                <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs leading-normal text-gray-400 font-semibold">Estaciones Capturadas</p>
                  <p className="text-xl leading-none font-bold text-white">{selectedCameras?.length}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-black/40 p-3 rounded-xl border border-white/5">
                <div className="p-2 bg-green-500/20 rounded-lg text-green-400">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs leading-normal text-gray-400 font-semibold">Avistamientos Totales</p>
                  <p className="text-xl leading-none font-bold text-white">{capturedSightings?.length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-900/40 to-black p-4 rounded-2xl border border-purple-500/30">
            <div className="flex items-center gap-3 mb-3">
              <Users className="w-5 h-5 text-purple-400" />
              <h3 className="text-xl leading-normal font-bold text-white">Créditos de Investigación</h3>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Los datos geoespaciales de este reporte fueron posibles gracias a las estaciones desplegadas por los siguientes investigadores e instituciones:
            </p>

            <div className="space-y-3">
              {creditedInvestigators?.map(inv => (
                <div key={inv.id} className="bg-white/5 p-3 rounded-xl border border-white/10 flex items-center justify-between hover:bg-white/10 transition-colors">
                  <div>
                    <p className="font-bold leading-normal text-white text-base">{inv.full_name}</p>
                    <p className="text-purple-300 leading-normal text-xs">{inv.institucion}</p>
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
            <div className="exportable-chart" data-title="Índice de Biodiversidad / Diversidad">
              <DiversityChart
                stationIds={selectedCameraIds}
                startDate={reportFilters?.startDate || null}
                endDate={reportFilters?.endDate || null}
                projectId={null}
              />
            </div>
          )}

          {/* RAI Mensual */}
          {reportFilters?.activeCharts?.includes('seasonal') && (
            <div className="exportable-chart" data-title="Tasa de Captura Relativa (RAI) Mensual">
              <RaiMonthlyChart
                stationIds={selectedCameraIds}
                startDate={reportFilters?.startDate || null}
                endDate={reportFilters?.endDate || null}
                projectId={null}
              />
            </div>
          )}

          {/* RAI Global */}
          {reportFilters?.activeCharts?.includes('rai') && (
            <div className="exportable-chart" data-title="Tasa de Captura Relativa (RAI) Global">
              <RaiChart
                stationIds={selectedCameraIds}
                startDate={reportFilters?.startDate || null}
                endDate={reportFilters?.endDate || null}
                projectId={null}
              />
            </div>
          )}

          {/* Patrón de Actividad Weckel */}
          {reportFilters?.activeCharts?.includes('activity') && (
            <div className="exportable-chart" data-title="Patrón de Actividad (Método Weckel)">
              <ActivityWeckelChart
                stationIds={selectedCameraIds}
                startDate={reportFilters?.startDate || null}
                endDate={reportFilters?.endDate || null}
                projectId={null}
              />
            </div>
          )}

          {/* Ocupación */}
          {reportFilters?.activeCharts?.includes('occupancy') && (
            <div className="exportable-chart" data-title="Modelo de Ocupación Naive">
              <OcupacionChart
                stationIds={selectedCameraIds}
                startDate={reportFilters?.startDate || null}
                endDate={reportFilters?.endDate || null}
                projectId={null}
              />
            </div>
          )}

          {/* Temperatura */}
          {reportFilters?.activeCharts?.includes('temperature') && (
            <div className="exportable-chart" data-title="Avistamientos según Temperatura (°C)">
              <TemperaturaChart
                stationIds={selectedCameraIds}
                startDate={reportFilters?.startDate || null}
                endDate={reportFilters?.endDate || null}
                projectId={null}
              />
            </div>
          )}

          {/* Eventos Independientes */}
          {reportFilters?.activeCharts?.includes('prey') && (
            <div className="exportable-chart" data-title="Eventos Independientes por Especie">
              <EventosIndependientesChart
                stationIds={selectedCameraIds}
                startDate={reportFilters?.startDate || null}
                endDate={reportFilters?.endDate || null}
                projectId={null}
              />
            </div>
          )}

          {/* Mapa de Calor */}
          {reportFilters?.activeCharts?.includes('mapaCalor') && (
            <div className="exportable-chart" data-title="Mapa de Calor de Actividad Horaria">
              <MapaCalorChart
                stationIds={selectedCameraIds}
                startDate={reportFilters?.startDate || null}
                endDate={reportFilters?.endDate || null}
                projectId={null}
              />
            </div>
          )}

          {/* Gremios Tróficos */}
          {reportFilters?.activeCharts?.includes('trophic') && (
            <div className="exportable-chart" data-title="Distribución de Gremios Tróficos">
              <GremiosChart
                stationIds={selectedCameraIds}
                startDate={reportFilters?.startDate || null}
                endDate={reportFilters?.endDate || null}
                projectId={null}
              />
            </div>
          )}

          {/* Fila 3: Línea de Tiempo */}
          {reportFilters?.activeCharts?.includes('timeline') && (
            <div className="exportable-chart bg-white/5 p-2 rounded-2xl border border-white/10 w-full flex flex-col" style={{ minHeight: '260px' }} data-title="Línea de Tiempo de Detecciones">
              <h3 className="text-xs leading-normal font-bold text-white mb-1">Línea de Tiempo de Detecciones</h3>
              <div className="w-full flex-1" style={{ minHeight: '220px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timelineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00ff88" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" stroke="#ffffff80" fontSize={8} tickLine={false} axisLine={false} />
                    <YAxis stroke="#ffffff80" fontSize={8} tickLine={false} axisLine={false} />
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" vertical={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                    <Area type="monotone" dataKey="avistamientos" stroke="#00ff88" strokeWidth={3} fillOpacity={1} fill="url(#colorUv)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Fila 4: Frecuencia de Avistamiento por Especie (real backend) */}
          {reportFilters?.activeCharts?.includes('frequency') && (
            <div className="exportable-chart" data-title="Frecuencia de Avistamiento (%)">
              <FrequencyChart
                stationIds={selectedCameraIds}
                startDate={reportFilters?.startDate || null}
                endDate={reportFilters?.endDate || null}
                projectId={null}
              />
            </div>
          )}

        </div>
      </div>
    </FloatingPanel>
  );
};
