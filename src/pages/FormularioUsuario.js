import React, { useState, useEffect } from "react";
import axios from "axios";
import keycloak from "../services/keycloak-config";
import LocationSelector from "./LocationSelector";
import "../styles/Formulario.css";

const FormularioUsuario = ({ rolesSeleccionados, volver }) => {
  const [paso, setPaso] = useState(1);
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    tipoDocumento: "",
    documento: "",
    correo: "",
    celular: "",
    birthDate: "",
    status: true,
    location: {
      departamento: "",
      ciudad: ""
    }
  });
  const [mensaje, setMensaje] = useState("");
  const [mensajeColor, setMensajeColor] = useState("");
  const [departamentos, setDepartamentos] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const API_HOST = process.env.REACT_APP_API_HOST;

  useEffect(() => {
    axios.get(`${API_HOST}/api/locations`)
      .then(res => setDepartamentos(res.data))
      .catch(err => console.error("Error al cargar departamentos", err));
  }, [API_HOST]);

  useEffect(() => {
    if (formData.location.departamento) {
      axios.get(`${API_HOST}/api/locations?parentId=${formData.location.departamento}`)
        .then(res => setCiudades(res.data))
        .catch(err => console.error("Error al cargar ciudades", err));
    } else {
      setCiudades([]);
    }
  }, [API_HOST, formData.location.departamento]);

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${keycloak.token}`,
  });
  const verificarDuplicados = async () => {
    try {
      if (paso === 1) {
        // Solo se verifica el documento en el paso 1
        const resDocumento = await axios.get(`${API_HOST}/person/existsByDocument`, {
          params: { document: formData.documento },
          headers: getAuthHeaders()
        });
  
        if (resDocumento.data === true) {
          setMensaje("El número de documento ya está registrado en el sistema.");
          setMensajeColor("error");
          return false;
        }
      }
  
      if (paso === 2) {
        console.log("Verificando correo:", formData.correo); // Añade esto
        // Solo se verifica el correo en el paso 2
        const resCorreo = await axios.get(`${API_HOST}/person/existsByEmail`, {
          params: { email: formData.correo },
          headers: getAuthHeaders()
        });
        console.log("Respuesta del backend:", resCorreo.data);
        if (resCorreo.data === true) {
          setMensaje("El correo ya está registrado en el sistema.");
          setMensajeColor("error");
          return false;
        }
      }
  
      return true;
    } catch (error) {
      console.error("Error al verificar duplicados:", error);
      setMensaje("El correo ya está registrado en el sistema..");
      setMensajeColor("error");
      return false;
    }
  };  

  const validarPasoUno = () => {
    const documentoValido = /^[a-zA-Z0-9]+$/.test(formData.documento);

    if (!formData.nombres || !formData.apellidos || !formData.tipoDocumento || !formData.documento) {
      setMensaje("Por favor, complete todos los campos personales obligatorios.");
      setMensajeColor("error");
      return false;
    }

    if (!documentoValido) {
      setMensaje("El documento debe contener solo letras y números.");
      setMensajeColor("error");
      return false;
    }

    return true;
  };

  const validarPasoDos = () => {
    const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo);
    const celularValido = /^[0-9]{10,13}$/.test(formData.celular);

    if (!formData.correo || !formData.celular) {
      setMensaje("Por favor, complete todos los campos de contacto obligatorios.");
      setMensajeColor("error");
      return false;
    }

    if (!correoValido) {
      setMensaje("Ingrese un correo electrónico válido.");
      setMensajeColor("error");
      return false;
    }

    if (!celularValido) {
      setMensaje("El celular debe contener solo números (mínimo 10 y máximo 13 dígitos).");
      setMensajeColor("error");
      return false;
    }

    setMensaje("");
    setMensajeColor("");
    return true;
  };

  const siguientePaso = async () => {
    if (paso === 1 && !validarPasoUno()) return;

    // Verificar duplicados antes de pasar al siguiente paso
    if (paso === 1) {
      const esValido = await verificarDuplicados();
      if (!esValido) return; // Si hay duplicado, no avanzar
    }

    setMensaje("");
    setMensajeColor("");
    setPaso(prev => prev + 1);
  };

  const anteriorPaso = () => {
    setMensaje("");
    setMensajeColor("");
    setPaso(prev => prev - 1);
  };

  const manejarCambio = (e) => {
    const { name, value, checked } = e.target;
    if (["departamento", "ciudad"].includes(name)) {
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [name]: value
        }
      }));
    } else if (name === "status") {
      setFormData(prev => ({ ...prev, status: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const guardarUsuario = async () => {
    if (!validarPasoDos()) return;

    const esValido = await verificarDuplicados();
    if (!esValido) return;
    try {
      const payload = {
        personId: null,
        firstName: formData.nombres,
        lastName: formData.apellidos,
        documentType: formData.tipoDocumento.toUpperCase(),
        document: formData.documento,
        email: formData.correo,
        phone: formData.celular,
        status: formData.status,
        birthDate: formData.birthDate || null,
        location: formData.location.ciudad
          ? { idLocation: parseInt(formData.location.ciudad) }
          : null,
        roles: rolesSeleccionados.map(role => ({ name: role.toUpperCase() })),
      };

      console.log("📦 Payload enviado al backend:", JSON.stringify(payload, null, 2));

      // Realizar la solicitud POST con el token de autenticación
      await axios.post(`${API_HOST}/person/addPerson`, payload, {
        headers: getAuthHeaders(),
      });

      setMensaje("Usuario creado correctamente.");
      setMensajeColor("success");
      setPaso(1);
      setFormData({
        nombres: "",
        apellidos: "",
        tipoDocumento: "",
        documento: "",
        correo: "",
        celular: "",
        birthDate: "",
        status: true,
        location: {
          departamento: "",
          ciudad: ""
        }
      });

      // Mostrar el modal de éxito
      setShowModal(true);
    } catch (error) {
      console.error("Error al guardar usuario:", error);
      setMensaje("Hubo un error al crear el usuario. Intente nuevamente.");
      setMensajeColor("error");
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    volver(); // Redirige al inicio después de cerrar el modal
  };

  return (
    <div className="formulario-container">
      <p className="fw-semibold text-center mb-4">
        Complete los siguientes datos {paso === 1 ? "personales del usuario a crear" : "personales"}:
      </p>

      <div className="formulario-pasos text-center mb-4">
        <div className={paso >= 1 ? "circulo activo" : "circulo"}></div>
        <div className="linea"></div>
        <div className={paso >= 2 ? "circulo activo" : "circulo"}></div>
      </div>

      {mensaje && (
        <div className={`alerta ${mensajeColor === "error" ? "alerta-error" : "alerta-success"}`}>
          {mensaje}
        </div>
      )}

      {paso === 1 ? (
        <div className="row">
          <div className="col-md-6 mb-3">
            <input
              type="text"
              name="nombres"
              className="form-control shadow-input"
              placeholder="Nombres *"
              value={formData.nombres}
              onChange={manejarCambio}
            />
          </div>
          <div className="col-md-6 mb-3">
            <input
              type="text"
              name="apellidos"
              className="form-control shadow-input"
              placeholder="Apellidos *"
              value={formData.apellidos}
              onChange={manejarCambio}
            />
          </div>
          <div className="col-md-6 mb-3">
            <select
              name="tipoDocumento"
              className="form-select shadow-input"
              value={formData.tipoDocumento}
              onChange={manejarCambio}
            >
              <option value="">Tipo de documento *</option>
              <option value="CC">Cédula</option>
              <option value="TI">Tarjeta de Identidad</option>
            </select>
          </div>
          <div className="col-md-6 mb-3">
            <input
              type="text"
              name="documento"
              className="form-control shadow-input"
              placeholder="Documento *"
              value={formData.documento}
              onChange={manejarCambio}
            />
          </div>
        </div>
      ) : (
        <div className="row">
          <div className="col-md-6 mb-3">
            <input
              type="email"
              name="correo"
              className="form-control shadow-input"
              placeholder="Correo *"
              value={formData.correo}
              onChange={manejarCambio}
            />
          </div>
          <div className="col-md-6 mb-3">
            <input
              type="text"
              name="celular"
              className="form-control shadow-input"
              placeholder="Celular *"
              value={formData.celular}
              onChange={manejarCambio}
            />
          </div>

          <div className="col-md-6 mb-3">
            <input
              type="date"
              name="birthDate"
              className="form-control shadow-input"
              value={formData.birthDate}
              onChange={manejarCambio}
              placeholder="Fecha de nacimiento (opcional)"
            />
          </div>

          <div className="col-md-6 mb-3 d-flex align-items-center">
            <label className="me-2">¿Activo?</label>
            <input
              type="checkbox"
              name="status"
              checked={formData.status}
              onChange={manejarCambio}
            />
          </div>

          <div className="col-md-12 mb-3">
            <LocationSelector
              onSelect={(ciudad) => setFormData({
                ...formData,
                location: { ...formData.location, ciudad: ciudad }
              })}
              departamentos={departamentos}
              ciudades={ciudades}
              location={formData.location}
              onLocationChange={manejarCambio}
            />
          </div>
        </div>
      )}

      <div className="d-flex justify-content-between mt-4">
        {paso === 1 ? (
          <button className="btn btn-secondary px-4" onClick={volver}>Cancelar</button>
        ) : (
          <button className="btn btn-secondary px-4" onClick={anteriorPaso}>Atrás</button>
        )}
        {paso === 1 ? (
          <button className="btn btn-primary px-4" onClick={siguientePaso}>Siguiente</button>
        ) : (
          <button className="btn btn-success px-4" onClick={guardarUsuario}>Guardar</button>
        )}
      </div>

      {showModal && (
        <div
          className="custom-modal-overlay"
          onClick={handleModalClose}
        >
          <div
            className="custom-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h5>¡Usuario creado exitosamente!</h5>
            <button className="btn btn-success" onClick={handleModalClose}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormularioUsuario;
