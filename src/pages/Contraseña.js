import React, { useState } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { useNavigate } from 'react-router-dom';
import { modifyPassword } from '../services/UserService';
import { Toast, ToastContainer } from "react-bootstrap";

export default function EditarContraseña() {
  const { keycloak } = useKeycloak();
  const navigate = useNavigate();
  const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState({ type: "", text: "" });
  const handleCloseToast = () => setMessage({ ...message, show: false });

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
      setMessage({type: "success", text: "Contraseña cambiada con éxito"});
      setTimeout(() => navigate('/cuenta'), 2000);
    } catch (err) {
      setMessage({type: "danger", text: "Error al cambiar la contraseña"});
    } finally {
      setLoading(false);
    }
  };

  const passwordsMatch = passwords.newPassword === passwords.confirmPassword;
  const isValid = passwords.newPassword && passwords.confirmPassword && passwordsMatch;

  return (
    <div className="container mt-4">
      {message.text && (
        <ToastContainer position="bottom-end" className="p-3">
          <Toast
            show={message.show}
            onClose={handleCloseToast}
            delay={3000}
            autohide
            className={`border-0 shadow-lg rounded-3 bg-${message.type} position-relative`}
            style={{
              minHeight: "80px",
            }}
          >
            <Toast.Body className="text-white px-4 py-3 fs-6 w-100" style={{ fontSize: "1rem" }}>
              {message.text}
            </Toast.Body>
          </Toast>
          <style>{`@media (min-width: 768px) {.toast {max-width: 400px;}.toast-body {font-size: 1.25rem;}}`}</style>
        </ToastContainer>
      )}
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
    </div>
  );
}
