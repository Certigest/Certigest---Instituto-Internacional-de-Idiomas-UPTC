import React, { useEffect, useState } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { getStudentsByGroupId, sendCalifications } from '../services/CourseService';
import ModalConfirm from '../components/ModalConfirm';
import { useNavigate, useParams } from 'react-router-dom';
import { Toast, ToastContainer } from "react-bootstrap";

export default function GroupStudentsRate() {
  const { courseId, levelId, groupId } = useParams();
  const { keycloak } = useKeycloak();
  const [students, setStudents] = useState([]);
  const [califications, setCalifications] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(() => () => {});
  const [modalMessage, setModalMessage] = useState("");
  const navigate = useNavigate();
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
          setCalifications(
            data.map((student) => ({
              firstName: student.firstName,
              lastName: student.lastName,
              document: student.document,
              calification: student.calification,
            }))
          );
        } catch (err) {
          setMessage({type: "danger", text: "Error al cargar los estudiantes"});
        }
      }
    };

    fetchStudents();
  }, [courseId, levelId, groupId, keycloak]);

  const handleInputChange = (index, value) => {
    const updated = [...califications];
    updated[index].calification = value;
    setCalifications(updated);
  };

  const handleSubmit = async () => {
    const invalid = califications.some((c) => c.calification === '' || c.calification === null || isNaN(c.calification) || c.calification < 0 || c.calification > 5);
    if (invalid) {
      setMessage({type: "danger", text: "Por favor, ingrese calificaciones válidas entre 0 y 5."});
      return;
    }

    try {
      await sendCalifications(groupId, keycloak.token, califications);
      setMessage({type: "success", text: "Calificaciones enviadas correctamente"});
    } catch (err) {
      setMessage({type: "danger", text: "Error al enviar calificaciones"});
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
      <h2 className="fw-bold mb-4">Calificar Estudiantes - Grupo</h2>
      <div className="table-responsive">
        <table className="table table-bordered table-striped shadow">
          <thead className="table-dark">
            <tr>
              <th>Nombre</th>
              <th>Documento</th>
              <th>Email</th>
              <th>Nota (0 - 5)</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr key={student.personId}>
                <td>{student.firstName} {student.lastName}</td>
                <td>{student.document}</td>
                <td>{student.email}</td>
                <td>
                    <input
                        type="text"
                        className="form-control"
                        value={califications[index]?.calification ?? ''}
                        onChange={(e) => {
                          const value = e.target.value;
                        
                          const regex = /^(?:[0-4](?:\.\d{0,2})?|5(?:\.0{0,2})?)?$/;
                        
                          if (value === '' || regex.test(value)) {
                            handleInputChange(index, value);
                          }
                        }}
                        onBlur={(e) => {
                          const value = parseFloat(e.target.value);
                          if (isNaN(value) || value < 0 || value > 5) {
                            handleInputChange(index, ''); 
                          } else {
                            handleInputChange(index, value.toFixed(1));
                          }
                        }}
                        inputMode="decimal"
                        pattern="^\d*(\.\d{0,1})?$"
                        placeholder="0.0 - 5.0"
                    />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-end">
        <button className="btn btn-secondary me-2" onClick={() => navigate(`/grupos-nivel/${courseId}/${levelId}`)}>
            Regresar
        </button>
        <button className="btn btn-warning fw-bold shadow" onClick={() => openConfirmModal(() => handleSubmit(), "¿Está seguro de que desea enviar las calificaciones?")}>
          Calificar
        </button>
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
