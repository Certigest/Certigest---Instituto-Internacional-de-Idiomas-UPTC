import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Header.css';
import logo from '../assets/Logo.png';
import perfil from '../assets/Perfil.png'; // Usa tu imagen real aquí

function Header() {
  const navigate = useNavigate();

  const goToHome = () => {
    navigate('/home');
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
            <span className="badge bg-warning text-dark mb-1">Administrador</span>
            <div className="text-dark">
              Nombre de usuario: <strong>Vanesa</strong>
            </div>
            <button className="btn btn-link p-0 text-danger">Cerrar Sesión</button>
          </div>
          <img
            src={perfil}
            alt="Perfil"
            className="header-profile ms-2"
          />
        </div>
      </div>
    </header>
  );
}

export default Header;
