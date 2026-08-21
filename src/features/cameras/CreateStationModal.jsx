import React, { useState } from 'react';
import { FloatingPanel } from '../../components/layout/FloatingPanel';
import { useModalStore } from '../../store/useModalStore';
import { Camera, Save, Video } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';
import { useProjectStore } from '../../store/useProjectStore';
import { CameraStationStatus } from '../../constants/enums';

export const CreateStationModal = () => {
  const { closeModal } = useModalStore();
  const users = useUserStore(state => state.users);
  const projects = useProjectStore(state => state.projects);
  
  // Simulamos que el usuario logueado es el primero
  const currentUser = users[0] || { id: 'uuid-unknown', full_name: 'Usuario' };
  const userProjects = projects.filter(p => p.user_id === currentUser.id);

  const [formData, setFormData] = useState({
    project_id: userProjects[0]?.id || '',
    station_code: '',
    location_name: '',
    camera_brand: '',
    camera_model: '',
    serial_number: '',
    days_active: '',
    deployment_date: '',
    status: CameraStationStatus.ACTIVE,
    retrieval_date: ''
  });

  const [selectedVideos, setSelectedVideos] = useState([]);
  const [showErrors, setShowErrors] = useState(false);

  const handleVideoChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 100) {
      alert('⚠️ Solo puedes subir un máximo de 100 videos a la vez.');
      setSelectedVideos(files.slice(0, 100));
    } else {
      setSelectedVideos(files);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const isFormValid = formData.project_id && 
                      formData.station_code && 
                      formData.location_name && 
                      formData.deployment_date &&
                      (formData.status !== 'retrieved' || formData.retrieval_date);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid) {
      setShowErrors(true);
      return;
    }
    console.log('Guardando nueva estación:', formData);
    // Aquí iría la lógica de mutación de backend
    closeModal();
  };

  return (
    <FloatingPanel className="w-[90%] max-w-3xl max-h-[85vh] mx-auto mt-[5vh] p-0 bg-gradient-to-br from-[#0a0f18] to-black backdrop-blur-3xl flex flex-col rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
      
      {/* Premium Header */}
      <div className="relative bg-gradient-to-r from-[#00ff88]/20 via-[#00ff88]/5 to-transparent border-b border-white/10 p-4 sm:p-5 flex justify-between items-start shrink-0 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-[#00ff88]/10 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-1">
            <span className="bg-[#00ff88]/20 text-[#00ff88] text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-[#00ff88]/30 tracking-widest shadow-lg flex items-center gap-1.5">
              <Camera className="w-3 h-3" />
              Nuevo Registro
            </span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight drop-shadow-md">Instalar Estación de Cámara</h2>
          <p className="text-xs text-gray-400 mt-1 font-medium leading-relaxed">Registra un nuevo punto de monitoreo asignado a un proyecto existente.</p>
        </div>
        
        <button type="button" onClick={closeModal} className="relative z-10 text-gray-500 hover:text-red-400 p-2.5 bg-white/5 hover:bg-red-500/10 rounded-full cursor-pointer transition-all duration-300 hover:rotate-90">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 sm:px-8 py-2 mt-4 mb-2">
        <form id="create-station-form" onSubmit={handleSubmit} className="space-y-8">
          
          <div className="bg-black/40 p-6 rounded-2xl border border-white/5 shadow-inner space-y-6">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Proyecto Asignado *</label>
              <select 
                name="project_id"
                value={formData.project_id}
                onChange={handleChange}
                className={`w-full bg-white/5 border ${showErrors && !formData.project_id ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'border-white/10'} rounded-xl p-4 text-white focus:outline-none focus:border-[#00ff88] transition-all focus:bg-white/10 cursor-pointer appearance-none shadow-inner`}
              >
                <option value="" disabled className="bg-[#0f172a] text-white">Selecciona uno de tus proyectos...</option>
                {userProjects.map(p => (
                  <option key={p.id} value={p.id} className="bg-[#0f172a] text-white">{p.title}</option>
                ))}
              </select>
              <p className="text-[10px] text-gray-500 mt-2 tracking-widest uppercase font-bold">
                Solo puedes agregar estaciones a proyectos que tú administras (Usuario actual: <span className="text-blue-400">{currentUser.full_name}</span>).
              </p>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Código de Estación *</label>
                <input 
                  type="text" 
                  name="station_code"
                  value={formData.station_code}
                  onChange={handleChange}
                  placeholder="Ej. CAM-P1-05"
                  className={`w-full bg-white/5 border ${showErrors && !formData.station_code ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'border-white/10'} rounded-xl p-4 text-white placeholder-white/20 focus:outline-none focus:border-[#00ff88] transition-all focus:bg-white/10 uppercase shadow-inner`}
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Nombre de Sector *</label>
                <input 
                  type="text" 
                  name="location_name"
                  value={formData.location_name}
                  onChange={handleChange}
                  placeholder="Ej. Bosque Seco Norte"
                  className={`w-full bg-white/5 border ${showErrors && !formData.location_name ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'border-white/10'} rounded-xl p-4 text-white placeholder-white/20 focus:outline-none focus:border-[#00ff88] transition-all focus:bg-white/10 shadow-inner`}
                />
              </div>
            </div>
          </div>

          <div className="bg-black/40 p-6 rounded-2xl border border-white/5 shadow-inner space-y-6">
            <h3 className="text-sm font-black text-white/80 uppercase tracking-widest border-b border-white/5 pb-2">Especificaciones de Equipo</h3>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Marca <span className="text-gray-600 font-normal">Opc.</span></label>
                <input 
                  type="text" 
                  name="camera_brand"
                  value={formData.camera_brand}
                  onChange={handleChange}
                  placeholder="Ej. Browning"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-white/20 focus:outline-none focus:border-[#00ff88] transition-all focus:bg-white/10 shadow-inner"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Modelo <span className="text-gray-600 font-normal">Opc.</span></label>
                <input 
                  type="text" 
                  name="camera_model"
                  value={formData.camera_model}
                  onChange={handleChange}
                  placeholder="Ej. Recon Force 4K"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-white/20 focus:outline-none focus:border-[#00ff88] transition-all focus:bg-white/10 shadow-inner"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Nº de Serie <span className="text-gray-600 font-normal">Opc.</span></label>
                <input 
                  type="text" 
                  name="serial_number"
                  value={formData.serial_number}
                  onChange={handleChange}
                  placeholder="Ej. SN-987654"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-white/20 focus:outline-none focus:border-[#00ff88] transition-all focus:bg-white/10 shadow-inner"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Instalación *</label>
                <input 
                  type="date" 
                  name="deployment_date"
                  value={formData.deployment_date}
                  onChange={handleChange}
                  className={`w-full bg-white/5 border ${showErrors && !formData.deployment_date ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'border-white/10'} rounded-xl p-4 text-white focus:outline-none focus:border-[#00ff88] transition-all focus:bg-white/10 cursor-pointer shadow-inner`}
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Días Activos <span className="text-gray-600 font-normal">Opc.</span></label>
                <input 
                  type="number" 
                  name="days_active"
                  value={formData.days_active}
                  onChange={handleChange}
                  min="0"
                  placeholder="Ej. 30"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-white/20 focus:outline-none focus:border-[#00ff88] transition-all focus:bg-white/10 shadow-inner [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>

            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Estado *</label>
                <div className="flex bg-black/60 rounded-xl p-1 relative border border-white/10 cursor-pointer w-full h-[58px]">
                  <div className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-[#1e293b] border border-white/10 rounded-lg transition-transform duration-300 shadow-md ${formData.status === CameraStationStatus.RETRIEVED ? 'translate-x-full' : 'translate-x-0'}`}></div>
                  
                  <button type="button" onClick={() => setFormData({...formData, status: CameraStationStatus.ACTIVE, retrieval_date: ''})} className={`flex-1 flex items-center justify-center gap-2 text-sm font-bold z-10 transition-colors h-full ${formData.status === CameraStationStatus.ACTIVE ? 'text-[#00ff88]' : 'text-gray-500 hover:text-white'}`}>
                    <span className="w-2 h-2 rounded-full bg-[#00ff88] shadow-[0_0_8px_rgba(0,255,136,0.8)]"></span> Activa
                  </button>
                  
                  <button type="button" onClick={() => setFormData({...formData, status: CameraStationStatus.RETRIEVED})} className={`flex-1 flex items-center justify-center gap-2 text-sm font-bold z-10 transition-colors h-full ${formData.status === CameraStationStatus.RETRIEVED ? 'text-red-400' : 'text-gray-500 hover:text-white'}`}>
                    <span className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)]"></span> Retirada
                  </button>
                </div>
              </div>
              
              {formData.status === CameraStationStatus.RETRIEVED && (
                <div className="flex-1">
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Fecha Retiro *</label>
                  <input 
                    type="date" 
                    name="retrieval_date"
                    value={formData.retrieval_date}
                    onChange={handleChange}
                    className={`w-full bg-white/5 border ${showErrors && !formData.retrieval_date ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'border-white/10'} rounded-xl p-4 text-white focus:outline-none focus:border-red-400 transition-all focus:bg-white/10 cursor-pointer shadow-inner`}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Carga de Videos para Procesamiento Backend */}
          <div className="bg-gradient-to-br from-[#00ff88]/10 to-transparent border border-[#00ff88]/20 rounded-2xl p-6 sm:p-8 relative overflow-hidden group shadow-inner">
            <div className="absolute inset-0 bg-[#00ff88]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="p-3 bg-[#00ff88]/20 text-[#00ff88] rounded-xl shadow-[0_0_15px_rgba(0,255,136,0.2)]">
                <Video className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-white text-lg tracking-wide drop-shadow-md">Videos de Muestra <span className="text-[#00ff88]">(Procesamiento IA)</span></h3>
                <p className="text-xs font-semibold text-gray-400 mt-1">Archivos cortos (Máx 10 seg) para analizar la fauna de esta cámara en el backend.</p>
              </div>
            </div>
            
            <label className="block w-full border-2 border-dashed border-[#00ff88]/30 hover:border-[#00ff88] rounded-xl p-8 text-center cursor-pointer transition-all bg-black/40 group relative z-10">
              <input 
                type="file" 
                multiple 
                accept="video/mp4,video/x-m4v,video/*"
                onChange={handleVideoChange}
                className="hidden"
              />
              <span className="bg-[#00ff88] hover:bg-green-400 text-black font-extrabold py-3 px-8 rounded-xl shadow-[0_0_20px_rgba(0,255,136,0.3)] inline-block transition-all hover:scale-105 mb-4 uppercase tracking-widest text-xs">
                Seleccionar Videos
              </span>
              <p className="text-gray-400 text-sm font-semibold">
                Sube hasta 100 archivos simultáneamente.
              </p>
            </label>

            {selectedVideos.length > 0 && (
              <div className="mt-6 p-4 bg-black/60 rounded-xl border border-[#00ff88]/30 flex justify-between items-center shadow-lg relative z-10">
                <span className="text-[#00ff88] font-bold text-sm">
                  ✓ {selectedVideos.length} {selectedVideos.length === 1 ? 'video seleccionado' : 'videos seleccionados'} listos para enviar.
                </span>
                <button 
                  type="button" 
                  onClick={() => setSelectedVideos([])}
                  className="text-red-400 hover:text-red-300 text-xs font-bold uppercase tracking-wider bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Limpiar
                </button>
              </div>
            )}
          </div>

        </form>
      </div>

      <div className="py-4 px-6 sm:px-8 bg-black/40 border-t border-white/10 flex justify-end gap-4 shrink-0">
        <button 
          type="submit"
          form="create-station-form"
          className="px-8 py-2.5 bg-gradient-to-r from-[#00ff88] to-[#00cc6a] hover:from-green-400 hover:to-[#00ff88] text-black rounded-xl font-black shadow-[0_0_25px_rgba(0,255,136,0.4)] transition-all hover:scale-105 flex items-center gap-2 cursor-pointer group"
        >
          <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
          Registrar Estación
        </button>
      </div>
    </FloatingPanel>
  );
};
