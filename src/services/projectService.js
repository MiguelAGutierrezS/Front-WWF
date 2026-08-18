const API_URL = import.meta.env.VITE_API_URL;

/**
 * Servicio para gestionar la entidad Project
 * Nota: Los endpoints POST, PATCH y DELETE requieren el header x-user-id
 */
export const projectService = {
  /**
   * Obtener todos los proyectos
   * @returns {Promise<Array>}
   */
  async getAllProjects() {
    try {
      const response = await fetch(`${API_URL}/projects/`);
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error en getAllProjects:', error);
      throw error;
    }
  },

  /**
   * Obtener un proyecto por su ID
   * @param {string} projectId - UUID del proyecto
   * @returns {Promise<Object>}
   */
  async getProjectById(projectId) {
    try {
      const response = await fetch(`${API_URL}/projects/${projectId}`);
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error en getProjectById (${projectId}):`, error);
      throw error;
    }
  },

  /**
   * Crear un nuevo proyecto
   * @param {Object} projectData - { title*, user_id*, description, objectives, expected_results, status, colaborators }
   * @param {string} userId - UUID del usuario logueado (header x-user-id)
   * @returns {Promise<Object>} Proyecto creado
   */
  async createProject(projectData, userId) {
    try {
      const response = await fetch(`${API_URL}/projects/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify(projectData),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Error HTTP: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error en createProject:', error);
      throw error;
    }
  },

  /**
   * Actualizar un proyecto existente
   * @param {string} projectId - UUID del proyecto
   * @param {Object} projectData - campos a actualizar
   * @param {string} userId - UUID del usuario logueado (header x-user-id)
   * @returns {Promise<Object>}
   */
  async updateProject(projectId, projectData, userId) {
    try {
      const response = await fetch(`${API_URL}/projects/${projectId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify(projectData),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Error HTTP: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error en updateProject (${projectId}):`, error);
      throw error;
    }
  },

  /**
   * Eliminar un proyecto
   * @param {string} projectId - UUID del proyecto
   * @param {string} userId - UUID del usuario logueado (header x-user-id)
   * @returns {Promise<boolean>}
   */
  async deleteProject(projectId, userId) {
    try {
      const response = await fetch(`${API_URL}/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': userId,
        },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Error HTTP: ${response.status}`);
      }
      return true;
    } catch (error) {
      console.error(`Error en deleteProject (${projectId}):`, error);
      throw error;
    }
  },

  /**
   * Añadir colaboradores a un proyecto
   * @param {string} projectId - UUID del proyecto
   * @param {string[]} collaboratorIds - Array de UUIDs de usuarios colaboradores
   * @param {string} userId - UUID del usuario logueado (header x-user-id)
   * @returns {Promise<Object>}
   */
  async addCollaborators(projectId, collaboratorIds, userId) {
    try {
      const response = await fetch(`${API_URL}/projects/${projectId}/collaborators`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({ colaborators: collaboratorIds }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Error HTTP: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error en addCollaborators (${projectId}):`, error);
      throw error;
    }
  },

  /**
   * Obtener proyectos de un usuario (owned + collaborator)
   * @param {string} userId - UUID del usuario
   * @returns {Promise<Object>} { owned_projects: [], collaborator_projects: [] }
   */
  async getUserProjects(userId) {
    try {
      const response = await fetch(`${API_URL}/projects/user/${userId}`, {
        headers: {
          'x-user-id': userId,
        },
      });
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error en getUserProjects (${userId}):`, error);
      throw error;
    }
  },
};
