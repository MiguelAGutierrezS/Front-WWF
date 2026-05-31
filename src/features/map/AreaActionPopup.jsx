import React from 'react';
import { AdvancedMarker } from '@vis.gl/react-google-maps';
import { useMapStore } from '../../store/useMapStore';
import { useModalStore } from '../../store/useModalStore';
import { FileText } from 'lucide-react';

export const AreaActionPopup = () => {
  const { selectionShape, selectedCameraIds, clearSelection, resetReportFilters } = useMapStore();
  const { openModal } = useModalStore();

  if (!selectionShape || selectedCameraIds.length === 0) return null;

  // Render popup at the top edge of the selection to avoid blocking the center
  let position = { lat: 0, lng: 0 };
  if (selectionShape.type === 'circle') {
    position = selectionShape.center; // For circle, we could offset lat, but center is easy
  } else if (selectionShape.type === 'rectangle') {
    position = {
      lat: selectionShape.bounds.north,
      lng: (selectionShape.bounds.east + selectionShape.bounds.west) / 2
    };
  }

  const handleConfigClick = () => {
    resetReportFilters();
    openModal('reportConfig');
  };

  return (
    <AdvancedMarker position={position} zIndex={9999}>
      <div className="relative -top-12 -left-1/2 transform translate-x-1/4 animate-in zoom-in slide-in-from-bottom-2 duration-300 flex items-center gap-2">
        <button 
          onClick={handleConfigClick}
          className="bg-primary hover:bg-green-400 text-black font-extrabold px-6 py-3 text-base rounded-full shadow-[0_0_20px_rgba(0,255,136,0.5)] flex items-center justify-center whitespace-nowrap border-2 border-black/20 cursor-pointer transition-all hover:scale-105"
        >
          Configurar Reporte ({selectedCameraIds.length} Estaciones)
        </button>
      </div>
    </AdvancedMarker>
  );
};
