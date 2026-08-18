import React, { useState } from 'react';
import { FloatingPanel } from '../../components/layout/FloatingPanel';
import { useModalStore } from '../../store/useModalStore';
import { Camera, Save, Video } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';
import { useProjectStore } from '../../store/useProjectStore';

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
    latitude: '',
    longitude: '',
    camera_brand: '',
    camera_model: '',
    status: 'active'
  });

  const [selectedVideos, setSelectedVideos] = useState([]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Guardando nueva estación:', formData);
    // Aquí iría la lógica de mutación de backend
    closeModal();
  };

  return (
    <FloatingPanel className="w-full max-w-2xl max-h-[90vh] mx-auto mt-[5vh] p-8 bg-black/95 backdrop-blur-3xl flex flex-col rounded-3xl border border-white/10 shadow-2xl relative">
      <div className="flex justify-between items-start border-b border-white/10 pb-6 mb-6 shrink-0">
        <div>
          <div className="flex items-center gap-3 text-[#00ff88] mb-2">
            <Camera className="w-5 h-5" />
            <p className="font-bold tracking-widest text-sm uppercase">Nuevo Registro</p>
          </div>
          <h2 className="text-3xl font-extrabold text-white">Instalar Estación de Cámara</h2>
          <p className="text-gray-400 mt-2">Registra un nuevo punto de monitoreo asignado a un proyecto existente.</p>
        </div>
        <button onClick={closeModal} className="text-white/40 hover:text-white p-2 bg-white/5 rounded-full cursor-pointer transition-colors">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        <form id="create-station-form" onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label className="block text-sm font-bold text-gray-400 uppercase mb-2">Proyecto Asignado *</label>
            <select 
              name="project_id"
              required
              value={formData.project_id}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-[#00ff88] transition-colors cursor-pointer appearance-none"
            >
              <option value="" disabled className="bg-gray-900">Selecciona uno de tus proyectos...</option>
              {userProjects.map(p => (
                <option key={p.id} value={p.id} className="bg-gray-900">{p.title}</option>
              ))}
            </select>
            <p className="text-xs text-purple-400 mt-2 font-semibold">
              Solo puedes agregar estaciones a proyectos que tú administras (Usuario actual: {currentUser.full_name}).
            </p>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-400 uppercase mb-2">Código de Estación *</label>
              <input 
                type="text" 
                name="station_code"
                required
                value={formData.station_code}
                onChange={handleChange}
                placeholder="Ej. CAM-P1-05"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-white/20 focus:outline-none focus:border-[#00ff88] transition-colors uppercase"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-400 uppercase mb-2">Nombre de Sector *</label>
              <input 
                type="text" 
                name="location_name"
                required
                value={formData.location_name}
                onChange={handleChange}
                placeholder="Ej. Bosque Seco Norte"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-white/20 focus:outline-none focus:border-[#00ff88] transition-colors"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-400 uppercase mb-2">Latitud (Y) *</label>
              <input 
                type="number" 
                step="any"
                name="latitude"
                required
                value={formData.latitude}
                onChange={handleChange}
                placeholder="Ej. -16.29"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-white/20 focus:outline-none focus:border-[#00ff88] transition-colors font-mono"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-400 uppercase mb-2">Longitud (X) *</label>
              <input 
                type="number" 
                step="any"
                name="longitude"
                required
                value={formData.longitude}
                onChange={handleChange}
                placeholder="Ej. -63.59"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-white/20 focus:outline-none focus:border-[#00ff88] transition-colors font-mono"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-400 uppercase mb-2">Marca del Equipo *</label>
              <input 
                type="text" 
                name="camera_brand"
                required
                value={formData.camera_brand}
                onChange={handleChange}
                placeholder="Ej. Browning"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-white/20 focus:outline-none focus:border-[#00ff88] transition-colors"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-400 uppercase mb-2">Modelo *</label>
              <input 
                type="text" 
                name="camera_model"
                required
                value={formData.camera_model}
                onChange={handleChange}
                placeholder="Ej. Recon Force 4K"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-white/20 focus:outline-none focus:border-[#00ff88] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-400 uppercase mb-2">Estado de Operación</label>
            <select 
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-[#00ff88] transition-colors cursor-pointer appearance-none"
            >
              <option value="active" className="bg-gray-900">🟢 Activa (Grabando / Operativa)</option>
              <option value="inactive" className="bg-gray-900">🔴 Inactiva (En mantenimiento / Robada)</option>
            </select>
          </div>

          {/* Carga de Videos para Procesamiento Backend */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/10 text-gray-200 rounded-lg">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Videos de Muestra (Procesamiento IA)</h3>
                <p className="text-xs text-gray-400">Archivos cortos (Máx 10 seg) para analizar la fauna de esta cámara en el backend.</p>
              </div>
            </div>
            
            <label className="block w-full border-2 border-dashed border-white/20 hover:border-white/50 rounded-xl p-8 text-center cursor-pointer transition-colors bg-black/40">
              <input 
                type="file" 
                multiple 
                accept="video/mp4,video/x-m4v,video/*"
                onChange={handleVideoChange}
                className="hidden"
              />
              <span className="bg-white hover:bg-gray-200 text-black font-bold py-2 px-6 rounded-lg shadow-lg inline-block transition-colors mb-3">
                Seleccionar Videos
              </span>
              <p className="text-gray-400 text-sm font-semibold">
                Sube hasta 100 archivos simultáneamente.
              </p>
            </label>

            {selectedVideos.length > 0 && (
              <div className="mt-4 p-4 bg-black/50 rounded-lg border border-white/5 flex justify-between items-center">
                <span className="text-green-400 font-bold">
                  ✓ {selectedVideos.length} {selectedVideos.length === 1 ? 'video seleccionado' : 'videos seleccionados'} listos para enviar.
                </span>
                <button 
                  type="button" 
                  onClick={() => setSelectedVideos([])}
                  className="text-red-400 hover:text-red-300 text-sm font-semibold"
                >
                  Limpiar
                </button>
              </div>
            )}
          </div>

        </form>
      </div>

      <div className="mt-6 pt-6 border-t border-white/10 flex justify-end gap-4 shrink-0">
        <button 
          onClick={closeModal}
          type="button"
          className="px-6 py-3 rounded-xl font-bold text-white hover:bg-white/5 transition-colors cursor-pointer"
        >
          Cancelar
        </button>
        <button 
          type="submit"
          form="create-station-form"
          className="px-8 py-3 bg-[#00ff88] hover:bg-green-400 text-black rounded-xl font-extrabold shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-all hover:scale-105 flex items-center gap-2 cursor-pointer"
        >
          <Save className="w-5 h-5" />
          Registrar Estación
        </button>
      </div>
    </FloatingPanel>
  );
};
