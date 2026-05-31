import React, { useMemo, useState, useEffect } from 'react';
import { FloatingPanel } from '../../components/layout/FloatingPanel';
import { useModalStore } from '../../store/useModalStore';
import { useMapStore } from '../../store/useMapStore';
import { species } from '../../data/mockDatabase';
import { Filter, Calendar, Settings2, BarChart2 } from 'lucide-react';

export const ReportConfigModal = () => {
  const { openModal, closeModal } = useModalStore();
  const { selectedCameraIds, setReportFilters, reportFilters, clearSelection } = useMapStore();

  // Local state para manejar el formulario antes de guardar
  const [localStartDate, setLocalStartDate] = useState(reportFilters.startDate || '');
  const [localEndDate, setLocalEndDate] = useState(reportFilters.endDate || '');
  const [localExcludedSpecies, setLocalExcludedSpecies] = useState(reportFilters.excludedSpecies || []);
  const [localActiveCharts, setLocalActiveCharts] = useState(reportFilters.activeCharts || ['timeline', 'frequency', 'pie', 'biodiversity']);

  const handleCloseEntirely = () => {
    clearSelection();
    closeModal();
  };

  // Obtener la lista única de especies presentes en el área seleccionada
  const uniqueSpecies = useMemo(() => {
    if (!selectedCameraIds || selectedCameraIds.length === 0) return [];
    const areaSightings = species.filter(s => selectedCameraIds.includes(s.station_id));
    const speciesNames = [...new Set(areaSightings.map(s => s.common_name))];
    return speciesNames.sort();
  }, [selectedCameraIds]);

  const toggleSpecies = (speciesName) => {
    if (localExcludedSpecies.includes(speciesName)) {
      setLocalExcludedSpecies(localExcludedSpecies.filter(s => s !== speciesName));
    } else {
      setLocalExcludedSpecies([...localExcludedSpecies, speciesName]);
    }
  };

  const toggleChart = (chartId) => {
    if (localActiveCharts.includes(chartId)) {
      setLocalActiveCharts(localActiveCharts.filter(c => c !== chartId));
    } else {
      setLocalActiveCharts([...localActiveCharts, chartId]);
    }
  };

  const handleGenerate = () => {
    setReportFilters({
      startDate: localStartDate || null,
      endDate: localEndDate || null,
      excludedSpecies: localExcludedSpecies,
      activeCharts: localActiveCharts
    });
    openModal('customReport');
  };

  if (!selectedCameraIds || selectedCameraIds.length === 0) return null;

  return (
    <FloatingPanel className="w-full max-w-4xl max-h-[90vh] mx-auto mt-[5vh] p-8 bg-black/95 backdrop-blur-3xl flex flex-col rounded-3xl border border-white/10 shadow-2xl relative">
      <div className="flex justify-between items-start border-b border-white/10 pb-6 mb-6">
        <div>
          <div className="flex items-center gap-3 text-primary mb-2">
            <Filter className="w-5 h-5" />
            <p className="font-bold tracking-widest text-sm uppercase">Pre-Configuración</p>
          </div>
          <h2 className="text-3xl font-extrabold text-white">Parámetros del Reporte</h2>
          <p className="text-gray-400 mt-2">Ajusta los datos que deseas procesar para las {selectedCameraIds.length} estaciones seleccionadas.</p>
        </div>
        <button onClick={handleCloseEntirely} className="text-white/40 hover:text-white p-2 bg-white/5 rounded-full cursor-pointer transition-colors">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-8">
        
        {/* FILTRO 1: Gráficas (Escalable) */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-5 h-5 text-blue-400" />
            <h3 className="text-xl font-bold text-white">1. Módulos Visuales (Gráficas)</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { id: 'timeline', label: 'Línea de Tiempo' },
              { id: 'frequency', label: 'Frecuencia Horizontal' },
              { id: 'pie', label: 'Composición Total (Torta)' },
              { id: 'biodiversity', label: 'Índice de Biodiversidad' }
            ].map(chart => (
              <label key={chart.id} className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all duration-300 hover:scale-[1.03] ${localActiveCharts.includes(chart.id) ? 'bg-blue-500/20 border-blue-500 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-[#1a1a1a]'}`}>
                <input 
                  type="checkbox" 
                  className="hidden" 
                  checked={localActiveCharts.includes(chart.id)}
                  onChange={() => toggleChart(chart.id)}
                />
                <div className={`w-5 h-5 mr-3 rounded-md border flex items-center justify-center ${localActiveCharts.includes(chart.id) ? 'bg-blue-500 border-blue-500' : 'border-gray-500'}`}>
                  {localActiveCharts.includes(chart.id) && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>}
                </div>
                <span className="font-semibold text-sm leading-tight">{chart.label}</span>
              </label>
            ))}
          </div>
        </section>

        {/* FILTRO 2: Rango de Fechas */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-green-400" />
            <h3 className="text-xl font-bold text-white">2. Rango de Fechas</h3>
          </div>
          <div className="flex gap-4">
            <div className="flex-1 bg-white/5 p-4 rounded-xl border border-white/10">
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Fecha Inicio</label>
              <input 
                type="date" 
                value={localStartDate}
                onChange={(e) => setLocalStartDate(e.target.value)}
                className="w-full bg-black/40 text-white p-3 rounded-lg border border-white/10 focus:outline-none focus:border-green-500" 
              />
            </div>
            <div className="flex-1 bg-white/5 p-4 rounded-xl border border-white/10">
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Fecha Fin</label>
              <input 
                type="date" 
                value={localEndDate}
                onChange={(e) => setLocalEndDate(e.target.value)}
                className="w-full bg-black/40 text-white p-3 rounded-lg border border-white/10 focus:outline-none focus:border-green-500" 
              />
            </div>
          </div>
        </section>

        {/* FILTRO 3: Especies */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-purple-400" />
              <h3 className="text-xl font-bold text-white">3. Filtrar Especies Detectadas</h3>
            </div>
            <button 
              onClick={() => setLocalExcludedSpecies(localExcludedSpecies.length === uniqueSpecies.length ? [] : [...uniqueSpecies])}
              className="text-sm text-purple-400 hover:text-purple-300 font-semibold cursor-pointer"
            >
              {localExcludedSpecies.length === uniqueSpecies.length ? 'Seleccionar Todas' : 'Deseleccionar Todas'}
            </button>
          </div>
          <div className="bg-white/5 p-6 rounded-xl border border-white/10">
            {uniqueSpecies.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No se detectaron especies en esta área.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {uniqueSpecies.map(speciesName => {
                  const isIncluded = !localExcludedSpecies.includes(speciesName);
                  return (
                    <label key={speciesName} className="flex items-center space-x-3 cursor-pointer group transition-all duration-300 hover:scale-[1.05]">
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={isIncluded}
                        onChange={() => toggleSpecies(speciesName)}
                      />
                      <div className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${isIncluded ? 'bg-purple-500 border-purple-500' : 'bg-black/40 border-white/20 group-hover:border-white/40'}`}>
                        {isIncluded && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>}
                      </div>
                      <span className={`capitalize truncate transition-colors ${isIncluded ? 'text-white' : 'text-gray-500'}`}>
                        {speciesName}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </section>

      </div>

      <div className="mt-8 pt-6 border-t border-white/10 flex justify-end gap-4">
        <button 
          onClick={handleCloseEntirely}
          className="px-6 py-3 rounded-xl font-bold text-white hover:bg-[#1a1a1a] transition-all duration-300 hover:scale-105 cursor-pointer"
        >
          Cancelar
        </button>
        <button 
          onClick={handleGenerate}
          className="px-8 py-3 bg-primary hover:bg-green-400 text-black rounded-xl font-extrabold shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-all hover:scale-105 cursor-pointer"
        >
          Generar Reporte →
        </button>
      </div>
    </FloatingPanel>
  );
};
