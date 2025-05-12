import { useEffect, useState } from 'react';
import { getGroupsByStudent } from '../services/CourseService';
import { useKeycloak } from '@react-keycloak/web';

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

  const openPdf = async (response) => {
    if (!response.ok) throw new Error('Error al generar certificado');
    const blob = await response.blob();
    const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
    window.open(url, '_blank');
  };

  const handleLevelCertificate = async (group, type) => {
    const payload = {
      levelId: group.group_id.level_id.level_id,
      certificateType: type,
    };
    try {
      const response = await fetch(
        'http://localhost:8080/certificate/generateLevelCertificate',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${keycloak.token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      await openPdf(response);
    } catch (err) {
      console.error(err);
      alert('No se pudo generar el certificado de nivel.');
    }
  };

  const handleAllLevelsCertificate = async (group) => {
  const payload = { courseName: group.level_id.id_course.course_name };
    try {
      const response = await fetch(
        'http://localhost:8080/certificate/generateAllLevelsCertificate',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${keycloak.token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      await openPdf(response);
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
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {groups.length > 0 ? (
              groups.map((group) => (
                <tr key={group.group_id}>
                  <td>{group.group_id?.level_id?.id_course?.course_name || 'Desconocido'}</td>
                  <td>{group.group_id?.level_id?.level_name || 'Desconocido'}</td>
                  <td>{group.group_id.group_name}</td>
                  <td>{formatDate(group.start_date)}</td>
                  <td>{formatDate(group.end_date)}</td>
                  <td>{group.group_id.schedule}</td>
                  <td>
                    {{
                      'In_person': 'Presencial',
                      'virtual': 'Virtual',
                    }[group.group_id.level_id.level_modality] || ''}
                  </td>
                  <td>{group.level_duration}</td>
                  <td>{group.calification != null ? group.calification : 'N/A'}</td>
                  <td>
                    <div className="dropdown">
                      <button
                        className="btn btn-primary dropdown-toggle"
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        Acción
                      </button>
                      <ul className="dropdown-menu">
                        <li>
                          <button
                            className="dropdown-item"
                            onClick={() => handleLevelCertificate(group, 'BASIC')}
                          >
                            Básico
                          </button>
                        </li>
                        {shouldShowNotesOption(group.end_date, group.calification) && (
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={() => handleLevelCertificate(group, 'NOTES')}
                            >
                              Notas
                            </button>
                          </li>
                        )}
                        <li>
                          <button
                            className="dropdown-item"
                            onClick={() => handleAllLevelsCertificate(group)}
                          >
                            Curso Completo
                          </button>
                        </li>
                      </ul>
                    </div>
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
