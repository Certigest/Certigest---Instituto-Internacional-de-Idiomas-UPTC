import { useEffect, useState } from 'react';
import { getGroupsByStudent } from '../services/CourseService';
import { useKeycloak } from '@react-keycloak/web';
import Dropdown from 'react-bootstrap/Dropdown';
import ButtonGroup from 'react-bootstrap/ButtonGroup';

const StudentGroupsTable = () => {
  const { keycloak } = useKeycloak();
  const [groups, setGroups] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

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

  const formatDate = (date) => new Date(date).toLocaleDateString();

  const shouldShowNotesOption = (endDate, calification) => {
    return new Date(endDate) < new Date() && calification != null;
  };

  const shouldShowAbilitiesOption = (endDate, calification) =>
    new Date(endDate) < new Date() && calification >= 3.0;

  const API_HOST = process.env.REACT_APP_API_HOST; 

  const openPdf = async (response, code) => {
    if (!response.ok) throw new Error('Error al generar certificado');
    const url = `${API_HOST}/certificate/validateCertificate/${code}`;
    window.open(url, '_blank');
  };

  const handleLevelCertificate = async (group_id, type) => {
    const payload = {
      levelId: group_id.level_id.level_id,
      certificateType: type,
    };
    try {
      const response = await fetch(`${API_HOST}/certificate/generateLevelCertificate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${keycloak.token}`,
        },
        body: JSON.stringify(payload),
      });
      const { code } = await response.json();
      openPdf(response, code);
    } catch (err) {
      console.error(err);
      alert('No se pudo generar el certificado de nivel.');
    }
  };

  const handleAllLevelsCertificate = async (group) => {
    const payload = { courseId: group.level_id.id_course.id_course };
    try {
      const response = await fetch(`${API_HOST}/certificate/generateAllLevelsCertificate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${keycloak.token}`,
        },
        body: JSON.stringify(payload),
      });
      const { code } = await response.json();
      openPdf(response, code);
    } catch (err) {
      console.error(err);
      alert('No se pudo generar el certificado de curso completo.');
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="fw-bold mb-4">Grupos del Estudiante</h2>

      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

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
              groups.map(({ group_id, calification, start_date, end_date, level_duration }) => (
                <tr key={group_id.group_id}>
                  <td>{group_id.level_id.id_course.course_name || 'Desconocido'}</td>
                  <td>{group_id.level_id.level_name || 'Desconocido'}</td>
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
                      <Dropdown.Toggle variant="primary" id={`dropdown-${group_id.level_id.level_id}`}>
                        Seleccione un Tipo
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => handleLevelCertificate(group_id, 'BASIC')}>
                          Básico
                        </Dropdown.Item>
                        {shouldShowNotesOption(end_date, calification) && (
                          <Dropdown.Item onClick={() => handleLevelCertificate(group_id, 'NOTES')}>
                            Notas
                          </Dropdown.Item>
                        )}
                        {shouldShowAbilitiesOption(end_date, calification) && (
                          <Dropdown.Item onClick={() => handleLevelCertificate(group_id, 'ABILITIES')}>
                            Habilidades
                          </Dropdown.Item>
                        )}
                        <Dropdown.Item onClick={() => handleAllLevelsCertificate(group_id)}>
                          Curso Completo
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </td>
                </tr>
              ))
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