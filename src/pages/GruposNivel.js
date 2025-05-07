import React, { useEffect, useState } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { getGroupsByLevel } from '../services/CourseService';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';

export default function GroupListLevel() {
  const { id } = useParams();
  const { keycloak } = useKeycloak();
  const [groups, setGroups] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroups = async () => {
      if (keycloak?.authenticated) {
        try {
          const data = await getGroupsByLevel(keycloak.token, id);
          setGroups(data);
        } catch (error) {
          console.error('Error al obtener los grupos:', error);
        }
      }
    };

    fetchGroups();
  }, [keycloak, id]);

  if (!keycloak?.authenticated || !groups.length) {
    return <div className="text-center mt-4">Cargando grupos...</div>;
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4 fw-bold">Grupos</h2>
      <div className="row">
        {groups.map((group) => (
          <div className="col-md-6 col-lg-4 mb-4" key={group.group_id}>
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title">{group.level_id.id_course.course_name}</h5>
                <h6 className="card-subtitle mb-2 text-muted">{group.level_id.level_name}</h6>
                <p className="card-text">{group.level_id.level_description}</p>
                <ul className="list-group list-group-flush mb-3">
                  <li className="list-group-item"><strong>Grupo:</strong> {group.group_name}</li>
                  <li className="list-group-item"><strong>Horario:</strong> {group.schedule}</li>
                </ul>
                <div className="text-center mt-4">
                  <button
                    id={group.group_id}
                    className="btn btn-warning fw-bold shadow me-2"
                    onClick={() => navigate(`/grupo-estudiantes/${group.group_id}`)}
                  >
                    Ver estudiantes
                  </button>
                  <button
                    id={group.group_id}
                    className="btn btn-warning fw-bold shadow"
                    onClick={() => navigate(`/inscribir`)}
                  >
                    Inscribir estudiantes
                  </button>
                </div>
              </div>
              <div className="card-footer text-muted text-end">
                Profesor: {group.group_teacher.firstName} {group.group_teacher.lastName}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
