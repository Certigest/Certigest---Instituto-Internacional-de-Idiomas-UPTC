import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';
import keycloak from '../services/keycloak-config';

// URL de la API
const API_HOST = process.env.REACT_APP_API_HOST;

const ExcelUpload = () => {
  const [mensaje, setMensaje] = useState("");

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) {
      setMensaje("No se seleccionó ningún archivo.");
      return;
    }

    // Validación de extensión y tipo MIME
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

      let exito = 0;
      let fallos = 0;

      for (const person of persons) {
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
    } catch (error) {
      console.error('Error procesando el archivo:', error);
      setMensaje('Error procesando el archivo.');
    }
  };

  return (
    <div className="text-center">
      <h5>Subida Masiva de Usuarios</h5>
      <input
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFileUpload}
        className="form-control mt-3"
      />
      {mensaje && <p className="mt-3 text-info fw-bold">{mensaje}</p>}
    </div>
  );
};

export default ExcelUpload;
