import React, { useState, useMemo } from 'react';
import { FloatingPanel } from '../../components/layout/FloatingPanel';
import { useModalStore } from '../../store/useModalStore';
import { useMapStore } from '../../store/useMapStore';
import { Menu, Calendar, ChevronDown, ChevronUp, Info, Filter as FilterIcon } from 'lucide-react';
import { species } from '../../data/mockDatabase';

export const FilterPanel = () => {
  const { closeModal } = useModalStore();
  const { globalCameraFilters, setGlobalCameraFilters } = useMapStore();
  
  // Local states based on global state
  const [activeTime, setActiveTime] = useState(globalCameraFilters.activeTime || null);
  const [dateStart, setDateStart] = useState(globalCameraFilters.dateStart || '');
  const [dateEnd, setDateEnd] = useState(globalCameraFilters.dateEnd || '');
  const [selectedSpecies, setSelectedSpecies] = useState(globalCameraFilters.selectedSpecies || []);
  
  const [isSpeciesOpen, setIsSpeciesOpen] = useState(true);

  // Extract unique species from all global mock data
  const uniqueSpecies = useMemo(() => {
    const names = [...new Set(species.map(s => s.common_name))];
    return names.sort();
  }, []);

  const handleTimePreset = (time) => {
    if (activeTime === time) {
      setActiveTime(null);
    } else {
      // If selecting a preset, clear custom dates
      setActiveTime(time);
      setDateStart('');
      setDateEnd('');
    }
  };

  const handleDateChange = (type, value) => {
    // If setting custom dates, clear preset
    setActiveTime(null);
    if (type === 'start') setDateStart(value);
    else setDateEnd(value);
  };

  const toggleSpecies = (sp) => {
    if (selectedSpecies.includes(sp)) {
      setSelectedSpecies(selectedSpecies.filter(s => s !== sp));
    } else {
      setSelectedSpecies([...selectedSpecies, sp]);
    }
  };

  const applyFilters = () => {
    setGlobalCameraFilters({
      activeTime,
      dateStart,
      dateEnd,
      selectedSpecies
    });
    closeModal();
  };

  return (
    <FloatingPanel className="w-[450px] p-0 overflow-hidden bg-black/90" title="">
      {/* Header */}
      <div className="bg-black p-4 flex justify-between items-center border-b border-white/10">
        <div className="flex items-center gap-3">
          <Menu className="text-white/60 w-6 h-6" />
          <h3 className="text-primary font-bold tracking-widest text-base">FILTROS GLOBALES</h3>
        </div>
        <button onClick={closeModal} className="text-white/40 hover:text-white transition-colors cursor-pointer">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>

      <div className="p-4 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
        
        {/* Section 1: Time Filters */}
        <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/5">
          <div className="flex justify-between gap-3 mb-4">
            {['HOY', '24 HRS', '7 DÍAS'].map((time) => (
              <button
                key={time}
                onClick={() => handleTimePreset(time)}
                className={`flex-1 py-3 rounded-full text-base font-bold transition-all duration-300 hover:scale-[1.05] cursor-pointer ${
                  activeTime === time 
                    ? 'bg-primary text-black' 
                    : 'bg-black text-white/60 hover:bg-[#1a1a1a] border border-white/10'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
          
          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center gap-2 mb-3 text-white/60 text-sm font-semibold">
              <Calendar className="w-4 h-4" />
              <span>O elegir rango exacto:</span>
            </div>
            <div className="flex gap-2">
              <input 
                type="date" 
                value={dateStart}
                onChange={(e) => handleDateChange('start', e.target.value)}
                className="w-full bg-black text-white/80 p-3 rounded-lg border border-white/10 focus:outline-none focus:border-primary text-base" 
              />
              <input 
                type="date" 
                value={dateEnd}
                onChange={(e) => handleDateChange('end', e.target.value)}
                className="w-full bg-black text-white/80 p-3 rounded-lg border border-white/10 focus:outline-none focus:border-primary text-base" 
              />
            </div>
          </div>
        </div>

        {/* Section 2: Especies Detectadas */}
        <div>
          <button 
            onClick={() => setIsSpeciesOpen(!isSpeciesOpen)}
            className="w-full bg-[#003366] text-white p-5 rounded-lg flex justify-between items-center mb-2 cursor-pointer"
          >
            <span className="font-bold text-lg">Especies / Avistamientos</span>
            {isSpeciesOpen ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
          </button>
          
          {isSpeciesOpen && (
            <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/5 space-y-3">
              {uniqueSpecies.map(sp => {
                const isChecked = selectedSpecies.includes(sp);
                return (
                  <label key={sp} className="flex items-center justify-between cursor-pointer group transition-all duration-300 hover:scale-[1.03]">
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={isChecked}
                        onChange={() => toggleSpecies(sp)}
                      />
                      <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${isChecked ? 'bg-primary border-primary' : 'bg-black border-white/20 group-hover:border-white/40'}`}>
                        {isChecked && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>}
                      </div>
                      <span className={`text-lg capitalize transition-colors ${isChecked ? 'text-white font-medium' : 'text-white/60 group-hover:text-white/80'}`}>
                        {sp}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer / Apply Button */}
      <div className="p-4 bg-black border-t border-white/10">
        <button 
          onClick={applyFilters}
          className="w-full bg-primary hover:bg-green-400 text-black font-extrabold py-4 text-lg rounded-xl flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] cursor-pointer shadow-[0_0_15px_rgba(0,255,136,0.2)]"
        >
          <FilterIcon className="w-6 h-6" />
          Aplicar Filtros al Mapa
        </button>
      </div>

    </FloatingPanel>
  );
};
