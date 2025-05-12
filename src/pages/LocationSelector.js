import React, { useState, useEffect } from 'react';
import axios from 'axios';
import keycloak from '../services/keycloak-config'; // Ajusta la ruta según la estructura de tu proyecto

const LocationSelector = ({ onSelect }) => {
  const [departamentos, setDepartamentos] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${keycloak.token}`,
  });

  const API_HOST = process.env.REACT_APP_API_HOST;

  useEffect(() => {
    axios.get(`${API_HOST}/api/locations`, { headers: getAuthHeaders() })
      .then(response => setDepartamentos(response.data))
      .catch(error => console.error('Error al obtener departamentos:', error));
  }, [API_HOST]);
  

  useEffect(() => {
    if (selectedDepartment) {
      axios.get(`${API_HOST}/api/locations?parentId=${selectedDepartment}`, { headers: getAuthHeaders() })
        .then(response => setCiudades(response.data))
        .catch(error => console.error('Error al obtener ciudades:', error));
    }
  }, [API_HOST, selectedDepartment]);

  return (
    <div>
      <label>Departamento</label>
      <select className="form-select" onChange={e => setSelectedDepartment(e.target.value)} defaultValue="">
        <option value="" disabled>Selecciona un departamento</option>
        {departamentos.map(loc => (
          <option key={loc.idLocation} value={loc.idLocation}>{loc.locationName}</option>
        ))}
      </select>

      {ciudades.length > 0 && (
        <>
          <label className="mt-3">Ciudad</label>
          <select className="form-select" onChange={e => onSelect(e.target.value)} defaultValue="">
            <option value="" disabled>Selecciona una ciudad</option>
            {ciudades.map(loc => (
              <option key={loc.idLocation} value={loc.idLocation}>{loc.locationName}</option>
            ))}
          </select>
        </>
      )}
    </div>
  );
};

export default LocationSelector;
