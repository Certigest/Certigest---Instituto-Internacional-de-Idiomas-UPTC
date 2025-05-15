import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';
import { getStudentsByGroupId, removeStudentFromGroup } from '../services/CourseService';
import ModalConfirm from '../components/ModalConfirm';
import Dropdown from 'react-bootstrap/Dropdown';
import { Toast, ToastContainer } from "react-bootstrap";
import ButtonGroup from 'react-bootstrap/ButtonGroup';

export default function GroupStudents() {
  const { courseId, levelId, groupId } = useParams();
  const { keycloak } = useKeycloak();
  const [students, setStudents] = useState([]);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(() => () => {});
  const [modalMessage, setModalMessage] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const handleCloseToast = () => setMessage({ ...message, show: false });

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
          setMessage({type: "danger", text: "Error al cargar los estudiantes"});
        }
      }
    };

    fetchStudents();
  }, [courseId, levelId, groupId, keycloak]);

  const handleRemoveStudent = async (studentId) => {
    try {
      await removeStudentFromGroup(groupId, studentId, keycloak.token);

      setStudents(students.filter((s) => s.studentId !== studentId));
      setMessage({type: "success", text: "Estudiante eliminado correctamente"});
    } catch (err) {
      setErrorMessage('Error al eliminar el estudiante');
      console.error('Error al eliminar el estudiante:', err);
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
      <h2 className="fw-bold mb-4">Estudiantes del Grupo</h2>

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
            {students.map((student) => {
              return (
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
              );
            })}
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
