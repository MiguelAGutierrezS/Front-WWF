import React, { useState } from 'react';
import { useUserStore } from '../../store/useUserStore';

export const UserForm = ({ onSuccess, onCancel }) => {
  const { addUser, isLoading, error } = useUserStore();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    institucion: '',
    sexo: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addUser({
        full_name: formData.full_name,
        email: formData.email,
        institucion: formData.institucion || null,
        sexo: formData.sexo || null
      });
      if (onSuccess) onSuccess();
    } catch (err) {
      // Error is handled in store, but we can catch it here if we want to prevent closing
      console.error("Error al crear usuario", err);
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <h3 className="text-xl font-bold text-white mb-4">Registrar Nuevo Usuario</h3>
      
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Nombre Completo *</label>
          <input 
            type="text" 
            name="full_name"
            required
            value={formData.full_name}
            onChange={handleChange}
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary transition-colors"
            placeholder="Ej. Jane Doe"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Correo Electrónico *</label>
          <input 
            type="email" 
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary transition-colors"
            placeholder="ejemplo@correo.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Institución (Opcional)</label>
          <input 
            type="text" 
            name="institucion"
            value={formData.institucion}
            onChange={handleChange}
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary transition-colors"
            placeholder="Ej. Universidad XYZ"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Sexo (Opcional)</label>
          <select 
            name="sexo"
            value={formData.sexo}
            onChange={handleChange}
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary transition-colors appearance-none"
          >
            <option value="">Seleccionar...</option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
            <option value="Otro">Otro</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-white/10">
          {onCancel && (
            <button 
              type="button" 
              onClick={onCancel}
              className="px-6 py-2 rounded-xl font-bold text-gray-300 bg-white/5 hover:bg-white/10 transition-colors"
            >
              Cancelar
            </button>
          )}
          <button 
            type="submit" 
            disabled={isLoading}
            className="px-6 py-2 rounded-xl font-bold text-black bg-primary hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Guardando...' : 'Crear Usuario'}
          </button>
        </div>
      </form>
    </div>
  );
};
