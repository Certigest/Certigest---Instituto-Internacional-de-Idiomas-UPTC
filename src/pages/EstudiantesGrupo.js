import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';
import { getStudentsByGroupId, removeStudentFromGroup } from '../services/CourseService';
import ModalConfirm from '../components/ModalConfirm';

export default function GroupStudents() {
  const { courseId, levelId, groupId } = useParams();
  const { keycloak } = useKeycloak();
  const [students, setStudents] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(() => () => {});
  const [modalMessage, setModalMessage] = useState("");

  const openConfirmModal = (action, message) => {
    setConfirmAction(() => action);
    setModalMessage(message);
    setIsModalOpen(true);
  };

  const closeConfirmModal = () => {
    setIsModalOpen(false);
    setConfirmAction(() => () => {});
  };

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

      setStudents(students.filter((s) => s.studentId !== studentId));
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
              <tr key={student.studentId}>
                <td>{student.firstName} {student.lastName}</td>
                <td>{student.document}</td>
                <td>{student.email}</td>
                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => openConfirmModal(() => handleRemoveStudent(student.studentId), "¿Está seguro que desea quitar este estudiante del grupo?")}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <ModalConfirm
          message={modalMessage}
          onConfirm={() => {
            confirmAction();
            closeConfirmModal();
          }}
          onCancel={closeConfirmModal}
        />
      )}
    </div>
  );
}
