// src/pages/Roles.js
import React from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { useNavigate } from 'react-router-dom';

function Roles() {
  const { keycloak } = useKeycloak();
  const navigate = useNavigate();

  const allowedRoles = ['admin', 'teacher', 'student'];
  const roles = keycloak.tokenParsed?.realm_access?.roles || [];

  const filteredRoles = roles.filter(role => allowedRoles.includes(role));

  const handleRoleSelect = (role) => {
    localStorage.setItem('selectedRole', role);
    navigate('/home');
  };

  return (
    <div className="p-4">
      <h2>Selecciona un rol para continuar</h2>
      {filteredRoles.length > 0 ? (
        filteredRoles.map((role) => (
          <button
            key={role}
            onClick={() => handleRoleSelect(role)}
            className="btn btn-primary m-2"
          >
            Usar como {role}
          </button>
        ))
      ) : (
        <p>No tienes roles válidos asignados (admin, teacher o student).</p>
      )}
    </div>
  );
}

export default Roles;
