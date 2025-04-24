// src/pages/Cuenta.js
import React, { useEffect, useState } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { getAccountInfo } from '../services/UserService';

export default function Cuenta() {
  const { keycloak } = useKeycloak();
  const [accountInfo, setAccountInfo] = useState(null);

  useEffect(() => {
    const fetchAccountInfo = async () => {
      if (keycloak?.authenticated) {
        try {
          const data = await getAccountInfo(keycloak.token);
          console.log(keycloak.token)
          setAccountInfo(data);

        } catch (error) {
          console.error('Error al obtener la información de cuenta:', error);
        }
      }
    };

    fetchAccountInfo();
  }, [keycloak]);

  if (!accountInfo) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4 fw-bold">Información Personal</h2>
      <div className="row bg-white p-4 rounded shadow">
        <div className="col-md-3 d-flex justify-content-center align-items-center mb-3 mb-md-0">
          <img
            src={accountInfo.profilePic || '/profile-pic.png'}
            alt="Foto de perfil"
            className="img-fluid rounded shadow"
            style={{ width: '160px', height: '160px', objectFit: 'cover' }}
          />
        </div>
        <div className="col-md-9">
          <div className="row">
            <div className="col-md-6 mb-2"><strong>Nombres:</strong> {accountInfo.firstName}</div>
            <div className="col-md-6 mb-2"><strong>Apellidos:</strong> {accountInfo.lastName}</div>
            <div className="col-md-6 mb-2"><strong>Tipo de documento:</strong> {accountInfo.documentType}</div>
            <div className="col-md-6 mb-2"><strong>Documento:</strong> {accountInfo.document}</div>
            <div className="col-md-6 mb-2"><strong>Correo:</strong> {accountInfo.email}</div>
            <div className="col-md-6 mb-2"><strong>Celular:</strong> {accountInfo.phone}</div>
            <div className="col-md-6 mb-2">
              <strong>Fecha de nacimiento:</strong>{' '}
              {new Date(accountInfo.birthDate).toLocaleDateString('es-ES')}
            </div>

            <div className="col-md-6 mb-2">
              <strong>Estado:</strong>{' '}
              <span className={`text-${accountInfo.status ? 'success' : 'danger'}`}>
                {accountInfo.status ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <div className="col-md-6 mb-2"><strong>Cargo:</strong> {accountInfo.role}</div>
          </div>
        </div>
      </div>

      <div className="text-center mt-4">
        <button className="btn btn-warning fw-bold shadow">Modificar Datos</button>
      </div>
    </div>
  );
}
