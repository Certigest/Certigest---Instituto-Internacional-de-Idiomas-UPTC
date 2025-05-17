import React from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/Logo.png';
import acreditacion from '../assets/logo_Acreditacion.png';
import '../styles/PublicHomePage.css';

const PublicHomePage = () => {
    const { keycloak } = useKeycloak();
    const navigate = useNavigate();

    const handleLogin = () => {
        keycloak.login();
    };

    const goToValidate = () => {
        navigate('/validate');
    };

    return (
        <div className="public-container">
            <header className="header-container-public-home">
                <div className="header-content">
                    <img
                        src={logo}
                        alt="Logo Instituto"
                        className="header-logo-overlay-public-home"
                    />
                    <div className="header-banner-public-home text-center">
                        <h5 className="mb-0 fw-bold text-dark">
                            Gestión de certificados Instituto <br />
                            Internacional de Idiomas
                        </h5>
                    </div>
                </div>
            </header>

            <div className="public-buttons">
                <button className="btn-yellow" onClick={handleLogin}>
                    Iniciar Sesión
                </button>
                <button className="btn-yellow" onClick={goToValidate}>
                    Validar Certificado
                </button>
            </div>

            <footer className="public-footer">
                <img
                    src={acreditacion}
                    alt="Acreditación Alta Calidad"
                    className="footer-acreditacion"
                />
            </footer>
        </div>
    );
};

export default PublicHomePage;