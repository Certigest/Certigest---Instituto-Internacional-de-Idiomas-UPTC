import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Toast, ToastContainer } from "react-bootstrap";
import { useKeycloak } from '@react-keycloak/web';
import {
  getStudentsWhoHaveNotTakenLevel,
  enrollStudentToGroup,
  getGroupById,
} from '../services/CourseService';

export default function EnrollStudents() {
  const { courseId, levelId, groupId } = useParams();
  const { keycloak } = useKeycloak();
  const [students, setStudents] = useState([]);
  const [group, setGroup] = useState(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const [message, setMessage] = useState({ type: "", text: "" });
  const handleCloseToast = () => setMessage({ ...message, show: false });

  useEffect(() => {
    const fetchData = async () => {
      if (keycloak?.authenticated) {
        try {
          const [studentsData, groupData] = await Promise.all([
            getStudentsWhoHaveNotTakenLevel(keycloak.token, levelId),
            getGroupById(keycloak.token, groupId),
          ]);
          setStudents(studentsData);
          setGroup(groupData);
        } catch (err) {
          console.error('Error al cargar datos:', err);
        }
      }
    };

    fetchData();
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
      if (!group) {
        alert('Información del grupo no disponible.');
        return;
      }

      const today = new Date();
      const startDate = new Date(group.start_date);
      const endDate = new Date(group.end_date);

      if (today >= startDate && today <= endDate) {
        await enrollStudentToGroup(keycloak.token, student.personId, groupId);
        setMessage({type: "success", text: "Estudiante inscrito correctamente."});
        setStudents((prevStudents) =>
          prevStudents.filter((s) => s.personId !== student.personId)
        );
      } else {
        setMessage({type: "danger", text: "El grupo no está activo en este momento. Modifique las fechas de inicio y finalización del grupo para inscribir al estudiante."});
      }
    } catch (error) {
      setMessage({type: "danger", text: "Error al inscribir al estudiante."});
    }
  };

  return (
    <div className="container mt-4">
      {message.text && (
        <ToastContainer position="bottom-end" className="p-3">
          <Toast
            show={message.show}
            onClose={handleCloseToast}
            delay={3000}
            autohide
            className={`border-0 shadow-lg rounded-3 bg-${message.type} position-relative`}
            style={{
              minHeight: "80px",
            }}
          >
            <Toast.Body className="text-white px-4 py-3 fs-6 w-100" style={{ fontSize: "1rem" }}>
              {message.text}
            </Toast.Body>
          </Toast>
          <style>{`@media (min-width: 768px) {.toast {max-width: 400px;}.toast-body {font-size: 1.25rem;}}`}</style>
        </ToastContainer>
      )}
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
