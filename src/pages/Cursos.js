import { useState } from 'react';

const Cursos = () => {
  const [tab, setTab] = useState("modificar");

  const renderTab = () => {
    switch (tab) {
      case "crear":
        return <div>Formulario para crear cursos</div>;
      case "modificar":
        return <div>Formulario para modificar cursos</div>;
      case "ver":
        return <div>Tabla con cursos</div>;
      case "cargar":
        return <div>Subida masiva de usuarios</div>;
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="flex space-x-4 mb-4">
        {["crear", "modificar", "ver"].map(tabName => (
          <button
            key={tabName}
            className={`px-4 py-2 border ${tab === tabName ? 'bg-yellow-300' : ''}`}
            onClick={() => setTab(tabName)}
          >
            {tabName.charAt(0).toUpperCase() + tabName.slice(1)} Cursos
          </button>
        ))}
      </div>
      {renderTab()}
    </div>
  );
};
export default Cursos;
