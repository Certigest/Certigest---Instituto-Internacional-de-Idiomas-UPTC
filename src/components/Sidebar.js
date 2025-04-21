import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Sidebar.css';

function Sidebar({ isOpen, onClose, onToggleSidebar }) {
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.sidebar') && !e.target.closest('.sidebar-toggle-btn')) {
        onClose();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [onClose]);

  const handleLinkClick = () => {
    onClose();
  };

  return (
    <>
      {/* Botón solo visible en pantallas pequeñas */}
      <button
        className="btn btn-outline-primary d-md-none m-2 sidebar-toggle-btn"
        onClick={onToggleSidebar}
      >
        ☰ Menú
      </button>

      <nav className={`sidebar bg-light p-3 ${isOpen ? 'open' : ''}`}>
        <div className="d-flex flex-column">
          <Link className="sidebar-btn" to="/cuenta" onClick={handleLinkClick}>Cuenta</Link>
          <Link className="sidebar-btn" to="/usuarios" onClick={handleLinkClick}>Usuarios</Link>
          <Link className="sidebar-btn" to="/cursos" onClick={handleLinkClick}>Cursos</Link>
          <Link className="sidebar-btn" to="/certificados" onClick={handleLinkClick}>Certificados</Link>
          <Link className="sidebar-btn" to="/inscripcion" onClick={handleLinkClick}>Inscripción</Link>
          <Link className="sidebar-btn" to="/reportes" onClick={handleLinkClick}>Reportes</Link>
        </div>
      </nav>
    </>
  );
}

export default Sidebar;
