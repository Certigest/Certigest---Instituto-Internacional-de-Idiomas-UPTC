import { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';

import ResponsiveNavbar from './components/ResponsiveNavbar';

import Home from './pages/Home';
import Usuarios from './pages/Usuarios';
import Cursos from './pages/Cursos';
import Certificados from './pages/Certificados';
import Inscripcion from './pages/Inscripcion';
import Reportes from './pages/Reportes';
import Cuenta from './pages/Cuenta';
import EditPersonalAccount from './pages/ModifyAccount';
import ViewStudentCourses from './pages/ViewStudentCourses';
import Roles from './pages/Roles';
import RateGroup from './pages/EstudiantesListado';
import EditPassword from './pages/Contraseña';
import LevelList from './pages/NivelesCurso';
import GroupListLevel from './pages/GruposNivel';
import GroupList from './pages/Grupos';
import GroupStudents from './pages/EstudiantesGrupo';
import EnrollStudents from './pages/ListadoEstudiantesInscripción';
import PublicHomePage from './pages/PublicHomePage';
import PublicValidatePage from './pages/PublicValidatePage';


import './styles/global.css';


function LayoutWithRoles() {
  const [selectedRole, setSelectedRole] = useState(localStorage.getItem('selectedRole'));
  const [loading, setLoading] = useState(true);
  const { keycloak, initialized } = useKeycloak(); // Agregado 'initialized'
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (initialized && keycloak.authenticated) { // Esperar que Keycloak se inicialice
      const appRoles = ['admin', 'teacher', 'student'];
      const roles = keycloak.tokenParsed?.realm_access?.roles || [];
      const matchedRoles = roles.filter((role) => appRoles.includes(role));

      if (!selectedRole) {
        if (matchedRoles.length === 1) {
          const role = matchedRoles[0];
          localStorage.setItem('selectedRole', role);
          setSelectedRole(role);
          navigate('/home');
        } else {
          navigate('/select-role');
        }
      } else {
        setLoading(false);
      }
    }
  }, [keycloak, selectedRole, navigate, initialized]); // Se agregó 'initialized' a las dependencias

  if (loading) {
    return <div className="p-4">Cargando...</div>;
  }

  if (selectedRole && location.pathname === '/') {
    return <Navigate to="/home" replace />;
  }

  return (
    <div className="app-wrapper">
      <ResponsiveNavbar>
          <Routes>
            <Route path="/home" element={<Home />} />

            {selectedRole === 'admin' && (
              <>
                <Route path="/cuenta" element={<Cuenta />} />
                <Route path="/editar-cuenta" element={<EditPersonalAccount />} />
                <Route path="/editar-contraseña" element={<EditPassword />} />
                <Route path="/usuarios" element={<Usuarios />} />
                <Route path="/reportes" element={<Reportes />} />
                <Route path="/cursos" element={<Cursos />} />
                <Route path="/niveles-curso/:id" element={<LevelList />} />
                <Route path="/grupos-nivel/:courseId/:levelId" element={<GroupListLevel />} />
                <Route path="/certificados" element={<Certificados />} />
                <Route path="/inscripcion" element={<Inscripcion />} />
                <Route path="/grupo-estudiantes/:courseId/:levelId/:groupId" element={<GroupStudents />} />
                <Route path="/inscribir/:courseId/:levelId/:groupId" element={<EnrollStudents />} />
              </>
            )}

            {selectedRole === 'teacher' && (
              <>
                <Route path="/cuenta" element={<Cuenta />} />
                <Route path="/editar-cuenta" element={<EditPersonalAccount />} />
                <Route path="/editar-contraseña" element={<EditPassword />} />
                <Route path="/grupos-profesor" element={<GroupList />} />
                <Route path="/calificar/:id" element={<RateGroup />} />
              </>
            )}

            {selectedRole === 'student' && (
              <>
                <Route path="/cuenta" element={<Cuenta />} />
                <Route path="/editar-contraseña" element={<EditPassword />} />
                <Route path="/editar-cuenta" element={<EditPersonalAccount />} />
                <Route path="/cursos" element={<ViewStudentCourses />} />
              </>
            )}

            <Route path="*" element={<Home />} />
          </Routes>
      </ResponsiveNavbar>
    </div>
  );
}

function App() {
  const { keycloak, initialized } = useKeycloak();

  if (!initialized) return <div>Cargando...</div>;

  return (
    <Router>
      <Routes>
        {!keycloak.authenticated ? (
          // Usuario NO autenticado → mostrar página pública
          <>
            <Route path="/" element={<PublicHomePage />} />
            <Route path="/Validate" element={<PublicValidatePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : (
          // Usuario autenticado → manejar flujo con LayoutWithRoles
          <>
            <Route path="/select-role" element={<Roles />} />
            <Route path="/*" element={<LayoutWithRoles />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;
