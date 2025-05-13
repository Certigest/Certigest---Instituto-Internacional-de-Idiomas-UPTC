import React, { useEffect, useState } from "react";
import axios from "axios";
import keycloak from "../services/keycloak-config";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const AdministratorCertificateView = () => {
    console.log("AdministratorCertificateView montado");
    const [certificates, setCertificates] = useState([]);
    const [filtro, setFiltro] = useState("");

    const API_HOST = process.env.REACT_APP_API_HOST;

    useEffect(() => {
        const fetchCertificates = async () => {
        try {
            console.log("Keycloak token:", keycloak.token);
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
    }, [API_HOST]);

    const certificadosFiltrados = certificates.filter((cert) => {
        const filtroLower = filtro.toLowerCase();
        return (
        cert.fullName.toLowerCase().includes(filtroLower) ||
        cert.personId.toLowerCase().includes(filtroLower) ||
        cert.code.toLowerCase().includes(filtroLower)
        );
    });

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
            console.error("Error al visualizar el certificado:", error);
            alert("No se pudo visualizar el certificado.");
        }
    };

    return (
        <div className="container mt-4 bg-white p-4 border rounded shadow-sm">
        <h5 className="fw-bold mb-4 text-primary">Certificados generados</h5>

        <input
            type="text"
            className="form-control mb-3"
            placeholder="Buscar por nombre, apellido, ID o código del certificado"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
        />

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
                        <td>{cert.certificateType}</td>
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
        </div>
    );
};

export default AdministratorCertificateView;
