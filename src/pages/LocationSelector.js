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

  useEffect(() => {
    axios.get('http://localhost:8080/api/locations', { headers: getAuthHeaders() })
      .then(response => setDepartamentos(response.data))
      .catch(error => console.error('Error al obtener departamentos:', error));
  }, []);

  useEffect(() => {
    if (selectedDepartment) {
      axios.get(`http://localhost:8080/api/locations?parentId=${selectedDepartment}`, { headers: getAuthHeaders() })
        .then(response => setCiudades(response.data))
        .catch(error => console.error('Error al obtener ciudades:', error));
    }
  }, [selectedDepartment]);

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
