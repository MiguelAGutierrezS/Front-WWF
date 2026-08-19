import React, { useState, useEffect, useRef } from 'react';
import { useMapStore } from '../../store/useMapStore';
import { Square, Circle, X, Crop } from 'lucide-react';

export const AreaSelectorToolbar = () => {
  const { drawingMode, setDrawingMode, clearSelection, selectionShape } = useMapStore();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleModeChange = (mode) => {
    if (drawingMode === mode) {
      clearSelection();
    } else {
      setDrawingMode(mode);
    }
  };

  const handleCancel = () => {
    clearSelection();
    setIsOpen(false);
  };

  // Si hay una figura seleccionada (selectionShape) o estamos dibujando, podemos mostrar el estado
  const hasSelection = !!selectionShape;

  return (
    <div ref={containerRef} className="absolute bottom-8 left-1/2 transform -translate-x-1/2 pointer-events-auto z-50 flex flex-col items-center">
      
      {/* Expanded Menu */}
      <div 
        className={`bg-gradient-to-t from-black/90 to-black/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-4 shadow-[0_10px_40px_rgba(0,0,0,0.8)] flex flex-col items-center mb-4 transition-all duration-500 origin-bottom ${
          isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 translate-y-8 pointer-events-none absolute bottom-full'
        }`}
      >
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-4 text-center">
          Modo de Recorte
        </p>
        <div className="flex gap-4">
          <button 
            onClick={() => handleModeChange('rectangle')}
            className={`flex flex-col items-center justify-center gap-2 w-20 py-3 rounded-2xl transition-all duration-300 cursor-pointer group ${
              drawingMode === 'rectangle' 
                ? 'bg-gradient-to-b from-[#00ff88]/20 to-transparent border border-[#00ff88]/50 text-[#00ff88] shadow-[0_0_20px_rgba(0,255,136,0.3)] scale-105' 
                : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5 hover:border-white/20 hover:scale-105'
            }`}
          >
            <Square className={`w-6 h-6 transition-transform duration-300 ${drawingMode === 'rectangle' ? 'scale-110' : 'group-hover:scale-110'}`} /> 
            <span className="text-[10px] font-bold tracking-wide">Cuadrado</span>
          </button>
          
          <button 
            onClick={() => handleModeChange('circle')}
            className={`flex flex-col items-center justify-center gap-2 w-20 py-3 rounded-2xl transition-all duration-300 cursor-pointer group ${
              drawingMode === 'circle' 
                ? 'bg-gradient-to-b from-[#00ff88]/20 to-transparent border border-[#00ff88]/50 text-[#00ff88] shadow-[0_0_20px_rgba(0,255,136,0.3)] scale-105' 
                : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5 hover:border-white/20 hover:scale-105'
            }`}
          >
            <Circle className={`w-6 h-6 transition-transform duration-300 ${drawingMode === 'circle' ? 'scale-110' : 'group-hover:scale-110'}`} /> 
            <span className="text-[10px] font-bold tracking-wide">Círculo</span>
          </button>
          
          {(drawingMode || hasSelection) && (
            <button 
              onClick={handleCancel}
              className="flex flex-col items-center justify-center gap-2 w-20 py-3 rounded-2xl transition-all duration-300 cursor-pointer group bg-gradient-to-b from-red-500/10 to-transparent border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/40 hover:scale-105 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
            >
              <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" /> 
              <span className="text-[10px] font-bold tracking-wide">Cancelar</span>
            </button>
          )}
        </div>
      </div>

      {/* Pill Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center gap-3 px-8 py-3 rounded-full font-black text-xs tracking-widest transition-all duration-500 shadow-2xl cursor-pointer hover:scale-105 ${
          isOpen || drawingMode || hasSelection
            ? 'bg-gradient-to-r from-[#00ff88] to-[#00cc6a] text-black shadow-[0_0_25px_rgba(0,255,136,0.6)]' 
            : 'bg-black/90 backdrop-blur-2xl text-white border border-white/10 hover:bg-black hover:border-white/30'
        }`}
      >
        <Crop className={`w-4 h-4 transition-transform duration-500 ${isOpen ? 'rotate-90' : ''}`} />
        <span>HERRAMIENTA ESPACIAL</span>
      </button>

    </div>
  );
};
