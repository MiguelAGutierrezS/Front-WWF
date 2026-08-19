import React, { useState, useMemo } from 'react';
import { SlidePanel } from '../../components/layout/SlidePanel';
import { useModalStore } from '../../store/useModalStore';
import { useMapStore } from '../../store/useMapStore';
import { Menu, Calendar, ChevronDown, ChevronUp, Info, Filter as FilterIcon, Clock, CheckCircle2, Circle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export const FilterPanel = () => {
  const { closeModal } = useModalStore();
  const { globalCameraFilters, setGlobalCameraFilters, species } = useMapStore();
  
  // Local states based on global state
  const [activeTime, setActiveTime] = useState(globalCameraFilters.activeTime || null);
  const [dateStart, setDateStart] = useState(globalCameraFilters.dateStart || '');
  const [dateEnd, setDateEnd] = useState(globalCameraFilters.dateEnd || '');
  const [selectedSpecies, setSelectedSpecies] = useState(globalCameraFilters.selectedSpecies || []);
  
  const [isSpeciesOpen, setIsSpeciesOpen] = useState(true);

  // Extract unique species from all live data
  const uniqueSpecies = useMemo(() => {
    const names = [...new Set(species.map(s => s.common_name))];
    return names.sort();
  }, [species]);

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

  const applyButton = (
    <button 
      onClick={applyFilters}
      className="w-full bg-primary hover:bg-green-400 text-black font-extrabold py-3 text-base rounded-xl flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] cursor-pointer shadow-[0_0_15px_rgba(0,255,136,0.2)]"
    >
      <FilterIcon className="w-5 h-5" />
      Aplicar Filtros al Mapa
    </button>
  );

  return (
    <SlidePanel 
      onClose={closeModal} 
      title="FILTROS GLOBALES" 
      footer={applyButton}
      className="w-[400px] p-0 overflow-hidden bg-black/90"
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar p-5">
        
        {/* Section 1: Time Filters */}
        <div className="bg-black/40 rounded-2xl p-5 border border-white/10 shadow-inner">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-[#00ff88]" />
            <h3 className="font-extrabold text-white tracking-wide">Filtro de Tiempo</h3>
          </div>
          
          <div className="flex justify-between gap-3 mb-5">
            {['HOY', '24 HRS', '7 DÍAS'].map((time) => (
              <button
                key={time}
                onClick={() => handleTimePreset(time)}
                className={`flex-1 py-2.5 rounded-xl text-[11px] font-black tracking-wider transition-all duration-300 cursor-pointer shadow-lg ${
                  activeTime === time 
                    ? 'bg-[#00ff88] text-black shadow-[0_0_15px_rgba(0,255,136,0.4)] scale-105' 
                    : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5 hover:scale-105'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
          
          <div className="pt-4 border-t border-white/5">
            <div className="flex items-center gap-2 mb-3 text-gray-400 text-xs font-semibold uppercase tracking-wider">
              <Calendar className="w-4 h-4" />
              <span>O elegir rango exacto:</span>
            </div>
            <div className="flex flex-col gap-3">
              <input 
                type="date" 
                value={dateStart}
                onChange={(e) => handleDateChange('start', e.target.value)}
                className="w-full bg-black/60 text-white p-3 rounded-xl border border-white/10 focus:outline-none focus:border-[#00ff88] transition-colors text-sm cursor-pointer" 
              />
              <input 
                type="date" 
                value={dateEnd}
                onChange={(e) => handleDateChange('end', e.target.value)}
                className="w-full bg-black/60 text-white p-3 rounded-xl border border-white/10 focus:outline-none focus:border-[#00ff88] transition-colors text-sm cursor-pointer" 
              />
            </div>
          </div>
        </div>

        {/* Section 2: Especies Detectadas */}
        <div className="bg-black/40 rounded-2xl border border-white/10 shadow-inner overflow-hidden">
          <button 
            onClick={() => setIsSpeciesOpen(!isSpeciesOpen)}
            className="w-full p-5 flex justify-between items-center hover:bg-white/5 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <FilterIcon className="w-5 h-5 text-blue-400 group-hover:text-blue-300 transition-colors" />
              <span className="font-extrabold text-white tracking-wide">Especies detectadas</span>
            </div>
            {isSpeciesOpen ? <ChevronUp className="w-5 h-5 text-blue-400" /> : <ChevronDown className="w-5 h-5 text-gray-500 group-hover:text-blue-400 transition-colors" />}
          </button>
          
          <AnimatePresence initial={false}>
            {isSpeciesOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="p-5 pt-0 border-t border-white/5 bg-black/20">
                  <div className="space-y-2 mt-3">
                    {uniqueSpecies.map(sp => {
                      const isChecked = selectedSpecies.includes(sp);
                      return (
                        <label key={sp} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 hover:bg-white/5 hover:scale-[1.02] border border-transparent hover:border-white/5">
                          <input 
                            type="checkbox" 
                            className="hidden" 
                            checked={isChecked}
                            onChange={() => toggleSpecies(sp)}
                          />
                          {isChecked ? (
                            <CheckCircle2 className="w-5 h-5 text-[#00ff88] drop-shadow-[0_0_8px_rgba(0,255,136,0.5)]" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-600" />
                          )}
                          <span className={`text-sm capitalize transition-colors ${isChecked ? 'text-white font-bold' : 'text-gray-400'}`}>
                            {sp}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </SlidePanel>
  );
};
