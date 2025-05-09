import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/Logo.png';
import acreditacion from '../assets/logo_Acreditacion.png';
import '../styles/PublicValidatePage.css';

const PublicValidatePage = () => {
    const [certificateId, setCertificateId] = useState('');
    const navigate = useNavigate();

    const handleAlphanumericValidate = async () => {
        if (!certificateId.trim()) {
        alert('Por favor, ingresa un código alfanumérico.');
        return;
        }
        await fetchAndOpenPdf(certificateId);
    };

    const handleValidateQR = () => {
        const code = prompt('Por favor, escanea o ingresa manualmente el código QR:');
        if (code) {
        fetchAndOpenPdf(code);
        }
    };

    const fetchAndOpenPdf = async (code) => {
        try {
        const response = await fetch(
            `http://localhost:8080/certificate/validateCertificate/${code}`,
            { method: 'GET' }
        );
        if (!response.ok) {
            alert('No se pudo validar el certificado.');
            return;
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
        window.open(url);
        } catch (error) {
        console.error('Error al validar certificado:', error);
        alert('Ocurrió un error al intentar validar el certificado.');
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
            <img src={logo} alt="Logo Instituto" className="header-logo-overlay-public-home" />
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
        </div>
    );
};

export default PublicValidatePage;
