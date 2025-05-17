import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode'; // Solo importamos Html5Qrcode, no el scanner
import logo from '../assets/Logo.png';
import acreditacion from '../assets/logo_Acreditacion.png';
import '../styles/PublicValidatePage.css';

const PublicValidatePage = () => {
    const [certificateId, setCertificateId] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showQrScanner, setShowQrScanner] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [cameraId, setCameraId] = useState('');
    const [cameras, setCameras] = useState([]);
    const qrScannerRef = useRef(null);
    const videoRef = useRef(null);
    const navigate = useNavigate();
    const API_HOST = process.env.REACT_APP_API_HOST;

    const isAlfa = errorMessage.toLowerCase().includes('alfanumérico');
    const alertType = isAlfa ? 'alert-warning' : 'alert-danger';
    const customClass = 'custom-dark';

    // Validación y apertura de PDF
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

    // Obtener lista de cámaras disponibles
    useEffect(() => {
        if (!showQrScanner) return;

        Html5Qrcode.getCameras()
            .then(devices => {
                if (devices && devices.length) {
                    setCameras(devices);
                    
                    // Preferir cámara trasera
                    const backCamera = devices.find(device => 
                        device.label.toLowerCase().includes('back') || 
                        device.label.toLowerCase().includes('trasera') ||
                        device.label.toLowerCase().includes('rear')
                    );
                    
                    // Si hay cámara trasera, usar esa, sino usar la primera
                    setCameraId(backCamera ? backCamera.id : devices[0].id);
                } else {
                    setErrorMessage('No se detectaron cámaras disponibles');
                }
            })
            .catch(err => {
                console.error('Error al obtener cámaras:', err);
                setErrorMessage('No se pudo acceder a la cámara. Revisa los permisos.');
            });
    }, [showQrScanner]);

    // Iniciar y detener el escáner
    useEffect(() => {
        if (!showQrScanner || !cameraId) return;

        const html5QrCode = new Html5Qrcode("qr-reader");
        qrScannerRef.current = html5QrCode;

        const qrCodeSuccessCallback = (decodedText) => {
            // Procesar QR escaneado
            const prefix = `${API_HOST}/certificate/validateCertificate/`;
            let code = decodedText;
            
            if (decodedText.startsWith(prefix)) {
                code = decodedText.substring(prefix.length);
            }
            
            if (code.match(/^[A-Za-z0-9-]+$/)) {
                stopScanner();
                fetchAndOpenPdf(code);
            } else {
                setErrorMessage('El código QR no es válido o no corresponde a un certificado.');
            }
        };

        const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
        };

        const startScanner = () => {
            html5QrCode.start(
                cameraId,
                config,
                qrCodeSuccessCallback,
                () => {} // Ignoramos errores para que no muestre mensajes molestos
            )
            .then(() => {
                setScanning(true);
                console.log('Escáner QR iniciado');
            })
            .catch((err) => {
                console.error('Error al iniciar escáner:', err);
                setErrorMessage('No se pudo iniciar la cámara. Revisa los permisos.');
            });
        };

        startScanner();

        return () => {
            if (qrScannerRef.current && qrScannerRef.current.isScanning) {
                qrScannerRef.current.stop()
                    .then(() => console.log('Escáner QR detenido'))
                    .catch(err => console.error('Error al detener escáner:', err));
            }
        };
    }, [showQrScanner, cameraId, fetchAndOpenPdf, API_HOST]);

    const stopScanner = () => {
        if (qrScannerRef.current && qrScannerRef.current.isScanning) {
            qrScannerRef.current.stop()
                .then(() => {
                    setScanning(false);
                    setShowQrScanner(false);
                })
                .catch(err => console.error('Error al detener escáner:', err));
        } else {
            setShowQrScanner(false);
        }
    };

    const handleAlphanumericValidate = () => {
        if (!certificateId.trim()) {
            setErrorMessage('Por favor, ingresa un código alfanumérico.');
            return;
        }
        setErrorMessage('');
        fetchAndOpenPdf(certificateId);
    };

    // Auto-cierre de alerta
    useEffect(() => {
        if (!errorMessage) return;
        const timer = setTimeout(() => setErrorMessage(''), 3000);
        return () => clearTimeout(timer);
    }, [errorMessage]);

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
                        <button className="btn-green" onClick={() => setShowQrScanner(true)}>
                            Escanear Código QR
                        </button>
                    </div>
                </>
            ) : (
                <div className="qr-scanner-container">
                    <div id="qr-reader" className="qr-reader-simple">
                        {/* Aquí se renderizará el lector de QR */}
                    </div>
                    <div className="scanner-overlay">
                        <div className="scan-region-highlight"></div>
                        <p className="scan-message">Posiciona un código QR dentro del marco</p>
                    </div>
                    <button className="btn-green mt-4" onClick={stopScanner}>
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