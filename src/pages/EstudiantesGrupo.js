import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';
import { getStudentsByGroupId, removeStudentFromGroup } from '../services/CourseService';

export default function GroupStudents() {
  const { courseId, levelId, groupId } = useParams();
  const { keycloak } = useKeycloak();
  const [students, setStudents] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      if (keycloak?.authenticated) {
        try {
          const data = await getStudentsByGroupId(groupId, keycloak.token);
          setStudents(data);
        } catch (err) {
          setErrorMessage('Error al obtener los estudiantes');
          console.error('Error al obtener los estudiantes:', err);
        }
      }
    };

    fetchStudents();
  }, [courseId, levelId, groupId, keycloak]);

  const handleRemoveStudent = async (studentId) => {
    try {
      await removeStudentFromGroup(groupId, studentId, keycloak.token);

      setStudents(students.filter((s) => s.personId !== studentId));
      setSuccessMessage('Estudiante eliminado con éxito');
      setErrorMessage('');
    } catch (err) {
      setErrorMessage('Error al eliminar el estudiante');
      console.error('Error al eliminar el estudiante:', err);
    }
  };

  return (
    <div className="container mt-4">
      <div className="mb-4">
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <button className="nav-link" onClick={() => navigate('/inscripcion')}>
              Inscripción
            </button>
          </li>
          <li className="nav-item">
            <button className="nav-link" onClick={() => navigate(`/niveles-curso/${courseId}`)}>
              Niveles
            </button>
          </li>
          <li className="nav-item">
            <button className="nav-link" onClick={() => navigate(`/grupos-nivel/${courseId}/${levelId}`)}>
              Grupos
            </button>
          </li>
        </ul>
      </div>
      <h2 className="fw-bold mb-4">Estudiantes del Grupo</h2>

      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      <div className="table-responsive">
        <table className="table table-bordered table-striped shadow">
          <thead className="table-dark">
            <tr>
              <th>Nombre</th>
              <th>Documento</th>
              <th>Email</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.personId}>
                <td>{student.firstName} {student.lastName}</td>
                <td>{student.document}</td>
                <td>{student.email}</td>
                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleRemoveStudent(student.personId)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
