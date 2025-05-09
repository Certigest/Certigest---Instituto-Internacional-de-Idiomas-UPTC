import React, { useState } from 'react';
import { useKeycloak } from '@react-keycloak/web';

const PublicHomePage = () => {
  const [certificateId, setCertificateId] = useState('');
  const { keycloak } = useKeycloak();

    const handleValidate = async () => {
        if (!certificateId.trim()) {
        alert('Por favor, ingresa un ID de certificado.');
        return;
        }
    
        try {
        const response = await fetch(`http://localhost:8080/certificate/validateCertificate/${certificateId}`, {
            method: 'GET',
        });
    
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
            window.open(url); // Abre el PDF en una nueva pestaña
        } else {
            alert('No se pudo validar el certificado.');
        }
        } catch (error) {
        console.error('Error al validar certificado:', error);
        alert('Ocurrió un error al intentar validar el certificado.');
        }
    };

  const handleLogin = () => {
    keycloak.login();
  };
  
  

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Bienvenido a CertiGest</h1>

      <input
        type="text"
        placeholder="Ingrese el ID del certificado"
        value={certificateId}
        onChange={(e) => setCertificateId(e.target.value)}
        style={styles.input}
      />

      <div style={styles.buttonContainer}>
        <button style={styles.button} onClick={handleLogin}>
          Iniciar Sesión
        </button>

        <button style={styles.button} onClick={handleValidate}>
          Validar Certificado
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#6f4f1f',
    minHeight: '100vh',
    padding: '50px',
    color: 'white',
    textAlign: 'center',
  },
  title: {
    fontSize: '2.5em',
    marginBottom: '40px',
  },
  input: {
    padding: '10px',
    fontSize: '1.1em',
    width: '60%',
    maxWidth: '500px',
    marginBottom: '30px',
    borderRadius: '5px',
    border: '2px solid #f1c40f',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    flexWrap: 'wrap',
  },
  button: {
    backgroundColor: '#f1c40f',
    color: 'black',
    fontSize: '1.2em',
    padding: '15px 30px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default PublicHomePage;
