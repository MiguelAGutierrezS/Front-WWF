import React, { useState } from 'react';
import { FloatingPanel } from '../../components/layout/FloatingPanel';
import { useModalStore } from '../../store/useModalStore';
import { useMapStore } from '../../store/useMapStore';
import { UploadCloud, Loader, ImageIcon } from 'lucide-react';
import { cameraStationService } from '../../services/cameraStationService';

export const UploadWidget = () => {
  const { closeModal } = useModalStore();
  const cameraStations = useMapStore(state => state.cameraStations);
  
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedStationId, setSelectedStationId] = useState('');
  const [detectionsResult, setDetectionsResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4', 'video/x-msvideo', 'video/quicktime'];

  const handleFileUpload = async (file) => {
    if (!file) return;
    if (!selectedStationId) {
      setErrorMsg('Por favor selecciona una estación primero.');
      return;
    }
    if (!allowedTypes.includes(file.type)) {
      setErrorMsg('Formato no soportado. Usa JPG, PNG, MP4, AVI o MOV.');
      return;
    }

    setErrorMsg('');
    setUploading(true);
    setDetectionsResult(null);

    try {
      const result = await cameraStationService.uploadMediaFile(selectedStationId, file);
      setDetectionsResult(result.data || result);
    } catch (error) {
      setErrorMsg(error.message || 'Error al procesar el archivo con la IA.');
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const onFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
  };

  return (
    <FloatingPanel 
      title="Subir Multimedia e IA" 
      onClose={closeModal}
      className="w-[500px] max-h-[85vh] flex flex-col"
    >
      <div className="mb-4">
        <label className="block text-sm font-bold text-gray-400 uppercase mb-2">Estación Destino *</label>
        <select 
          value={selectedStationId}
          onChange={(e) => setSelectedStationId(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary transition-colors cursor-pointer appearance-none"
        >
          <option value="" disabled className="bg-gray-900">Selecciona una estación...</option>
          {cameraStations.map(s => (
            <option key={s.id} value={s.id} className="bg-gray-900">{s.station_code} - {s.location_name}</option>
          ))}
        </select>
      </div>

      {errorMsg && (
        <div className="bg-red-500/20 text-red-400 p-3 rounded-lg text-sm mb-4 border border-red-500/30">
          {errorMsg}
        </div>
      )}

      {!uploading && !detectionsResult && (
        <div 
          className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer ${
            isDragging ? 'border-primary bg-primary/10' : 'border-white/20 hover:border-primary/50 bg-black/40'
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
        >
          <label className="cursor-pointer w-full flex flex-col items-center">
            <UploadCloud className="w-10 h-10 text-primary mb-3" />
            <p className="text-sm font-bold text-white mb-1">Arrastra tu archivo aquí</p>
            <p className="text-xs text-gray-400">o haz clic para explorar</p>
            <input type="file" className="hidden" accept=".jpg,.png,.mp4,.avi,.mov" onChange={onFileChange} />
          </label>
        </div>
      )}

      {uploading && (
        <div className="w-full mt-2 p-4 rounded-2xl bg-gray-900 border border-white/10 flex flex-col items-center">
          <div className="w-full h-40 rounded-xl bg-gray-800 animate-pulse mb-4 relative overflow-hidden flex items-center justify-center">
            {/* Shimmer AI effect */}
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_1.5s_infinite]" />
            <Loader className="w-8 h-8 text-primary animate-spin opacity-50 z-10" />
          </div>
          <div className="h-4 bg-gray-800 rounded w-3/4 animate-pulse mb-2"></div>
          <div className="h-3 bg-gray-800 rounded w-1/2 animate-pulse mb-4"></div>
          <div className="flex gap-2">
            <div className="h-6 bg-gray-800 rounded-full w-16 animate-pulse"></div>
            <div className="h-6 bg-gray-800 rounded-full w-20 animate-pulse"></div>
          </div>
          <p className="text-primary text-xs font-bold mt-4 tracking-widest animate-pulse">ANALIZANDO CON IA...</p>
        </div>
      )}

      {detectionsResult && (
        <div className="mt-4 flex-1 overflow-y-auto custom-scrollbar">
          <div className="bg-green-500/20 text-green-400 p-3 rounded-lg text-sm mb-4 border border-green-500/30 font-bold">
            ¡Análisis completado! {detectionsResult.detections_count || (detectionsResult.detections?.length || 0)} detecciones encontradas.
          </div>

          <div className="grid grid-cols-2 gap-3">
            {(detectionsResult.detections || []).map((det, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <div className="h-32 bg-black/50 relative">
                  {det.url_img ? (
                    <img 
                      src={det.url_img} 
                      alt={det.common_name} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/300x200?text=Crop+No+Disponible';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-white/20" />
                    </div>
                  )}
                  {det.is_verified && (
                    <span className="absolute top-2 right-2 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Verificado
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <h4 className="text-primary font-bold text-sm truncate">{det.common_name}</h4>
                  <p className="text-gray-400 text-[10px] italic mb-2 truncate">{det.scientific_name}</p>
                  
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-white/70 bg-white/10 px-1.5 py-0.5 rounded">{det.family} / {det.genus}</span>
                    <span className="text-[#00ff88] font-bold">
                      {Math.round((det.confidence_score || 0) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => setDetectionsResult(null)}
            className="w-full mt-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-colors cursor-pointer text-sm"
          >
            Subir otro archivo
          </button>
        </div>
      )}
    </FloatingPanel>
  );
};
