import React, { useState, useEffect } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { getAccountInfo } from '../services/UserService';
import { modifyAccountInfo } from '../services/UserService';
import { useNavigate } from 'react-router-dom';

export default function Cuenta() {
  const { keycloak } = useKeycloak();
  const [accountInfo, setAccountInfo] = useState(null);
  const [editedUser, setEditedUser] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAccountInfo = async () => {
      if (keycloak?.authenticated) {
        try {
          const data = await getAccountInfo(keycloak.token);
          setAccountInfo(data);
          setEditedUser(data);
        } catch (error) {
          console.error('Error al obtener la información de cuenta:', error);
        }
      }
    };

    fetchAccountInfo();
  }, [keycloak]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    window.history.back();
  };

  const handleSave = async () => {
    try {
      const updatedInfo = await modifyAccountInfo(keycloak.token, editedUser);
      setAccountInfo(updatedInfo);
      setShowNotification(true);
      setTimeout(() => {
        navigate('/cuenta'); // Redirige después de un tiempo
      }, 2000);
    } catch (err) {
      console.error('Error actualizando usuario:', err);
    }
  };

  if (!editedUser) return <div className="text-center mt-4">Cargando...</div>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4 fw-bold">Información Personal</h2>
      <div className="row bg-white p-4 rounded shadow">
        <div className="col-md-3 d-flex justify-content-center align-items-center mb-3 mb-md-0">
          <img
            src={editedUser.profilePictureUrl || '/profile-pic.png'}
            alt="Foto de perfil"
            className="img-fluid rounded shadow"
            style={{ width: '160px', height: '160px', objectFit: 'cover' }}
          />
        </div>

        <div className="col-md-9">
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Nombres</label>
              <input type="text" className="form-control" name="firstName" value={editedUser.firstName || ''} onChange={handleChange} />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Apellidos</label>
              <input type="text" className="form-control" name="lastName" value={editedUser.lastName || ''} onChange={handleChange} />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Tipo de documento</label>
              <select className="form-select" name="documentType" value={editedUser.documentType || ''} onChange={handleChange}>
                <option value="CC">CC</option>
                <option value="TI">TI</option>
              </select>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Documento</label>
              <input type="text" className="form-control" name="document" value={editedUser.document || ''} onChange={handleChange} />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Correo</label>
              <input type="email" className="form-control" name="email" value={editedUser.email || ''} onChange={handleChange} />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Celular</label>
              <input type="text" className="form-control" name="phone" value={editedUser.phone || ''} onChange={handleChange} />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Fecha de nacimiento</label>
              <input type="date" className="form-control" name="birthDate" value={editedUser.birthDate ? editedUser.birthDate.split('T')[0] : ''} onChange={handleChange} />
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center mt-4">
        <button className="btn btn-secondary me-2" onClick={handleCancel}>Cancelar</button>
        <button className="btn btn-warning fw-bold shadow" onClick={handleSave}>Guardar Cambios</button>
      </div>
      {showNotification && (
        <div className="alert alert-success mt-3" style={{
          position: 'fixed',
          bottom: '20px',
          left: '20%',
          transform: 'translateX(-50%)',
          zIndex: 1050,
          width: 'auto',
          maxWidth: '90%',
        }} role="alert">
          Cambios guardados
        </div>
      )}
    </div>
  );
}
