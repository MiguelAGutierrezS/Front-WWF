import React, { useEffect, useState } from 'react';
import { useUserStore } from '../../store/useUserStore';
import { UserForm } from './UserForm';
import { FloatingPanel } from '../../components/layout/FloatingPanel';
import { useModalStore } from '../../store/useModalStore';
import { Plus, Users } from 'lucide-react';

export const UserManagerModal = () => {
  const { users, isLoading, error, fetchUsers } = useUserStore();
  const [showForm, setShowForm] = useState(false);
  const { closeModal } = useModalStore();

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <FloatingPanel 
      className="w-[90%] max-w-4xl max-h-[90vh] mx-auto mt-[5vh] p-6 bg-black/95 backdrop-blur-3xl flex flex-col rounded-3xl border border-white/10 shadow-2xl"
    >
      <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/20 rounded-xl">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-white">Gestión de Investigadores</h2>
            <p className="text-sm text-gray-400">Directorio de usuarios registrados en el sistema</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {!showForm && (
            <button 
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-primary text-black px-4 py-2 rounded-xl font-bold hover:bg-green-400 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nuevo Investigador
            </button>
          )}
          <button 
            onClick={closeModal}
            className="text-white/50 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {showForm ? (
          <div className="max-w-2xl mx-auto mb-6">
            <UserForm 
              onSuccess={() => setShowForm(false)} 
              onCancel={() => setShowForm(false)} 
            />
          </div>
        ) : (
          <>
            {isLoading && users.length === 0 ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : error && users.length === 0 ? (
              <div className="bg-red-500/20 text-red-200 p-4 rounded-xl border border-red-500/50 text-center">
                <p>Error al cargar usuarios: {error}</p>
                <button onClick={fetchUsers} className="mt-2 text-sm underline hover:text-white">Reintentar</button>
              </div>
            ) : (
              <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#1f2937] text-white">
                    <tr>
                      <th className="px-6 py-4 font-bold">Nombre Completo</th>
                      <th className="px-6 py-4 font-bold">Email</th>
                      <th className="px-6 py-4 font-bold">Institución</th>
                      <th className="px-6 py-4 font-bold">Sexo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 text-white font-medium">{user.full_name}</td>
                        <td className="px-6 py-4 text-gray-400">{user.email}</td>
                        <td className="px-6 py-4 text-gray-400">{user.institucion || '-'}</td>
                        <td className="px-6 py-4 text-gray-400">{user.sexo || '-'}</td>
                      </tr>
                    ))}
                    {users.length === 0 && !isLoading && (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                          No hay investigadores registrados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </FloatingPanel>
  );
};
