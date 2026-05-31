import React, { useMemo, useState, useEffect } from 'react';
import { FloatingPanel } from '../../components/layout/FloatingPanel';
import { useModalStore } from '../../store/useModalStore';
import { useMapStore } from '../../store/useMapStore';
import { species } from '../../data/mockDatabase';
import { Filter, Calendar, Settings2, BarChart2, Clock, Thermometer } from 'lucide-react';

export const ReportConfigModal = () => {
  const { openModal, closeModal } = useModalStore();
  const { selectedCameraIds, setReportFilters, reportFilters, clearSelection } = useMapStore();

  // Local state para manejar el formulario antes de guardar
  const [localStartDate, setLocalStartDate] = useState(reportFilters.startDate || '');
  const [localEndDate, setLocalEndDate] = useState(reportFilters.endDate || '');
  const [localExcludedSpecies, setLocalExcludedSpecies] = useState(reportFilters.excludedSpecies || []);
  const [localActiveCharts, setLocalActiveCharts] = useState(reportFilters.activeCharts || ['biodiversity', 'seasonal', 'activity', 'occupancy', 'temperature', 'prey', 'rai', 'trophic', 'timeline', 'frequency']);
  const [localActivePeriods, setLocalActivePeriods] = useState(reportFilters.activePeriods || ['Mañana', 'Tarde', 'Noche']);
  const [localTempMin, setLocalTempMin] = useState(reportFilters.tempMin || '');
  const [localTempMax, setLocalTempMax] = useState(reportFilters.tempMax || '');
  const [errorMsg, setErrorMsg] = useState('');

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

  const togglePeriod = (period) => {
    if (localActivePeriods.includes(period)) {
      setLocalActivePeriods(localActivePeriods.filter(p => p !== period));
    } else {
      setLocalActivePeriods([...localActivePeriods, period]);
    }
  };

  const isDateValid = localStartDate && localEndDate;

  const handleGenerate = () => {
    if (!isDateValid) {
      setErrorMsg('⚠️ Debes rellenar la Fecha Inicio y Fecha Fin de manera obligatoria para crear el reporte.');
      // Scroll to top or just let them see the error at the bottom
      return;
    }
    
    setErrorMsg('');
    setReportFilters({
      startDate: localStartDate || null,
      endDate: localEndDate || null,
      excludedSpecies: localExcludedSpecies,
      activeCharts: localActiveCharts,
      activePeriods: localActivePeriods,
      tempMin: localTempMin,
      tempMax: localTempMax
    });
    openModal('customReport');
  };

  if (!selectedCameraIds || selectedCameraIds.length === 0) return null;

  return (
    <FloatingPanel className="w-full max-w-4xl max-h-[90vh] mx-auto mt-[5vh] p-6 bg-black/95 backdrop-blur-3xl flex flex-col rounded-3xl border border-white/10 shadow-2xl relative">
      <div className="flex justify-between items-start border-b border-white/10 pb-4 mb-4">
        <div>
          <div className="flex items-center gap-3 text-primary mb-1">
            <Filter className="w-4 h-4" />
            <p className="font-bold tracking-widest text-xs uppercase">Pre-Configuración</p>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Parámetros del Reporte</h2>
          <p className="text-sm text-gray-400 mt-1">Ajusta los datos que deseas procesar para las {selectedCameraIds.length} estaciones seleccionadas.</p>
        </div>
        <button onClick={handleCloseEntirely} className="text-white/40 hover:text-white p-2 bg-white/5 rounded-full cursor-pointer transition-colors">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-6">
        
        {/* FILTRO 1: Gráficas (Escalable) */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <BarChart2 className="w-4 h-4 text-gray-200" />
            <h3 className="text-lg font-bold text-white">1. Módulos Visuales (Gráficas)</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { id: 'biodiversity', label: 'Índice de Biodiversidad' },
              { id: 'seasonal', label: 'Distribución Estacional' },
              { id: 'activity', label: 'Patrón de Actividad Diaria' },
              { id: 'occupancy', label: 'Ocupación del Hábitat (Psi)' },
              { id: 'temperature', label: 'Temperatura vs Actividad' },
              { id: 'prey', label: 'Abundancia de Presas' },
              { id: 'rai', label: 'Abundancia Relativa (RAI)' },
              { id: 'trophic', label: 'Gremios Tróficos' },
              { id: 'timeline', label: 'Línea de Tiempo' },
              { id: 'frequency', label: 'Frecuencia Horizontal' }
            ].map(chart => (
              <label key={chart.id} className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all duration-300 hover:scale-[1.03] ${localActiveCharts.includes(chart.id) ? 'bg-white border-white text-black' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-[#1a1a1a]'}`}>
                <input 
                  type="checkbox" 
                  className="hidden" 
                  checked={localActiveCharts.includes(chart.id)}
                  onChange={() => toggleChart(chart.id)}
                />
                <div className={`w-5 h-5 mr-3 rounded-md border flex items-center justify-center ${localActiveCharts.includes(chart.id) ? 'bg-black border-black text-white' : 'border-gray-500'}`}>
                  {localActiveCharts.includes(chart.id) && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>}
                </div>
                <span className="font-semibold text-sm leading-tight">{chart.label}</span>
              </label>
            ))}
          </div>
        </section>

        {/* FILTRO 2: Rango de Fechas */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-green-400" />
            <h3 className="text-lg font-bold text-white">2. Rango de Fechas</h3>
          </div>
          <div className="flex gap-4">
            <div className="flex-1 bg-white/5 p-3 rounded-xl border border-white/10">
              <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Fecha Inicio</label>
              <input 
                type="date" 
                value={localStartDate}
                onChange={(e) => { setLocalStartDate(e.target.value); setErrorMsg(''); }}
                className={`w-full bg-black/40 text-white p-3 rounded-lg border ${errorMsg && !localStartDate ? 'border-red-500' : 'border-white/10'} focus:outline-none focus:border-green-500 transition-colors`} 
              />
            </div>
            <div className="flex-1 bg-white/5 p-3 rounded-xl border border-white/10">
              <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Fecha Fin <span className="text-red-400">*</span></label>
              <input 
                type="date" 
                value={localEndDate}
                onChange={(e) => { setLocalEndDate(e.target.value); setErrorMsg(''); }}
                className={`w-full bg-black/40 text-white p-3 rounded-lg border ${errorMsg && !localEndDate ? 'border-red-500' : 'border-white/10'} focus:outline-none focus:border-green-500 transition-colors`} 
              />
            </div>
          </div>
        </section>

        {/* FILTRO 3: Especies */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-gray-200" />
              <h3 className="text-lg font-bold text-white">3. Filtrar Especies Detectadas</h3>
            </div>
            <button 
              onClick={() => setLocalExcludedSpecies(localExcludedSpecies.length === uniqueSpecies.length ? [] : [...uniqueSpecies])}
              className="text-xs text-gray-300 hover:text-white font-semibold cursor-pointer"
            >
              {localExcludedSpecies.length === uniqueSpecies.length ? 'Seleccionar Todas' : 'Deseleccionar Todas'}
            </button>
          </div>
          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
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
                      <div className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${isIncluded ? 'bg-white border-white' : 'bg-black/40 border-white/20 group-hover:border-white/40'}`}>
                        {isIncluded && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>}
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

        {/* FILTRO 4: Periodo del Día */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-gray-200" />
            <h3 className="text-lg font-bold text-white">4. Periodo del Día</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {['Mañana', 'Tarde', 'Noche'].map(period => (
              <label key={period} className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all duration-300 hover:scale-[1.03] ${localActivePeriods.includes(period) ? 'bg-white border-white text-black' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-[#1a1a1a]'}`}>
                <input 
                  type="checkbox" 
                  className="hidden" 
                  checked={localActivePeriods.includes(period)}
                  onChange={() => togglePeriod(period)}
                />
                <div className={`w-5 h-5 mr-3 rounded-md border flex items-center justify-center ${localActivePeriods.includes(period) ? 'bg-black border-black text-white' : 'border-gray-500'}`}>
                  {localActivePeriods.includes(period) && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>}
                </div>
                <span className="font-semibold text-sm">{period}</span>
              </label>
            ))}
          </div>
        </section>

        {/* FILTRO 5: Rango de Temperatura */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Thermometer className="w-4 h-4 text-red-400" />
            <h3 className="text-lg font-bold text-white">5. Rango de Temperatura (°C)</h3>
          </div>
          <div className="flex gap-4">
            <div className="flex-1 bg-white/5 p-3 rounded-xl border border-white/10">
              <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Temp Mínima (°C)</label>
              <input 
                type="number" 
                placeholder="Ej. 20"
                value={localTempMin}
                onChange={(e) => setLocalTempMin(e.target.value)}
                className="w-full bg-black/40 text-white p-3 rounded-lg border border-white/10 focus:outline-none focus:border-red-500" 
              />
            </div>
            <div className="flex-1 bg-white/5 p-3 rounded-xl border border-white/10">
              <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Temp Máxima (°C)</label>
              <input 
                type="number" 
                placeholder="Ej. 35"
                value={localTempMax}
                onChange={(e) => setLocalTempMax(e.target.value)}
                className="w-full bg-black/40 text-white p-3 rounded-lg border border-white/10 focus:outline-none focus:border-red-500" 
              />
            </div>
          </div>
        </section>

      </div>

      <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center gap-3">
        <div className="flex-1">
          {errorMsg && <p className="text-red-400 font-bold animate-in fade-in slide-in-from-bottom-2 text-sm">{errorMsg}</p>}
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleCloseEntirely}
            className="px-4 py-2 rounded-xl font-bold text-white hover:bg-[#1a1a1a] transition-all duration-300 hover:scale-105 cursor-pointer text-sm"
          >
            Cancelar
          </button>
          <button 
            onClick={handleGenerate}
            className="px-6 py-2 bg-primary hover:bg-green-400 text-black rounded-xl font-extrabold shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-all hover:scale-105 cursor-pointer text-sm"
          >
            Generar Reporte →
          </button>
        </div>
      </div>
    </FloatingPanel>
  );
};
