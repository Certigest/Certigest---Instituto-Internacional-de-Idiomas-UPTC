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

  const roleInfo = {
    admin: {
      label: 'Administrador',
      image: '/assetsRoles/admin.png',
    },
    teacher: {
      label: 'Docente',
      image: '/assetsRoles/teacher.png',
    },
    student: {
      label: 'Estudiante',
      image: '/assetsRoles/student.png',
    },
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div className="container w-100 shadow-lg rounded p-4 bg-white" style={{ maxWidth: '1140px', maxHeight: '900px'}}>
        <h2 className="text-center mb-4">Selecciona un rol para continuar</h2>
        {filteredRoles.length > 0 ? (
          <div className="row justify-content-center">
            {filteredRoles.map((role) => (
              <div
                className="col-12 col-sm-6 col-md-4 d-flex justify-content-center mb-4"
                key={role}
              >
                <div
                  className="card shadow text-center"
                  style={{ width: '16rem', cursor: 'pointer' }}
                  onClick={() => handleRoleSelect(role)}
                >
                  <img
                    src={roleInfo[role].image}
                    className="card-img-top p-3"
                    alt={roleInfo[role].label}
                  />
                  <div className="card-body">
                    <h5 className="card-title fw-bold">{roleInfo[role].label}</h5>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-danger">No tienes roles válidos asignados (admin, teacher o student).</p>
        )}
      </div>
    </div>
  );
}

export default Roles;
