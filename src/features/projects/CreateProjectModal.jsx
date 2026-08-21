import React, { useState } from 'react';
import { FloatingPanel } from '../../components/layout/FloatingPanel';
import { useModalStore } from '../../store/useModalStore';
import { useUserStore } from '../../store/useUserStore';
import { useProjectStore } from '../../store/useProjectStore';
import { Map as MapIcon, Save } from 'lucide-react';
import { ProjectStatus, ProjectStatusLabels } from '../../constants/enums';

export const CreateProjectModal = () => {
  const { closeModal } = useModalStore();
  const users = useUserStore(state => state.users);
  const { addProject, isLoading, error } = useProjectStore();
  
  // Simulamos que el usuario logueado es el primero
  const currentUser = users[0] || { id: null, full_name: 'Cargando...' };

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    objectives: '',
    expected_results: '',
    status: ProjectStatus.PUBLIC,
    colaborators: []
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser.id) return;
    
    try {
      await addProject({
        title: formData.title,
        description: formData.description || null,
        objectives: formData.objectives || null,
        expected_results: formData.expected_results || null,
        status: formData.status,
        colaborators: formData.colaborators,
        user_id: currentUser.id,
      }, currentUser.id);
      closeModal();
    } catch (err) {
      console.error('Error al crear proyecto:', err);
    }
  };

  return (
    <FloatingPanel className="w-[90%] max-w-2xl max-h-[85vh] mx-auto mt-[5vh] p-0 bg-gradient-to-br from-[#0a0f18] to-black backdrop-blur-3xl flex flex-col rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
      
      {/* Premium Header */}
      <div className="relative bg-gradient-to-r from-blue-900/20 via-[#00ff88]/5 to-transparent border-b border-white/10 p-4 sm:p-5 flex justify-between items-start shrink-0 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#00ff88]/5 rounded-full blur-[80px] pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-1">
            <span className="bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-blue-500/30 tracking-widest shadow-lg flex items-center gap-1.5">
              <MapIcon className="w-3 h-3" />
              Nuevo Registro
            </span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight drop-shadow-md">Crear Proyecto</h2>
          <p className="text-xs text-gray-400 mt-1 font-medium leading-relaxed">Define los parámetros de un nuevo proyecto de conservación en la plataforma.</p>
          <p className="text-[10px] text-gray-500 mt-2 tracking-widest uppercase font-bold">Investigador: <span className="text-[#00ff88]">{currentUser.full_name}</span></p>
        </div>
        
        <button onClick={closeModal} className="relative z-10 text-gray-500 hover:text-red-400 p-2.5 bg-white/5 hover:bg-red-500/10 rounded-full cursor-pointer transition-all duration-300 hover:rotate-90">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 sm:px-8 py-2 mt-4 mb-2">
        <form id="create-project-form" onSubmit={handleSubmit} className="space-y-6">
          
          <div className="bg-black/40 p-6 rounded-2xl border border-white/5 shadow-inner space-y-6">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Título del Proyecto *</label>
              <input 
                type="text" 
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="Ej. Monitoreo de Jaguar en el Pantanal"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-white/20 focus:outline-none focus:border-blue-500 transition-all focus:bg-white/10 shadow-inner"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Descripción General</label>
              <textarea 
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe brevemente el propósito geográfico y biológico..."
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-white/20 focus:outline-none focus:border-blue-500 transition-all focus:bg-white/10 resize-none custom-scrollbar shadow-inner"
              />
            </div>
          </div>

          <div className="bg-black/40 p-6 rounded-2xl border border-white/5 shadow-inner space-y-6">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Objetivos Específicos</label>
              <textarea 
                name="objectives"
                rows={2}
                value={formData.objectives}
                onChange={handleChange}
                placeholder="Ej. Identificar rutas de movimiento y conflictos..."
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-white/20 focus:outline-none focus:border-blue-500 transition-all focus:bg-white/10 resize-none custom-scrollbar shadow-inner"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Resultados Esperados</label>
              <textarea 
                name="expected_results"
                rows={2}
                value={formData.expected_results}
                onChange={handleChange}
                placeholder="Ej. Mapa de calor de actividad, identificación de individuos..."
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-white/20 focus:outline-none focus:border-blue-500 transition-all focus:bg-white/10 resize-none custom-scrollbar shadow-inner"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Visibilidad de Datos *</label>
              <select 
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 transition-all focus:bg-white/10 cursor-pointer shadow-inner appearance-none"
              >
                <option value={ProjectStatus.PUBLIC} className="bg-[#0f172a] text-white">{ProjectStatusLabels[ProjectStatus.PUBLIC]}</option>
                <option value={ProjectStatus.PRIVATE} className="bg-[#0f172a] text-white">{ProjectStatusLabels[ProjectStatus.PRIVATE]}</option>
              </select>
            </div>
          </div>

        </form>
      </div>

      <div className="py-4 px-6 sm:px-8 bg-black/40 border-t border-white/10 flex justify-end gap-4 shrink-0">
        <button 
          type="submit"
          form="create-project-form"
          disabled={isLoading || !currentUser.id}
          className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl font-black shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all hover:scale-105 flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
          {isLoading ? 'Guardando...' : 'Guardar Proyecto'}
        </button>
      </div>
    </FloatingPanel>
  );
};
