// src/pages/GenerarCertificadosAdmin.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useKeycloak } from '@react-keycloak/web';
import { getGroupsByPerson } from '../services/CourseService';
import Dropdown from 'react-bootstrap/Dropdown';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/alertStyle.css'; // Aquí defines .alert-danger.custom-dark

export default function GenerarCertificadosAdmin() {
    const { keycloak } = useKeycloak();
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [groups, setGroups] = useState([]);
    const [filtro, setFiltro] = useState('');
    const [documentoFiltro, setDocumentoFiltro] = useState('');
    const [error, setError] = useState('');

    const API = process.env.REACT_APP_API_HOST;
    const now = new Date();

    // Auto-ocultar alerta tras 2s
    useEffect(() => {
        if (!error) return;
        const t = setTimeout(() => setError(''), 3000);
        return () => clearTimeout(t);
    }, [error]);

    // Carga inicial de usuarios
    useEffect(() => {
        (async () => {
        try {
            const resp = await axios.get(`${API}/person/allPerson`, {
            headers: { Authorization: `Bearer ${keycloak.token}` },
            });
            setUsers(resp.data);
        } catch (e) {
            console.error(e);
            setError('No se pudieron cargar los usuarios');
        }
        })();
    }, [API, keycloak]);

    // Normalización y filtrado
    const normalize = str =>
        str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const usuariosFiltrados = users.filter(u => {
        const t = normalize(filtro);
        const d = documentoFiltro.toLowerCase();
        return (
        (normalize(u.firstName || '').includes(t) ||
            normalize(u.lastName || '').includes(t) ||
            normalize(u.email || '').includes(t)) &&
        (d === '' || (u.document || '').toLowerCase().includes(d))
        );
    });

    // Al seleccionar usuario, cargo grupos
    useEffect(() => {
        if (!selectedUser) return;
        (async () => {
        try {
            const data = await getGroupsByPerson(
            selectedUser.personId,
            keycloak.token
            );
            setGroups(data);
            setError('');
        } catch (e) {
            console.error(e);
            setError('No se pudieron cargar los grupos de este usuario');
        }
        })();
    }, [selectedUser, keycloak]);

    // Abre PDF o muestra error en alerta
    const openPdf = async code => {
        try {
        const resp = await fetch(
            `${API}/certificate/validateCertificate/${code}`,
            {
            method: 'GET',
            headers: { Authorization: `Bearer ${keycloak.token}` },
            }
        );
        if (!resp.ok) {
            const { error: msg } = await resp.json();
            throw new Error(msg || 'Certificado no válido');
        }
        const pdf = await resp.blob();
        const url = URL.createObjectURL(new Blob([pdf], { type: 'application/pdf' }));
        window.open(url, '_blank');
        } catch (e) {
        console.error(e);
        setError(e.message);
        }
    };

    // Generar certificado por nivel
    const generarCertificado = async (payload, endpoint) => {
        try {
        const resp = await axios.post(`${API}${endpoint}`, payload, {
            headers: { Authorization: `Bearer ${keycloak.token}` },
        });
        openPdf(resp.data.code);
        } catch (err) {
        console.error(err);
        const msg = err.response?.data?.error || 'Error al generar el certificado';
        setError(msg);
        }
    };

    // Generar certificado de todos los niveles
    const generarAllLevels = async group => {
        try {
        const resp = await axios.post(
            `${API}/certificate/generateAllLevelsCertificateAdmin`,
            {
            personDocument: selectedUser.document,
            courseId: group.group_id.level_id.id_course.id_course,
            },
            { headers: { Authorization: `Bearer ${keycloak.token}` } }
        );
        openPdf(resp.data.code);
        } catch (err) {
        console.error(err);
        const msg =
            err.response?.data?.error || 'Error al generar certificado completo';
        setError(msg);
        }
    };

    // Si no hay usuario seleccionado → lista usuarios
    if (!selectedUser) {
        return (
        <div className="container mt-4">
            <h5 className="fw-bold mb-4 text-primary">Listado de usuarios</h5>
            {error && (
            <div
                className="alert alert-danger custom-dark position-fixed bottom-0 end-0 m-3"
                role="alert"
                style={{ minWidth: '280px', zIndex: 1055 }}
            >
                {error}
            </div>
            )}

            <div className="row mb-3">
            <div className="col-md-6 mb-2">
                <input
                type="text"
                className="form-control"
                placeholder="Buscar por nombre, apellido o correo"
                value={filtro}
                onChange={e => setFiltro(e.target.value)}
                />
            </div>
            <div className="col-md-6 mb-2">
                <input
                type="text"
                className="form-control"
                placeholder="Filtrar por documento"
                value={documentoFiltro}
                onChange={e => setDocumentoFiltro(e.target.value)}
                />
            </div>
            </div>

            <div className="table-responsive" style={{ minHeight: '400px', maxHeight: '500px', overflowY: 'auto' }}>
            <table className="table table-bordered table-striped text-center mb-0">
                <thead className="table-light sticky-top">
                <tr>
                    <th>Nombre</th>
                    <th>Apellido</th>
                    <th>Tipo Documento</th>
                    <th>Documento</th>
                    <th>Correo</th>
                    <th>Celular</th>
                    <th>Estado</th>
                    <th>Nacimiento</th>
                    <th>Ciudad</th>
                    <th>Departamento</th>
                    <th>Rol(es)</th>
                </tr>
                </thead>
                <tbody>
                {usuariosFiltrados.map(u => (
                    <tr
                    key={u.personId}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedUser(u)}
                    >
                    <td>{u.firstName}</td>
                    <td>{u.lastName}</td>
                    <td>{u.documentType}</td>
                    <td>{u.document}</td>
                    <td>{u.email}</td>
                    <td>{u.phone}</td>
                    <td>{u.status ? 'Activo' : 'Inactivo'}</td>
                    <td>{u.birthDate ? new Date(u.birthDate).toLocaleDateString('es-CO') : ''}</td>
                    <td>{u.location?.locationName || ''}</td>
                    <td>{u.location?.parent?.locationName || ''}</td>
                    <td>{u.roles?.map(r => r.name).join(', ')}</td>
                    </tr>
                ))}
                {usuariosFiltrados.length === 0 && (
                    <tr>
                    <td colSpan="11" className="text-muted py-3">
                        No se encontraron usuarios.
                    </td>
                    </tr>
                )}
                </tbody>
            </table>
            </div>
        </div>
        );
    }

    // Vista de grupos para el usuario seleccionado
    return (
        <div className="container mt-4">
        <button className="btn btn-link mb-3" onClick={() => setSelectedUser(null)}>
            ← Volver a usuarios
        </button>
        <h5 className="fw-bold mb-4">
            Grupos de {selectedUser.firstName} {selectedUser.lastName}
        </h5>

        {error && (
            <div
            className="alert alert-danger custom-dark position-fixed bottom-0 end-0 m-3"
            role="alert"
            style={{ minWidth: '280px', zIndex: 1055 }}
            >
            {error}
            </div>
        )}

        <div className="table-responsive" style={{ minHeight: '400px', maxHeight: '500px', overflowY: 'auto' }}>
            <table className="table table-bordered table-striped text-center mb-0">
            <thead className="table-dark sticky-top">
                <tr>
                <th>Curso</th>
                <th>Nivel</th>
                <th>Grupo</th>
                <th>Inicio</th>
                <th>Fin</th>
                <th>Horario</th>
                <th>Modalidad</th>
                <th>Duración</th>
                <th>Nota</th>
                <th>Certificado</th>
                </tr>
            </thead>
            <tbody>
                {groups.map(g => (
                <tr key={g.group_id.group_id}>
                    <td>{g.group_id.level_id.id_course.course_name}</td>
                    <td>{g.group_id.level_id.level_name}</td>
                    <td>{g.group_id.group_name}</td>
                    <td>{new Date(g.start_date).toLocaleDateString('es-CO')}</td>
                    <td>{new Date(g.end_date).toLocaleDateString('es-CO')}</td>
                    <td>{g.group_id.schedule}</td>
                    <td>
                    {g.group_id.level_id.level_modality === 'In_person'
                        ? 'Presencial'
                        : 'Virtual'}
                    </td>
                    <td>{g.level_duration} Horas</td>
                    <td>{g.calification ?? 'N/A'}</td>
                    <td>
                    <Dropdown as={ButtonGroup}>
                        <Dropdown.Toggle variant="primary">Seleccione un Tipo</Dropdown.Toggle>
                        <Dropdown.Menu>
                        <Dropdown.Item
                            onClick={() =>
                            generarCertificado(
                                {
                                personDocument: selectedUser.document,
                                levelId: g.group_id.level_id.level_id,
                                certificateType: 'BASIC',
                                },
                                '/certificate/generateLevelCertificateAdmin'
                            )
                            }
                        >
                            Básico
                        </Dropdown.Item>
                        <Dropdown.Item
                            onClick={() =>
                                generarCertificado(
                                {
                                    personDocument: selectedUser.document,
                                    levelId: g.group_id.level_id.level_id,
                                    certificateType: 'NOTES',
                                },
                                '/certificate/generateLevelCertificateAdmin'
                                )
                            }
                            >
                            Notas
                        </Dropdown.Item>
                        {g.group_id.level_id.id_course.course_type === 'SKILLS' && (
                            <Dropdown.Item
                                onClick={() =>
                                generarCertificado(
                                    {
                                    personDocument: selectedUser.document,
                                    levelId: g.group_id.level_id.level_id,
                                    certificateType: 'ABILITIES',
                                    },
                                    '/certificate/generateLevelCertificateAdmin'
                                )
                                }
                            >
                                Habilidades
                            </Dropdown.Item>
                            )}
                        <Dropdown.Item onClick={() => generarAllLevels(g)}>
                            Curso Completo ({g.group_id.level_id.id_course.course_name})
                        </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                    </td>
                </tr>
                ))}
                {groups.length === 0 && (
                <tr>
                    <td colSpan="10" className="text-center">
                    No hay grupos.
                    </td>
                </tr>
                )}
            </tbody>
            </table>
        </div>
        </div>
    );
}
