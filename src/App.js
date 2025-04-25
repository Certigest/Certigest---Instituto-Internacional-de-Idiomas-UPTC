import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import keycloak from './services/keycloak-config';

import Header from './components/Header';
import Sidebar from './components/Sidebar';

import Home from './pages/Home';
import Usuarios from './pages/Usuarios';
import Cursos from './pages/Cursos';
import Certificados from './pages/Certificados';
import Inscripcion from './pages/Inscripcion';
import Reportes from './pages/Reportes';
import Cuenta from './pages/Cuenta';
import EditPersonalAccount from './pages/ModifyAccount';

import './styles/global.css';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <ReactKeycloakProvider
      authClient={keycloak}
      initOptions={{ onLoad: 'login-required' }}
    >
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
                <Route path="/editar-cuenta" element={<EditPersonalAccount />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </ReactKeycloakProvider>
  );
}

export default App;
