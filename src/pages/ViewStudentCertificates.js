import React, { useEffect, useState } from 'react';
import { useKeycloak } from '@react-keycloak/web';

export default function ViewStudentCertificates() {
    const { keycloak } = useKeycloak();
    const [history, setHistory] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchHistory = async () => {
        try {
            const resp = await fetch('http://localhost:8080/certificate/myCertificates', {
            headers: {
                Authorization: `Bearer ${keycloak.token}`
            }
            });
            if (!resp.ok) throw new Error('Error cargando certificados');
            setHistory(await resp.json());
        } catch (err) {
            console.error(err);
            setError('No se pudo cargar el historial.');
        }
        };
        if (keycloak?.authenticated) fetchHistory();
    }, [keycloak]);

    const openPdf = async (code) => {
        try {
        const resp = await fetch(`http://localhost:8080/certificate/validateCertificate/${code}`, {
            method: 'GET',
            headers: {
            Authorization: `Bearer ${keycloak.token}`
            }
        });
        if (!resp.ok) throw new Error('No válido');
        const blob = await resp.blob();
        const url = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
        window.open(url, '_blank');
        } catch {
        alert('No se pudo abrir el certificado.');
        }
    };

    return (
        <div className="container mt-4">
        <h2 className="fw-bold mb-4">Mis Certificados</h2>
        {error && <div className="alert alert-danger">{error}</div>}
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
                {history.length > 0
                ? history.map((certificate) => (
                    <tr key={certificate.code}>
                        <td>{certificate.courseName}</td>
                        <td>{certificate.levelName}</td>
                        <td>{certificate.generationDate = new Date(certificate.generationDate).toLocaleDateString('es-ES')}</td>
                        <td>{certificate.certificateType}</td>
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
                    ))
                : (
                    <tr>
                    <td colSpan="6" className="text-center">No hay certificados.</td>
                    </tr>
                )}
            </tbody>
            </table>
        </div>
        </div>
    );
}
