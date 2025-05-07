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
      <button
        className="btn btn-warning d-md-none m-3"
        onClick={onToggleSidebar}
      >
        ☰ Menú
      </button>
  
      <nav
        className={`sidebar bg-light p-3 border-end shadow-sm ${
          isOpen ? 'd-block' : 'd-none'
        } d-md-block`}
        style={{ minHeight: '100vh', width: '250px' }}
      >
        <div className="d-flex flex-column gap-3">
          <Link className="btn btn-outline-primary text-start" to="/cuenta" onClick={handleLinkClick}>
            Cuenta
          </Link>
          <Link className="btn btn-outline-primary text-start" to="/usuarios" onClick={handleLinkClick}>
            Usuarios
          </Link>
          <Link className="btn btn-outline-primary text-start" to="/cursos" onClick={handleLinkClick}>
            Cursos
          </Link>
          <Link className="btn btn-outline-primary text-start" to="/certificados" onClick={handleLinkClick}>
            Certificados
          </Link>
          <Link className="btn btn-outline-primary text-start" to="/inscripcion" onClick={handleLinkClick}>
            Inscripción
          </Link>
          <Link className="btn btn-outline-primary text-start" to="/reportes" onClick={handleLinkClick}>
            Reportes
          </Link>
        </div>
      </nav>
    </>
  );  
}

export default Sidebar;
