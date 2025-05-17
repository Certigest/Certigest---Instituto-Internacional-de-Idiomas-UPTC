import React, { useEffect, useState } from "react";
import axios from "axios";
import keycloak from "../services/keycloak-config";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const AdministratorCertificateView = () => {
    const [certificates, setCertificates] = useState([]);
    const [filtroPersona, setFiltroPersona] = useState("");
    const [filtroCodigo, setFiltroCodigo] = useState("");
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const API_HOST = process.env.REACT_APP_API_HOST;

    useEffect(() => {
        const fetchCertificates = async () => {
            try {
                const response = await axios.get(`${API_HOST}/certificate/all`, {
                    headers: {
                        Authorization: `Bearer ${keycloak.token}`,
                    },
                });
                setCertificates(response.data);
            } catch (error) {
                console.error("Error al obtener certificados:", error);
            }
        };

        fetchCertificates();

        // Detectar cambios en el tamaño de pantalla
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [API_HOST]);

    // 1. Filtrado por persona
    const filtradoPorPersona = certificates.filter((cert) => {
        const filtroLower = filtroPersona.toLowerCase();
        return (
            cert.fullName.toLowerCase().includes(filtroLower) ||
            cert.personId.toLowerCase().includes(filtroLower)
        );
    });

    // 2. Filtrado por código dentro del resultado anterior
    const certificadosFiltrados = filtradoPorPersona.filter((cert) =>
        cert.code.toLowerCase().includes(filtroCodigo.toLowerCase())
    );

    const verCertificado = async (code) => {
        try {
            const response = await axios.get(
                `${API_HOST}/certificate/validateCertificate/${code}`,
                {
                    headers: {
                        Authorization: `Bearer ${keycloak.token}`,
                    },
                    responseType: "blob",
                }
            );

            const file = new Blob([response.data], { type: "application/pdf" });
            const fileURL = URL.createObjectURL(file);
            window.open(fileURL, "_blank");
        } catch (error) {
            const reader = new FileReader();
            reader.onload = () => {
                const errorMsg = JSON.parse(reader.result).error;
                alert(errorMsg);
            };
            reader.readAsText(error.response.data);
        }
    };

    // Renderizar certificados como tarjetas para móvil
    const renderCertificadosMobile = () => {
        if (certificadosFiltrados.length === 0) {
            return (
                <div className="text-center text-muted py-4">
                    No se encontraron certificados.
                </div>
            );
        }

        return certificadosFiltrados.map((cert, idx) => {
            const tipoTraducido = {
                BASIC: "Básico",
                NOTES: "Notas",
                ALL_LEVEL: "Curso Completo",
                ABILITIES: "Habilidades",
            }[cert.certificateType] || cert.certificateType;

            return (
                <div key={idx} className="card mb-3">
                    <div className="card-body">
                        <h5 className="card-title">{cert.fullName}</h5>
                        <h6 className="card-subtitle mb-2 text-muted">ID: {cert.personId}</h6>
                        
                        <div className="row my-2">
                            <div className="col-6 fw-bold">Curso:</div>
                            <div className="col-6">{cert.courseName}</div>
                        </div>
                        
                        <div className="row mb-2">
                            <div className="col-6 fw-bold">Nivel:</div>
                            <div className="col-6">{cert.levelName}</div>
                        </div>
                        
                        <div className="row mb-2">
                            <div className="col-6 fw-bold">Tipo:</div>
                            <div className="col-6">{tipoTraducido}</div>
                        </div>
                        
                        <div className="row mb-2">
                            <div className="col-6 fw-bold">Fecha:</div>
                            <div className="col-6">
                                {cert.generationDate
                                    ? new Intl.DateTimeFormat("es-CO").format(
                                        new Date(cert.generationDate)
                                    )
                                    : ""}
                            </div>
                        </div>
                        
                        <div className="row mb-3">
                            <div className="col-6 fw-bold">Código:</div>
                            <div className="col-6 text-break">{cert.code}</div>
                        </div>
                        
                        <button
                            className="btn btn-primary w-100"
                            onClick={() => verCertificado(cert.code)}
                        >
                            <i className="bi bi-eye-fill me-2"></i>Ver Certificado
                        </button>
                    </div>
                </div>
            );
        });
    };

    // Renderizar tabla para pantallas grandes
    const renderTabla = () => {
        return (
            <div className="table-responsive">
                <table className="table table-bordered table-striped align-middle text-center">
                    <thead className="table-light">
                        <tr>
                            <th>Nombre</th>
                            <th>Apellido</th>
                            <th>ID</th>
                            <th>Curso</th>
                            <th>Nivel</th>
                            <th>Fecha de generación</th>
                            <th>Tipo</th>
                            <th>Código</th>
                            <th>Visualizar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {certificadosFiltrados.length > 0 ? (
                            certificadosFiltrados.map((cert, idx) => {
                                const [nombre, ...apellidos] = cert.fullName.split(" ");
                                const tipoTraducido = {
                                    BASIC: "Básico",
                                    NOTES: "Notas",
                                    ALL_LEVEL: "Curso Completo",
                                    ABILITIES: "Habilidades",
                                }[cert.certificateType] || cert.certificateType;

                                return (
                                    <tr key={idx}>
                                        <td>{nombre}</td>
                                        <td>{apellidos.join(" ")}</td>
                                        <td>{cert.personId}</td>
                                        <td>{cert.courseName}</td>
                                        <td>{cert.levelName}</td>
                                        <td>
                                            {cert.generationDate
                                                ? new Intl.DateTimeFormat("es-CO").format(
                                                    new Date(cert.generationDate)
                                                )
                                                : ""}
                                        </td>
                                        <td>{tipoTraducido}</td>
                                        <td>{cert.code}</td>
                                        <td>
                                            <button
                                                className="btn btn-outline-primary btn-sm"
                                                onClick={() => verCertificado(cert.code)}
                                            >
                                                <i className="bi bi-eye-fill"></i> Ver
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="9" className="text-muted py-3">
                                    No se encontraron certificados.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="container-fluid mt-4 px-3 px-md-4">
            <div className="bg-white p-3 p-md-4 border rounded shadow-sm">
                <h5 className="fw-bold mb-3 mb-md-4 text-primary">Certificados generados</h5>

                {/* Filtros */}
                <div className="row g-2 mb-3">
                    <div className="col-12">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Buscar por nombre, apellido o ID"
                            value={filtroPersona}
                            onChange={(e) => setFiltroPersona(e.target.value)}
                        />
                    </div>
                    <div className="col-12">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Buscar por código del certificado"
                            value={filtroCodigo}
                            onChange={(e) => setFiltroCodigo(e.target.value)}
                            disabled={filtradoPorPersona.length === 0}
                        />
                    </div>
                </div>

                {/* Vista condicional basada en tamaño de pantalla */}
                {isMobile ? renderCertificadosMobile() : renderTabla()}
            </div>
        </div>
    );
};

export default AdministratorCertificateView;