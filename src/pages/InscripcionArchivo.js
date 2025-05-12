import * as XLSX from "xlsx";
import { useState, useRef } from "react";
import { enrollStudentsMassive } from "../services/CourseService";
import { useKeycloak } from '@react-keycloak/web';
import ModalConfirm from '../components/ModalConfirm';
import { useNavigate } from 'react-router-dom';

function ExcelUploader() {
  const [students, setStudents] = useState([]);
  const [failedEnrollments, setFailedEnrollments] = useState([]);
  const [enrollDone, setEnrollDone] = useState(false);
  const { keycloak } = useKeycloak();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(() => () => {});
  const [modalMessage, setModalMessage] = useState("");
  const fileInputRef = useRef(null);
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

  const handleFile = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (file.type !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
    alert("Por favor, selecciona un archivo de Excel (.xlsx)");
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    const data = new Uint8Array(event.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const parsedData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    const rows = parsedData.slice(1); // Omitir encabezado

    if (rows.length > 30) {
      alert("Solo puedes cargar un máximo de 30 estudiantes por archivo.");
      if (fileInputRef.current) fileInputRef.current.value = null;
      setStudents([]);
      return;
    }

    const studentsData = rows.map((row) => {
      const formatDate = (value) => {
        if (typeof value === 'number') {
          const date = new Date((value - 25569) * 86400 * 1000);
          const day = ("0" + date.getDate()).slice(-2);
          const month = ("0" + (date.getMonth() + 1)).slice(-2);
          const year = date.getFullYear();
          return `${day}/${month}/${year}`;
        } else if (typeof value === 'string') {
          const dateParts = value.split('-');
          if (dateParts.length === 3) {
            return `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
          }
          return value;
        }
        return value;
      };

      return {
        fullName: row[0],
        documentNumber: row[1],
        course: row[2],
        level: row[3],
        grade: parseFloat(row[4]),
        levelCost: parseFloat(row[5]),
        materialCost: parseFloat(row[6]),
        courseDate: formatDate(row[7]),
      };
    });

    setStudents(studentsData);
    setFailedEnrollments([]);
    setEnrollDone(false);
  };

  reader.readAsArrayBuffer(file);
};


  const handleEnroll = async () => {
    const response = await enrollStudentsMassive(keycloak.token, students);
    setEnrollDone(true);

    if (Array.isArray(response)) {
      const failed = response.filter((s) => s.description);
      setFailedEnrollments(failed);
    } else if (response.error) {
      alert(response.error);
    }

    // Limpiar el input de archivo después de procesar
    if (fileInputRef.current) {
      fileInputRef.current.value = '';  // Esto restablece el archivo cargado
    }
  };

  const isFormValid = () => {
    return students.every(student => 
      student.fullName && 
      student.documentNumber && 
      student.course && 
      student.level && 
      !isNaN(student.grade) && 
      student.grade >= 0 && student.grade <= 5 && // Validar que la nota esté entre 0 y 5
      !isNaN(student.levelCost) && 
      (student.materialCost === '' || isNaN(student.materialCost)) && 
      student.courseDate && 
      /\d{2}\/\d{2}\/\d{2}/.test(student.courseDate)
    );
  };

  return (
    <div className="container my-5">
      <h2 className="text-center mb-4">Cargar estudiantes que ya han terminado un nivel</h2>
      <div className="d-flex justify-content-start mb-3">
        <button className="btn btn-secondary me-2" onClick={() => navigate("/inscripcion")}>
          ← Regresar
        </button>
      </div>
      <div className="text-center mb-4">
        <input
          type="file"
          accept=".xlsx"
          onClick={() => {
            if (fileInputRef.current) {
              fileInputRef.current.value = null; // Esto permite volver a seleccionar el mismo archivo
            }
          }}
          onChange={handleFile}
          className="form-control w-auto d-inline-block"
          multiple={false}
          ref={fileInputRef}
        />
      </div>

      {students.length > 0 && (
        <>
          <div className="table-responsive mt-4">
            <table className="table table-striped table-bordered shadow">
              <thead className="table-dark">
                <tr>
                  <th>Nombres y Apellidos</th>
                  <th>Número de documento</th>
                  <th>Curso</th>
                  <th>Nivel</th>
                  <th>Nota (0.0 - 5.0)</th>
                  <th>Costo Nivel (sin puntos ni comas)</th>
                  <th>Costo Material (sin puntos ni comas)</th>
                  <th>Fecha del Curso (dd/mm/yyyy)</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, idx) => (
                  <tr key={idx}>
                    <td>{student.fullName}</td>
                    <td>{student.documentNumber}</td>
                    <td>{student.course}</td>
                    <td>{student.level}</td>
                    <td>{student.grade}</td>
                    <td>{student.levelCost}</td>
                    <td>{student.materialCost}</td>
                    <td>{student.courseDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!enrollDone && (
            <div className="text-center mt-3">
              <button
                className="btn btn-warning fw-bold px-4 py-2 rounded-pill shadow"
                onClick={() => openConfirmModal(() => handleEnroll(), "¿Está seguro que desea inscribir estos estudiantes?")}
                disabled={!isFormValid()}
              >
                Cargar Estudiantes
              </button>
            </div>
          )}
        </>
      )}

      {enrollDone && failedEnrollments.length === 0 && (
        <div className="mt-4 text-success fw-bold text-center">
          Todos los estudiantes han sido inscritos correctamente
        </div>
      )}

      {failedEnrollments.length > 0 && (
        <div className="mt-5">
          <h5 className="text-danger fw-bold">Estudiantes que no fueron inscritos:</h5>
          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead className="table-danger">
                <tr>
                  <th>Nombre</th>
                  <th>Documento</th>
                  <th>Curso</th>
                  <th>Nivel</th>
                  <th>Descripción del error</th>
                </tr>
              </thead>
              <tbody>
                {failedEnrollments.map((student, idx) => (
                  <tr key={idx}>
                    <td>{student.fullName}</td>
                    <td>{student.documentNumber}</td>
                    <td>{student.course}</td>
                    <td>{student.level}</td>
                    <td className="text-danger">{student.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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

export default ExcelUploader;
