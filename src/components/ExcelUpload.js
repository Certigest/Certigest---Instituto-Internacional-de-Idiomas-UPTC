import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';
import keycloak from '../services/keycloak-config';

const API_HOST = process.env.REACT_APP_API_HOST;

const ExcelUpload = () => {
  const [mensaje, setMensaje] = useState("");
  const [previewData, setPreviewData] = useState([]);
  const [fileName, setFileName] = useState("");

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) {
      setMensaje("No se seleccionó ningún archivo.");
      return;
    }

    setFileName(file.name);

    const validExtensions = ['.xlsx', '.xls'];
    const isExcelExtension = validExtensions.some(ext =>
      file.name.toLowerCase().endsWith(ext)
    );
    const isExcelMime =
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.ms-excel';

    if (!isExcelExtension || !isExcelMime) {
      setMensaje("Por favor, seleccione un archivo Excel válido (.xlsx o .xls).");
      return;
    }

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const persons = jsonData.map((row) => ({
        firstName: row.firstName,
        lastName: row.lastName,
        documentType: row.documentType,
        document: row.document.toString(),
        email: row.email,
        phone: row.phone.toString(),
        status: row.status === 'true' || row.status === true,
        birthDate: row.birthDate
          ? new Date(row.birthDate).toISOString().split("T")[0]
          : null,
        location: {
          idLocation: parseInt(row.locationId),
        },
        roles: row.roles
          ? row.roles.split(',').map((role) => ({
              name: role.trim().toUpperCase(),
            }))
          : [],
      }));

      setPreviewData(persons);
      setMensaje(`Archivo "${file.name}" cargado correctamente. Revisa los datos antes de confirmar.`);
    } catch (error) {
      console.error('Error procesando el archivo:', error);
      setMensaje('Error procesando el archivo.');
    }
  };

  const handleConfirmUpload = async () => {
    let exito = 0;
    let fallos = 0;

    for (const person of previewData) {
      try {
        await axios.post(`${API_HOST}/person/addPerson`, person, {
          headers: {
            Authorization: `Bearer ${keycloak.token}`,
          },
        });
        exito++;
      } catch (error) {
        console.error('Error al subir persona:', person, error.response?.data || error.message);
        fallos++;
      }
    }

    setMensaje(`Subida completada: ${exito} exitosos, ${fallos} fallidos.`);
    setPreviewData([]); // Limpiar vista previa
  };

  const handleCancelUpload = () => {
    setPreviewData([]);
    setMensaje(`Carga desde "${fileName}" cancelada.`);
  };

  return (
    <div className="container mt-4">
      <h5 className="text-center">Subida Masiva de Usuarios</h5>
      <input
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFileUpload}
        className="form-control mt-3"
      />

      {mensaje && <p className="mt-3 text-info fw-bold">{mensaje}</p>}

      {previewData.length > 0 && (
        <div className="mt-4">
          <h6>Vista previa de los datos:</h6>
          <table className="table table-bordered table-sm">
            <thead className="table-light">
              <tr>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Tipo Documento</th>
                <th>Documento</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Estado</th>
                <th>Fecha Nacimiento</th>
                <th>Ubicación</th>
                <th>Roles</th>
              </tr>
            </thead>
            <tbody>
              {previewData.map((p, idx) => (
                <tr key={idx}>
                  <td>{p.firstName}</td>
                  <td>{p.lastName}</td>
                  <td>{p.documentType}</td>
                  <td>{p.document}</td>
                  <td>{p.email}</td>
                  <td>{p.phone}</td>
                  <td>{p.status ? 'Activo' : 'Inactivo'}</td>
                  <td>{p.birthDate}</td>
                  <td>{p.location.idLocation}</td>
                  <td>{p.roles.map(r => r.name).join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="d-flex gap-2">
            <button className="btn btn-success" onClick={handleConfirmUpload}>Confirmar Subida</button>
            <button className="btn btn-danger" onClick={handleCancelUpload}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExcelUpload;
