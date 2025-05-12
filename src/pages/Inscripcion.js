import React, { useEffect, useState } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { getAllCourses } from '../services/CourseService';
import { useNavigate } from 'react-router-dom';

export default function CourseList() {
  const { keycloak } = useKeycloak();
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      if (keycloak?.authenticated) {
        try {
          const data = await getAllCourses(keycloak.token);
          setCourses(data);
        } catch (error) {
          console.error('Error al obtener los cursos:', error);
        }
      }
    };

    fetchCourses();
  }, [keycloak]);

  if (!keycloak?.authenticated || !courses.length) {
    return <div className="text-center mt-4">Cargando cursos...</div>;
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4 fw-bold">Cursos</h2>
      <div className="row">
        {courses.map((course) => (
          <div className="col-md-6 col-lg-4 mb-4" key={course.id_course}>
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title">{course.course_name}</h5>
                <h6 className="card-subtitle mb-2 text-muted">{course.language}</h6>
                <p className="card-text">{course.course_description}</p>
                <ul className="list-group list-group-flush mb-3">
                  <li className="list-group-item"><strong>Tipo:</strong> {course.course_type}</li>
                  <li className="list-group-item"><strong>Creación:</strong> {new Date(course.creation_date).toLocaleDateString()}</li>
                </ul>
                <button
                  className="btn btn-warning fw-bold shadow"
                  onClick={() => navigate(`/niveles-curso/${course.id_course}`)}
                >
                  Ver Detalles
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="text-center mt-3">
        <p className="mt-2 mb-1">¿Tiene un archivo con la lista de niveles que han visto los estudiantes?</p>
        <button className="btn btn-warning fw-bold px-4 py-2 rounded-pill shadow" onClick={() => navigate('/inscripcion-masiva')}>
          Cargar Estudiantes Inscritos
        </button>
      </div>
    </div>
  );
}
