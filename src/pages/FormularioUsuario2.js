import React, { useState, useEffect } from "react";
import axios from "axios";
import keycloak from "../services/keycloak-config";

const FormularioUsuario2 = ({ usuario, setEditarUsuario }) => {
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    tipoDocumento: "",
    documento: "",
    correo: "",
    celular: "",
    birthDate: "",
    status: true,
    roles: [],
    location: null,
  });

  const [mensaje, setMensaje] = useState("");
  const [mensajeColor, setMensajeColor] = useState("");

  const API_HOST = process.env.REACT_APP_API_HOST;

  useEffect(() => {
    if (usuario) {
      setFormData({
        nombres: usuario.firstName || "",
        apellidos: usuario.lastName || "",
        tipoDocumento: usuario.documentType || "",
        documento: usuario.document || "",
        correo: usuario.email || "",
        celular: usuario.phone || "",
        birthDate: usuario.birthDate ? usuario.birthDate.split("T")[0] : "",
        status: usuario.status ?? true,
        roles: usuario.roles?.map(role => role.name) || [],
        location: usuario.location || null,
      });
    }
  }, [usuario]);

  const handleRoleChange = (selectedOptions) => {
    const selectedRoles = Array.from(selectedOptions).map(option => option.value);
    setFormData((prev) => ({ ...prev, roles: selectedRoles }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validarCampos = () => {
    const { nombres, apellidos, tipoDocumento, correo, celular } = formData;
    if (!nombres || !apellidos || !tipoDocumento || !correo || !celular) {
      setMensaje("Por favor completa todos los campos obligatorios.");
      setMensajeColor("danger");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      setMensaje("Correo electrónico no es válido.");
      setMensajeColor("danger");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarCampos()) return;

    try {
      await keycloak.updateToken(30);

      const payload = {
        firstName: formData.nombres,
        lastName: formData.apellidos,
        document: formData.documento,
        documentType: formData.tipoDocumento,
        email: formData.correo,
        phone: formData.celular,
        birthDate: formData.birthDate,
        status: formData.status,
        roles: formData.roles.map(role => ({ name: role })),
        location: formData.location,
      };

      await axios.put(`${API_HOST}/person/modify`, payload, {
        headers: {
          Authorization: `Bearer ${keycloak.token}`,
        },
      });

      setMensaje("Usuario actualizado correctamente.");
      setMensajeColor("success");
      
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      setMensaje("Error al actualizar el usuario.");
      setMensajeColor("danger");
    }
  };

  return (
    <div className="container mt-4 p-4 bg-white border rounded shadow-sm">
      <h4 className="mb-3">{usuario ? "Editar Usuario" : "Crear Nuevo Usuario"}</h4>
      {mensaje && <div className={`alert alert-${mensajeColor}`}>{mensaje}</div>}
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-6 mb-3">
            <label>Nombres *</label>
            <input
              type="text"
              name="nombres"
              className="form-control"
              value={formData.nombres}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6 mb-3">
            <label>Apellidos *</label>
            <input
              type="text"
              name="apellidos"
              className="form-control"
              value={formData.apellidos}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6 mb-3">
            <label>Documento</label>
            <input
              type="text"
              name="documento"
              className="form-control"
              value={formData.documento}
              onChange={handleChange}
              disabled
            />
          </div>

          <div className="col-md-6 mb-3">
            <label>Tipo de Documento *</label>
            <select
              name="tipoDocumento"
              className="form-control"
              value={formData.tipoDocumento}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione una opción</option>
              <option value="CC">Cédula de Ciudadanía</option>
              <option value="TI">Tarjeta de Identidad</option>
            </select>
          </div>

          <div className="col-md-6 mb-3">
            <label>Correo *</label>
            <input
              type="email"
              name="correo"
              className="form-control"
              value={formData.correo}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6 mb-3">
            <label>Celular *</label>
            <input
              type="text"
              name="celular"
              className="form-control"
              value={formData.celular}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6 mb-3">
            <label>Fecha de nacimiento</label>
            <input
              type="date"
              name="birthDate"
              className="form-control"
              value={formData.birthDate}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-check-label d-block mb-2">Estado</label>
            <div className="form-check form-switch">
              <input
                type="checkbox"
                className="form-check-input"
                id="statusSwitch"
                name="status"
                checked={formData.status}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="statusSwitch">
                {formData.status ? "Activo" : "Inactivo"}
              </label>
            </div>
          </div>

          <div className="col-md-6 mb-3">
            <label>Roles</label>
            <select
              className="form-control"
              multiple
              value={formData.roles}
              onChange={(e) => handleRoleChange(e.target.selectedOptions)}
            >
              <option value="TEACHER">Teacher</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
        </div>

        <div className="d-flex justify-content-between mt-4">
          <button type="submit" className="btn btn-success">Guardar</button>
          <button type="button" className="btn btn-secondary" onClick={() => setEditarUsuario(false)}>Cancelar</button>
        </div>
      </form>
    </div>
  );
};

export default FormularioUsuario2;
