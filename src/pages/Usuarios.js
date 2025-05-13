import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import VerUsuarios from "./VerUsuarios";
import FormularioUsuario from "../pages/FormularioUsuario";
import "../styles/Usuarios.css"; // Asegúrate de incluir esto si tienes estilos personalizados
import ExcelUpload from "../components/ExcelUpload"; // ✅ Importado

const Usuarios = () => {
  const [tab, setTab] = useState("crear");
  const [rolesSeleccionados, setRolesSeleccionados] = useState([]);

  const roles = [
    { nombre: "ADMIN", img: require("../assets/admin.png") },
    { nombre: "TEACHER", img: require("../assets/docente.png") },
    { nombre: "STUDENT", img: require("../assets/estudiante.png") },
  ];

  const manejarSeleccionRol = (rol) => {
    setRolesSeleccionados((prevRoles) =>
      prevRoles.includes(rol)
        ? prevRoles.filter((r) => r !== rol)
        : [...prevRoles, rol]
    );
  };

  const volverASeleccion = () => {
    setTab("crear");
    setRolesSeleccionados([]);
  };

  return (
    <div className="container my-1">
      <h5 className="fw-bold">Gestión de Usuarios</h5>

      <ul className="nav nav-tabs border-bottom-0 mt-3">
        <li className="nav-item">
          <button
            className={`nav-link fw-semibold ${tab === "crear" ? "active" : ""}`}
            onClick={volverASeleccion}
          >
            Crear usuario
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link fw-semibold ${tab === "ver" ? "active" : ""}`}
            onClick={() => {
              setTab("ver");
              setRolesSeleccionados([]);
            }}
          >
            Ver usuarios
          </button>
        </li>
      </ul>

      <div className="bg-light p-4 border rounded-bottom shadow-sm">
        {tab === "crear" ? (
          rolesSeleccionados.length > 0 && tab === "formulario" ? (
            <FormularioUsuario
              rolesSeleccionados={rolesSeleccionados}
              volver={volverASeleccion}
            />
          ) : (
            <>
              <p className="fw-semibold mb-4">Seleccione uno o más roles</p>
              <div className="row text-center mb-3">
                {roles.map((rol) => (
                  <div
                    className="col-md-4 mb-3"
                    key={rol.nombre}
                    onClick={() => manejarSeleccionRol(rol.nombre)}
                    style={{ cursor: "pointer" }}
                  >
                    <div
                      className={`card h-100 border rounded shadow-sm rol-card hover-glow position-relative ${
                        rolesSeleccionados.includes(rol.nombre) ? "border-primary border-3 selected" : ""
                      }`}
                    >
                      <div className="card-body d-flex flex-column align-items-center">
                        <img
                          src={rol.img}
                          alt={rol.nombre}
                          width="100"
                          height="100"
                          className="mb-3"
                        />
                        <h6 className="fw-semibold">{rol.nombre}</h6>
                      </div>

                      {rolesSeleccionados.includes(rol.nombre) && (
                        <div
                          className="position-absolute top-0 end-0 m-2 bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                          style={{ width: "24px", height: "24px", fontSize: "14px" }}
                        >
                          ✓
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-3">
                <button
                  className="btn btn-primary fw-bold px-4 py-2 rounded-pill shadow"
                  disabled={rolesSeleccionados.length === 0}
                  onClick={() => setTab("formulario")}
                >
                  Continuar
                </button>

                <p className="mt-2 mb-1">¿Tiene un archivo con usuarios ya creados?</p>
                <button
                  className="btn btn-warning fw-bold px-4 py-2 rounded-pill shadow"
                  onClick={() => setTab("excel")} 
                >
                  Cargar Usuarios
                </button>
              </div>
            </>
          )
        ) : tab === "formulario" ? (
          <FormularioUsuario
            rolesSeleccionados={rolesSeleccionados}
            volver={volverASeleccion}
          />
        ) : tab === "excel" ? (
          <>
            <button
              className="btn btn-secondary mb-3"
              onClick={volverASeleccion}
            >
              ← Volver
            </button>
            <ExcelUpload />
          </>
        ) : (
          <VerUsuarios />
        )}
      </div>
    </div>
  );
};

export default Usuarios;
