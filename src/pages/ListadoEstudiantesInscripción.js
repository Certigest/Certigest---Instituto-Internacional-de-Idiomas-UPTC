import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';
import { getStudentsWhoHaveNotTakenLevel, enrollStudentToGroup } from '../services/CourseService';

export default function EnrollStudents() {
  const { courseId, levelId, groupId } = useParams();
  const { keycloak } = useKeycloak();
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      if (keycloak?.authenticated) {
        try {
          const data = await getStudentsWhoHaveNotTakenLevel(keycloak.token, levelId);
          setStudents(data);
        } catch (err) {
          console.error('Error al obtener los estudiantes:', err);
        }
      }
    };

    fetchStudents();
  }, [keycloak, courseId, levelId, groupId]);

  const filteredStudents = students.filter((student) => {
    const query = search.toLowerCase();
    return (
      student.firstName.toLowerCase().includes(query) ||
      student.lastName.toLowerCase().includes(query) ||
      student.document.toLowerCase().includes(query)
    );
  });

  const handleEnroll = async (student) => {
    try {
      await enrollStudentToGroup(keycloak.token, student.personId, groupId);
      alert('Estudiante inscrito correctamente');
      setStudents((prevStudents) =>
        prevStudents.filter((s) => s.personId !== student.personId)
      );
    } catch (error) {
      console.error('Error al inscribir:', error);
      alert('Error al inscribir al estudiante');
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
      <h2 className="mb-3 fw-bold">Inscribir Estudiantes</h2>

      <input
        type="text"
        className="form-control mb-3"
        placeholder="Buscar por nombre, apellido o documento"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="table-responsive">
        <table className="table table-striped table-bordered shadow">
          <thead className="table-dark">
            <tr>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Documento</th>
              <th>Email</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <tr key={student.personId}>
                  <td>{student.firstName}</td>
                  <td>{student.lastName}</td>
                  <td>{student.document}</td>
                  <td>{student.email}</td>
                  <td>
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => handleEnroll(student)}
                    >
                      Inscribir
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">No se encontraron estudiantes</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
