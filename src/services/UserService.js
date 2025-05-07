import axios from 'axios';
import keycloak from './keycloak-config'; 

/**
 * Obtiene la información de cuenta personal.
 * @returns {Promise<Object>} Datos del usuario.
 */
export async function getAccountInfo() {
  const API_HOST = process.env.REACT_APP_API_HOST;
  const token = keycloak.token;

  const response = await axios.get(`${API_HOST}/person/personal-account`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

/**
 * Modifica la información de cuenta personal.
 * @param {Object} updatedUser Datos actualizados del usuario.
 * @returns {Promise<Object>} Respuesta del backend.
 */
export async function modifyAccountInfo(updatedUser) {
  const API_HOST = process.env.REACT_APP_API_HOST;
  const token = keycloak.token; // obtiene el token desde el closure

  const response = await axios.post(`${API_HOST}/person/modify-personal-account`, updatedUser, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  return response.data;
}


export const modifyPassword = async (token, newPassword) => {
  const API_HOST = process.env.REACT_APP_API_HOST;
  const response = await fetch(`${API_HOST}/person/modifyPassword`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ password: newPassword }),
  });

  if (!response.ok) {
    throw new Error('Error al modificar la contraseña');
  }

  return await response.text();
};
