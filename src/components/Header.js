import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Header.css';
import logo from '../assets/Logo.png';
import perfilPlaceholder from '../assets/Perfil.png';
import { useKeycloak } from '@react-keycloak/web';
import axios from 'axios';

const appRoles = ['admin', 'teacher', 'student'];

function Header() {
  const navigate = useNavigate();
  const { keycloak } = useKeycloak();

  const [selectedRole, setSelectedRole] = useState(localStorage.getItem('selectedRole'));
  const [availableRoles, setAvailableRoles] = useState([]);
  const [profileImageUrl, setProfileImageUrl] = useState(null);

  useEffect(() => {
    if (keycloak?.tokenParsed?.realm_access?.roles) {
      const roles = keycloak.tokenParsed.realm_access.roles;
      const filtered = roles.filter((role) => appRoles.includes(role));
      setAvailableRoles(filtered);
    }
  }, [keycloak]);

  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_HOST}/person/image`, {
          headers: {
            Authorization: `Bearer ${keycloak.token}`,
          },
          responseType: 'blob',
        });
        setProfileImageUrl(URL.createObjectURL(response.data));
      } catch (error) {
        console.warn('No se pudo cargar la imagen de perfil:', error.response?.status);
      }
    };

    if (keycloak?.authenticated) {
      fetchProfileImage();
    }
  }, [keycloak]);

  const handleRoleChange = (role) => {
    localStorage.setItem('selectedRole', role);
    setSelectedRole(role);
    navigate('/');
    window.location.reload();
  };

  const logout = () => {
    localStorage.removeItem('selectedRole');
    keycloak.logout();
  };

  const goToHome = () => {
    navigate('/');
  };

  return (
    <header className="header-container border-bottom shadow-sm">
      <div className="d-flex align-items-center justify-content-between px-4 py-3 position-relative">
        <img
          src={logo}
          alt="Logo Instituto"
          className="header-logo-overlay"
          onClick={goToHome}
        />

        <div className="header-banner text-center mx-auto">
          <h5 className="mb-0 fw-bold text-dark">
            Gestión de certificados Instituto <br />
            Internacional de Idiomas
          </h5>
        </div>

        <div className="d-flex align-items-center text-end header-user-box ms-3">
          <div className="me-2 text-start">
            {selectedRole && (
              <div className="dropdown mb-1">
                <button
                  className="btn btn-sm btn-warning dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Rol: {selectedRole}
                </button>
                <ul className="dropdown-menu">
                  {availableRoles.map((role) => (
                    <li key={role}>
                      <button className="dropdown-item" onClick={() => handleRoleChange(role)}>
                        {role}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="text-dark">
              Nombre de usuario: <strong>{keycloak.tokenParsed?.preferred_username || 'Usuario'}</strong>
            </div>
            <button className="btn btn-link p-0 text-danger" onClick={logout}>
              Cerrar Sesión
            </button>
          </div>
          <img
            src={profileImageUrl || perfilPlaceholder}
            alt="Perfil"
            className="header-profile ms-2"
          />
        </div>
      </div>
    </header>
  );
}

export default Header;
