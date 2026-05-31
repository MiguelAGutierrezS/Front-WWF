import React, { useState } from 'react';
import { useMapStore } from '../../store/useMapStore';
import { Square, Circle, X, Crop } from 'lucide-react';

export const AreaSelectorToolbar = () => {
  const { drawingMode, setDrawingMode, clearSelection, selectionShape } = useMapStore();
  const [isOpen, setIsOpen] = useState(false);

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
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 pointer-events-auto z-50 flex flex-col items-center">
      
      {/* Expanded Menu */}
      <div 
        className={`bg-black/90 backdrop-blur-xl border border-white/20 rounded-3xl p-3 shadow-2xl flex flex-col items-center mb-3 transition-all duration-500 origin-bottom ${
          isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 translate-y-8 pointer-events-none absolute bottom-full'
        }`}
      >
        <p className="text-white/80 text-xs font-medium mb-3 text-center">
          Selecciona un tipo de figura para el recorte
        </p>
        <div className="flex gap-3">
          <button 
            onClick={() => handleModeChange('rectangle')}
            className={`flex flex-col items-center justify-center gap-1.5 w-20 py-3 rounded-2xl transition-all duration-300 cursor-pointer ${
              drawingMode === 'rectangle' 
                ? 'bg-[#00ff88] text-black shadow-[0_0_15px_rgba(0,255,136,0.4)] scale-105' 
                : 'bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:scale-105'
            }`}
          >
            <Square className="w-5 h-5" /> 
            <span className="text-[10px] font-bold">Cuadrado</span>
          </button>
          
          <button 
            onClick={() => handleModeChange('circle')}
            className={`flex flex-col items-center justify-center gap-1.5 w-20 py-3 rounded-2xl transition-all duration-300 cursor-pointer ${
              drawingMode === 'circle' 
                ? 'bg-[#00ff88] text-black shadow-[0_0_15px_rgba(0,255,136,0.4)] scale-105' 
                : 'bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:scale-105'
            }`}
          >
            <Circle className="w-5 h-5" /> 
            <span className="text-[10px] font-bold">Círculo</span>
          </button>
          
          {(drawingMode || hasSelection) && (
            <button 
              onClick={handleCancel}
              className="flex flex-col items-center justify-center gap-1.5 w-20 py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              <X className="w-5 h-5" /> 
              <span className="text-[10px] font-bold">Cancelar</span>
            </button>
          )}
        </div>
      </div>

      {/* Pill Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-full font-extrabold text-xs transition-all duration-500 shadow-2xl cursor-pointer hover:scale-105 ${
          isOpen || drawingMode || hasSelection
            ? 'bg-[#00ff88] text-black shadow-[0_0_20px_rgba(0,255,136,0.5)]' 
            : 'bg-black/80 backdrop-blur-md text-white border border-white/20 hover:bg-black'
        }`}
      >
        <Crop className={`w-4 h-4 transition-transform duration-500 ${isOpen ? 'rotate-90' : ''}`} />
        <span>HERRAMIENTA ESPACIAL</span>
      </button>

    </div>
  );
};
