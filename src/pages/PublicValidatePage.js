import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/Logo.png';
import acreditacion from '../assets/logo_Acreditacion.png';
import '../styles/PublicValidatePage.css';

const PublicValidatePage = () => {
    const [certificateId, setCertificateId] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    const API_HOST = process.env.REACT_APP_API_HOST;

    // Determina si usar warning o danger
    const isAlfa = errorMessage.toLowerCase().includes('alfanumérico');
    const alertType = isAlfa ? 'alert-warning' : 'alert-danger';
    const customClass = 'custom-dark'; // mismo sufijo para ambos

    // Auto-cierre de la alerta
    useEffect(() => {
        if (!errorMessage) return;
        const timer = setTimeout(() => setErrorMessage(''), 3000);
        return () => clearTimeout(timer);
    }, [errorMessage]);

    const handleAlphanumericValidate = async () => {
        if (!certificateId.trim()) {
        setErrorMessage('Por favor, ingresa un código alfanumérico.');
        return;
        }
        setErrorMessage('');
        await fetchAndOpenPdf(certificateId);
    };

    const handleValidateQR = () => {
        const code = prompt('Por favor, escanea o ingresa manualmente el código QR:');
        if (code) {
        setErrorMessage('');
        fetchAndOpenPdf(code);
        }
    };

    const fetchAndOpenPdf = async (code) => {
        try {
        const response = await fetch(
            `${API_HOST}/certificate/validateCertificate/${code}`,
            { method: 'GET' }
        );
        if (!response.ok) {
            setErrorMessage('No existe el certificado.');
            return;
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(
            new Blob([blob], { type: 'application/pdf' })
        );
        window.open(url);
        } catch (error) {
        console.error('Error al validar certificado:', error);
        setErrorMessage('Ocurrió un error al intentar validar el certificado.');
        }
    };

    const handleBack = () => {
        navigate('/');
    };

    return (
        <div className="public-validate-container">
        <button className="btn-back" onClick={handleBack}>
            ← Regresar
        </button>

        <header className="header-validate">
            <div className="header-content">
            <img
                src={logo}
                alt="Logo Instituto"
                className="header-logo-overlay-public-home"
            />
            <div className="header-banner-validate text-center">
                <h5 className="mb-0 fw-bold text-dark">
                Gestión de certificados Instituto <br />
                Internacional de Idiomas
                </h5>
            </div>
            </div>
        </header>

        <div className="validate-input-container">
            <input
            type="text"
            placeholder="Ingrese el código alfanumérico"
            value={certificateId}
            onChange={(e) => setCertificateId(e.target.value)}
            className="validate-input"
            />
        </div>

        <div className="public-buttons">
            <button className="btn-green" onClick={handleAlphanumericValidate}>
            Código Alfanumérico
            </button>
            <button className="btn-green" onClick={handleValidateQR}>
            Código QR
            </button>
        </div>

        <footer className="public-footer">
            <img
            src={acreditacion}
            alt="Acreditación Alta Calidad"
            className="footer-acreditacion"
            />
        </footer>

        {/* Alerta fija en esquina inferior derecha */}
        {errorMessage && (
            <div
            className={`alert ${alertType} ${customClass} position-fixed bottom-0 end-0 m-3`}
            role="alert"
            style={{ minWidth: '280px', zIndex: 1055 }}
            >
            {errorMessage}
            </div>
        )}
        </div>
    );
};

export default PublicValidatePage;
