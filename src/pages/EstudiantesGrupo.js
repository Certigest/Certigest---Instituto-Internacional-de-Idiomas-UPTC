import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';
import { getStudentsByGroupId, removeStudentFromGroup } from '../services/CourseService';
import ModalConfirm from '../components/ModalConfirm';
import Dropdown from 'react-bootstrap/Dropdown';
import ButtonGroup from 'react-bootstrap/ButtonGroup';

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

  const shouldShowNotesOption = (endDate, calification) => {
    return new Date(endDate) < new Date() && calification >= 3.0;
  };
  const shouldShowAbilitiesOption = (endDate, calification) =>
    new Date(endDate) < new Date() && calification >= 3.0;
  
  const API_HOST = process.env.REACT_APP_API_HOST || "http://localhost:8080";

  const openPdf = async (response, code) => {
    if (!response.ok) throw new Error('Error al generar certificado');
    const url = `${API_HOST}/certificate/validateCertificate/${code}`;
    window.open(url, '_blank');
  };

  const handleLevelCertificate = async (level_id, type) => {
    const payload = { levelId: level_id, certificateType: type };
    try {
      const response = await fetch(`${API_HOST}/certificate/generateLevelCertificate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${keycloak.token}`,
        },
        body: JSON.stringify(payload),
      });
      const { code } = await response.json();
      openPdf(response, code);
    } catch (err) {
      console.error(err);
      alert('No se pudo generar el certificado de nivel.');
    }
  };

  const handleAllLevelsCertificate = async (courseId) => {
    const payload = { courseId };
    try {
      const response = await fetch(`${API_HOST}/certificate/generateAllLevelsCertificate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${keycloak.token}`,
        },
        body: JSON.stringify(payload),
      });

      const { code } = await response.json();
      openPdf(response, code); 
    } catch (err) {
      console.error(err);
      alert('No se pudo generar el certificado de curso completo.');
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
              <th>Certificado</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => {
              const { end_date, calification } = student; // asegúrate de que vengan estas props
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
                  <td>
                    <Dropdown as={ButtonGroup}>
                      <Dropdown.Toggle variant="primary" id={`dropdown-${student.studentId}`}>
                        Seleccione un Tipo
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => handleLevelCertificate(levelId, 'BASIC')}>
                          Básico
                        </Dropdown.Item>
                        {shouldShowNotesOption(end_date, calification) && (
                          <Dropdown.Item onClick={() => handleLevelCertificate(levelId, 'NOTES')}>
                            Notas
                          </Dropdown.Item>
                        )}
                        {shouldShowAbilitiesOption(end_date, calification) && (
                          <Dropdown.Item onClick={() => handleLevelCertificate(levelId, 'ABILITIES')}>
                            Habilidades
                          </Dropdown.Item>
                        )}
                        <Dropdown.Item onClick={() => handleAllLevelsCertificate(courseId)}>
                          Curso Completo
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
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
