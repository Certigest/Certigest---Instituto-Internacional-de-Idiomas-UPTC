import React, { useEffect, useState } from "react"; 
import axios from "axios";
import keycloak from "../services/keycloak-config";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import imagenUsuario from "../assets/imagenUsuario.png";

const VerUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [documentoFiltro, setDocumentoFiltro] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const usuariosPorPagina = 5;

  const API_HOST = process.env.REACT_APP_API_HOST;

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await axios.get(`${API_HOST}/person/allPerson`, {
          headers: {
            Authorization: `Bearer ${keycloak.token}`,
          },
        });
        setUsuarios(response.data);
      } catch (err) {
        console.error("Error al obtener usuarios:", err);
      }
    };

    fetchUsuarios();
  }, []);

  const usuariosFiltrados = usuarios.filter((user) => {
    const coincideTexto = (
      user.firstName?.toLowerCase().includes(filtro.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(filtro.toLowerCase()) ||
      user.email?.toLowerCase().includes(filtro.toLowerCase())
    );
    const coincideDocumento = documentoFiltro === "" || user.document?.includes(documentoFiltro);
    return coincideTexto && coincideDocumento;
  });

  const indexInicio = (paginaActual - 1) * usuariosPorPagina;
  const indexFin = indexInicio + usuariosPorPagina;
  const usuariosPaginados = usuariosFiltrados.slice(indexInicio, indexFin);
  const totalPaginas = Math.ceil(usuariosFiltrados.length / usuariosPorPagina);

  const handleEliminarUsuario = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este usuario?")) {
      try {
        await keycloak.updateToken(30);
        const response = await axios.delete(`${API_HOST}/person/${id}`, {
          headers: {
            Authorization: `Bearer ${keycloak.token}`,
          },
        });

        if (response.status === 200) {
          setUsuarios(usuarios.filter(user => user.personId !== id));
          setUsuarioSeleccionado(null);
          alert("Usuario eliminado correctamente.");
        }
      } catch (err) {
        console.error("Error al eliminar usuario:", err);
        alert("No se pudo eliminar el usuario.");
      }
    }
  };

  return (
    <div className="container mt-4 bg-white p-4 border rounded shadow-sm">
      {usuarioSeleccionado ? (
        <div>
          <h5 className="fw-bold mb-4">Información Personal del usuario seleccionado</h5>
          <div className="d-flex flex-column flex-md-row align-items-start gap-4 p-3 bg-light border rounded shadow-sm">
            <div
              style={{
                width: 150,
                height: 150,
                border: "4px solid #333",
                borderRadius: 20,
                boxShadow: "0px 4px 10px rgba(0,0,0,0.4)",
                overflow: "hidden",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <img
                src={imagenUsuario}
                alt="Usuario"
                style={{ width: "100%", height: "100%", objectFit: "fill" }}
              />
            </div>

            <div className="w-100">
              <div className="row">
                <div className="col-md-6">
                  <p><strong>Nombres:</strong> {usuarioSeleccionado.firstName}</p>
                  <p><strong>Tipo de documento:</strong> {usuarioSeleccionado.documentType}</p>
                  <p><strong>Correo:</strong> {usuarioSeleccionado.email}</p>
                  <p><strong>Estado:</strong>{" "}
                    <span className={usuarioSeleccionado.status ? "text-success" : "text-danger"}>
                      {usuarioSeleccionado.status ? "Activo" : "Inactivo"}
                    </span>
                  </p>
                  <p><strong>Fecha de nacimiento:</strong>{" "}
                    {usuarioSeleccionado.birthDate
                      ? new Intl.DateTimeFormat("es-CO").format(new Date(usuarioSeleccionado.birthDate))
                      : "No registrada"}
                  </p>
                </div>
                <div className="col-md-6">
                  <p><strong>Apellidos:</strong> {usuarioSeleccionado.lastName}</p>
                  <p><strong>Documento:</strong> {usuarioSeleccionado.document}</p>
                  <p><strong>Celular:</strong> {usuarioSeleccionado.phone}</p>
                  <p><strong>Cargo(s):</strong> {usuarioSeleccionado.roles?.map(r => r.name).join(", ")}</p>
                  <p><strong>Ubicación:</strong> {usuarioSeleccionado.location?.name || "No registrada"}</p>
                </div>
              </div>

              <div className="mt-3 d-flex gap-3">
                <button className="btn btn-primary rounded-circle" title="Editar">
                  <i className="bi bi-pencil-fill"></i>
                </button>
                <button
                  className="btn btn-danger rounded-circle"
                  title="Eliminar"
                  onClick={() => handleEliminarUsuario(usuarioSeleccionado.personId)}
                >
                  <i className="bi bi-x-circle-fill"></i>
                </button>
              </div>
            </div>
          </div>

          <button className="btn btn-outline-secondary mt-4" onClick={() => setUsuarioSeleccionado(null)}>
            ⬅ Regresar
          </button>
        </div>
      ) : (
        <>
          <h5 className="fw-bold mb-4 text-primary">Listado de usuarios registrados</h5>

          <div className="row mb-3">
            <div className="col-md-6 mb-2">
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por nombre, apellido o correo"
                value={filtro}
                onChange={(e) => {
                  setFiltro(e.target.value);
                  setPaginaActual(1);
                }}
              />
            </div>
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                placeholder="Filtrar por número de documento"
                value={documentoFiltro}
                onChange={(e) => {
                  setDocumentoFiltro(e.target.value);
                  setPaginaActual(1);
                }}
              />
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-bordered table-striped align-middle text-center">
              <thead className="table-light">
                <tr>
                  <th>Nombre</th>
                  <th>Apellido</th>
                  <th>Tipo de documento</th>
                  <th>Documento</th>
                  <th>Correo</th>
                  <th>Celular</th>
                  <th>Estado</th>
                  <th>Fecha de nacimiento</th>
                  <th>Ubicación</th>
                  <th>Rol(es)</th>
                </tr>
              </thead>
              <tbody>
                {usuariosPaginados.length > 0 ? (
                  usuariosPaginados.map((user) => (
                    <tr
                      key={user.personId}
                      onClick={() => setUsuarioSeleccionado(user)}
                      style={{ cursor: "pointer" }}
                    >
                      <td>{user.firstName || ""}</td>
                      <td>{user.lastName || ""}</td>
                      <td>{user.documentType || ""}</td>
                      <td>{user.document || ""}</td>
                      <td>{user.email || ""}</td>
                      <td>{user.phone || ""}</td>
                      <td>{user.status ? "Activo" : "Inactivo"}</td>
                      <td>
                        {user.birthDate
                          ? new Intl.DateTimeFormat("es-CO").format(new Date(user.birthDate))
                          : ""}
                      </td>
                      <td>{user.location?.name || ""}</td>
                      <td>{user.roles?.map((r) => r.name).join(", ") || "Sin roles"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="text-muted py-3">
                      No se encontraron usuarios.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPaginas > 1 && (
            <nav className="mt-3">
              <ul className="pagination justify-content-center">
                {[...Array(totalPaginas)].map((_, i) => (
                  <li
                    key={i}
                    className={`page-item ${paginaActual === i + 1 ? "active" : ""}`}
                  >
                    <button className="page-link" onClick={() => setPaginaActual(i + 1)}>
                      {i + 1}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </>
      )}
    </div>
  );
};

export default VerUsuarios;
