import React from 'react';
import { useKeycloak } from '@react-keycloak/web';

function Home() {
  const { keycloak } = useKeycloak();

  if (!keycloak?.authenticated) {
    return <div>Acceso denegado. Por favor inicia sesión.</div>;
  }

  return (
    <div>
      <h3>Bienvenido a Certigest</h3>
      <p>Seleccione una opción en el menú lateral para continuar.</p>
    </div>
  );
}

export default Home;
