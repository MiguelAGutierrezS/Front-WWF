import React, { useState } from 'react';
import { Plus, Camera, Map as MapIcon, X } from 'lucide-react';
import { useModalStore } from '../../store/useModalStore';

export const CreationFAB = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { openModal } = useModalStore();

  const handleAction = (modalName) => {
    setIsOpen(false);
    openModal(modalName);
  };

  return (
    <div className="absolute bottom-8 right-8 z-40 flex flex-col items-end pointer-events-auto">
      
      {/* Menu desplegable */}
      <div 
        className={`flex flex-col gap-3 mb-4 transition-all duration-300 origin-bottom ${
          isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-8 pointer-events-none'
        }`}
      >
        <button 
          onClick={() => handleAction('createStation')}
          className="flex items-center gap-3 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white p-4 pr-6 rounded-full border border-white/10 shadow-lg cursor-pointer transition-colors group"
        >
          <div className="bg-[#00ff88]/20 p-2 rounded-full text-[#00ff88] group-hover:scale-110 transition-transform">
            <Camera className="w-6 h-6" />
          </div>
          <span className="font-bold text-base">Crear Estación</span>
        </button>

        <button 
          onClick={() => handleAction('createProject')}
          className="flex items-center gap-3 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white p-4 pr-6 rounded-full border border-white/10 shadow-lg cursor-pointer transition-colors group"
        >
          <div className="bg-blue-500/20 p-2 rounded-full text-blue-400 group-hover:scale-110 transition-transform">
            <MapIcon className="w-6 h-6" />
          </div>
          <span className="font-bold text-base">Crear Proyecto</span>
        </button>
      </div>

      {/* Main FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full flex items-center justify-center text-black shadow-[0_0_20px_rgba(0,255,136,0.4)] transition-all duration-300 cursor-pointer ${
          isOpen ? 'bg-red-500 rotate-45 shadow-red-500/40' : 'bg-[#00ff88] hover:scale-110'
        }`}
      >
        <Plus className="w-8 h-8" />
      </button>

    </div>
  );
};
