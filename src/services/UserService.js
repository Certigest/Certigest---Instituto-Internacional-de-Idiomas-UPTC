// src/services/UserService.js
import axios from 'axios';

/**
 * Obtiene la información de cuenta personal.
 * @param {string} token Token JWT de autenticación.
 * @returns {Promise<Object>} Datos del usuario.
 */
export async function getAccountInfo(token) {

  const response = await axios.get('http://localhost:8080/person/personal-account', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

/**
 * Modifica la información de cuenta personal.
 * @param {string} token Token JWT de autenticación.
 * @param {Object} updatedUser Datos actualizados del usuario.
 * @returns {Promise<Object>} Respuesta del backend.
 */
export async function modifyAccountInfo(token, updatedUser) {

  const response = await axios.post('http://localhost:8080/person/modify-personal-account', updatedUser, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}
