import React, { useEffect, useState } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { getAllStudents, enrollStudentToGroup } from '../services/CourseService';

export default function EnrollStudents() {
  const { keycloak } = useKeycloak();
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [groupId, setGroupId] = useState(1); // Establece el groupId aquí, dinámicamente si es necesario

  useEffect(() => {
    const fetchStudents = async () => {
      if (keycloak?.authenticated) {
        try {
          const data = await getAllStudents(keycloak.token);
          setStudents(data);
        } catch (err) {
          console.error('Error al obtener los estudiantes:', err);
        }
      }
    };

    fetchStudents();
  }, [keycloak]);

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
      // Utiliza el groupId dinámico aquí
      await enrollStudentToGroup(keycloak.token, student.personId, groupId);
      alert('Estudiante inscrito correctamente');
    } catch (error) {
      console.error('Error al inscribir:', error);
      alert('Error al inscribir al estudiante');
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-3 fw-bold">Inscribir Estudiantes</h2>

      <input
        type="text"
        className="form-control mb-3"
        placeholder="Buscar por nombre, apellido o documento"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Aquí podrías tener un selector de grupo si es necesario */}
      <select
        className="form-control mb-3"
        value={groupId}
        onChange={(e) => setGroupId(Number(e.target.value))}
      >
        {/* Opciones de grupos - en este caso solo un ejemplo */}
        <option value={1}>Grupo 1</option>
        <option value={2}>Grupo 2</option>
        <option value={3}>Grupo 3</option>
      </select>

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
