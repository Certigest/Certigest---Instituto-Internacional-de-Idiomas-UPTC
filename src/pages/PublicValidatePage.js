import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import logo from '../assets/Logo.png';
import acreditacion from '../assets/logo_Acreditacion.png';
import '../styles/PublicValidatePage.css';

const PublicValidatePage = () => {
    const [certificateId, setCertificateId] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showQrScanner, setShowQrScanner] = useState(false);
    const scannerRef = useRef(null);
    const navigate = useNavigate();
    const API_HOST = process.env.REACT_APP_API_HOST;

    const isAlfa = errorMessage.toLowerCase().includes('alfanumérico');
    const alertType = isAlfa ? 'alert-warning' : 'alert-danger';
    const customClass = 'custom-dark';

    // Validación y apertura de PDF (memoizada para el useEffect)
    const fetchAndOpenPdf = useCallback(async (code) => {
        try {
            const response = await fetch(`${API_HOST}/certificate/validateCertificate/${code}`);
            if (!response.ok) {
                setErrorMessage('No existe el certificado.');
                return;
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
            window.open(url);
        } catch (error) {
            console.error(error);
            setErrorMessage('Ocurrió un error al intentar validar el certificado.');
        }
    }, [API_HOST]);

    // Auto-cierre de alerta
    useEffect(() => {
        if (!errorMessage) return;
        const timer = setTimeout(() => setErrorMessage(''), 3000);
        return () => clearTimeout(timer);
    }, [errorMessage]);

    const handleAlphanumericValidate = () => {
        if (!certificateId.trim()) {
            setErrorMessage('Por favor, ingresa un código alfanumérico.');
            return;
        }
        setErrorMessage('');
        fetchAndOpenPdf(certificateId);
    };

    const handleValidateQR = () => setShowQrScanner(true);

    const handleCloseScanner = () => {
        if (scannerRef.current) {
            scannerRef.current.clear().catch(console.error);
            scannerRef.current = null;
        }
        setShowQrScanner(false);
    };

    // Iniciar el escáner QR
    useEffect(() => {
        if (!showQrScanner) return;

        const qrRegionId = 'qr-reader-id';
        const scanner = new Html5QrcodeScanner(
            qrRegionId,
            { fps: 10, qrbox: 250 },
            false
        );
        scannerRef.current = scanner;

        scanner.render(
            (decodedText) => {
                handleCloseScanner();

                const prefix = `${API_HOST}/certificate/validateCertificate/`;
                if (decodedText.startsWith(prefix)) {
                    const code = decodedText.substring(prefix.length);
                    fetchAndOpenPdf(code);
                } else {
                    setErrorMessage('El código QR no es válido o no corresponde a un certificado.');
                }
            },
        );

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(console.error);
                scannerRef.current = null;
            }
        };
    }, [showQrScanner, fetchAndOpenPdf]);

    return (
        <div className="public-validate-container">
            <button className="btn-back" onClick={() => navigate('/')}>← Regresar</button>
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

            {!showQrScanner ? (
                <>
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
                            Escanear Código QR
                        </button>
                    </div>
                </>
            ) : (
                <div className="qr-scanner-container">
                    <div id="qr-reader-id" style={{ width: '300px' }}></div>
                    <button className="btn-red mt-2" onClick={handleCloseScanner}>
                        Cerrar escáner
                    </button>
                </div>
            )}

            <footer className="public-footer">
                <img src={acreditacion} alt="Acreditación Alta Calidad" className="footer-acreditacion" />
            </footer>

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
