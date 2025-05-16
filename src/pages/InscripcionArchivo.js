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
  const [showInfo, setShowInfo] = useState(false);

  const openConfirmModal = (action, message) => {
    setConfirmAction(() => action);
    setModalMessage(message);
    setIsModalOpen(true);
  };

  const restriccionesInfo = (
    <div className="p-3 border bg-light rounded">
      <p>📌 <strong>Restricciones para cargar estudiantes desde Excel:</strong></p>
      <p><strong>El botón de cargar estudiantes se habilitará solo después de cumplir con las siguiente condiciones</strong></p>
      <ol>
        <li>Solo se pueden cargar un <strong>máximo de 30 estudiantes</strong> por archivo.</li>
        <li>El archivo debe tener <strong>extensión .xlsx</strong>.</li>
        <li><strong>Todas las columnas son obligatorias</strong>, excepto el <strong>Costo del material</strong>.</li>
        <li>Las columnas deben estar en <strong>este orden</strong>:
          <ul>
            <li>Nombres y Apellidos</li>
            <li>Número de documento</li>
            <li>Curso</li>
            <li>Nivel</li>
            <li>Nota</li>
            <li>Costo Nivel</li>
            <li>Costo Material</li>
            <li>Fecha inicio</li>
            <li>Fecha fin</li>
          </ul>
        </li>
        <li>La <strong>nota</strong> debe estar entre <strong>0 y 5</strong> y puede contener decimales (ej. "4.5").</li>
        <li>El <strong>Costo Nivel</strong> y el <strong>Costo del Material</strong> deben ser <strong>números enteros</strong>, sin letras ni símbolos especiales.</li>
        <li>Las <strong>fechas</strong> deben estar en el siguiente formato dentro del documento de excel <strong>dd/mm/yyyy</strong> (por ejemplo: "10/03/2015").</li>
      </ol>
      <p>⚠️ En lo posible no dejar espacios al inicio o al final de los textos.</p>
    </div>
  );

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

      const rows = parsedData.slice(1);

      if (rows.length > 30) {
        alert("Solo puedes cargar un máximo de 30 estudiantes por archivo.");
        if (fileInputRef.current) fileInputRef.current.value = null;
        setStudents([]);
        return;
      }

      const studentsData = rows.map((row) => {
        const formatDate = (value) => {
          if (typeof value === 'number') {
          const parsed = XLSX.SSF.parse_date_code(value);
          if (parsed) {
            const year = parsed.y;
            const month = String(parsed.m).padStart(2, '0');
            const day = String(parsed.d).padStart(2, '0');
            return `${year}-${month}-${day}`;
          }
        }
          return '';
        };

        return {
          fullName: row[0],
          documentNumber: row[1],
          course: typeof row[2] === 'string' ? row[2].trim() : row[2],
          level: typeof row[3] === 'string' ? row[3].trim() : row[3],
          grade: parseFloat(String(row[4]).replace(',', '.')),
          levelCost: parseFloat(row[5]),
          materialCost: parseFloat(row[6]),
          startDate: formatDate(row[7]),
          endDate: formatDate(row[8]),
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

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isFormValid = () => {
    return students.every(student =>
      student.fullName &&
      student.documentNumber &&
      student.course &&
      student.level &&
      Number.isFinite(student.grade) &&
      student.grade >= 0 && student.grade <= 5 &&
      Number.isInteger(student.levelCost) &&
      (student.materialCost === '' ||  isNaN(student.materialCost) || Number.isInteger(student.materialCost)) &&
      student.startDate &&
      student.endDate &&
      /^\d{4}-\d{2}-\d{2}$/.test(student.startDate) &&
      /^\d{4}-\d{2}-\d{2}$/.test(student.endDate)
    );
  };


  return (
    <div className="container my-5">
      <h2 className="text-center mb-4">Cargar estudiantes que ya han terminado un nivel</h2>
      <div className="d-flex justify-content-start mb-3">
        <button className="btn btn-secondary me-2" onClick={() => navigate("/inscripcion")}>
          ← Regresar
        </button>
        <button
          className="btn btn-info"
          type="button"
          onClick={() => setShowInfo(!showInfo)}
          aria-expanded={showInfo}
          aria-controls="restriccionesCollapse"
        >
          {showInfo ? "Ocultar restricciones" : "Mostrar restricciones"}
        </button>
      </div>
      <div className={`collapse ${showInfo ? "show" : ""}`} id="restriccionesCollapse">
          {restriccionesInfo}
      </div>
      <div className="text-center mb-4">
        <input
          type="file"
          accept=".xlsx"
          onClick={() => {
            if (fileInputRef.current) {
              fileInputRef.current.value = null;
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
                  <th>Nota</th>
                  <th>Costo Nivel</th>
                  <th>Costo Material</th>
                  <th>Fecha inicio</th>
                  <th>Fecha fin</th>
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
                    <td>{student.startDate}</td>
                    <td>{student.endDate}</td>
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
