const API_URL = import.meta.env.VITE_API_URL;

/**
 * Servicio para gestionar la entidad User
 */
export const userService = {
  /**
   * Obtener todos los usuarios
   * @returns {Promise<Array>} Array de usuarios
   */
  async getAllUsers() {
    try {
      const response = await fetch(`${API_URL}/users/`);
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error en getAllUsers:', error);
      throw error;
    }
  },

  /**
   * Obtener un usuario por su ID
   * @param {string} userId - UUID del usuario
   * @returns {Promise<Object>} Datos del usuario
   */
  async getUserById(userId) {
    try {
      const response = await fetch(`${API_URL}/users/${userId}`);
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error en getUserById (${userId}):`, error);
      throw error;
    }
  },

  /**
   * Crear un nuevo usuario
   * @param {Object} userData - { full_name*, email*, institucion, sexo }
   * @returns {Promise<Object>} Usuario creado
   */
  async createUser(userData) {
    try {
      const response = await fetch(`${API_URL}/users/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        // Podrías manejar el 422 Unprocessable Entity específicamente aquí
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Error HTTP: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error en createUser:', error);
      throw error;
    }
  },

  /**
   * Actualizar un usuario existente
   * @param {string} userId - UUID del usuario
   * @param {Object} userData - { full_name, email, institucion, sexo }
   * @returns {Promise<Object>} Usuario actualizado
   */
  async updateUser(userId, userData) {
    try {
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Error HTTP: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error en updateUser (${userId}):`, error);
      throw error;
    }
  },

  /**
   * Eliminar un usuario
   * @param {string} userId - UUID del usuario
   * @returns {Promise<void>} 
   */
  async deleteUser(userId) {
    try {
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Error HTTP: ${response.status} al eliminar`);
      }
      // DELETE a menudo retorna 204 No Content, por lo que no parseamos JSON si no hay cuerpo
      if (response.status !== 204) {
        return await response.json();
      }
      return true;
    } catch (error) {
      console.error(`Error en deleteUser (${userId}):`, error);
      throw error;
    }
  }
};
