import React, { useEffect, useState } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/alertStyle.css';

export default function ViewStudentCertificates() {
    const { keycloak } = useKeycloak();
    const [history, setHistory] = useState([]);
    const [error, setError] = useState('');
    const API_HOST = process.env.REACT_APP_API_HOST;

    // Auto-limpieza del error tras 2s
    useEffect(() => {
        if (!error) return;
        const timer = setTimeout(() => setError(''), 3000);
        return () => clearTimeout(timer);
    }, [error]);

    // Carga historial de certificados
    useEffect(() => {
        const fetchHistory = async () => {
        try {
            const resp = await fetch(`${API_HOST}/certificate/myCertificates`, {
            headers: { Authorization: `Bearer ${keycloak.token}` }
            });
            if (!resp.ok) throw new Error('Error cargando certificados');
            setHistory(await resp.json());
        } catch (err) {
            console.error(err);
            setError('No se pudo cargar el historial.');
        }
        };
        if (keycloak?.authenticated) fetchHistory();
    }, [API_HOST, keycloak]);

    // Abrir PDF y manejar errores
    const openPdf = async (code) => {
        try {
        const resp = await fetch(
            `${API_HOST}/certificate/validateCertificate/${code}`,
            {
            method: 'GET',
            headers: { Authorization: `Bearer ${keycloak.token}` }
            }
        );
        if (!resp.ok) throw new Error('No válido');
            const blob = await resp.blob();
            const url = URL.createObjectURL(
                new Blob([blob], { type: 'application/pdf' })
        );
        window.open(url, '_blank');
        } catch (err) {
            console.error(err);
            setError('No se pudo abrir el certificado.');
        }
    };

    return (
        <div className="container mt-4">
        <h2 className="fw-bold mb-4">Mis Certificados</h2>

        {/* Alerta de error con estilo oscuro */}
        {error && (
            <div
            className="alert alert-danger custom-dark"
            role="alert"
            style={{ position: 'fixed', bottom: '1rem', right: '1rem', zIndex: 1055, minWidth: '260px' }}
            >
            {error}
            </div>
        )}

        <div className="table-responsive">
            <table className="table table-bordered table-striped">
            <thead className="table-dark">
                <tr>
                <th>Curso</th>
                <th>Nivel</th>
                <th>Fecha Generación</th>
                <th>Tipo</th>
                <th>Código</th>
                <th>Acción</th>
                </tr>
            </thead>
            <tbody>
                {history.length > 0 ? (
                history.map((certificate) => {
                    const tipoTraducido = {
                    BASIC: 'Básico',
                    NOTES: 'Notas',
                    ALL_LEVEL: 'Curso Completo',
                    ABILITIES: 'Habilidades'
                    }[certificate.certificateType] || certificate.certificateType;

                    return (
                    <tr key={certificate.code}>
                        <td>{certificate.courseName}</td>
                        <td>{certificate.levelName}</td>
                        <td>
                        {new Date(certificate.generationDate).toLocaleDateString(
                            'es-ES'
                        )}
                        </td>
                        <td>{tipoTraducido}</td>
                        <td>{certificate.code}</td>
                        <td>
                        <button
                            className="btn btn-warning"
                            onClick={() => openPdf(certificate.code)}
                        >
                            Ver PDF
                        </button>
                        </td>
                    </tr>
                    );
                })
                ) : (
                <tr>
                    <td colSpan="6" className="text-center">
                    No hay certificados.
                    </td>
                </tr>
                )}
            </tbody>
            </table>
        </div>
        </div>
    );
}
