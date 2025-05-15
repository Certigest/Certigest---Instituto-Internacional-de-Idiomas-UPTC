import React, { useEffect, useState } from 'react';
import { getGroupsByStudent } from '../services/CourseService';
import { useKeycloak } from '@react-keycloak/web';
import Dropdown from 'react-bootstrap/Dropdown';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/alertStyle.css';

const StudentGroupsTable = () => {
  const { keycloak } = useKeycloak();
  const [groups, setGroups] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  const API_HOST = process.env.REACT_APP_API_HOST;
  const now = new Date();

  // Auto-ocultar la alerta a los 2s
  useEffect(() => {
    if (!errorMessage) return;
    const t = setTimeout(() => setErrorMessage(''), 3000);
    return () => clearTimeout(t);
  }, [errorMessage]);

  async function extractErrorMessage(response) {
    try {
      const text = await response.text();
      const json = JSON.parse(text);
      return json.error || json.message || text;
    } catch {
      return 'Error desconocido del servidor';
    }
  }

  // Carga inicial de grupos
  useEffect(() => {
    const fetchGroups = async () => {
      if (keycloak?.authenticated) {
        try {
          const data = await getGroupsByStudent(keycloak.token);
          setGroups(data);
        } catch (err) {
          console.error('Error al obtener los grupos del estudiante:', err);
          setErrorMessage('Error al cargar los grupos.');
        }
      }
    };
    fetchGroups();
  }, [keycloak]);

  const formatDate = (date) => new Date(date).toLocaleDateString('es-CO');

  // Abrir PDF y gestionar error
  const openPdf = (code) => {
    window.open(`${API_HOST}/certificate/validateCertificate/${code}`, '_blank');
  };

  // Generar certificado de nivel
  const handleLevelCertificate = async (group_id, type) => {
    const payload = {
      levelId: group_id.level_id.level_id,
      certificateType: type,
    };
    try {
      const resp = await fetch(`${API_HOST}/certificate/generateLevelCertificate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${keycloak.token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) {
        const msg = await extractErrorMessage(resp);
        throw new Error(msg);
      }
      const { code } = await resp.json();
      openPdf(code);
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message);
    }
  };

  // Generar certificado de todos los niveles
  const handleAllLevelsCertificate = async (group) => {
    const payload = { courseId: group.level_id.id_course.id_course };
    try {
      const resp = await fetch(`${API_HOST}/certificate/generateAllLevelsCertificate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${keycloak.token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) {
        const msg = await extractErrorMessage(resp);
        throw new Error(msg);
      }
      const { code } = await resp.json();
      openPdf(code);
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="fw-bold mb-4">Grupos del Estudiante</h2>

      {/* Alerta de error fija */}
      {errorMessage && (
        <div className="alert alert-danger custom-dark position-fixed bottom-0 end-0 m-3">
          {errorMessage}
        </div>
      )}

      <div className="table-responsive">
        <table className="table table-bordered table-striped shadow">
          <thead className="table-dark">
            <tr>
              <th>Curso</th>
              <th>Nivel</th>
              <th>Grupo</th>
              <th>Fecha Inicio</th>
              <th>Fecha Fin</th>
              <th>Horario</th>
              <th>Modalidad</th>
              <th>Duración (Horas)</th>
              <th>Nota</th>
              <th>Certificado</th>
            </tr>
          </thead>
          <tbody>
            {groups.length > 0 ? (
              groups.map(
                ({
                  group_id,
                  calification,
                  start_date,
                  end_date,
                  level_duration,
                }) => (
                  <tr key={group_id.group_id}>
                    <td>
                      {group_id.level_id.id_course.course_name ||
                        'Desconocido'}
                    </td>
                    <td>
                      {group_id.level_id.level_name || 'Desconocido'}
                    </td>
                    <td>{group_id.group_name}</td>
                    <td>{formatDate(start_date)}</td>
                    <td>{formatDate(end_date)}</td>
                    <td>{group_id.schedule}</td>
                    <td>
                      {{
                        In_person: 'Presencial',
                        virtual: 'Virtual',
                      }[group_id.level_id.level_modality] || 'Desconocido'}
                    </td>
                    <td>{level_duration}</td>
                    <td>{calification != null ? calification : 'N/A'}</td>
                    <td>
                      <Dropdown as={ButtonGroup}>
                        <Dropdown.Toggle
                          variant="primary"
                          id={`dropdown-${group_id.group_id}`}
                        >
                          Seleccione un Tipo
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item
                            onClick={() =>
                              handleLevelCertificate(group_id, 'BASIC')
                            }
                          >
                            Básico
                          </Dropdown.Item>
                          <Dropdown.Item
                              onClick={() =>
                                handleLevelCertificate(group_id, 'NOTES')
                              }
                          >
                              Notas
                          </Dropdown.Item>
                          {group_id.level_id.id_course.course_type ===
                              'SKILLS' && (
                              <Dropdown.Item
                                onClick={() =>
                                  handleLevelCertificate(
                                    group_id,
                                    'ABILITIES'
                                  )
                                }
                              >
                                Habilidades
                              </Dropdown.Item>
                            )}
                          <Dropdown.Item
                            onClick={() =>
                              handleAllLevelsCertificate(group_id)
                            }
                          >
                            Curso Completo
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </td>
                  </tr>
                )
              )
            ) : (
              <tr>
                <td colSpan="10" className="text-center">
                  No hay grupos disponibles
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentGroupsTable;
