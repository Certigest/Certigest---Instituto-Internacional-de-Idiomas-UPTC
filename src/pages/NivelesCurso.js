import React, { useEffect, useState } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { getLevelsByCourse } from '../services/CourseService'; // Asegúrate de tener este servicio
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';

export default function LevelList() {
  const { id } = useParams();
  const { keycloak } = useKeycloak();
  const [levels, setLevels] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLevels = async () => {
      if (keycloak?.authenticated) {
        try {
          const data = await getLevelsByCourse(keycloak.token, id);
          setLevels(data);
        } catch (error) {
          console.error('Error al obtener los niveles:', error);
        }
      }
    };

    fetchLevels();
  }, [keycloak, id]);

  if (!keycloak?.authenticated || !levels.length) {
    return <div className="text-center mt-4">Cargando niveles...</div>;
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4 fw-bold">Niveles</h2>
      <div className="row">
        {levels.map((level) => (
          <div className="col-md-6 col-lg-4 mb-4" key={level.level_id}>
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title">{level.level_name}</h5>
                <h6 className="card-subtitle mb-2 text-muted">{level.id_course.course_name}</h6>
                <p className="card-text">{level.level_description}</p>
                <ul className="list-group list-group-flush mb-3">
                  <li className="list-group-item"><strong>Idioma:</strong> {level.id_course.language}</li>
                  <li className="list-group-item"><strong>Tipo:</strong> {level.id_course.course_type}</li>
                </ul>
                <button
                  className="btn btn-warning fw-bold shadow"
                  onClick={() => navigate(`/grupos-nivel/${level.level_id}`)}
                >
                  Ver Grupos
                </button>
              </div>
              <div className="card-footer text-muted text-end">
                Curso creado el: {new Date(level.id_course.creation_date).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
