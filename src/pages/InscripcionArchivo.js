import * as XLSX from "xlsx";
import { useState } from "react";
import { enrollStudentsMassive } from "../services/CourseService";
import { useKeycloak } from '@react-keycloak/web';

function ExcelUploader() {
  const [students, setStudents] = useState([]);
  const [failedEnrollments, setFailedEnrollments] = useState([]);
  const [enrollDone, setEnrollDone] = useState(false);
  const { keycloak } = useKeycloak();

  const handleFile = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const parsedData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      const studentsData = parsedData.slice(1).map((row) => {
        const formatDate = (value) => {
          return typeof value === 'number'
            ? XLSX.SSF.format("yyyy-mm-dd", value)
            : value;
        };

        return {
          fullName: row[0],
          documentNumber: row[1],
          course: row[2],
          level: row[3],
          group: row[4],
          grade: row[5],
          levelCost: row[6],
          materialCost: row[7],
          startDate: formatDate(row[8]),
          endDate: formatDate(row[9]),
        };
      });

      setStudents(studentsData);
      setFailedEnrollments([]);
      setEnrollDone(false); // reset estado
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
  };

  return (
    <div>
      <input type="file" accept=".xlsx" onChange={handleFile} />

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
                  <th>Grupo</th>
                  <th>Nota</th>
                  <th>Costo Nivel</th>
                  <th>Costo Material</th>
                  <th>Fecha inicio</th>
                  <th>Fecha Finalización</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, idx) => (
                  <tr key={idx}>
                    <td>{student.fullName}</td>
                    <td>{student.documentNumber}</td>
                    <td>{student.course}</td>
                    <td>{student.level}</td>
                    <td>{student.group}</td>
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
                onClick={handleEnroll}
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
          <h5 className="text-danger fw-bold">Estudiantes no inscritos correctamente:</h5>
          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead className="table-danger">
                <tr>
                  <th>Nombre</th>
                  <th>Documento</th>
                  <th>Curso</th>
                  <th>Nivel</th>
                  <th>Grupo</th>
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
                    <td>{student.group}</td>
                    <td className="text-danger">{student.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExcelUploader;
