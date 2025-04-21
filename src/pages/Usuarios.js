import { useState } from 'react';

const Usuarios = () => {
  const [tab, setTab] = useState("modificar");

  const renderTab = () => {
    switch (tab) {
      case "crear":
        return <div>Formulario para crear usuarios</div>;
      case "modificar":
        return <div>Formulario para modificar usuarios</div>;
      case "ver":
        return <div>Tabla con usuarios</div>;
      case "cargar":
        return <div>Subida masiva de usuarios</div>;
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="flex space-x-4 mb-4">
        {["crear", "modificar", "ver", "cargar"].map(tabName => (
          <button
            key={tabName}
            className={`px-4 py-2 border ${tab === tabName ? 'bg-yellow-300' : ''}`}
            onClick={() => setTab(tabName)}
          >
            {tabName.charAt(0).toUpperCase() + tabName.slice(1)} Usuarios
          </button>
        ))}
      </div>
      {renderTab()}
    </div>
  );
};
export default Usuarios;
