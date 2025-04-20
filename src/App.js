import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [mensaje, setMensaje] = useState(''); // Estado para almacenar la respuesta

  useEffect(() => {
    // Realiza una solicitud GET al backend
    axios.get('http://localhost:8080/public/hello')  // Cambia la URL si es necesario
      .then((response) => {
        setMensaje(response.data);  // Guarda la respuesta en el estado
      })
      .catch((error) => {
        console.error('Hubo un error con la solicitud:', error);
        setMensaje('Error al obtener mensaje');
      });
  }, []);  // El arreglo vacío asegura que solo se ejecute al cargar el componente

  return (
    <div>
      <h1>Mensaje desde Spring Boot:</h1>
      <p>{mensaje}</p>  {/* Muestra el mensaje obtenido del backend */}
    </div>
  );
}

export default App;
