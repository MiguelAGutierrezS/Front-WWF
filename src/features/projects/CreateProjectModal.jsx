import React, { useState } from 'react';
import { FloatingPanel } from '../../components/layout/FloatingPanel';
import { useModalStore } from '../../store/useModalStore';
import { Map as MapIcon, Save } from 'lucide-react';

export const CreateProjectModal = () => {
  const { closeModal } = useModalStore();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    objectives: '',
    expected_results: '',
    status: 'private'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Guardando nuevo proyecto:', formData);
    // Aquí iría la lógica de mutación de backend
    closeModal();
  };

  return (
    <FloatingPanel className="w-full max-w-2xl max-h-[90vh] mx-auto mt-[5vh] p-8 bg-black/95 backdrop-blur-3xl flex flex-col rounded-3xl border border-white/10 shadow-2xl relative">
      <div className="flex justify-between items-start border-b border-white/10 pb-6 mb-6 shrink-0">
        <div>
          <div className="flex items-center gap-3 text-blue-400 mb-2">
            <MapIcon className="w-5 h-5" />
            <p className="font-bold tracking-widest text-sm uppercase">Nuevo Registro</p>
          </div>
          <h2 className="text-3xl font-extrabold text-white">Crear Proyecto</h2>
          <p className="text-gray-400 mt-2">Define los parámetros de un nuevo proyecto de conservación en la plataforma.</p>
        </div>
        <button onClick={closeModal} className="text-white/40 hover:text-white p-2 bg-white/5 rounded-full cursor-pointer transition-colors">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        <form id="create-project-form" onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label className="block text-sm font-bold text-gray-400 uppercase mb-2">Título del Proyecto *</label>
            <input 
              type="text" 
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="Ej. Monitoreo de Jaguar en el Pantanal"
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-white/20 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-400 uppercase mb-2">Descripción General *</label>
            <textarea 
              name="description"
              required
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe brevemente el propósito geográfico y biológico..."
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-white/20 focus:outline-none focus:border-blue-500 transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-400 uppercase mb-2">Objetivos Específicos *</label>
            <textarea 
              name="objectives"
              required
              rows={2}
              value={formData.objectives}
              onChange={handleChange}
              placeholder="Ej. Identificar rutas de movimiento y conflictos..."
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-white/20 focus:outline-none focus:border-blue-500 transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-400 uppercase mb-2">Resultados Esperados</label>
            <textarea 
              name="expected_results"
              rows={2}
              value={formData.expected_results}
              onChange={handleChange}
              placeholder="Ej. Mapa de calor de actividad, identificación de individuos..."
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-white/20 focus:outline-none focus:border-blue-500 transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-400 uppercase mb-2">Visibilidad de Datos *</label>
            <select 
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 transition-colors cursor-pointer appearance-none"
            >
              <option value="public" className="bg-gray-900">Público (Compartir datos anonimizados)</option>
              <option value="private" className="bg-gray-900">Privado (Solo investigadores autorizados)</option>
            </select>
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
          form="create-project-form"
          className="px-8 py-3 bg-blue-500 hover:bg-blue-400 text-white rounded-xl font-extrabold shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all hover:scale-105 flex items-center gap-2 cursor-pointer"
        >
          <Save className="w-5 h-5" />
          Guardar Proyecto
        </button>
      </div>
    </FloatingPanel>
  );
};
