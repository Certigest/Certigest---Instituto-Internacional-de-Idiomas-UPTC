import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Sidebar.css';

function SidebarStudent({ isOpen, onClose, onToggleSidebar }) {
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
      <nav className={`sidebar bg-light p-3 ${isOpen ? 'open' : ''}`}>
        <div className="d-flex flex-column">
          <Link className="sidebar-btn" to="/cuenta" onClick={handleLinkClick}>Cuenta</Link>
          <Link className="sidebar-btn" to="/cursos" onClick={handleLinkClick}>Cursos</Link>
        </div>
      </nav>
    </>
  );
}

export default SidebarStudent;
