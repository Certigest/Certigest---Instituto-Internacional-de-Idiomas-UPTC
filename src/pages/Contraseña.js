import React, { useState } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { useNavigate } from 'react-router-dom';
import { modifyPassword } from '../services/UserService';

export default function EditarContraseña() {
  const { keycloak } = useKeycloak();
  const navigate = useNavigate();
  const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    navigate('/cuenta');
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      await modifyPassword(keycloak.token, passwords.newPassword);
      setShowNotification(true);
      setTimeout(() => navigate('/cuenta'), 2000);
    } catch (err) {
      console.error('Error al modificar la contraseña:', err);
      setError('No se pudo cambiar la contraseña. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const passwordsMatch = passwords.newPassword === passwords.confirmPassword;
  const isValid = passwords.newPassword && passwords.confirmPassword && passwordsMatch;

  return (
    <div className="container mt-4">
      <h2 className="mb-4 fw-bold">Cambiar Contraseña</h2>
      <div className="row bg-white p-4 rounded shadow">
        <div className="col-md-6 mb-3">
          <label className="form-label">Nueva contraseña</label>
          <input
            type="password"
            className="form-control"
            name="newPassword"
            value={passwords.newPassword}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label">Repetir contraseña</label>
          <input
            type="password"
            className={`form-control ${passwords.confirmPassword && !passwordsMatch ? 'is-invalid' : ''}`}
            name="confirmPassword"
            value={passwords.confirmPassword}
            onChange={handleChange}
            required
          />
          {!passwordsMatch && passwords.confirmPassword && (
            <div className="invalid-feedback">Las contraseñas no coinciden.</div>
          )}
        </div>
      </div>

      {error && <div className="alert alert-danger mt-3">{error}</div>}

      <div className="text-center mt-4">
        <button className="btn btn-secondary me-2" onClick={handleCancel} disabled={loading}>
          Cancelar
        </button>
        <button className="btn btn-warning fw-bold shadow" onClick={handleSave} disabled={loading || !isValid}>
          {loading ? 'Guardando...' : 'Cambiar Contraseña'}
        </button>
      </div>

      {showNotification && (
        <div className="alert alert-success mt-3" role="alert">
          Contraseña cambiada correctamente
        </div>
      )}
    </div>
  );
}
