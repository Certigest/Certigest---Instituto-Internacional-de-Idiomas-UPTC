import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useKeycloak } from "@react-keycloak/web";
import { Offcanvas } from "bootstrap";
import "../styles/Header.css";
import "../styles/Sidebar.css";
import axios from "axios";
import logo from "../assets/Logo.png";
import perfilPlaceholder from "../assets/Perfil.png";
import Dropdown from "react-bootstrap/Dropdown";
import "bootstrap/dist/css/bootstrap.min.css";

const appRoles = ["admin", "teacher", "student"];

function ResponsiveNavbar({ children }) {
  const navigate = useNavigate();
  const { keycloak } = useKeycloak();

  const [selectedRole, setSelectedRole] = useState(localStorage.getItem("selectedRole"));
  const [availableRoles, setAvailableRoles] = useState([]);
  const [profileImageUrl, setProfileImageUrl] = useState(null);

  useEffect(() => {
    if (keycloak?.tokenParsed?.realm_access?.roles) {
      const roles = keycloak.tokenParsed.realm_access.roles;
      const filtered = roles.filter((role) => appRoles.includes(role));
      setAvailableRoles(filtered);
    }
  }, [keycloak]);

  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_HOST}/person/image`, {
          headers: {
            Authorization: `Bearer ${keycloak.token}`,
          },
          responseType: "blob",
        });
        setProfileImageUrl(URL.createObjectURL(response.data));
      } catch (error) {
        console.warn("No se pudo cargar la imagen de perfil:", error.response?.status);
      }
    };

    if (keycloak?.authenticated) {
      fetchProfileImage();
    }
  }, [keycloak]);

  const handleRoleChange = (role) => {
    localStorage.setItem("selectedRole", role);
    setSelectedRole(role);
    navigate("/");
    window.location.reload();
  };

  const logout = () => {
    localStorage.removeItem("selectedRole");
    keycloak.logout();
  };

  const goToHome = () => navigate("/");

  const closeOffcanvasAndNavigate = (path) => {
    const offcanvasEl = document.getElementById("offcanvasNavbar");
    const offcanvas = Offcanvas.getInstance(offcanvasEl);
    if (offcanvas) offcanvas.hide();
    const backdrops = document.querySelectorAll(".offcanvas-backdrop");
    backdrops.forEach((bd) => bd.remove());

    navigate(path);
  };

  const renderMenuLinks = () => {
    switch (selectedRole) {
      case "admin":
        return (
          <>
            <button className="nav-link sidebar-btn text-start btn btn-link" onClick={() => closeOffcanvasAndNavigate("/cuenta")}>
              Cuenta
            </button>
            <button className="nav-link sidebar-btn text-start btn btn-link" onClick={() => closeOffcanvasAndNavigate("/usuarios")}>
              Usuarios
            </button>
            <button className="nav-link sidebar-btn text-start btn btn-link" onClick={() => closeOffcanvasAndNavigate("/cursos")}>
              Cursos
            </button>
            <button className="nav-link sidebar-btn text-start btn btn-link" onClick={() => closeOffcanvasAndNavigate("/certificados")}>
              Certificados
            </button>
            <button className="nav-link sidebar-btn text-start btn btn-link" onClick={() => closeOffcanvasAndNavigate("/inscripcion")}>
              Inscripción
            </button>
            <button className="nav-link sidebar-btn text-start btn btn-link" onClick={() => closeOffcanvasAndNavigate("/reportes")}>
              Reportes
            </button>
          </>
        );
      case "teacher":
        return (
          <>
            <Link className="nav-link sidebar-btn" to="/cuenta">
              Cuenta
            </Link>
            <Link className="nav-link sidebar-btn" to="/grupos-profesor">
              Grupos
            </Link>
          </>
        );
      case "student":
        return (
          <>
            <Link className="nav-link sidebar-btn" to="/cuenta">
              Cuenta
            </Link>
            <Link className="nav-link sidebar-btn" to="/cursos">
              Cursos
            </Link>
          </>
        );
      default:
        return null;
    }
  };

  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="d-flex">
      <div className="d-none d-md-block bg-light p-3 border-end" style={{ width: "250px", minHeight: "100vh" }}>
        <div className="mb-4 text-center">
          <img src={logo} alt="Logo" onClick={goToHome} style={{ height: "100px", cursor: "pointer" }} />
        </div>
        <div className="nav flex-column">{renderMenuLinks()}</div>
      </div>

      <div className="flex-grow-1">
        <div className="d-md-none bg-warning">
          <nav className="navbar navbar-expand-md navbar-light d-md-none shadow-sm border-bottom">
            <div className="container-fluid px-3">
              <img src={logo} alt="Logo" className="navbar-brand" onClick={goToHome} style={{ height: "60px", cursor: "pointer" }} />
              <button className="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar">
                <span className="navbar-toggler-icon"></span>
              </button>
            </div>
          </nav>
        </div>

        <div className="offcanvas offcanvas-start" tabIndex="-1" id="offcanvasNavbar">
          <div className="d-md-none bg-warning">
            <div className="offcanvas-header">
              <h5 className="offcanvas-title">Menú</h5>
              <button type="button" className="btn-close" data-bs-dismiss="offcanvas"></button>
            </div>
          </div>

          <div className="offcanvas-body">
            <div className="navbar-nav flex-column">{renderMenuLinks()}</div>
          </div>
        </div>
        <header className="border-bottom shadow-sm py-2 px-3 bg-white d-flex justify-content-between align-items-center">
          <div className="d-none d-md-block header-banner text-center mx-auto me-5">
            <h4 className="mb-0 fw-bold text-dark" style={{ fontSize: "clamp(0.8rem, 3vw, 2rem)" }}>
              Gestión de certificados Instituto Internacional de Idiomas
            </h4>
          </div>
          {selectedRole && (
            <Dropdown className="me-5">
              <Dropdown.Toggle variant="warning" size="sm">
                Rol: {selectedRole}
              </Dropdown.Toggle>

              <Dropdown.Menu>
                {availableRoles.map((role) => (
                  <Dropdown.Item key={role} onClick={() => handleRoleChange(role)}>
                    {role}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          )}
          <div className="me-3 text-end">
            <div className="small text-dark">
              <button className="btn btn-link text-dark p-0" onClick={toggleMenu} style={{ background: "none", border: "none" }}>
                <img src={profileImageUrl || perfilPlaceholder} alt="Perfil" className="rounded-circle" style={{ width: "40px", height: "40px", objectFit: "cover" }} />
              </button>

              {isOpen && (
                <div
                  className="dropdown-menu show"
                  aria-labelledby="profileDropdown"
                  style={{
                    position: "absolute",
                    top: "10vm",
                    right: "10px",
                    zIndex: 1000,
                  }}
                >
                  <div className="dropdown-item text-dark">
                    Usuario: <strong>{keycloak.tokenParsed?.preferred_username || "Usuario"}</strong>
                  </div>
                  <button className="dropdown-item text-danger" onClick={logout}>
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="p-4">{children}</main>
      </div>
    </div>
  );
}

export default ResponsiveNavbar;
