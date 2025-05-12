import React, { useEffect, useState } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { getStudentsByGroupId, sendCalifications } from '../services/CourseService';
import ModalConfirm from '../components/ModalConfirm';
import { useNavigate, useParams } from 'react-router-dom';

export default function RateGroup() {
  const { id } = useParams();
  const { keycloak } = useKeycloak();
  const [students, setStudents] = useState([]);
  const [califications, setCalifications] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(() => () => {});
  const [modalMessage, setModalMessage] = useState("");
  const navigate = useNavigate();

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
          const data = await getStudentsByGroupId(id, keycloak.token);
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
          console.error('Error al obtener los estudiantes:', err);
        }
      }
    };

    fetchStudents();
  }, [id, keycloak]);

  const handleInputChange = (index, value) => {
    const updated = [...califications];
    updated[index].calification = value;
    setCalifications(updated);
  };

  const handleSubmit = async () => {
    const invalid = califications.some((c) => c.calification === '' || isNaN(c.calification) || c.calification < 0 || c.calification > 5);
    if (invalid) {
      setErrorMessage('Por favor, ingrese calificaciones válidas entre 0 y 5.');
      return;
    }

    try {
      await sendCalifications(id, keycloak.token, califications);
      setSuccessMessage('Calificaciones enviadas correctamente');
      setErrorMessage('');
    } catch (err) {
      console.error('Error al enviar calificaciones:', err);
      setErrorMessage('Error al enviar calificaciones.');
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="fw-bold mb-4">Calificar Estudiantes - Grupo {id}</h2>

      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

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
        <button className="btn btn-secondary me-2" onClick={() => navigate('/grupos-profesor')}>
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
