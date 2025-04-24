// src/services/UserService.js
import axios from 'axios';

export async function getAccountInfo(token) {
  console.log('🔑 Token enviado al backend:', token); // 👈 Asegúrate que no sea undefined o null

  const response = await axios.get('http://localhost:8080/person/personal-account', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

