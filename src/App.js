import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';

import Home from './pages/Home';
import Usuarios from './pages/Usuarios';
import Cursos from './pages/Cursos';
import Certificados from './pages/Certificados';
import Inscripcion from './pages/Inscripcion';
import Reportes from './pages/Reportes';
import Cuenta from './pages/Cuenta';

import './styles/global.css';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Alternar visibilidad del sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Cerrar el sidebar
  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <Router>
      <div className="app-wrapper">
        <Header />
        <div className="d-flex">
          <Sidebar 
            isOpen={sidebarOpen} 
            onClose={closeSidebar} 
            onToggleSidebar={toggleSidebar}
          />
          <main className="content p-4 flex-grow-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/cuenta" element={<Cuenta />} />
              <Route path="/usuarios" element={<Usuarios />} />
              <Route path="/cursos" element={<Cursos />} />
              <Route path="/certificados" element={<Certificados />} />
              <Route path="/inscripcion" element={<Inscripcion />} />
              <Route path="/reportes" element={<Reportes />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
