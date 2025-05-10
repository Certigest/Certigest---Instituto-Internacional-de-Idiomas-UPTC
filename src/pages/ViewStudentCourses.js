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

  const formatDate = (date) => {
    const newDate = new Date(date);
    return newDate.toLocaleDateString();
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
              <th>Duración</th>
              <th>Nota</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {groups.length > 0 ? (
              groups.map((group) => (
                <tr key={group.group_id}>
                  <td>{group.level_id?.id_course?.course_name || 'Desconocido'}</td>
                  <td>{group.level_id?.level_name || 'Desconocido'}</td>
                  <td>{group.group_name}</td>
                  <td>{formatDate(group.start_date)}</td>
                  <td>{formatDate(group.end_date)}</td>
                  <td>{group.schedule}</td>
                  <td>{group.LEVEL_MODALITY}</td>
                  <td>{group.level_duration}</td>
                  <td>{group.calification !== null ? group.calification : 'N/A'}</td>
                  <td>
                    <button className="btn btn-primary">Acción</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="text-center">No hay grupos disponibles</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentGroupsTable;
